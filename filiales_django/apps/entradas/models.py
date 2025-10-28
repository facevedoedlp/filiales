from __future__ import annotations

from apps.core.models import TimeStampedModel
from django.conf import settings
from django.db import models


class SolicitudEntrada(TimeStampedModel):
    class Estados(models.TextChoices):
        PENDIENTE = "PENDIENTE", "Pendiente"
        APROBADA = "APROBADA", "Aprobada"
        RECHAZADA = "RECHAZADA", "Rechazada"
        PARCIAL = "PARCIAL", "Parcial"

    filial = models.ForeignKey(
        "filiales.Filial", on_delete=models.CASCADE, related_name="solicitudes_entradas"
    )
    partido = models.ForeignKey(
        "partidos.Partido", on_delete=models.CASCADE, related_name="solicitudes"
    )
    cantidad_solicitada = models.PositiveIntegerField()
    motivo = models.TextField(blank=True)
    estado = models.CharField(
        max_length=20, choices=Estados.choices, default=Estados.PENDIENTE, db_index=True
    )
    observaciones = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="solicitudes_entradas",
    )

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("estado",), name="solicitud_estado_idx"),
            models.Index(fields=("created_at",), name="solicitud_created_idx"),
            models.Index(
                fields=("filial", "partido"), name="solicitud_filial_partido_idx"
            ),
        ]

    def __str__(self) -> str:
        return f"Solicitud {self.pk} - {self.filial}"

    @property
    def total_asignado(self) -> int:
        return sum(self.asignaciones.values_list("cantidad_asignada", flat=True))


class AsignacionEntrada(TimeStampedModel):
    solicitud = models.ForeignKey(
        SolicitudEntrada, on_delete=models.CASCADE, related_name="asignaciones"
    )
    cantidad_asignada = models.PositiveIntegerField()
    asignado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="asignaciones_entradas",
    )

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("solicitud",), name="asignacion_solicitud_idx"),
        ]

    def __str__(self) -> str:
        return f"Asignación {self.cantidad_asignada} para {self.solicitud_id}"
