from __future__ import annotations

from typing import Iterable

from django.utils.functional import cached_property
from rest_framework.permissions import SAFE_METHODS, BasePermission


def _get_profile(request):
    user = getattr(request, "user", None)
    return getattr(user, "perfil", None)


class IsAdminAllAccess(BasePermission):
    """Permite acceso total solo a administradores."""

    def has_permission(self, request, view):  # type: ignore[override]
        profile = _get_profile(request)
        return bool(profile and profile.es_admin)

    def has_object_permission(self, request, view, obj):  # type: ignore[override]
        return self.has_permission(request, view)


class IsCoordinatorReadOnlyAll(BasePermission):
    """Permite acceso de solo lectura a coordinadores."""

    def has_permission(self, request, view):  # type: ignore[override]
        profile = _get_profile(request)
        if not profile:
            return False
        if profile.es_admin:
            return True
        if profile.es_coordinador:
            return request.method in SAFE_METHODS
        return False

    def has_object_permission(self, request, view, obj):  # type: ignore[override]
        return self.has_permission(request, view)


class IsFilialUserOwnScope(BasePermission):
    """Usuarios de filial solo acceden a su propio alcance."""

    def _allows_write(self, view, request) -> bool:
        allow = getattr(view, "allow_filial_user_writes", True)
        if allow:
            return True
        return request.method in SAFE_METHODS

    def has_permission(self, request, view):  # type: ignore[override]
        profile = _get_profile(request)
        if not profile:
            return False
        if profile.es_admin:
            return True
        if profile.es_coordinador:
            return request.method in SAFE_METHODS
        if profile.es_usuario_filial:
            return self._allows_write(view, request)
        return False

    def has_object_permission(self, request, view, obj):  # type: ignore[override]
        profile = _get_profile(request)
        if not profile:
            return False
        if profile.es_admin:
            return True
        if profile.es_coordinador:
            return request.method in SAFE_METHODS
        if profile.es_usuario_filial:
            return self._allows_write(view, request)
        return False


class RoleBasedPermission(BasePermission):
    """Agrupa las políticas de rol para simplificar su uso."""

    permission_classes: Iterable[type[BasePermission]] = (
        IsAdminAllAccess,
        IsCoordinatorReadOnlyAll,
        IsFilialUserOwnScope,
    )

    @cached_property
    def _permissions(self) -> list[BasePermission]:
        return [permission() for permission in self.permission_classes]

    def has_permission(self, request, view):  # type: ignore[override]
        return any(
            permission.has_permission(request, view) for permission in self._permissions
        )

    def has_object_permission(self, request, view, obj):  # type: ignore[override]
        return any(
            permission.has_object_permission(request, view, obj)
            for permission in self._permissions
        )
