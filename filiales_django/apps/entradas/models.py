"""Modelos de solicitudes de entradas."""
from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils import timezone


class SolicitudEntrada(models.Model):
    """Representa la solicitud de entradas por parte de una filial."""

    class Estado(models.TextChoices):
        PENDIENTE = "PENDIENTE", "Pendiente"
        APROBADA = "APROBADA", "Aprobada"
        RECHAZADA = "RECHAZADA", "Rechazada"

    filial = models.ForeignKey("filiales.Filial", related_name="solicitudes_entradas", on_delete=models.CASCADE)
    solicitante = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="solicitudes_realizadas",
        on_delete=models.CASCADE,
    )
    cantidad_solicitada = models.PositiveIntegerField("cantidad solicitada")
    cantidad_aprobada = models.PositiveIntegerField("cantidad aprobada", default=0)
    estado = models.CharField("estado", max_length=15, choices=Estado.choices, default=Estado.PENDIENTE)
    motivo = models.TextField("motivo", blank=True)
    fecha_solicitud = models.DateTimeField("fecha de solicitud", default=timezone.now)
    fecha_resolucion = models.DateTimeField("fecha de resolución", null=True, blank=True)
    resolvio = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="solicitudes_resueltas",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    def __str__(self) -> str:
        return f"Solicitud {self.id} - {self.filial.nombre}"

    class Meta:
        verbose_name = "Solicitud de entrada"
        verbose_name_plural = "Solicitudes de entradas"
        ordering = ("-fecha_solicitud",)
