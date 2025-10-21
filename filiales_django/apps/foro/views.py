"""Vistas del foro."""
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.permissions import EsAdministrador

from .models import Categoria, Hilo, Respuesta
from .serializers import CategoriaSerializer, HiloSerializer, RespuestaSerializer


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [EsAdministrador]
    lookup_field = "slug"


class HiloViewSet(viewsets.ModelViewSet):
    queryset = Hilo.objects.select_related("categoria", "autor").prefetch_related("respuestas")
    serializer_class = HiloSerializer
    filterset_fields = ["categoria", "estado"]
    search_fields = ["titulo", "contenido"]
    ordering_fields = ["creado", "actualizado"]

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [permissions.IsAuthenticated()]
        if self.action == "create":
            return [permissions.IsAuthenticated()]
        if self.action in {"update", "partial_update", "close", "destroy"}:
            return [EsAdministrador()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(autor=self.request.user)

    @action(detail=True, methods=["post"], url_path="cerrar")
    def close(self, request, *args, **kwargs):
        hilo = self.get_object()
        hilo.estado = Hilo.Estado.CERRADO
        hilo.save(update_fields=["estado"])
        return Response(self.get_serializer(hilo).data)


class RespuestaViewSet(viewsets.ModelViewSet):
    queryset = Respuesta.objects.select_related("hilo", "autor", "respuesta_padre")
    serializer_class = RespuestaSerializer
    filterset_fields = ["hilo", "autor"]

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [permissions.IsAuthenticated()]
        if self.action == "create":
            return [permissions.IsAuthenticated()]
        if self.action in {"update", "partial_update", "destroy"}:
            return [EsAdministrador()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(autor=self.request.user)
