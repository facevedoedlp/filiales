from __future__ import annotations

import csv
from io import StringIO

from apps.auditoria.models import Accion
from apps.auditoria.serializers import AccionSerializer
from apps.core.viewsets import BaseModelViewSet
from django.http import HttpResponse
from rest_framework import decorators


class AccionViewSet(BaseModelViewSet):
    queryset = Accion.objects.select_related("usuario", "filial")
    serializer_class = AccionSerializer
    filterset_fields = {
        "usuario": ["exact"],
        "filial": ["exact"],
        "recurso": ["exact"],
        "accion": ["exact"],
        "created_at": ["date", "date__gte", "date__lte"],
    }
    search_fields = ["recurso", "accion"]
    ordering_fields = ["created_at", "accion", "recurso"]
    http_method_names = ["get", "head", "options"]
    allow_filial_user_writes = False

    def get_queryset(self):  # type: ignore[override]
        queryset = super().get_queryset()
        perfil = getattr(self.request.user, "perfil", None)
        if not perfil:
            return queryset.none()
        if perfil.es_admin or perfil.es_coordinador:
            return queryset
        if perfil.es_usuario_filial and perfil.filial_id:
            return queryset.filter(filial_id=perfil.filial_id)
        return queryset.none()

    @decorators.action(detail=False, methods=["get"], url_path="exportar")
    def exportar(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(
            ["id", "usuario", "filial", "recurso", "recurso_id", "accion", "created_at"]
        )
        for accion in queryset:
            writer.writerow(
                [
                    accion.id,
                    accion.usuario_id,
                    accion.filial_id,
                    accion.recurso,
                    accion.recurso_id,
                    accion.accion,
                    accion.created_at.isoformat(),
                ]
            )
        response = HttpResponse(buffer.getvalue(), content_type="text/csv")
        response["Content-Disposition"] = "attachment; filename=auditoria.csv"
        return response
