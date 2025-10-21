"""Vistas del módulo de acciones."""
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.mixins import FiltroPorFilialMixin
from core.permissions import EsAdministrador, EsPresidenteOAdmin

from .models import Accion, AccionImagen
from .serializers import AccionImagenSerializer, AccionSerializer


class AccionViewSet(FiltroPorFilialMixin, viewsets.ModelViewSet):
    """Gestión de acciones de filiales."""

    queryset = Accion.objects.select_related("filial", "creador").prefetch_related("imagenes")
    serializer_class = AccionSerializer
    filterset_fields = ["filial", "estado"]
    search_fields = ["titulo", "descripcion"]
    ordering_fields = ["fecha", "creada"]

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [permissions.IsAuthenticated()]
        if self.action in {"create", "update", "partial_update"}:
            return [EsPresidenteOAdmin()]
        if self.action == "destroy":
            return [EsAdministrador()]
        return super().get_permissions()

    @action(detail=True, methods=["post"], serializer_class=AccionImagenSerializer)
    def imagenes(self, request, *args, **kwargs):
        accion = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(accion=accion)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
