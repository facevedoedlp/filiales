from __future__ import annotations

from apps.entradas.models import AsignacionEntrada, SolicitudEntrada
from apps.filiales.models import Filial
from apps.partidos.models import Partido
from rest_framework import serializers


class SolicitudEntradaSerializer(serializers.ModelSerializer):
    filial = serializers.PrimaryKeyRelatedField(queryset=Filial.objects.all(), required=False)
    filial_nombre = serializers.CharField(source="filial.nombre", read_only=True)
    partido_titulo = serializers.CharField(source="partido.titulo", read_only=True)
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)
    created_by_nombre = serializers.SerializerMethodField()

    class Meta:
        model = SolicitudEntrada
        fields = [
            "id",
            "filial",
            "filial_nombre",
            "partido",
            "partido_titulo",
            "cantidad_solicitada",
            "motivo",
            "estado",
            "observaciones",
            "created_by",
            "created_by_nombre",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["estado", "created_by", "created_at", "updated_at"]

    def get_created_by_nombre(self, obj):
        if not obj.created_by:
            return None
        full_name = f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()
        return full_name or obj.created_by.username

    def validate(self, attrs):  # type: ignore[override]
        request = self.context.get("request")
        perfil = getattr(getattr(request, "user", None), "perfil", None)
        is_admin = bool(perfil and perfil.es_admin)
        if not is_admin:
            attrs.pop("filial", None)
        partido = attrs.get("partido") or getattr(self.instance, "partido", None)
        if partido and not partido.habilitado:
            raise serializers.ValidationError(
                {"partido": "El partido no esta habilitado para solicitudes."}
            )
        if partido and partido.solo_socios and not is_admin:
            es_socio = bool(perfil and getattr(perfil, "es_socio", False))
            if not es_socio:
                raise serializers.ValidationError(
                    {"partido": "Solo socios pueden solicitar entradas para este partido."}
                )
        return super().validate(attrs)


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
