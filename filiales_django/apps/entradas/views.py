"""Vistas para el módulo de entradas."""
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from core.mixins import FiltroPorFilialMixin
from core.permissions import EsAdministrador, EsPresidenteOAdmin

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
            return [EsPresidenteOAdmin()]
        if self.action in {"aprobar", "rechazar"}:
            return [EsAdministrador()]
        if self.action in {"update", "partial_update", "destroy"}:
            return [EsAdministrador()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        usuario = self.request.user
        if not (getattr(usuario, "es_presidente", False) or getattr(usuario, "es_admin", False)):
            raise PermissionDenied("Solo los presidentes pueden generar solicitudes")
        filial = serializer.validated_data.get("filial")
        if getattr(usuario, "es_presidente", False):
            filial = usuario.filial
        serializer.save(solicitante=usuario, filial=filial)

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
