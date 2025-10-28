from __future__ import annotations

from apps.auditoria.models import Accion
from apps.core.audit import log_action
from apps.core.mixins import FilialScopedQuerysetMixin
from apps.core.permissions import IsAdminAllAccess
from apps.core.services import dispatch_webhook, send_notification_email
from apps.core.viewsets import BaseModelViewSet
from apps.entradas.models import AsignacionEntrada, SolicitudEntrada
from apps.entradas.serializers import (
    AsignacionEntradaSerializer,
    SolicitudEntradaSerializer,
)
from django.db.models import Sum
from rest_framework import decorators, exceptions, response, status
from rest_framework.permissions import IsAuthenticated


class SolicitudEntradaViewSet(FilialScopedQuerysetMixin, BaseModelViewSet):
    queryset = SolicitudEntrada.objects.select_related(
        "filial", "partido", "created_by"
    )
    serializer_class = SolicitudEntradaSerializer
    scope_field = "filial"
    filterset_fields = {
        "partido": ["exact"],
        "estado": ["exact"],
        "created_at": ["date", "date__gte", "date__lte"],
        "filial": ["exact"],
    }
    search_fields = ["motivo", "observaciones", "partido__titulo", "filial__nombre"]
    ordering_fields = ["created_at", "estado", "cantidad_solicitada"]

    def get_serializer_save_kwargs(self, *, action: str):
        kwargs = super().get_serializer_save_kwargs(action=action)
        if action == "create":
            kwargs["created_by"] = self.request.user
        return kwargs

    def _validate_cupo(
        self, solicitud: SolicitudEntrada, cantidad_asignada: int
    ) -> None:
        partido = solicitud.partido
        if partido.cupo_total is None:
            return
        total_asignado = (
            AsignacionEntrada.objects.filter(solicitud__partido=partido)
            .aggregate(total=Sum("cantidad_asignada"))
            .get("total")
            or 0
        )
        disponible = partido.cupo_total - total_asignado
        if cantidad_asignada > disponible:
            raise exceptions.ValidationError(
                "No hay cupos suficientes para aprobar la solicitud."
            )

    @decorators.action(
        detail=True,
        methods=["post"],
        url_path="aprobar",
        permission_classes=[IsAuthenticated, IsAdminAllAccess],
    )
    def aprobar(self, request, pk=None):
        solicitud = self.get_object()
        cantidad_asignada = request.data.get("cantidad_asignada")
        comentario = request.data.get("comentario", "")
        if cantidad_asignada is None:
            raise exceptions.ValidationError("Debe indicar la cantidad asignada.")
        try:
            cantidad_asignada = int(cantidad_asignada)
        except (TypeError, ValueError):  # pragma: no cover - validated below
            raise exceptions.ValidationError("La cantidad asignada debe ser numérica.")
        if cantidad_asignada <= 0:
            raise exceptions.ValidationError("La cantidad asignada debe ser positiva.")
        if cantidad_asignada > solicitud.cantidad_solicitada:
            raise exceptions.ValidationError(
                "No se puede asignar más de lo solicitado."
            )
        self._validate_cupo(solicitud, cantidad_asignada)
        asignacion = AsignacionEntrada.objects.create(
            solicitud=solicitud,
            cantidad_asignada=cantidad_asignada,
            asignado_por=request.user,
        )
        partido = solicitud.partido
        if partido.cupo_total is not None:
            partido.actualizar_cupo_disponible(cantidad_asignada)
        if cantidad_asignada < solicitud.cantidad_solicitada:
            solicitud.estado = SolicitudEntrada.Estados.PARCIAL
        else:
            solicitud.estado = SolicitudEntrada.Estados.APROBADA
        solicitud.observaciones = comentario or solicitud.observaciones
        solicitud.save(update_fields=["estado", "observaciones", "updated_at"])
        self.log_action(
            solicitud,
            Accion.Tipos.APROBAR,
            payload={"cantidad_asignada": cantidad_asignada, "comentario": comentario},
        )
        log_action(
            usuario=request.user,
            recurso="apps.entradas.AsignacionEntrada",
            recurso_id=asignacion.id,
            accion=Accion.Tipos.ASIGNAR_ENTRADAS,
            payload={"cantidad_asignada": cantidad_asignada},
            filial=solicitud.filial,
            request=request,
        )
        if solicitud.filial.contacto_email:
            send_notification_email(
                "Solicitud de entradas aprobada",
                f"Se aprobó la solicitud {solicitud.id} con {cantidad_asignada} entradas.",
                [solicitud.filial.contacto_email],
            )
        dispatch_webhook(
            "eventos",
            {
                "evento": "solicitud_aprobada",
                "solicitud_id": solicitud.id,
                "cantidad_asignada": cantidad_asignada,
            },
        )
        serializer = SolicitudEntradaSerializer(solicitud)
        return response.Response(serializer.data, status=status.HTTP_200_OK)

    @decorators.action(
        detail=True,
        methods=["post"],
        url_path="rechazar",
        permission_classes=[IsAuthenticated, IsAdminAllAccess],
    )
    def rechazar(self, request, pk=None):
        solicitud = self.get_object()
        motivo = request.data.get("motivo", "")
        solicitud.estado = SolicitudEntrada.Estados.RECHAZADA
        if motivo:
            solicitud.observaciones = motivo
        solicitud.save(update_fields=["estado", "observaciones", "updated_at"])
        self.log_action(
            solicitud,
            Accion.Tipos.RECHAZAR,
            payload={"motivo": motivo},
        )
        if solicitud.filial.contacto_email:
            send_notification_email(
                "Solicitud de entradas rechazada",
                f"La solicitud {solicitud.id} fue rechazada. {motivo}",
                [solicitud.filial.contacto_email],
            )
        dispatch_webhook(
            "eventos",
            {
                "evento": "solicitud_rechazada",
                "solicitud_id": solicitud.id,
                "motivo": motivo,
            },
        )
        serializer = SolicitudEntradaSerializer(solicitud)
        return response.Response(serializer.data, status=status.HTTP_200_OK)


class AsignacionEntradaViewSet(FilialScopedQuerysetMixin, BaseModelViewSet):
    queryset = AsignacionEntrada.objects.select_related(
        "solicitud", "solicitud__filial", "solicitud__partido"
    )
    serializer_class = AsignacionEntradaSerializer
    scope_field = "solicitud__filial"
    filterset_fields = {
        "solicitud": ["exact"],
        "solicitud__partido": ["exact"],
    }
    search_fields = ["solicitud__filial__nombre", "solicitud__partido__titulo"]
    ordering_fields = ["created_at", "cantidad_asignada"]
    http_method_names = ["get", "head", "options"]
    allow_filial_user_writes = False
