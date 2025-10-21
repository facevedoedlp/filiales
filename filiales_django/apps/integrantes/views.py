"""Vistas y endpoints relacionados con integrantes."""
from django.contrib.auth import get_user_model
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from core.permissions import EsAdministrador

from .serializers import CambiarEstadoSerializer, IntegranteSerializer

Integrante = get_user_model()


class IntegranteViewSet(viewsets.ModelViewSet):
    """CRUD de integrantes con permisos por rol."""

    queryset = Integrante.objects.all()
    serializer_class = IntegranteSerializer
    filterset_fields = ["rol", "estado_membresia", "filial"]
    search_fields = ["username", "nombre", "apellido", "documento"]
    ordering_fields = ["nombre", "apellido", "fecha_ingreso"]

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [permissions.IsAuthenticated()]
        if self.action == "create":
            return [EsAdministrador()]
        if self.action in {"update", "partial_update", "destroy", "cambiar_estado"}:
            return [EsAdministrador()]
        return super().get_permissions()

    @action(detail=True, methods=["patch"], serializer_class=CambiarEstadoSerializer)
    def cambiar_estado(self, request, *args, **kwargs):
        integrante = self.get_object()
        serializer = self.get_serializer(integrante, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PerfilActualView(APIView):
    """Devuelve la información del usuario autenticado."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = IntegranteSerializer(request.user)
        return Response(serializer.data)


class InicioSesionView(TokenObtainPairView):
    """Endpoint para obtener tokens JWT."""


class RefrescarTokenView(TokenRefreshView):
    """Endpoint para refrescar tokens JWT."""


class CerrarSesionView(APIView):
    """Invalidación lógica del token (placeholder)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Sesión cerrada"}, status=status.HTTP_200_OK)
