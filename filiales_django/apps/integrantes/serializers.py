"""Serializadores para la gestión de integrantes."""
from django.contrib.auth import get_user_model
from rest_framework import serializers

Integrante = get_user_model()


class IntegranteSerializer(serializers.ModelSerializer):
    """Serializador principal de integrantes."""

    class Meta:
        model = Integrante
        fields = [
            "id",
            "username",
            "email",
            "nombre",
            "apellido",
            "documento",
            "telefono",
            "filial",
            "rol",
            "estado_membresia",
            "fecha_ingreso",
            "is_active",
        ]
        read_only_fields = ("id", "fecha_ingreso")


class CambiarEstadoSerializer(serializers.ModelSerializer):
    """Serializador para actualizar rol y estado."""

    class Meta:
        model = Integrante
        fields = ["rol", "estado_membresia", "is_active"]
