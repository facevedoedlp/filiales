"""Vistas y endpoints relacionados con integrantes."""
from django.contrib.auth import get_user_model
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from core.permissions import EsAdministrador, EsPresidenteOAdmin

from .serializers import (
    CambiarEstadoSerializer,
    IntegranteSerializer,
    PerfilSerializer,
    RegistroIntegranteSerializer,
)

Integrante = get_user_model()


class IntegranteViewSet(viewsets.ModelViewSet):
    """CRUD de integrantes con permisos por rol."""

    queryset = Integrante.objects.all()
    serializer_class = IntegranteSerializer
    filterset_fields = ["rol", "estado_membresia", "filial"]
    search_fields = ["username", "nombre", "apellido", "documento"]
    ordering_fields = ["nombre", "apellido", "fecha_ingreso"]

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [permissions.IsAuthenticated()]
        if self.action == "create":
            return [EsPresidenteOAdmin()]
        if self.action in {"update", "partial_update", "cambiar_estado"}:
            return [EsPresidenteOAdmin()]
        if self.action == "destroy":
            return [EsAdministrador()]
        return super().get_permissions()

    def get_queryset(self):
        usuario = self.request.user
        if not usuario.is_authenticated:
            return Integrante.objects.none()
        if getattr(usuario, "es_admin", False):
            return Integrante.objects.all()
        if getattr(usuario, "es_presidente", False) and usuario.filial_id:
            return Integrante.objects.filter(filial=usuario.filial)
        return Integrante.objects.filter(pk=usuario.pk)

    def perform_create(self, serializer):
        usuario = self.request.user
        datos_extra = {}
        if getattr(usuario, "es_presidente", False):
            datos_extra["filial"] = usuario.filial
        integrante = serializer.save(**datos_extra)
        password = self.request.data.get("password")
        if password:
            integrante.set_password(password)
            integrante.save(update_fields=["password"])

    def perform_update(self, serializer):
        integrante = serializer.instance
        usuario = self.request.user
        if getattr(usuario, "es_presidente", False) and integrante.filial_id != usuario.filial_id:
            raise PermissionDenied("Solo puedes gestionar integrantes de tu filial")
        if getattr(usuario, "es_presidente", False):
            integrante = serializer.save(filial=usuario.filial)
        else:
            integrante = serializer.save()
        password = self.request.data.get("password")
        if password:
            integrante.set_password(password)
            integrante.save(update_fields=["password"])

    @action(detail=True, methods=["patch"], serializer_class=CambiarEstadoSerializer)
    def cambiar_estado(self, request, *args, **kwargs):
        integrante = self.get_object()
        serializer = self.get_serializer(integrante, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class RegistroIntegranteView(APIView):
    """Registro de nuevos integrantes vía formulario público."""

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = RegistroIntegranteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        respuesta = IntegranteSerializer(usuario)
        return Response(respuesta.data, status=status.HTTP_201_CREATED)


class PerfilActualView(APIView):
    """Devuelve la información del usuario autenticado."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = IntegranteSerializer(request.user)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        serializer = PerfilSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(IntegranteSerializer(request.user).data)


class InicioSesionView(TokenObtainPairView):
    """Endpoint para obtener tokens JWT."""


class RefrescarTokenView(TokenRefreshView):
    """Endpoint para refrescar tokens JWT."""


class CerrarSesionView(APIView):
    """Invalidación lógica del token (placeholder)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Sesión cerrada"}, status=status.HTTP_200_OK)
