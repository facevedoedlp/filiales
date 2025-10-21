"""Mixins reutilizables."""
from rest_framework import permissions


class FiltroPorFilialMixin:
    """Restringe la consulta a la filial del usuario cuando aplica."""

    filial_field = "filial"

    def get_queryset(self):
        queryset = super().get_queryset()
        usuario = self.request.user
        if usuario.is_authenticated and not getattr(usuario, "es_admin", False) and getattr(usuario, "filial", None):
            filtro = {self.filial_field: usuario.filial}
            return queryset.filter(**filtro)
        return queryset

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()
