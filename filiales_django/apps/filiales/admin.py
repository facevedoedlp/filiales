from apps.filiales.models import Autoridad, Filial
from django.contrib import admin


@admin.register(Filial)
class FilialAdmin(admin.ModelAdmin):
    list_display = ("nombre", "codigo", "activa", "ciudad", "provincia", "created_at")
    list_filter = ("activa", "ciudad", "provincia")
    search_fields = ("nombre", "codigo", "ciudad", "provincia")
    actions = ["habilitar", "deshabilitar"]

    @admin.action(description="Habilitar filiales seleccionadas")
    def habilitar(self, request, queryset):
        queryset.update(activa=True)

    @admin.action(description="Deshabilitar filiales seleccionadas")
    def deshabilitar(self, request, queryset):
        queryset.update(activa=False)


@admin.register(Autoridad)
class AutoridadAdmin(admin.ModelAdmin):
    list_display = ("persona_nombre", "cargo", "filial", "activo", "desde", "hasta")
    list_filter = ("cargo", "activo", "filial")
    search_fields = ("persona_nombre", "persona_documento", "email")
    autocomplete_fields = ("filial",)

    def has_change_permission(self, request, obj=None):
        if not request.user.is_superuser:
            perfil = getattr(request.user, "perfil", None)
            if not (perfil and perfil.es_admin):
                return False
        return super().has_change_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        return self.has_change_permission(request, obj)
