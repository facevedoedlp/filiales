from django.contrib import admin

from .models import SolicitudEntrada


@admin.register(SolicitudEntrada)
class SolicitudEntradaAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "filial",
        "solicitante",
        "cantidad_solicitada",
        "cantidad_aprobada",
        "estado",
        "fecha_solicitud",
    )
    list_filter = ("estado", "filial")
    search_fields = ("filial__nombre", "solicitante__username")
