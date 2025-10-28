from __future__ import annotations

from apps.core.models import TimeStampedModel
from django.conf import settings
from django.db import models


class Producto(TimeStampedModel):
    nombre = models.CharField(max_length=255)
    sku = models.CharField(max_length=40, unique=True)
    categoria = models.CharField(max_length=120)
    unidad = models.CharField(max_length=50)
    descripcion = models.TextField(blank=True)
    activo = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ("nombre",)
        indexes = [
            models.Index(fields=("sku",), name="producto_sku_idx"),
            models.Index(fields=("categoria",), name="producto_categoria_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.nombre} ({self.sku})"


class Pedido(TimeStampedModel):
    class Estados(models.TextChoices):
        PENDIENTE = "PENDIENTE", "Pendiente"
        APROBADO = "APROBADO", "Aprobado"
        RECHAZADO = "RECHAZADO", "Rechazado"
        ENTREGADO = "ENTREGADO", "Entregado"
        CANCELADO = "CANCELADO", "Cancelado"

    filial = models.ForeignKey(
        "filiales.Filial", on_delete=models.CASCADE, related_name="pedidos"
    )
    estado = models.CharField(
        max_length=20, choices=Estados.choices, default=Estados.PENDIENTE, db_index=True
    )
    observaciones = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="pedidos_creados",
    )

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("estado",), name="pedido_estado_idx"),
            models.Index(fields=("filial", "estado"), name="pedido_filial_estado_idx"),
        ]

    def __str__(self) -> str:
        return f"Pedido {self.id} - {self.filial.nombre}"


class PedidoItem(TimeStampedModel):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name="items")
    producto = models.ForeignKey(
        Producto, on_delete=models.PROTECT, related_name="pedido_items"
    )
    cantidad = models.PositiveIntegerField()
    detalle = models.TextField(blank=True)

    class Meta:
        ordering = ("producto__nombre",)
        indexes = [
            models.Index(fields=("pedido",), name="pedido_item_pedido_idx"),
            models.Index(fields=("producto",), name="pedido_item_producto_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.cantidad} x {self.producto.nombre}"
