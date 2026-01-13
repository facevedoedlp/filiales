from __future__ import annotations

from apps.core.models import TimeStampedModel
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class PerfilUsuario(TimeStampedModel):
    class Roles(models.TextChoices):
        ADMINISTRADOR = "ADMINISTRADOR", "Administrador"
        COORDINADOR = "COORDINADOR", "Coordinador"
        USUARIO_FILIAL = "USUARIO_FILIAL", "Usuario de filial"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="perfil"
    )
    rol = models.CharField(max_length=32, choices=Roles.choices)
    filial = models.ForeignKey(
        "filiales.Filial",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="perfiles",
    )
    es_socio = models.BooleanField(default=False, db_index=True)
    numero_socio = models.CharField(max_length=50, blank=True)

    class Meta:
        verbose_name = "Perfil de usuario"
        verbose_name_plural = "Perfiles de usuario"

    def __str__(self) -> str:
        return f"{self.user.username} ({self.rol})"

    def clean(self) -> None:
        if self.rol == self.Roles.USUARIO_FILIAL and not self.filial:
            raise ValidationError(
                "Los usuarios de filial deben tener una filial asociada."
            )

    @property
    def es_admin(self) -> bool:
        return self.rol == self.Roles.ADMINISTRADOR

    @property
    def es_coordinador(self) -> bool:
        return self.rol == self.Roles.COORDINADOR

    @property
    def es_usuario_filial(self) -> bool:
        return self.rol == self.Roles.USUARIO_FILIAL

    @property
    def permisos(self) -> list[str]:
        if self.es_admin:
            return ["full_access"]
        if self.es_coordinador:
            return ["read_all"]
        return ["filial_scope"]


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def crear_perfil_usuario(sender, instance, created, **kwargs):
    if created and not hasattr(instance, "perfil"):
        PerfilUsuario.objects.create(
            user=instance, rol=PerfilUsuario.Roles.USUARIO_FILIAL
        )
