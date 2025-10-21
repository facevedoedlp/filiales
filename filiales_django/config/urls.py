"""Enrutamiento principal del proyecto."""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter

from apps.acciones.views import AccionViewSet
from apps.dashboard.views import DashboardViewSet
from apps.entradas.views import SolicitudEntradaViewSet
from apps.filiales.views import FilialViewSet
from apps.foro.views import CategoriaViewSet, HiloViewSet, RespuestaViewSet
from apps.integrantes.views import IntegranteViewSet, PerfilActualView

router = DefaultRouter()
router.register(r"filiales", FilialViewSet, basename="filial")
router.register(r"integrantes", IntegranteViewSet, basename="integrante")
router.register(r"acciones", AccionViewSet, basename="accion")
router.register(r"entradas", SolicitudEntradaViewSet, basename="solicitud-entrada")
router.register(r"foro/categorias", CategoriaViewSet, basename="foro-categoria")
router.register(r"foro/hilos", HiloViewSet, basename="foro-hilo")
router.register(r"foro/respuestas", RespuestaViewSet, basename="foro-respuesta")
router.register(r"dashboard", DashboardViewSet, basename="dashboard")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.integrantes.urls")),
    path("api/", include(router.urls)),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/integrantes/me/", PerfilActualView.as_view(), name="perfil-actual"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
