from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Integrante


@admin.register(Integrante)
class IntegranteAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (
            "Información adicional",
            {
                "fields": (
                    "nombre",
                    "apellido",
                "documento",
                "telefono",
                "avatar",
                "filial",
                "rol",
                "estado_membresia",
                "fecha_nacimiento",
                "fecha_ingreso",
            )
        },
        ),
    )
    list_display = ("username", "nombre", "apellido", "rol", "estado_membresia", "filial")
    list_filter = ("rol", "estado_membresia", "filial")
    search_fields = ("username", "nombre", "apellido", "documento")
