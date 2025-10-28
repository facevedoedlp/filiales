from django.contrib import admin

from .models import Categoria, Respuesta, Tema


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("nombre", "slug")
    prepopulated_fields = {"slug": ("nombre",)}


class RespuestaInline(admin.TabularInline):
    model = Respuesta
    extra = 1


@admin.register(Tema)
class TemaAdmin(admin.ModelAdmin):
    list_display = ("titulo", "categoria", "autor", "fijado", "cerrado", "created_at")
    list_filter = ("categoria", "fijado", "cerrado")
    search_fields = ("titulo", "contenido")
    inlines = [RespuestaInline]


@admin.register(Respuesta)
class RespuestaAdmin(admin.ModelAdmin):
    list_display = ("tema", "autor", "created_at", "es_moderada")
    list_filter = ("es_moderada",)
