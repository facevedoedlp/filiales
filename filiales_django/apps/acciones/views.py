"""Vistas del módulo de acciones."""
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from core.permissions import EsAdministrador, EsPresidenteOAdmin

from .models import Accion, AccionImagen
from .serializers import AccionImagenSerializer, AccionSerializer


class AccionViewSet(viewsets.ModelViewSet):
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

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.method in permissions.SAFE_METHODS:
            return queryset
        usuario = self.request.user
        if getattr(usuario, "es_admin", False):
            return queryset
        if getattr(usuario, "filial_id", None):
            return queryset.filter(filial=usuario.filial)
        return queryset.none()

    def perform_create(self, serializer):
        usuario = self.request.user
        datos_extra = {"creador": usuario}
        if getattr(usuario, "es_presidente", False):
            datos_extra["filial"] = usuario.filial
        serializer.save(**datos_extra)

    def perform_update(self, serializer):
        usuario = self.request.user
        accion = serializer.instance
        if getattr(usuario, "es_presidente", False) and accion.filial_id != usuario.filial_id:
            raise PermissionDenied("Solo puedes editar acciones de tu filial")
        if getattr(usuario, "es_presidente", False):
            serializer.save(creador=accion.creador or usuario, filial=usuario.filial)
        else:
            serializer.save(creador=accion.creador or usuario)

    @action(detail=True, methods=["post"], serializer_class=AccionImagenSerializer)
    def imagenes(self, request, *args, **kwargs):
        accion = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(accion=accion)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
