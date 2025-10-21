"""Vistas para el módulo de entradas."""
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.mixins import FiltroPorFilialMixin
from core.permissions import EsAdministrador

from .models import SolicitudEntrada
from .serializers import ResolverSolicitudSerializer, SolicitudEntradaSerializer


class SolicitudEntradaViewSet(FiltroPorFilialMixin, viewsets.ModelViewSet):
    """Gestión del ciclo de vida de las solicitudes de entradas."""

    queryset = SolicitudEntrada.objects.select_related("filial", "solicitante", "resolvio")
    serializer_class = SolicitudEntradaSerializer
    filterset_fields = ["filial", "estado"]
    search_fields = ["filial__nombre", "solicitante__username"]
    ordering_fields = ["fecha_solicitud", "cantidad_solicitada"]

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated()]
        if self.action in {"aprobar", "rechazar"}:
            return [EsAdministrador()]
        if self.action in {"update", "partial_update", "destroy"}:
            return [EsAdministrador()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(solicitante=self.request.user)

    @action(detail=True, methods=["patch"], serializer_class=ResolverSolicitudSerializer)
    def aprobar(self, request, *args, **kwargs):
        solicitud = self.get_object()
        serializer = self.get_serializer(solicitud, data={**request.data, "estado": SolicitudEntrada.Estado.APROBADA}, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(SolicitudEntradaSerializer(solicitud).data)

    @action(detail=True, methods=["patch"], serializer_class=ResolverSolicitudSerializer)
    def rechazar(self, request, *args, **kwargs):
        solicitud = self.get_object()
        serializer = self.get_serializer(solicitud, data={**request.data, "estado": SolicitudEntrada.Estado.RECHAZADA}, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(SolicitudEntradaSerializer(solicitud).data)
