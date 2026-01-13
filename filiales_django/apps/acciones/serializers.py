from __future__ import annotations

from apps.acciones.models import AccionImagen, AccionSolidaria
from rest_framework import serializers


class AccionImagenSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = AccionImagen
        fields = ["id", "url", "es_principal", "created_at"]
        read_only_fields = fields

    def get_url(self, obj):
        if not obj.imagen:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.imagen.url)
        return obj.imagen.url


class AccionSolidariaSerializer(serializers.ModelSerializer):
    filial_nombre = serializers.CharField(source="filial.nombre", read_only=True)
    imagen_principal_url = serializers.SerializerMethodField()
    imagenes = serializers.SerializerMethodField()

    class Meta:
        model = AccionSolidaria
        fields = [
            "id",
            "filial",
            "filial_nombre",
            "nombre",
            "descripcion",
            "fecha",
            "estado",
            "ubicacion",
            "participantes",
            "imagen_principal",
            "imagen_principal_url",
            "imagenes",
            "creado_por",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "imagen_principal_url",
            "imagenes",
            "creado_por",
            "created_at",
            "updated_at",
        ]

    def get_imagen_principal_url(self, obj):
        if not obj.imagen_principal:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.imagen_principal.url)
        return obj.imagen_principal.url

    def get_imagenes(self, obj):
        serializer = AccionImagenSerializer(obj.imagenes.all(), many=True, context=self.context)
        return [item["url"] for item in serializer.data if item.get("url")]
