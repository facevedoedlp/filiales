from apps.entradas.models import AsignacionEntrada, SolicitudEntrada
from django.contrib import admin


@admin.register(SolicitudEntrada)
class SolicitudEntradaAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "filial",
        "partido",
        "estado",
        "cantidad_solicitada",
        "created_at",
    )
    list_filter = ("estado", "filial", "partido")
    search_fields = ("filial__nombre", "partido__titulo")
    autocomplete_fields = ("filial", "partido", "created_by")


@admin.register(AsignacionEntrada)
class AsignacionEntradaAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "solicitud",
        "cantidad_asignada",
        "asignado_por",
        "created_at",
    )
    list_filter = ("solicitud__filial", "solicitud__partido")
    search_fields = ("solicitud__filial__nombre", "solicitud__partido__titulo")
    autocomplete_fields = ("solicitud", "asignado_por")
