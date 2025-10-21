"""Endpoints de métricas del sistema."""
from django.db.models import Count, Sum
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.acciones.models import Accion
from apps.entradas.models import SolicitudEntrada
from apps.filiales.models import Filial
from apps.integrantes.models import Integrante


class DashboardViewSet(viewsets.ViewSet):
    """Colección de métricas agregadas."""

    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        return self.resumen(request)

    @action(detail=False, methods=["get"], url_path="resumen")
    def resumen(self, request, *args, **kwargs):
        data = {
            "total_filiales": Filial.objects.count(),
            "total_integrantes": Integrante.objects.count(),
            "acciones_publicadas": Accion.objects.filter(estado=Accion.Estado.PUBLICADA).count(),
            "solicitudes_pendientes": SolicitudEntrada.objects.filter(
                estado=SolicitudEntrada.Estado.PENDIENTE
            ).count(),
        }
        return Response(data)

    @action(detail=True, methods=["get"], url_path="filial")
    def filial(self, request, pk=None):
        filial = Filial.objects.get(pk=pk)
        acciones = filial.acciones.aggregate(total=Count("id"))
        integrantes = filial.integrantes.aggregate(total=Count("id"))
        entradas = filial.solicitudes_entradas.aggregate(
            solicitadas=Sum("cantidad_solicitada"), aprobadas=Sum("cantidad_aprobada")
        )
        data = {
            "filial": filial.nombre,
            "acciones": acciones.get("total", 0) or 0,
            "integrantes": integrantes.get("total", 0) or 0,
            "entradas_solicitadas": entradas.get("solicitadas", 0) or 0,
            "entradas_aprobadas": entradas.get("aprobadas", 0) or 0,
        }
        return Response(data)

    @action(detail=False, methods=["get"], url_path="acciones/estadisticas")
    def acciones_estadisticas(self, request, *args, **kwargs):
        datos = (
            Accion.objects.values("estado")
            .annotate(total=Count("id"))
            .order_by("estado")
        )
        return Response(list(datos))

    @action(detail=False, methods=["get"], url_path="entradas/estadisticas")
    def entradas_estadisticas(self, request, *args, **kwargs):
        datos = (
            SolicitudEntrada.objects.values("estado")
            .annotate(total=Count("id"))
            .order_by("estado")
        )
        return Response(list(datos))
