from django.contrib import admin

from .models import Categoria, Hilo, Respuesta


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("nombre", "slug")
    prepopulated_fields = {"slug": ("nombre",)}


class RespuestaInline(admin.TabularInline):
    model = Respuesta
    extra = 1


@admin.register(Hilo)
class HiloAdmin(admin.ModelAdmin):
    list_display = ("titulo", "categoria", "autor", "estado", "creado")
    list_filter = ("estado", "categoria")
    search_fields = ("titulo", "contenido")
    inlines = [RespuestaInline]


@admin.register(Respuesta)
class RespuestaAdmin(admin.ModelAdmin):
    list_display = ("hilo", "autor", "creado", "es_moderada")
    list_filter = ("es_moderada",)
