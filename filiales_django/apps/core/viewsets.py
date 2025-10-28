from __future__ import annotations

from typing import Any

from apps.auditoria.models import Accion
from apps.core.audit import log_action
from apps.core.pagination import DefaultPageNumberPagination
from apps.core.permissions import RoleBasedPermission
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated


class BaseModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    pagination_class = DefaultPageNumberPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    audit_recurso: str | None = None

    def get_audit_recurso(self) -> str:
        if self.audit_recurso:
            return self.audit_recurso
        return self.get_queryset().model._meta.label

    def get_filial_from_instance(self, instance: Any):
        for attr in ("filial", "pedido", "solicitud", "conversacion"):
            if hasattr(instance, attr):
                related = getattr(instance, attr)
                if related is None:
                    continue
                if hasattr(related, "filial"):
                    return related.filial
                if attr == "filial":
                    return related
        return getattr(instance, "filial", None)

    def log_action(self, instance, accion: str, payload: dict[str, Any] | None = None):
        filial = self.get_filial_from_instance(instance)
        log_action(
            usuario=self.request.user,
            recurso=self.get_audit_recurso(),
            recurso_id=getattr(instance, "pk", None),
            accion=accion,
            payload=payload,
            filial=filial,
            request=self.request,
        )

    def get_serializer_save_kwargs(self, *, action: str) -> dict[str, Any]:
        return {}

    def perform_create(self, serializer):  # type: ignore[override]
        instance = serializer.save(**self.get_serializer_save_kwargs(action="create"))
        self.log_action(instance, Accion.Tipos.CREAR)

    def perform_update(self, serializer):  # type: ignore[override]
        instance = serializer.save(**self.get_serializer_save_kwargs(action="update"))
        self.log_action(instance, Accion.Tipos.ACTUALIZAR)

    def perform_destroy(self, instance):  # type: ignore[override]
        pk = getattr(instance, "pk", None)
        super().perform_destroy(instance)
        log_action(
            usuario=self.request.user,
            recurso=self.get_audit_recurso(),
            recurso_id=pk,
            accion=Accion.Tipos.ELIMINAR,
            filial=self.get_filial_from_instance(instance),
            request=self.request,
        )
