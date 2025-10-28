from apps.partidos.models import Partido
from django.contrib import admin


@admin.register(Partido)
class PartidoAdmin(admin.ModelAdmin):
    list_display = (
        "titulo",
        "fecha",
        "lugar",
        "estado",
        "cupo_total",
        "cupo_disponible",
    )
    list_filter = ("estado", "fecha")
    search_fields = ("titulo", "lugar")
    ordering = ("-fecha",)
