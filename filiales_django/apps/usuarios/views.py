from __future__ import annotations

from apps.usuarios.serializers import CustomTokenObtainPairSerializer, MeSerializer
from rest_framework import permissions, response, status
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RefreshView(TokenRefreshView):
    pass


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        perfil = getattr(request.user, "perfil", None)
        if not perfil:
            return response.Response(status=status.HTTP_404_NOT_FOUND)
        serializer = MeSerializer(
            {
                "user": request.user,
                "rol": perfil.rol,
                "filial_id": perfil.filial_id,
                "permisos": perfil.permisos,
            }
        )
        return response.Response(serializer.data)
