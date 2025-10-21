"""Serializadores del foro."""
from rest_framework import serializers

from .models import Categoria, Hilo, Respuesta


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ["id", "nombre", "descripcion", "slug"]


class RespuestaSerializer(serializers.ModelSerializer):
    autor_nombre = serializers.CharField(source="autor.get_full_name", read_only=True)

    class Meta:
        model = Respuesta
        fields = [
            "id",
            "hilo",
            "autor",
            "autor_nombre",
            "contenido",
            "respuesta_padre",
            "creado",
            "actualizado",
            "es_moderada",
            "motivo_moderacion",
        ]
        read_only_fields = ("id", "autor_nombre", "creado", "actualizado", "es_moderada", "motivo_moderacion")


class HiloSerializer(serializers.ModelSerializer):
    autor_nombre = serializers.CharField(source="autor.get_full_name", read_only=True)
    respuestas = RespuestaSerializer(many=True, read_only=True)

    class Meta:
        model = Hilo
        fields = [
            "id",
            "categoria",
            "autor",
            "autor_nombre",
            "titulo",
            "contenido",
            "estado",
            "creado",
            "actualizado",
            "respuestas",
        ]
        read_only_fields = ("id", "autor_nombre", "creado", "actualizado", "respuestas")
