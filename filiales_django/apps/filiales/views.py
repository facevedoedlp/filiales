"""ViewSets del módulo de filiales."""
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.permissions import EsAdministrador

from .models import Filial
from .serializers import FilialSerializer


class FilialViewSet(viewsets.ModelViewSet):
    """CRUD completo para filiales."""

    queryset = Filial.objects.select_related("presidente").all()
    serializer_class = FilialSerializer
    filterset_fields = ["estado", "provincia"]
    search_fields = ["nombre", "ciudad", "provincia"]
    ordering_fields = ["nombre", "fecha_creacion"]

    def get_permissions(self):
        if self.action in {"list", "retrieve", "mapa"}:
            return [permissions.IsAuthenticated()]
        return [EsAdministrador()]

    @action(detail=False, methods=["get"], url_path="mapa")
    def mapa(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        datos = queryset.values("id", "nombre", "latitud", "longitud", "ciudad", "provincia")
        return Response(datos)
