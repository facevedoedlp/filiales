from django.contrib import admin

from .models import Filial


@admin.register(Filial)
class FilialAdmin(admin.ModelAdmin):
    list_display = ("nombre", "provincia", "pais", "estado", "presidente")
    search_fields = ("nombre", "provincia", "pais")
    list_filter = ("estado", "provincia")
