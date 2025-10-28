from __future__ import annotations

from apps.mensajes.models import Conversacion, Mensaje
from rest_framework import serializers


class ConversacionSerializer(serializers.ModelSerializer):
    creada_por = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Conversacion
        fields = [
            "id",
            "asunto",
            "creada_por",
            "visibilidad",
            "filial",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["creada_por", "created_at", "updated_at"]


class MensajeSerializer(serializers.ModelSerializer):
    emisor = serializers.PrimaryKeyRelatedField(read_only=True)
    leido_por = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Mensaje
        fields = [
            "id",
            "conversacion",
            "emisor",
            "texto",
            "leido_por",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["emisor", "leido_por", "created_at", "updated_at"]
