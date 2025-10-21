"""Modelos de filiales."""
from __future__ import annotations

from django.conf import settings
from django.db import models


class Filial(models.Model):
    """Representa una filial de la organización."""

    class Estado(models.TextChoices):
        ACTIVA = "ACTIVA", "Activa"
        INACTIVA = "INACTIVA", "Inactiva"
        SUSPENDIDA = "SUSPENDIDA", "Suspendida"

    nombre = models.CharField("nombre", max_length=150, unique=True)
    descripcion = models.TextField("descripción", blank=True)
    direccion = models.CharField("dirección", max_length=255)
    ciudad = models.CharField("ciudad", max_length=120)
    provincia = models.CharField("provincia", max_length=120)
    pais = models.CharField("país", max_length=120, default="Argentina")
    latitud = models.DecimalField("latitud", max_digits=9, decimal_places=6, null=True, blank=True)
    longitud = models.DecimalField("longitud", max_digits=9, decimal_places=6, null=True, blank=True)
    telefono = models.CharField("teléfono", max_length=20, blank=True)
    email = models.EmailField("correo electrónico", blank=True)
    presidente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="filiales_presididas",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    fecha_creacion = models.DateField("fecha de creación", auto_now_add=True)
    estado = models.CharField("estado", max_length=15, choices=Estado.choices, default=Estado.ACTIVA)

    def __str__(self) -> str:
        return self.nombre

    class Meta:
        verbose_name = "Filial"
        verbose_name_plural = "Filiales"
        ordering = ("nombre",)
