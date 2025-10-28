from __future__ import annotations

from apps.auditoria.models import Accion
from rest_framework import serializers


class AccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Accion
        fields = [
            "id",
            "usuario",
            "filial",
            "recurso",
            "recurso_id",
            "accion",
            "payload",
            "ip",
            "user_agent",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
