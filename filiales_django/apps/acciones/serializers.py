"""Serializadores del módulo de acciones."""
from rest_framework import serializers

from .models import Accion, AccionImagen


class AccionImagenSerializer(serializers.ModelSerializer):
    """Serializador para imágenes de acciones."""

    class Meta:
        model = AccionImagen
        fields = ["id", "imagen", "descripcion", "creada"]
        read_only_fields = ("id", "creada")


class AccionSerializer(serializers.ModelSerializer):
    """Serializador principal de acciones."""

    imagenes = AccionImagenSerializer(many=True, read_only=True)

    class Meta:
        model = Accion
        fields = [
            "id",
            "filial",
            "titulo",
            "descripcion",
            "fecha",
            "creador",
            "estado",
            "creada",
            "actualizada",
            "imagenes",
        ]
        read_only_fields = ("id", "creada", "actualizada", "imagenes")
