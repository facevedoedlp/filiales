from apps.mensajes.models import Conversacion, Mensaje
from django.contrib import admin


@admin.register(Conversacion)
class ConversacionAdmin(admin.ModelAdmin):
    list_display = ("asunto", "visibilidad", "filial", "creada_por", "created_at")
    list_filter = ("visibilidad", "filial")
    search_fields = ("asunto", "filial__nombre")
    autocomplete_fields = ("filial", "creada_por")


@admin.register(Mensaje)
class MensajeAdmin(admin.ModelAdmin):
    list_display = ("conversacion", "emisor", "created_at")
    list_filter = ("conversacion",)
    search_fields = ("texto", "conversacion__asunto")
    autocomplete_fields = ("conversacion", "emisor")
