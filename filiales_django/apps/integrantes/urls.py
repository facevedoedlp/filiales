"""Rutas de autenticación y gestión de tokens."""
from django.urls import path

from .views import CerrarSesionView, InicioSesionView, RefrescarTokenView

urlpatterns = [
    path("login/", InicioSesionView.as_view(), name="login"),
    path("refresh/", RefrescarTokenView.as_view(), name="refresh"),
    path("logout/", CerrarSesionView.as_view(), name="logout"),
]
