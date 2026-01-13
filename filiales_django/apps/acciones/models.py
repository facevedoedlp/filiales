from __future__ import annotations

from apps.core.models import TimeStampedModel
from django.conf import settings
from django.db import models


class AccionSolidaria(TimeStampedModel):
    class Estados(models.TextChoices):
        PROGRAMADA = "PROGRAMADA", "Programada"
        EN_CURSO = "EN_CURSO", "En curso"
        FINALIZADA = "FINALIZADA", "Finalizada"

    filial = models.ForeignKey(
        "filiales.Filial",
        on_delete=models.CASCADE,
        related_name="acciones_solidarias",
    )
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()
    fecha = models.DateField()
    estado = models.CharField(max_length=20, choices=Estados.choices, default=Estados.PROGRAMADA)
    ubicacion = models.CharField(max_length=255, blank=True)
    participantes = models.PositiveIntegerField(default=0)
    imagen_principal = models.ImageField(
        upload_to="acciones/principal/",
        null=True,
        blank=True,
    )
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="acciones_creadas",
    )

    class Meta:
        ordering = ("-fecha", "-created_at")
        indexes = [
            models.Index(fields=("estado",), name="accion_estado_idx"),
            models.Index(fields=("fecha",), name="accion_fecha_idx"),
            models.Index(fields=("filial", "fecha"), name="accion_filial_fecha_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.nombre} ({self.filial_id})"


class AccionImagen(TimeStampedModel):
    accion = models.ForeignKey(
        AccionSolidaria,
        on_delete=models.CASCADE,
        related_name="imagenes",
    )
    imagen = models.ImageField(upload_to="acciones/imagenes/")
    es_principal = models.BooleanField(default=False)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("accion",), name="accion_imagen_accion_idx"),
        ]

    def __str__(self) -> str:
        return f"Imagen {self.id} - Accion {self.accion_id}"
