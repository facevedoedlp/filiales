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
            "avatar",
            "filial",
            "rol",
            "estado_membresia",
            "fecha_nacimiento",
            "fecha_ingreso",
            "is_active",
        ]
        read_only_fields = ("id", "fecha_ingreso")
        extra_kwargs = {
            'email': {'required': False},
            'telefono': {'required': False},
            'avatar': {'required': False},
            'fecha_nacimiento': {'required': False},
            'documento': {'required': False},
        }


class CambiarEstadoSerializer(serializers.ModelSerializer):
    """Serializador para actualizar rol y estado."""

    class Meta:
        model = Integrante
        fields = ["rol", "estado_membresia", "is_active"]


class PerfilSerializer(serializers.ModelSerializer):
    """Serializador para actualizar datos básicos del perfil."""

    class Meta:
        model = Integrante
        fields = ["email", "nombre", "apellido", "telefono", "avatar", "fecha_nacimiento"]


class RegistroIntegranteSerializer(serializers.ModelSerializer):
    """Serializador utilizado para el registro público de usuarios."""

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Integrante
        fields = [
            "id",
            "username",
            "password",
            "email",
            "nombre",
            "apellido",
            "documento",
            "telefono",
            "fecha_nacimiento",
        ]
        read_only_fields = ("id",)

    def create(self, validated_data):
        password = validated_data.pop("password")
        usuario = Integrante(**validated_data)
        usuario.set_password(password)
        usuario.rol = Integrante.Rol.INTEGRANTE
        usuario.save()
        return usuario
