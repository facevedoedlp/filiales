from __future__ import annotations

from apps.entradas.models import AsignacionEntrada, SolicitudEntrada
from rest_framework import serializers


class SolicitudEntradaSerializer(serializers.ModelSerializer):
    filial = serializers.PrimaryKeyRelatedField(read_only=True)
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = SolicitudEntrada
        fields = [
            "id",
            "filial",
            "partido",
            "cantidad_solicitada",
            "motivo",
            "estado",
            "observaciones",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["estado", "created_by", "created_at", "updated_at"]


class AsignacionEntradaSerializer(serializers.ModelSerializer):
    asignado_por = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = AsignacionEntrada
        fields = [
            "id",
            "solicitud",
            "cantidad_asignada",
            "asignado_por",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["asignado_por", "created_at", "updated_at"]
