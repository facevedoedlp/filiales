from __future__ import annotations

from typing import Any

from django.db.models import QuerySet


class FilialScopedQuerysetMixin:
    """Restringe los queryset al alcance de la filial del usuario."""

    scope_field: str = "filial"
    scope_lookup: str | None = None

    def get_profile(self):
        return getattr(getattr(self.request, "user", None), "perfil", None)

    def apply_filial_scope(self, queryset: QuerySet, filial_id: int) -> QuerySet:
        lookup = self.scope_lookup or f"{self.scope_field}"
        return queryset.filter(**{lookup: filial_id})

    def get_queryset(self) -> QuerySet[Any]:  # type: ignore[override]
        queryset = super().get_queryset()  # type: ignore[misc]
        profile = self.get_profile()
        if not profile:
            return queryset.none()
        if profile.es_admin or profile.es_coordinador:
            return queryset
        if not profile.filial_id:
            return queryset.none()
        return self.apply_filial_scope(queryset, profile.filial_id)

    def get_serializer_save_kwargs(self, *, action: str):  # type: ignore[override]
        kwargs = super().get_serializer_save_kwargs(action=action)  # type: ignore[misc]
        profile = self.get_profile()
        if profile and profile.es_usuario_filial:
            kwargs[self.scope_field] = profile.filial
        return kwargs
