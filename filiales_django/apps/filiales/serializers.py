from __future__ import annotations

from apps.filiales.models import Autoridad, Filial
from rest_framework import serializers


class FilialSerializer(serializers.ModelSerializer):
    total_integrantes = serializers.IntegerField(read_only=True)

    class Meta:
        model = Filial
        fields = [
            "id",
            "nombre",
            "codigo",
            "activa",
            "direccion",
            "ciudad",
            "provincia",
            "pais",
            "contacto_email",
            "contacto_telefono",
            "total_integrantes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class AutoridadSerializer(serializers.ModelSerializer):
    estado = serializers.SerializerMethodField()

    class Meta:
        model = Autoridad
        fields = [
            "id",
            "filial",
            "cargo",
            "persona_nombre",
            "persona_documento",
            "email",
            "telefono",
            "desde",
            "hasta",
            "activo",
            "estado",
            "es_socio",
            "numero_socio",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at", "estado"]

    def get_estado(self, obj):
        """Transforma activo (boolean) a estado (string: 'ACTIVO'/'INACTIVO')."""
        return "ACTIVO" if obj.activo else "INACTIVO"

    def validate(self, attrs):  # type: ignore[override]
        filial = attrs.get("filial") or getattr(self.instance, "filial", None)
        
        # La filial es obligatoria EXCEPTO para administradores
        request = self.context.get("request")
        if request and request.user:
            perfil = getattr(request.user, "perfil", None)
            es_admin = perfil and perfil.es_admin if perfil else False
        else:
            es_admin = False
        
        if not filial and not es_admin:
            raise serializers.ValidationError({"filial": "La filial es obligatoria para todos los integrantes excepto administradores."})
        
        # Validar que numero_socio sea requerido si es_socio es True
        es_socio = attrs.get("es_socio", getattr(self.instance, "es_socio", False) if self.instance else False)
        numero_socio = attrs.get("numero_socio", "")
        
        if es_socio and not numero_socio:
            raise serializers.ValidationError({"numero_socio": "El número de socio es obligatorio cuando el integrante es socio del club."})
        
        return super().validate(attrs)
