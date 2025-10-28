from __future__ import annotations

from apps.core.models import TimeStampedModel
from django.db import models


class Partido(TimeStampedModel):
    class Estados(models.TextChoices):
        PROGRAMADO = "PROGRAMADO", "Programado"
        CERRADO = "CERRADO", "Cerrado"
        CANCELADO = "CANCELADO", "Cancelado"

    titulo = models.CharField(max_length=255)
    fecha = models.DateTimeField()
    lugar = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True)
    estado = models.CharField(
        max_length=20,
        choices=Estados.choices,
        default=Estados.PROGRAMADO,
        db_index=True,
    )
    cupo_total = models.PositiveIntegerField(null=True, blank=True)
    cupo_disponible = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ("-fecha",)
        indexes = [
            models.Index(fields=("fecha",), name="partido_fecha_idx"),
            models.Index(fields=("estado",), name="partido_estado_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.titulo} - {self.fecha:%Y-%m-%d}" if self.fecha else self.titulo

    def actualizar_cupo_disponible(self, cantidad_asignada: int) -> None:
        if self.cupo_total is None:
            return
        if self.cupo_disponible is None:
            self.cupo_disponible = self.cupo_total
        self.cupo_disponible = max(0, self.cupo_disponible - cantidad_asignada)
        self.save(update_fields=["cupo_disponible", "updated_at"])

    def save(self, *args, **kwargs):  # type: ignore[override]
        if self.cupo_total is not None and self.cupo_disponible is None:
            self.cupo_disponible = self.cupo_total
        super().save(*args, **kwargs)
