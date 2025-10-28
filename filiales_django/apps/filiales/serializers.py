"""Serializadores del módulo de filiales."""
from rest_framework import serializers

from .models import Filial


class FilialSerializer(serializers.ModelSerializer):
    """Serializador base de filiales."""

    presidente_nombre = serializers.CharField(source="presidente.get_full_name", read_only=True)

    class Meta:
        model = Filial
        fields = [
            "id",
            "nombre",
            "descripcion",
            "direccion",
            "ciudad",
            "provincia",
            "pais",
            "latitud",
            "longitud",
            "telefono",
            "email",
            "presidente",
            "presidente_nombre",
            "fecha_creacion",
            "estado",
        ]
        read_only_fields = ("id", "fecha_creacion", "presidente_nombre")
