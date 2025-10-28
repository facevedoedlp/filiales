from django.contrib import admin

from .models import Accion, AccionImagen


class AccionImagenInline(admin.TabularInline):
    model = AccionImagen
    extra = 1


@admin.register(Accion)
class AccionAdmin(admin.ModelAdmin):
    list_display = ("titulo", "filial", "fecha", "estado")
    search_fields = ("titulo", "descripcion")
    list_filter = ("estado", "filial")
    inlines = [AccionImagenInline]


@admin.register(AccionImagen)
class AccionImagenAdmin(admin.ModelAdmin):
    list_display = ("accion", "descripcion", "creada")
