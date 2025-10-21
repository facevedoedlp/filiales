"""Modelos relacionados con los integrantes del sistema."""
from __future__ import annotations

from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models
from django.utils import timezone


class IntegranteManager(UserManager):
    """Manager personalizado para utilizar correo electrónico opcional."""

    def create_user(self, username: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault("is_active", True)
        return super().create_user(username=username, password=password, **extra_fields)

    def create_superuser(self, username: str, password: str, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Los superusuarios deben tener is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Los superusuarios deben tener is_superuser=True.")
        return super().create_superuser(username=username, password=password, **extra_fields)


class Integrante(AbstractUser):
    """Usuario del sistema con roles personalizados."""

    class Rol(models.TextChoices):
        ADMIN = "ADMIN", "Administrador"
        PRESIDENTE = "PRESIDENTE", "Presidente"
        INTEGRANTE = "INTEGRANTE", "Integrante"

    class EstadoMembresia(models.TextChoices):
        VIGENTE = "VIGENTE", "Vigente"
        VENCIDA = "VENCIDA", "Vencida"
        SUSPENDIDA = "SUSPENDIDA", "Suspendida"

    nombre = models.CharField("nombre", max_length=150)
    apellido = models.CharField("apellido", max_length=150)
    documento = models.CharField("documento", max_length=20, unique=True)
    telefono = models.CharField("teléfono", max_length=20, blank=True)
    avatar = models.ImageField("avatar", upload_to="avatars/", null=True, blank=True)
    filial = models.ForeignKey(
        "filiales.Filial",
        related_name="integrantes",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    rol = models.CharField("rol", max_length=15, choices=Rol.choices, default=Rol.INTEGRANTE)
    estado_membresia = models.CharField(
        "estado de membresía",
        max_length=15,
        choices=EstadoMembresia.choices,
        default=EstadoMembresia.VIGENTE,
    )
    fecha_nacimiento = models.DateField("fecha de nacimiento", null=True, blank=True)
    fecha_ingreso = models.DateField("fecha de ingreso", default=timezone.now)

    objects = IntegranteManager()

    @property
    def es_admin(self) -> bool:
        return self.rol == self.Rol.ADMIN

    @property
    def es_presidente(self) -> bool:
        return self.rol == self.Rol.PRESIDENTE

    def __str__(self) -> str:
        return f"{self.username} ({self.get_full_name()})"

    class Meta:
        verbose_name = "Integrante"
        verbose_name_plural = "Integrantes"
        ordering = ("apellido", "nombre")
