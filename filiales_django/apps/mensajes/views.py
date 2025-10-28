from __future__ import annotations

from apps.core.viewsets import BaseModelViewSet
from apps.mensajes.models import Conversacion, Mensaje
from apps.mensajes.serializers import ConversacionSerializer, MensajeSerializer
from django.db.models import Q
from rest_framework import decorators, exceptions, response, status


class ConversacionViewSet(BaseModelViewSet):
    queryset = Conversacion.objects.select_related("filial", "creada_por")
    serializer_class = ConversacionSerializer
    filterset_fields = {
        "visibilidad": ["exact"],
        "filial": ["exact"],
    }
    search_fields = ["asunto", "filial__nombre"]
    ordering_fields = ["created_at", "visibilidad"]

    def get_queryset(self):  # type: ignore[override]
        queryset = super().get_queryset()
        perfil = getattr(self.request.user, "perfil", None)
        if not perfil:
            return queryset.none()
        if perfil.es_admin or perfil.es_coordinador:
            return queryset
        if perfil.es_usuario_filial and perfil.filial_id:
            return queryset.filter(
                Q(visibilidad=Conversacion.Visibilidad.GLOBAL)
                | Q(filial_id=perfil.filial_id)
            )
        return queryset.filter(visibilidad=Conversacion.Visibilidad.GLOBAL)

    def get_serializer_save_kwargs(self, *, action: str):
        kwargs = super().get_serializer_save_kwargs(action=action)
        if action == "create":
            perfil = getattr(self.request.user, "perfil", None)
            kwargs["creada_por"] = self.request.user
            visibilidad = self.request.data.get(
                "visibilidad", Conversacion.Visibilidad.FILIAL
            )
            if visibilidad == Conversacion.Visibilidad.FILIAL:
                if perfil and perfil.filial:
                    kwargs["filial"] = perfil.filial
                else:
                    raise exceptions.ValidationError(
                        "La conversación de filial requiere filial asociada."
                    )
            else:
                if not (perfil and perfil.es_admin):
                    raise exceptions.ValidationError(
                        "Solo administradores pueden crear conversaciones globales."
                    )
        return kwargs


class MensajeViewSet(BaseModelViewSet):
    queryset = Mensaje.objects.select_related(
        "conversacion", "emisor", "conversacion__filial"
    )
    serializer_class = MensajeSerializer
    filterset_fields = {"conversacion": ["exact"]}
    search_fields = ["texto", "conversacion__asunto"]
    ordering_fields = ["created_at"]

    def get_queryset(self):  # type: ignore[override]
        queryset = super().get_queryset()
        perfil = getattr(self.request.user, "perfil", None)
        if not perfil:
            return queryset.none()
        if perfil.es_admin or perfil.es_coordinador:
            return queryset
        if perfil.es_usuario_filial and perfil.filial_id:
            return queryset.filter(
                Q(conversacion__visibilidad=Conversacion.Visibilidad.GLOBAL)
                | Q(conversacion__filial_id=perfil.filial_id)
            )
        return queryset.none()

    def get_serializer_save_kwargs(self, *, action: str):
        kwargs = super().get_serializer_save_kwargs(action=action)
        if action == "create":
            kwargs["emisor"] = self.request.user
            conversacion_id = self.request.data.get("conversacion")
            if not conversacion_id:
                raise exceptions.ValidationError("Debe indicar la conversación.")
            try:
                conversacion = Conversacion.objects.get(pk=conversacion_id)
            except Conversacion.DoesNotExist as exc:
                raise exceptions.ValidationError("Conversación inválida") from exc
            perfil = getattr(self.request.user, "perfil", None)
            if perfil and perfil.es_usuario_filial:
                if (
                    conversacion.visibilidad == Conversacion.Visibilidad.FILIAL
                    and conversacion.filial_id != perfil.filial_id
                ):
                    raise exceptions.ValidationError(
                        "No puede participar en conversaciones de otra filial."
                    )
        return kwargs

    @decorators.action(detail=True, methods=["post"], url_path="marcar-leido")
    def marcar_leido(self, request, pk=None):
        mensaje = self.get_object()
        mensaje.leido_por.add(request.user)
        return response.Response(status=status.HTTP_204_NO_CONTENT)
