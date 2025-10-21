"""Vistas del foro."""
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from core.permissions import EsAdministrador

from .models import Categoria, Respuesta, Tema
from .serializers import CategoriaSerializer, RespuestaSerializer, TemaSerializer


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [EsAdministrador]
    lookup_field = "slug"


class TemaViewSet(viewsets.ModelViewSet):
    queryset = (
        Tema.objects.select_related("categoria", "autor", "filial")
        .prefetch_related("respuestas__autor")
        .all()
    )
    serializer_class = TemaSerializer
    filterset_fields = ["categoria", "filial", "fijado", "cerrado"]
    search_fields = ["titulo", "contenido"]
    ordering_fields = ["created_at", "updated_at"]

    def get_permissions(self):
        if self.action in {"list", "retrieve", "respuestas"}:
            return [permissions.IsAuthenticated()]
        if self.action == "create":
            return [permissions.IsAuthenticated()]
        if self.action in {"update", "partial_update", "destroy", "cerrar", "abrir", "fijar", "desfijar"}:
            return [EsAdministrador()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(autor=self.request.user, filial=getattr(self.request.user, "filial", None))

    @action(detail=True, methods=["post"], url_path="respuestas", serializer_class=RespuestaSerializer)
    def respuestas(self, request, *args, **kwargs):
        tema = self.get_object()
        if tema.cerrado:
            raise PermissionDenied("El tema está cerrado")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        respuesta = serializer.save(tema=tema, autor=request.user)
        return Response(RespuestaSerializer(respuesta).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["patch"], url_path="cerrar")
    def cerrar(self, request, *args, **kwargs):
        tema = self.get_object()
        tema.cerrado = True
        tema.save(update_fields=["cerrado"])
        return Response(self.get_serializer(tema).data)

    @action(detail=True, methods=["patch"], url_path="abrir")
    def abrir(self, request, *args, **kwargs):
        tema = self.get_object()
        tema.cerrado = False
        tema.save(update_fields=["cerrado"])
        return Response(self.get_serializer(tema).data)

    @action(detail=True, methods=["patch"], url_path="fijar")
    def fijar(self, request, *args, **kwargs):
        tema = self.get_object()
        tema.fijado = True
        tema.save(update_fields=["fijado"])
        return Response(self.get_serializer(tema).data)

    @action(detail=True, methods=["patch"], url_path="desfijar")
    def desfijar(self, request, *args, **kwargs):
        tema = self.get_object()
        tema.fijado = False
        tema.save(update_fields=["fijado"])
        return Response(self.get_serializer(tema).data)


class RespuestaViewSet(viewsets.ModelViewSet):
    queryset = Respuesta.objects.select_related("tema", "autor", "respuesta_padre")
    serializer_class = RespuestaSerializer
    filterset_fields = ["tema", "autor"]

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [permissions.IsAuthenticated()]
        if self.action == "create":
            return [permissions.IsAuthenticated()]
        if self.action in {"update", "partial_update", "destroy"}:
            return [EsAdministrador()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(autor=self.request.user)
