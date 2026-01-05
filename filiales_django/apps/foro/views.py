from __future__ import annotations

from rest_framework import permissions, response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from apps.mensajes.models import Conversacion, Mensaje
from apps.mensajes.serializers import ConversacionSerializer, MensajeSerializer


class CategoriaViewSet(ModelViewSet):
    """Stub para categorías del foro - mapea a conversaciones."""
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request):
        # Por ahora devolvemos lista vacía
        return response.Response([])
    
    def create(self, request):
        return response.Response({"detail": "El foro aún no está implementado"}, status=400)
    
    def retrieve(self, request, pk=None):
        return response.Response({"detail": "El foro aún no está implementado"}, status=400)
    
    def update(self, request, pk=None):
        return response.Response({"detail": "El foro aún no está implementado"}, status=400)
    
    def destroy(self, request, pk=None):
        return response.Response({"detail": "El foro aún no está implementado"}, status=400)


class HiloViewSet(ModelViewSet):
    """Stub para hilos del foro - mapea a conversaciones."""
    queryset = Conversacion.objects.all()
    serializer_class = ConversacionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # El ViewSet ya maneja list, create, retrieve, update, destroy
    # Solo necesitamos agregar acciones personalizadas si son necesarias


class RespuestaViewSet(ModelViewSet):
    """Stub para respuestas del foro - mapea a mensajes."""
    queryset = Mensaje.objects.all()
    serializer_class = MensajeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # El ViewSet ya maneja list, create, retrieve, update, destroy

