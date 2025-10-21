"""Rutas de autenticación y gestión de tokens."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CerrarSesionView,
    InicioSesionView,
    RefrescarTokenView,
    RegistroIntegranteView,
    PerfilActualView,
    IntegranteViewSet,
)

# Router para el ViewSet
router = DefaultRouter()
router.register(r'', IntegranteViewSet, basename='integrante')

urlpatterns = [
    # Auth endpoints
    path("login/", InicioSesionView.as_view(), name="login"),
    path("refresh/", RefrescarTokenView.as_view(), name="refresh"),
    path("logout/", CerrarSesionView.as_view(), name="logout"),
    path("register/", RegistroIntegranteView.as_view(), name="register"),
]