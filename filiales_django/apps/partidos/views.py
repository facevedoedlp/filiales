from __future__ import annotations

from apps.auditoria.models import Accion
from apps.core.permissions import IsAdminAllAccess
from apps.core.services import dispatch_webhook
from apps.core.viewsets import BaseModelViewSet
from apps.partidos.models import Partido
from apps.partidos.serializers import PartidoSerializer
from rest_framework import decorators, response
from rest_framework.permissions import IsAuthenticated


class PartidoViewSet(BaseModelViewSet):
    queryset = Partido.objects.all()
    serializer_class = PartidoSerializer
    filterset_fields = {
        "estado": ["exact"],
        "fecha": ["gte", "lte"],
    }
    search_fields = ["titulo", "lugar", "descripcion"]
    ordering_fields = ["fecha", "titulo", "created_at"]
    allow_filial_user_writes = False

    def get_queryset(self):  # type: ignore[override]
        return super().get_queryset().select_related()

    @decorators.action(
        detail=True,
        methods=["post"],
        url_path="cerrar",
        permission_classes=[IsAuthenticated, IsAdminAllAccess],
    )
    def cerrar(self, request, pk=None):
        partido = self.get_object()
        partido.estado = Partido.Estados.CERRADO
        partido.save(update_fields=["estado", "updated_at"])
        self.log_action(partido, Accion.Tipos.ACTUALIZAR, payload={"accion": "cerrar"})
        dispatch_webhook(
            "eventos",
            {"evento": "partido_cerrado", "partido_id": partido.id},
        )
        return response.Response(self.get_serializer(partido).data)

    @decorators.action(
        detail=True,
        methods=["post"],
        url_path="cancelar",
        permission_classes=[IsAuthenticated, IsAdminAllAccess],
    )
    def cancelar(self, request, pk=None):
        partido = self.get_object()
        partido.estado = Partido.Estados.CANCELADO
        partido.save(update_fields=["estado", "updated_at"])
        self.log_action(
            partido, Accion.Tipos.ACTUALIZAR, payload={"accion": "cancelar"}
        )
        dispatch_webhook(
            "eventos",
            {"evento": "partido_cancelado", "partido_id": partido.id},
        )
        return response.Response(self.get_serializer(partido).data)
