from __future__ import annotations

from apps.auditoria.views import AccionViewSet
from apps.entradas.views import AsignacionEntradaViewSet, SolicitudEntradaViewSet
from apps.filiales.views import AutoridadViewSet, FilialViewSet
from apps.mensajes.views import ConversacionViewSet, MensajeViewSet
from apps.partidos.views import PartidoViewSet
from apps.pedidos.views import PedidoItemViewSet, PedidoViewSet, ProductoViewSet
from apps.usuarios.views import MeView
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
router.register(
    "asignaciones-entrada", AsignacionEntradaViewSet, basename="asignacion-entrada"
)
router.register("productos", ProductoViewSet, basename="producto")
router.register("pedidos", PedidoViewSet, basename="pedido")
router.register("pedido-items", PedidoItemViewSet, basename="pedido-item")
router.register("conversaciones", ConversacionViewSet, basename="conversacion")
router.register("mensajes", MensajeViewSet, basename="mensaje")
router.register("auditoria", AccionViewSet, basename="auditoria")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.usuarios.urls")),
    path("api/me", MeView.as_view(), name="me"),
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
