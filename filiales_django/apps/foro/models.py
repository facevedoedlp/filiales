"""Modelos del sistema de foro."""
from __future__ import annotations

from django.conf import settings
from django.db import models


class Categoria(models.Model):
    nombre = models.CharField("nombre", max_length=120, unique=True)
    descripcion = models.TextField("descripción", blank=True)
    slug = models.SlugField("slug", unique=True)

    def __str__(self) -> str:
        return self.nombre

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ("nombre",)


class Tema(models.Model):
    categoria = models.ForeignKey(Categoria, related_name="temas", on_delete=models.CASCADE)
    autor = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="temas_creados", on_delete=models.CASCADE)
    filial = models.ForeignKey(
        "filiales.Filial",
        related_name="temas",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    titulo = models.CharField("título", max_length=200)
    contenido = models.TextField("contenido")
    fijado = models.BooleanField("fijado", default=False)
    cerrado = models.BooleanField("cerrado", default=False)
    created_at = models.DateTimeField("creado", auto_now_add=True)
    updated_at = models.DateTimeField("actualizado", auto_now=True)

    def __str__(self) -> str:
        return self.titulo

    class Meta:
        verbose_name = "Tema"
        verbose_name_plural = "Temas"
        ordering = ("-created_at",)


class Respuesta(models.Model):
    tema = models.ForeignKey(Tema, related_name="respuestas", on_delete=models.CASCADE)
    autor = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="respuestas_creadas", on_delete=models.CASCADE)
    contenido = models.TextField("contenido")
    respuesta_padre = models.ForeignKey(
        "self",
        related_name="respuestas_hijas",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField("creado", auto_now_add=True)
    updated_at = models.DateTimeField("actualizado", auto_now=True)
    es_moderada = models.BooleanField("moderada", default=False)
    motivo_moderacion = models.CharField("motivo moderación", max_length=255, blank=True)

    def __str__(self) -> str:
        return f"Respuesta de {self.autor}"

    class Meta:
        verbose_name = "Respuesta"
        verbose_name_plural = "Respuestas"
        ordering = ("created_at",)
