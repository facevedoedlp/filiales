from __future__ import annotations

from apps.core.models import TimeStampedModel
from django.conf import settings
from django.db import models


class Accion(TimeStampedModel):
    class Tipos(models.TextChoices):
        CREAR = "CREAR", "Crear"
        ACTUALIZAR = "ACTUALIZAR", "Actualizar"
        ELIMINAR = "ELIMINAR", "Eliminar"
        APROBAR = "APROBAR", "Aprobar"
        RECHAZAR = "RECHAZAR", "Rechazar"
        SUSPENDER = "SUSPENDER", "Suspender"
        HABILITAR = "HABILITAR", "Habilitar"
        DESHABILITAR = "DESHABILITAR", "Deshabilitar"
        CAMBIAR_AUTORIDAD = "CAMBIAR_AUTORIDAD", "Cambiar autoridad"
        ASIGNAR_ENTRADAS = "ASIGNAR_ENTRADAS", "Asignar entradas"

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="acciones",
    )
    filial = models.ForeignKey(
        "filiales.Filial",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="acciones",
    )
    recurso = models.CharField(max_length=150)
    recurso_id = models.CharField(max_length=50)
    accion = models.CharField(max_length=40, choices=Tipos.choices)
    payload = models.JSONField(default=dict, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("accion",), name="accion_tipo_idx"),
            models.Index(fields=("recurso", "recurso_id"), name="accion_recurso_idx"),
            models.Index(fields=("usuario",), name="accion_usuario_idx"),
            models.Index(fields=("filial",), name="accion_filial_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.accion} - {self.recurso} ({self.recurso_id})"
