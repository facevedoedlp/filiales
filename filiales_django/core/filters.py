"""Filtros compartidos para la API."""
from django_filters import rest_framework as filters

from apps.acciones.models import Accion
from apps.filiales.models import Filial


class AccionFilter(filters.FilterSet):
    fecha_desde = filters.DateFilter(field_name="fecha", lookup_expr="gte")
    fecha_hasta = filters.DateFilter(field_name="fecha", lookup_expr="lte")

    class Meta:
        model = Accion
        fields = ["filial", "estado", "fecha_desde", "fecha_hasta"]


class FilialFilter(filters.FilterSet):
    nombre = filters.CharFilter(field_name="nombre", lookup_expr="icontains")

    class Meta:
        model = Filial
        fields = ["nombre", "provincia", "estado"]
