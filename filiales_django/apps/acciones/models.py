"""Modelos del módulo de acciones."""
from __future__ import annotations

from django.conf import settings
from django.db import models


class Accion(models.Model):
    """Registro de una acción realizada por una filial."""

    class Estado(models.TextChoices):
        BORRADOR = "BORRADOR", "Borrador"
        PUBLICADA = "PUBLICADA", "Publicada"

    filial = models.ForeignKey("filiales.Filial", related_name="acciones", on_delete=models.CASCADE)
    titulo = models.CharField("título", max_length=200)
    descripcion = models.TextField("descripción")
    fecha = models.DateField("fecha")
    creador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="acciones_creadas",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    estado = models.CharField("estado", max_length=15, choices=Estado.choices, default=Estado.BORRADOR)
    creada = models.DateTimeField("creada", auto_now_add=True)
    actualizada = models.DateTimeField("actualizada", auto_now=True)

    def __str__(self) -> str:
        return f"{self.titulo} - {self.filial.nombre}"

    class Meta:
        verbose_name = "Acción"
        verbose_name_plural = "Acciones"
        ordering = ("-fecha",)


class AccionImagen(models.Model):
    """Archivos multimedia asociados a una acción."""

    accion = models.ForeignKey(Accion, related_name="imagenes", on_delete=models.CASCADE)
    imagen = models.ImageField("imagen", upload_to="acciones")
    descripcion = models.CharField("descripción", max_length=200, blank=True)
    creada = models.DateTimeField("creada", auto_now_add=True)

    def __str__(self) -> str:
        return f"Imagen de {self.accion}"

    class Meta:
        verbose_name = "Imagen de acción"
        verbose_name_plural = "Imágenes de acciones"
