from __future__ import annotations

from apps.core.models import TimeStampedModel
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Conversacion(TimeStampedModel):
    class Visibilidad(models.TextChoices):
        FILIAL = "FILIAL", "Filial"
        GLOBAL = "GLOBAL", "Global"

    asunto = models.CharField(max_length=255)
    creada_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="conversaciones_creadas",
    )
    visibilidad = models.CharField(
        max_length=10, choices=Visibilidad.choices, default=Visibilidad.FILIAL
    )
    filial = models.ForeignKey(
        "filiales.Filial",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="conversaciones",
    )

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("visibilidad",), name="conversacion_visibilidad_idx"),
            models.Index(fields=("filial",), name="conversacion_filial_idx"),
        ]

    def clean(self) -> None:
        if self.visibilidad == self.Visibilidad.FILIAL and not self.filial:
            raise ValidationError(
                "Las conversaciones de filial requieren una filial asociada."
            )
        if self.visibilidad == self.Visibilidad.GLOBAL:
            self.filial = None

    def __str__(self) -> str:
        return self.asunto


class Mensaje(TimeStampedModel):
    conversacion = models.ForeignKey(
        Conversacion, on_delete=models.CASCADE, related_name="mensajes"
    )
    emisor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="mensajes_enviados",
    )
    texto = models.TextField()
    leido_por = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="mensajes_leidos", blank=True
    )

    class Meta:
        ordering = ("created_at",)
        indexes = [
            models.Index(fields=("conversacion",), name="mensaje_conversacion_idx"),
            models.Index(fields=("emisor",), name="mensaje_emisor_idx"),
        ]

    def __str__(self) -> str:
        return f"Mensaje {self.pk} en {self.conversacion_id}"
