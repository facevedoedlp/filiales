from __future__ import annotations

from apps.partidos.models import Partido
from rest_framework import serializers


class PartidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partido
        fields = [
            "id",
            "titulo",
            "fecha",
            "lugar",
            "descripcion",
            "estado",
            "habilitado",
            "solo_socios",
            "cupo_total",
            "cupo_disponible",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate(self, attrs):  # type: ignore[override]
        cupo_total = attrs.get("cupo_total", getattr(self.instance, "cupo_total", None))
        cupo_disponible = attrs.get(
            "cupo_disponible", getattr(self.instance, "cupo_disponible", None)
        )
        if (
            cupo_total is not None
            and cupo_disponible is not None
            and cupo_disponible > cupo_total
        ):
            raise serializers.ValidationError(
                "El cupo disponible no puede superar el total."
            )
        return attrs
