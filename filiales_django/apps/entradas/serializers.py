"""Serializadores para solicitudes de entradas."""
from django.utils import timezone
from rest_framework import serializers

from .models import SolicitudEntrada


class SolicitudEntradaSerializer(serializers.ModelSerializer):
    """Serializador base."""

    class Meta:
        model = SolicitudEntrada
        fields = [
            "id",
            "filial",
            "solicitante",
            "cantidad_solicitada",
            "cantidad_aprobada",
            "estado",
            "motivo",
            "fecha_solicitud",
            "fecha_resolucion",
            "resolvio",
        ]
        read_only_fields = ("id", "fecha_solicitud", "fecha_resolucion", "resolvio")


class ResolverSolicitudSerializer(serializers.ModelSerializer):
    """Serializador para aprobar o rechazar solicitudes."""

    class Meta:
        model = SolicitudEntrada
        fields = ["cantidad_aprobada", "estado"]

    def validate(self, attrs):
        estado = attrs.get("estado")
        cantidad_aprobada = attrs.get("cantidad_aprobada", 0)
        if estado == SolicitudEntrada.Estado.APROBADA and cantidad_aprobada <= 0:
            raise serializers.ValidationError("Debe indicar una cantidad aprobada mayor a cero.")
        return attrs

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        instance.fecha_resolucion = timezone.now()
        usuario = self.context.get("request").user
        instance.resolvio = usuario
        instance.save(update_fields=["fecha_resolucion", "resolvio"])
        return instance
