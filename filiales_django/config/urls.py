from __future__ import annotations

from apps.auditoria.views import AccionViewSet
from apps.acciones.views import AccionSolidariaViewSet
from apps.entradas.views import AsignacionEntradaViewSet, SolicitudEntradaViewSet
from apps.filiales.views import AutoridadViewSet, FilialMapaView, FilialViewSet
from apps.mensajes.views import ConversacionViewSet, MensajeViewSet
from apps.partidos.views import PartidoViewSet
from apps.pedidos.views import PedidoItemViewSet, PedidoViewSet, ProductoViewSet
from apps.core.views import (
    DashboardAccionesEstadisticasView,
    DashboardEntradasEstadisticasView,
    DashboardResumenView,
    DashboardView,
)
from apps.foro.views import CategoriaViewSet, HiloViewSet, RespuestaViewSet
from apps.usuarios.views import MeView
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from rest_framework.routers import DefaultRouter

schema_view = get_schema_view(
    openapi.Info(
        title="Sistema de Gestión de Filiales",
        default_version="v1",
        description="API para la gestión de filiales de Estudiantes de La Plata.",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

router = DefaultRouter()
router.register("filiales", FilialViewSet, basename="filial")
router.register("autoridades", AutoridadViewSet, basename="autoridad")
router.register("partidos", PartidoViewSet, basename="partido")
router.register(
    "solicitudes-entrada", SolicitudEntradaViewSet, basename="solicitud-entrada"
)
router.register("entradas", SolicitudEntradaViewSet, basename="entrada")  # Alias para compatibilidad
router.register(
    "asignaciones-entrada", AsignacionEntradaViewSet, basename="asignacion-entrada"
)
router.register("productos", ProductoViewSet, basename="producto")
router.register("pedidos", PedidoViewSet, basename="pedido")
router.register("pedido-items", PedidoItemViewSet, basename="pedido-item")
router.register("conversaciones", ConversacionViewSet, basename="conversacion")
router.register("mensajes", MensajeViewSet, basename="mensaje")
router.register("auditoria", AccionViewSet, basename="auditoria")
router.register("acciones", AccionSolidariaViewSet, basename="accion")
router.register("integrantes", AutoridadViewSet, basename="integrante")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.usuarios.urls")),
    path("api/me/", MeView.as_view(), name="me"),
    path("api/integrantes/me/", MeView.as_view(), name="integrantes-me"),  # Alias para compatibilidad
    path("api/dashboard/", DashboardView.as_view(), name="dashboard"),
    path("api/dashboard/resumen/", DashboardResumenView.as_view(), name="dashboard-resumen"),
    path("api/dashboard/acciones/estadisticas/", DashboardAccionesEstadisticasView.as_view(), name="dashboard-acciones"),
    path("api/dashboard/entradas/estadisticas/", DashboardEntradasEstadisticasView.as_view(), name="dashboard-entradas"),
    path("api/filiales/mapa/", FilialMapaView.as_view(), name="filiales-mapa"),
    # Endpoints de foro (stub - mapean a conversaciones y mensajes)
    path("api/foro/categorias/", CategoriaViewSet.as_view({"get": "list", "post": "create"}), name="foro-categorias"),
    path("api/foro/categorias/<slug:slug>/", CategoriaViewSet.as_view({"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}), name="foro-categoria-detail"),
    path("api/foro/hilos/", HiloViewSet.as_view({"get": "list", "post": "create"}), name="foro-hilos"),
    path("api/foro/hilos/<int:pk>/", HiloViewSet.as_view({"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}), name="foro-hilo-detail"),
    path("api/foro/respuestas/", RespuestaViewSet.as_view({"get": "list", "post": "create"}), name="foro-respuestas"),
    path("api/foro/respuestas/<int:pk>/", RespuestaViewSet.as_view({"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}), name="foro-respuesta-detail"),
    path("api/", include(router.urls)),
    path("health/", lambda request: HttpResponse("ok"), name="health"),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path(
        "swagger.json",
        schema_view.without_ui(cache_timeout=0),
        name="schema-json",
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
