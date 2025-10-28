from apps.auditoria.models import Accion
from django.contrib import admin


@admin.register(Accion)
class AccionAdmin(admin.ModelAdmin):
    list_display = ("id", "usuario", "filial", "recurso", "accion", "created_at")
    list_filter = ("accion", "filial", "usuario")
    search_fields = ("recurso", "accion", "recurso_id")
    ordering = ("-created_at",)
