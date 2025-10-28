"""Serializadores del foro."""
from rest_framework import serializers

from .models import Categoria, Respuesta, Tema


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
            "tema",
            "autor",
            "autor_nombre",
            "contenido",
            "respuesta_padre",
            "created_at",
            "updated_at",
            "es_moderada",
            "motivo_moderacion",
        ]
        read_only_fields = (
            "id",
            "autor_nombre",
            "created_at",
            "updated_at",
            "es_moderada",
            "motivo_moderacion",
        )
        extra_kwargs = {"tema": {"required": False}}


class TemaSerializer(serializers.ModelSerializer):
    autor_nombre = serializers.CharField(source="autor.get_full_name", read_only=True)
    filial_nombre = serializers.CharField(source="filial.nombre", read_only=True)
    respuestas = RespuestaSerializer(many=True, read_only=True)

    class Meta:
        model = Tema
        fields = [
            "id",
            "categoria",
            "autor",
            "autor_nombre",
            "filial",
            "filial_nombre",
            "titulo",
            "contenido",
            "fijado",
            "cerrado",
            "created_at",
            "updated_at",
            "respuestas",
        ]
        read_only_fields = (
            "id",
            "autor_nombre",
            "filial_nombre",
            "created_at",
            "updated_at",
            "respuestas",
        )
