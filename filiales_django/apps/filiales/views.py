from __future__ import annotations

from apps.auditoria.models import Accion
from apps.core.mixins import FilialScopedQuerysetMixin
from apps.core.permissions import IsAdminAllAccess, RoleBasedPermission
from apps.core.services import dispatch_webhook, send_notification_email
from apps.core.viewsets import BaseModelViewSet
from apps.filiales.models import Autoridad, Filial
from apps.filiales.serializers import AutoridadSerializer, FilialSerializer
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import decorators, exceptions, permissions, response, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView


class FilialMapaView(APIView):
    """Devuelve las filiales activas para el mapa."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = Filial.objects.filter(activa=True)
        perfil = getattr(request.user, "perfil", None)
        if perfil and perfil.es_usuario_filial and perfil.filial_id:
            queryset = queryset.filter(id=perfil.filial_id)
        serializer = FilialSerializer(queryset, many=True)
        return response.Response(serializer.data)


class FilialViewSet(BaseModelViewSet):
    queryset = Filial.objects.all()
    serializer_class = FilialSerializer
    filterset_fields = {
        "activa": ["exact"],
        "codigo": ["exact"],
        "ciudad": ["exact"],
        "provincia": ["exact"],
    }
    search_fields = ["nombre", "codigo", "ciudad", "provincia"]
    ordering_fields = ["nombre", "codigo", "ciudad", "provincia", "created_at"]
    allow_filial_user_writes = False

    def get_queryset(self):  # type: ignore[override]
        queryset = super().get_queryset()
        queryset = queryset.select_related().annotate(
            total_integrantes=Count("autoridades", filter=Q(autoridades__activo=True))
        )
        perfil = getattr(self.request.user, "perfil", None)
        if perfil and perfil.es_usuario_filial and perfil.filial_id:
            return queryset.filter(id=perfil.filial_id)
        return queryset

    @decorators.action(
        detail=True,
        methods=["post"],
        url_path="habilitar",
        permission_classes=[IsAuthenticated, IsAdminAllAccess],
    )
    def habilitar(self, request, pk=None):
        filial = self.get_object()
        filial.activa = True
        filial.save(update_fields=["activa", "updated_at"])
        self.log_action(filial, Accion.Tipos.HABILITAR)
        if filial.contacto_email:
            send_notification_email(
                "Filial habilitada",
                f"La filial {filial.nombre} ha sido habilitada.",
                [filial.contacto_email],
            )
        dispatch_webhook(
            "eventos",
            {
                "evento": "filial_habilitada",
                "filial_id": filial.id,
                "nombre": filial.nombre,
            },
        )
        serializer = self.get_serializer(filial)
        return response.Response(serializer.data)

    @decorators.action(
        detail=True,
        methods=["post"],
        url_path="deshabilitar",
        permission_classes=[IsAuthenticated, IsAdminAllAccess],
    )
    def deshabilitar(self, request, pk=None):
        filial = self.get_object()
        filial.activa = False
        filial.save(update_fields=["activa", "updated_at"])
        self.log_action(filial, Accion.Tipos.DESHABILITAR)
        if filial.contacto_email:
            send_notification_email(
                "Filial deshabilitada",
                f"La filial {filial.nombre} ha sido deshabilitada.",
                [filial.contacto_email],
            )
        dispatch_webhook(
            "eventos",
            {
                "evento": "filial_deshabilitada",
                "filial_id": filial.id,
                "nombre": filial.nombre,
            },
        )
        serializer = self.get_serializer(filial)
        return response.Response(serializer.data)

    @decorators.action(
        detail=True,
        methods=["post"],
        url_path="cambiar-autoridades",
        permission_classes=[IsAuthenticated, IsAdminAllAccess],
    )
    def cambiar_autoridades(self, request, pk=None):
        filial = self.get_object()
        data = request.data
        if isinstance(data, dict) and "autoridades" in data:
            autoridades_data = data["autoridades"]
        else:
            autoridades_data = data
        if not isinstance(autoridades_data, list):
            raise exceptions.ValidationError("Se espera una lista de autoridades")
        hoy = timezone.now().date()
        filial.autoridades.filter(activo=True).update(activo=False, hasta=hoy)
        nuevas = []
        for autoridad in autoridades_data:
            autoridad_payload = {
                **autoridad,
                "filial": filial.id,
                "activo": autoridad.get("activo", True),
            }
            serializer = AutoridadSerializer(data=autoridad_payload)
            serializer.is_valid(raise_exception=True)
            instancia = serializer.save()
            nuevas.append(AutoridadSerializer(instancia).data)
        self.log_action(
            filial,
            Accion.Tipos.CAMBIAR_AUTORIDAD,
            payload={"autoridades": nuevas},
        )
        if filial.contacto_email:
            send_notification_email(
                "Autoridades actualizadas",
                f"Se actualizaron las autoridades de la filial {filial.nombre}.",
                [filial.contacto_email],
            )
        dispatch_webhook(
            "eventos",
            {
                "evento": "filial_cambio_autoridades",
                "filial_id": filial.id,
                "autoridades": nuevas,
            },
        )
        return response.Response(nuevas, status=status.HTTP_200_OK)


class AutoridadViewSet(FilialScopedQuerysetMixin, BaseModelViewSet):
    queryset = Autoridad.objects.select_related("filial")
    serializer_class = AutoridadSerializer
    filterset_fields = {
        "filial": ["exact"],
        "activo": ["exact"],
        "cargo": ["exact"],
    }
    search_fields = ["persona_nombre", "persona_documento", "email"]
    ordering_fields = ["persona_nombre", "cargo", "desde"]
    scope_field = "filial"
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    allow_filial_user_writes = False

    @decorators.action(
        detail=True,
        methods=["patch"],
        url_path="cambiar-estado",
        permission_classes=[IsAuthenticated, IsAdminAllAccess],
    )
    def cambiar_estado(self, request, pk=None):
        autoridad = self.get_object()
        # Aceptar tanto 'activo' como 'estado'
        activo = request.data.get("activo")
        if activo is None:
            estado = request.data.get("estado", "").upper()
            if estado == "ACTIVO":
                activo = True
            elif estado == "INACTIVO":
                activo = False
            else:
                raise exceptions.ValidationError("El campo 'activo' o 'estado' es requerido")
        else:
            activo = bool(activo)
        
        autoridad.activo = activo
        autoridad.save(update_fields=["activo", "updated_at"])
        self.log_action(autoridad, Accion.Tipos.ACTUALIZAR, payload={"activo": activo})
        serializer = self.get_serializer(autoridad)
        return response.Response(serializer.data)
