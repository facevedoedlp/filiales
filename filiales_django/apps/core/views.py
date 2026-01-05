from __future__ import annotations

from apps.auditoria.models import Accion
from apps.entradas.models import SolicitudEntrada
from apps.filiales.models import Autoridad, Filial
from django.db.models import Count
from rest_framework import permissions, response
from rest_framework.views import APIView


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        perfil = getattr(request.user, "perfil", None)
        if not perfil:
            return response.Response({})

        # Filtrar por filial si es usuario de filial
        queryset_filiales = Filial.objects.all()
        queryset_autoridades = Autoridad.objects.filter(activo=True)
        queryset_acciones = Accion.objects.all()
        queryset_entradas = SolicitudEntrada.objects.all()

        if perfil.es_usuario_filial and perfil.filial_id:
            queryset_filiales = queryset_filiales.filter(id=perfil.filial_id)
            queryset_autoridades = queryset_autoridades.filter(filial_id=perfil.filial_id)
            queryset_acciones = queryset_acciones.filter(filial_id=perfil.filial_id)
            queryset_entradas = queryset_entradas.filter(filial_id=perfil.filial_id)

        # Estadísticas generales
        total_filiales = queryset_filiales.count()
        total_autoridades = queryset_autoridades.count()
        total_acciones = queryset_acciones.count()
        total_entradas = queryset_entradas.count()

        return response.Response({
            "total_filiales": total_filiales,
            "total_integrantes": total_autoridades,  # Mapeamos autoridades como integrantes
            "total_acciones": total_acciones,
            "total_entradas": total_entradas,
        })


class DashboardResumenView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        perfil = getattr(request.user, "perfil", None)
        if not perfil:
            return response.Response({})

        queryset_filiales = Filial.objects.filter(activa=True)
        queryset_solicitudes = SolicitudEntrada.objects.filter(estado=SolicitudEntrada.Estados.PENDIENTE)

        if perfil.es_usuario_filial and perfil.filial_id:
            queryset_filiales = queryset_filiales.filter(id=perfil.filial_id)
            queryset_solicitudes = queryset_solicitudes.filter(filial_id=perfil.filial_id)

        # Resumen de estados
        filiales_activas = queryset_filiales.count()
        solicitudes_pendientes = queryset_solicitudes.count()

        return response.Response({
            "filiales_activas": filiales_activas,
            "solicitudes_pendientes": solicitudes_pendientes,
        })


class DashboardAccionesEstadisticasView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        perfil = getattr(request.user, "perfil", None)
        if not perfil:
            return response.Response({})

        acciones_queryset = Accion.objects.all()
        if perfil.es_usuario_filial and perfil.filial_id:
            acciones_queryset = acciones_queryset.filter(filial_id=perfil.filial_id)

        # Estadísticas por tipo de acción
        estadisticas = acciones_queryset.values("accion").annotate(total=Count("id")).order_by("-total")

        result = {}
        for stat in estadisticas:
            result[stat["accion"].lower()] = stat["total"]

        return response.Response(result)


class DashboardEntradasEstadisticasView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        perfil = getattr(request.user, "perfil", None)
        if not perfil:
            return response.Response({})

        solicitudes_queryset = SolicitudEntrada.objects.all()
        if perfil.es_usuario_filial and perfil.filial_id:
            solicitudes_queryset = solicitudes_queryset.filter(filial_id=perfil.filial_id)

        # Estadísticas por estado
        estadisticas = solicitudes_queryset.values("estado").annotate(total=Count("id")).order_by("-total")

        result = {}
        for stat in estadisticas:
            result[stat["estado"].lower()] = stat["total"]

        return response.Response(result)

