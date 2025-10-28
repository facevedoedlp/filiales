from apps.usuarios.models import PerfilUsuario
from django.contrib import admin


@admin.register(PerfilUsuario)
class PerfilUsuarioAdmin(admin.ModelAdmin):
    list_display = ("user", "rol", "filial", "created_at")
    list_filter = ("rol", "filial")
    search_fields = ("user__username", "user__email")
    autocomplete_fields = ("user", "filial")
