from django.contrib import admin

from apps.acciones.models import AccionImagen, AccionSolidaria


@admin.register(AccionSolidaria)
class AccionSolidariaAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "filial", "estado", "fecha", "created_at")
    list_filter = ("estado", "filial")
    search_fields = ("nombre", "descripcion", "filial__nombre")
    ordering = ("-fecha",)


@admin.register(AccionImagen)
class AccionImagenAdmin(admin.ModelAdmin):
    list_display = ("id", "accion", "es_principal", "created_at")
    list_filter = ("es_principal",)
    search_fields = ("accion__nombre",)
