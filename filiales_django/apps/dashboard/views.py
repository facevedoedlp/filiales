"""Endpoints de métricas del sistema."""
from django.db.models import Count, Sum
from rest_framework import permissions, status, viewsets
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

    def _filtrar_filiales(self):
        usuario = self.request.user
        if getattr(usuario, "es_admin", False):
            return Filial.objects.all()
        if getattr(usuario, "filial_id", None):
            return Filial.objects.filter(pk=usuario.filial_id)
        return Filial.objects.none()

    def _filtrar_integrantes(self):
        usuario = self.request.user
        if getattr(usuario, "es_admin", False):
            return Integrante.objects.all()
        if getattr(usuario, "filial_id", None):
            return Integrante.objects.filter(filial=usuario.filial)
        return Integrante.objects.filter(pk=usuario.pk)

    def _filtrar_acciones(self):
        usuario = self.request.user
        if getattr(usuario, "es_admin", False):
            return Accion.objects.all()
        if getattr(usuario, "filial_id", None):
            return Accion.objects.filter(filial=usuario.filial)
        return Accion.objects.none()

    def _filtrar_solicitudes(self):
        usuario = self.request.user
        if getattr(usuario, "es_admin", False):
            return SolicitudEntrada.objects.all()
        if getattr(usuario, "filial_id", None):
            return SolicitudEntrada.objects.filter(filial=usuario.filial)
        return SolicitudEntrada.objects.none()

    @action(detail=False, methods=["get"], url_path="resumen")
    def resumen(self, request, *args, **kwargs):
        filiales = self._filtrar_filiales()
        integrantes = self._filtrar_integrantes()
        acciones = self._filtrar_acciones()
        solicitudes = self._filtrar_solicitudes()
        data = {
            "total_filiales": filiales.count(),
            "total_integrantes": integrantes.count(),
            "acciones_publicadas": acciones.filter(estado=Accion.Estado.PUBLICADA).count(),
            "solicitudes_pendientes": solicitudes.filter(estado=SolicitudEntrada.Estado.PENDIENTE).count(),
        }
        return Response(data)

    @action(detail=True, methods=["get"], url_path="filial")
    def filial(self, request, pk=None):
        filiales = self._filtrar_filiales()
        filial = filiales.filter(pk=pk).first()
        if filial is None:
            return Response({"detail": "No tienes acceso a esta filial"}, status=status.HTTP_404_NOT_FOUND)
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
        datos = self._filtrar_acciones().values("estado").annotate(total=Count("id")).order_by("estado")
        return Response(list(datos))

    @action(detail=False, methods=["get"], url_path="entradas/estadisticas")
    def entradas_estadisticas(self, request, *args, **kwargs):
        datos = (
            self._filtrar_solicitudes()
            .values("estado")
            .annotate(total=Count("id"))
            .order_by("estado")
        )
        return Response(list(datos))
