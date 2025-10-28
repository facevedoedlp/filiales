from __future__ import annotations

from apps.core.models import TimeStampedModel
from django.db import models


class Filial(TimeStampedModel):
    nombre = models.CharField(max_length=255)
    codigo = models.CharField(max_length=20, unique=True)
    activa = models.BooleanField(default=True, db_index=True)
    direccion = models.CharField(max_length=255, blank=True)
    ciudad = models.CharField(max_length=120)
    provincia = models.CharField(max_length=120)
    pais = models.CharField(max_length=120, default="Argentina")
    contacto_email = models.EmailField(blank=True)
    contacto_telefono = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ("nombre",)
        indexes = [
            models.Index(fields=("activa",), name="filial_activa_idx"),
            models.Index(fields=("codigo",), name="filial_codigo_idx"),
            models.Index(fields=("ciudad", "provincia"), name="filial_ciudad_prov_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.nombre} ({self.codigo})"


class Autoridad(TimeStampedModel):
    class Cargos(models.TextChoices):
        PRESIDENTE = "PRESIDENTE", "Presidente"
        SECRETARIO = "SECRETARIO", "Secretario"
        TESORERO = "TESORERO", "Tesorero"
        VOCAL = "VOCAL", "Vocal"
        OTRO = "OTRO", "Otro"

    filial = models.ForeignKey(
        Filial, on_delete=models.CASCADE, related_name="autoridades"
    )
    cargo = models.CharField(max_length=20, choices=Cargos.choices)
    persona_nombre = models.CharField(max_length=255)
    persona_documento = models.CharField(max_length=32)
    email = models.EmailField(blank=True)
    telefono = models.CharField(max_length=50, blank=True)
    desde = models.DateField()
    hasta = models.DateField(null=True, blank=True)
    activo = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ("-activo", "cargo")
        indexes = [
            models.Index(
                fields=("filial", "activo"), name="autoridad_filial_activo_idx"
            ),
        ]

    def __str__(self) -> str:
        return f"{self.persona_nombre} - {self.get_cargo_display()}"
