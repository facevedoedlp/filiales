"""Permisos reutilizables en toda la plataforma."""
from rest_framework.permissions import BasePermission


class EsAdministrador(BasePermission):
    """Permite acceso solo a administradores."""

    message = "Se requiere rol de administrador."

    def has_permission(self, request, view):
        usuario = request.user
        return bool(usuario and usuario.is_authenticated and (usuario.is_staff or getattr(usuario, "es_admin", False)))


class EsPresidente(BasePermission):
    """Permite acceso a presidentes."""

    message = "Se requiere rol de presidente."

    def has_permission(self, request, view):
        usuario = request.user
        return bool(usuario and usuario.is_authenticated and getattr(usuario, "es_presidente", False))


class EsPresidenteOAdmin(BasePermission):
    """Permite acceso a presidentes o administradores."""

    message = "Se requiere rol de presidente o administrador."

    def has_permission(self, request, view):
        usuario = request.user
        return bool(
            usuario
            and usuario.is_authenticated
            and (getattr(usuario, "es_presidente", False) or getattr(usuario, "es_admin", False))
        )


class EsMismoUsuario(BasePermission):
    """Valida que el usuario pueda acceder a su propia información."""

    message = "Solo puedes acceder a tus propios datos."

    def has_object_permission(self, request, view, obj):
        return bool(obj == request.user or getattr(request.user, "es_admin", False))
