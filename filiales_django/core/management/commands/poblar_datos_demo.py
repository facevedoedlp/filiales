"""Comando para poblar la base con datos de demostración."""
from __future__ import annotations

from datetime import date

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.acciones.models import Accion
from apps.filiales.models import Filial
from apps.foro.models import Categoria, Respuesta, Tema
from apps.integrantes.models import Integrante
from apps.entradas.models import SolicitudEntrada


class Command(BaseCommand):
    help = "Genera datos de ejemplo para el sistema de filiales"

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Creando datos de demostración..."))

        admin, _ = Integrante.objects.get_or_create(
            username="admin",
            defaults={
                "nombre": "Admin",
                "apellido": "General",
                "documento": "00000000",
                "rol": Integrante.Rol.ADMIN,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if not admin.password:
            admin.set_password("admin1234")
            admin.save()

        filial_caba, _ = Filial.objects.get_or_create(
            nombre="Filial Buenos Aires",
            defaults={
                "descripcion": "Filial central de referencia",
                "direccion": "Av. Siempre Viva 742",
                "ciudad": "CABA",
                "provincia": "Buenos Aires",
                "pais": "Argentina",
                "latitud": -34.603684,
                "longitud": -58.381559,
                "telefono": "+54 11 5555-0000",
                "email": "caba@filiales.org",
            },
        )

        filial_cba, _ = Filial.objects.get_or_create(
            nombre="Filial Córdoba",
            defaults={
                "descripcion": "Filial de la provincia de Córdoba",
                "direccion": "Bv. San Juan 123",
                "ciudad": "Córdoba",
                "provincia": "Córdoba",
                "pais": "Argentina",
                "latitud": -31.420083,
                "longitud": -64.188776,
                "telefono": "+54 351 555-1234",
                "email": "cordoba@filiales.org",
            },
        )

        presidente_caba, _ = Integrante.objects.get_or_create(
            username="presidente_caba",
            defaults={
                "nombre": "Laura",
                "apellido": "Fernández",
                "documento": "12345678",
                "rol": Integrante.Rol.PRESIDENTE,
                "filial": filial_caba,
            },
        )
        if not presidente_caba.password:
            presidente_caba.set_password("presidente123")
            presidente_caba.save()

        integrante_caba, _ = Integrante.objects.get_or_create(
            username="integrante_caba",
            defaults={
                "nombre": "Marcos",
                "apellido": "López",
                "documento": "23456789",
                "rol": Integrante.Rol.INTEGRANTE,
                "filial": filial_caba,
            },
        )
        if not integrante_caba.password:
            integrante_caba.set_password("integrante123")
            integrante_caba.save()

        presidente_cba, _ = Integrante.objects.get_or_create(
            username="presidente_cba",
            defaults={
                "nombre": "Sofía",
                "apellido": "Gómez",
                "documento": "34567890",
                "rol": Integrante.Rol.PRESIDENTE,
                "filial": filial_cba,
            },
        )
        if not presidente_cba.password:
            presidente_cba.set_password("presidente123")
            presidente_cba.save()

        integrante_cba, _ = Integrante.objects.get_or_create(
            username="integrante_cba",
            defaults={
                "nombre": "Juan",
                "apellido": "Pérez",
                "documento": "45678901",
                "rol": Integrante.Rol.INTEGRANTE,
                "filial": filial_cba,
            },
        )
        if not integrante_cba.password:
            integrante_cba.set_password("integrante123")
            integrante_cba.save()

        Accion.objects.get_or_create(
            filial=filial_caba,
            titulo="Campaña solidaria",
            defaults={
                "descripcion": "Recolección de alimentos para comedores locales",
                "fecha": date.today(),
                "creador": presidente_caba,
                "estado": Accion.Estado.PUBLICADA,
            },
        )

        Accion.objects.get_or_create(
            filial=filial_cba,
            titulo="Clínica deportiva",
            defaults={
                "descripcion": "Entrenamiento y charla motivacional",
                "fecha": date.today(),
                "creador": presidente_cba,
                "estado": Accion.Estado.PUBLICADA,
            },
        )

        SolicitudEntrada.objects.get_or_create(
            filial=filial_caba,
            solicitante=presidente_caba,
            motivo="Partido de la semana",
            defaults={
                "cantidad_solicitada": 20,
                "cantidad_aprobada": 10,
                "estado": SolicitudEntrada.Estado.APROBADA,
            },
        )

        categoria, _ = Categoria.objects.get_or_create(
            nombre="General",
            defaults={"descripcion": "Temas generales", "slug": "general"},
        )

        tema, _ = Tema.objects.get_or_create(
            categoria=categoria,
            titulo="Bienvenida al foro",
            defaults={
                "autor": presidente_caba,
                "filial": filial_caba,
                "contenido": "Comparte tus experiencias en esta comunidad.",
                "fijado": True,
            },
        )

        Respuesta.objects.get_or_create(
            tema=tema,
            autor=integrante_caba,
            contenido="¡Gracias por la bienvenida!",
        )

        self.stdout.write(self.style.SUCCESS("Datos de demostración creados correctamente."))
