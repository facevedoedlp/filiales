from __future__ import annotations

from apps.filiales.models import Autoridad, Filial
from rest_framework import serializers


class FilialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filial
        fields = [
            "id",
            "nombre",
            "codigo",
            "activa",
            "direccion",
            "ciudad",
            "provincia",
            "pais",
            "contacto_email",
            "contacto_telefono",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class AutoridadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Autoridad
        fields = [
            "id",
            "filial",
            "cargo",
            "persona_nombre",
            "persona_documento",
            "email",
            "telefono",
            "desde",
            "hasta",
            "activo",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate(self, attrs):  # type: ignore[override]
        filial = attrs.get("filial") or getattr(self.instance, "filial", None)
        if not filial:
            raise serializers.ValidationError("La filial es obligatoria.")
        return super().validate(attrs)
