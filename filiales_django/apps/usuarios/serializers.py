from __future__ import annotations

from apps.usuarios.models import PerfilUsuario
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]


class PerfilUsuarioSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    filial = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = PerfilUsuario
        fields = ["id", "user", "rol", "filial", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class MeSerializer(serializers.Serializer):
    user = UserSerializer()
    role = serializers.CharField(source="rol")
    filialId = serializers.IntegerField(source="filial_id", allow_null=True)
    permisos = serializers.ListField(child=serializers.CharField())


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        perfil = getattr(user, "perfil", None)
        if perfil:
            token["rol"] = perfil.rol
            token["filial_id"] = perfil.filial_id
        return token

    def validate(self, attrs):  # type: ignore[override]
        data = super().validate(attrs)
        perfil = getattr(self.user, "perfil", None)
        data["user"] = UserSerializer(self.user).data
        if perfil:
            data["role"] = perfil.rol
            data["filialId"] = perfil.filial_id
            data["permisos"] = perfil.permisos
        else:
            data["role"] = None
            data["filialId"] = None
            data["permisos"] = []
        return data
