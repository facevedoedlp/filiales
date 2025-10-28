from __future__ import annotations

from apps.pedidos.models import Pedido, PedidoItem, Producto
from rest_framework import serializers


class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = [
            "id",
            "nombre",
            "sku",
            "categoria",
            "unidad",
            "descripcion",
            "activo",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class PedidoItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PedidoItem
        fields = [
            "id",
            "pedido",
            "producto",
            "cantidad",
            "detalle",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class PedidoSerializer(serializers.ModelSerializer):
    filial = serializers.PrimaryKeyRelatedField(read_only=True)
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)
    items = PedidoItemSerializer(many=True, read_only=True)

    class Meta:
        model = Pedido
        fields = [
            "id",
            "filial",
            "estado",
            "observaciones",
            "created_by",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["estado", "created_by", "items", "created_at", "updated_at"]
