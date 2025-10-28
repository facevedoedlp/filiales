from apps.pedidos.models import Pedido, PedidoItem, Producto
from django.contrib import admin


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "sku", "categoria", "activo")
    list_filter = ("activo", "categoria")
    search_fields = ("nombre", "sku", "categoria")


class PedidoItemInline(admin.TabularInline):
    model = PedidoItem
    extra = 0


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ("id", "filial", "estado", "created_by", "created_at")
    list_filter = ("estado", "filial")
    search_fields = ("filial__nombre", "observaciones")
    autocomplete_fields = ("filial", "created_by")
    inlines = [PedidoItemInline]


@admin.register(PedidoItem)
class PedidoItemAdmin(admin.ModelAdmin):
    list_display = ("pedido", "producto", "cantidad")
    list_filter = ("pedido", "producto")
    search_fields = ("producto__nombre", "pedido__filial__nombre")
    autocomplete_fields = ("pedido", "producto")
