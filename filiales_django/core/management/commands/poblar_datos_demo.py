"""Comando para poblar la base con datos de demostración."""
from __future__ import annotations

from datetime import date, timedelta
from random import randint, choice

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.acciones.models import Accion
from apps.filiales.models import Filial
from apps.foro.models import Categoria, Respuesta, Tema
from apps.integrantes.models import Integrante
from apps.entradas.models import SolicitudEntrada


class Command(BaseCommand):
    help = "Genera datos de ejemplo para el sistema de filiales"

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("🚀 Creando datos de demostración...\n"))

        # ==========================================
        # USUARIOS PRINCIPALES
        # ==========================================
        self.stdout.write("👥 Creando usuarios principales...")
        
        admin, created = Integrante.objects.get_or_create(
            username="admin",
            defaults={
                "nombre": "Super",
                "apellido": "Admin",
                "documento": "00000000",
                "email": "admin@estudiantes.com",
                "telefono": "+54 11 4000-0000",
                "fecha_nacimiento": date(1980, 1, 1),
                "rol": Integrante.Rol.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "estado_membresia": "ACTIVO",
            },
        )
        if created or not admin.password:
            admin.set_password("admin1234")
            admin.save()
            self.stdout.write(self.style.SUCCESS("✅ Admin creado (usuario: admin, password: admin1234)"))

        federico, created = Integrante.objects.get_or_create(
            username="federico",
            defaults={
                "nombre": "Federico",
                "apellido": "Facevedo",
                "documento": "11111111",
                "email": "federico@estudiantes.com",
                "telefono": "+54 221 4000-0001",
                "fecha_nacimiento": date(1985, 5, 15),
                "rol": Integrante.Rol.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "estado_membresia": "ACTIVO",
            },
        )
        if created or not federico.password:
            federico.set_password("Lasmalvinas1*")
            federico.save()
            self.stdout.write(self.style.SUCCESS("✅ Federico creado (usuario: federico, password: Lasmalvinas1*)"))

        # ==========================================
        # FILIALES
        # ==========================================
        self.stdout.write("\n🏛️  Creando filiales...")

        filiales_data = [
            {
                "nombre": "Filial La Plata",
                "descripcion": "Filial matriz en la ciudad de La Plata",
                "direccion": "Calle 1 y 57",
                "ciudad": "La Plata",
                "provincia": "Buenos Aires",
                "pais": "Argentina",
                "latitud": -34.9205,
                "longitud": -57.9536,
                "telefono": "+54 221 425-7100",
                "email": "laplata@estudiantes.com",
            },
            {
                "nombre": "Filial Buenos Aires",
                "descripcion": "Filial central en CABA",
                "direccion": "Av. Corrientes 1234",
                "ciudad": "CABA",
                "provincia": "Buenos Aires",
                "pais": "Argentina",
                "latitud": -34.603684,
                "longitud": -58.381559,
                "telefono": "+54 11 4321-5678",
                "email": "buenosaires@estudiantes.com",
            },
            {
                "nombre": "Filial Córdoba",
                "descripcion": "Filial de la provincia de Córdoba",
                "direccion": "Bv. San Juan 123",
                "ciudad": "Córdoba",
                "provincia": "Córdoba",
                "pais": "Argentina",
                "latitud": -31.420083,
                "longitud": -64.188776,
                "telefono": "+54 351 422-1234",
                "email": "cordoba@estudiantes.com",
            },
            {
                "nombre": "Filial Rosario",
                "descripcion": "Filial en la ciudad de Rosario",
                "direccion": "Bv. Oroño 456",
                "ciudad": "Rosario",
                "provincia": "Santa Fe",
                "pais": "Argentina",
                "latitud": -32.944200,
                "longitud": -60.650539,
                "telefono": "+54 341 480-5678",
                "email": "rosario@estudiantes.com",
            },
            {
                "nombre": "Filial Mendoza",
                "descripcion": "Filial en la provincia de Mendoza",
                "direccion": "San Martín 789",
                "ciudad": "Mendoza",
                "provincia": "Mendoza",
                "pais": "Argentina",
                "latitud": -32.889459,
                "longitud": -68.845839,
                "telefono": "+54 261 423-9876",
                "email": "mendoza@estudiantes.com",
            },
            {
                "nombre": "Filial Madrid",
                "descripcion": "Filial en España",
                "direccion": "Gran Vía 28",
                "ciudad": "Madrid",
                "provincia": "Madrid",
                "pais": "España",
                "latitud": 40.420000,
                "longitud": -3.705000,
                "telefono": "+34 91 123-4567",
                "email": "madrid@estudiantes.com",
            },
            {
                "nombre": "Filial Barcelona",
                "descripcion": "Filial en Catalunya",
                "direccion": "Las Ramblas 100",
                "ciudad": "Barcelona",
                "provincia": "Barcelona",
                "pais": "España",
                "latitud": 41.385064,
                "longitud": 2.173404,
                "telefono": "+34 93 456-7890",
                "email": "barcelona@estudiantes.com",
            },
            {
                "nombre": "Filial Miami",
                "descripcion": "Filial en Estados Unidos",
                "direccion": "Ocean Drive 500",
                "ciudad": "Miami",
                "provincia": "Florida",
                "pais": "Estados Unidos",
                "latitud": 25.761681,
                "longitud": -80.191788,
                "telefono": "+1 305 123-4567",
                "email": "miami@estudiantes.com",
            },
        ]

        filiales = {}
        for data in filiales_data:
            filial, created = Filial.objects.get_or_create(
                nombre=data["nombre"],
                defaults=data
            )
            filiales[data["nombre"]] = filial
            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ {filial.nombre}"))

        # ==========================================
        # PRESIDENTES E INTEGRANTES
        # ==========================================
        self.stdout.write("\n👔 Creando presidentes e integrantes...")

        integrantes_data = [
            # La Plata
            {
                "username": "presidente_lp",
                "nombre": "Juan",
                "apellido": "Ramírez",
                "documento": "20123456",
                "email": "juan.ramirez@estudiantes.com",
                "telefono": "+54 221 456-7890",
                "fecha_nacimiento": date(1978, 3, 10),
                "rol": Integrante.Rol.PRESIDENTE,
                "filial": filiales["Filial La Plata"],
                "estado_membresia": "ACTIVO",
            },
            {
                "username": "socio_lp1",
                "nombre": "María",
                "apellido": "González",
                "documento": "25234567",
                "email": "maria.gonzalez@estudiantes.com",
                "telefono": "+54 221 567-8901",
                "fecha_nacimiento": date(1990, 7, 22),
                "rol": Integrante.Rol.INTEGRANTE,
                "filial": filiales["Filial La Plata"],
                "estado_membresia": "ACTIVO",
            },
            {
                "username": "socio_lp2",
                "nombre": "Carlos",
                "apellido": "Martínez",
                "documento": "30345678",
                "email": "carlos.martinez@estudiantes.com",
                "telefono": "+54 221 678-9012",
                "fecha_nacimiento": date(1995, 11, 5),
                "rol": Integrante.Rol.INTEGRANTE,
                "filial": filiales["Filial La Plata"],
                "estado_membresia": "ACTIVO",
            },
            # Buenos Aires
            {
                "username": "presidente_ba",
                "nombre": "Laura",
                "apellido": "Fernández",
                "documento": "22345678",
                "email": "laura.fernandez@estudiantes.com",
                "telefono": "+54 11 4321-6789",
                "fecha_nacimiento": date(1982, 8, 15),
                "rol": Integrante.Rol.PRESIDENTE,
                "filial": filiales["Filial Buenos Aires"],
                "estado_membresia": "ACTIVO",
            },
            {
                "username": "socio_ba1",
                "nombre": "Roberto",
                "apellido": "Díaz",
                "documento": "27456789",
                "email": "roberto.diaz@estudiantes.com",
                "telefono": "+54 11 4567-8901",
                "fecha_nacimiento": date(1988, 4, 30),
                "rol": Integrante.Rol.INTEGRANTE,
                "filial": filiales["Filial Buenos Aires"],
                "estado_membresia": "ACTIVO",
            },
            {
                "username": "socio_ba2",
                "nombre": "Ana",
                "apellido": "López",
                "documento": "32567890",
                "email": "ana.lopez@estudiantes.com",
                "telefono": "+54 11 5678-9012",
                "fecha_nacimiento": date(1992, 12, 18),
                "rol": Integrante.Rol.INTEGRANTE,
                "filial": filiales["Filial Buenos Aires"],
                "estado_membresia": "ACTIVO",
            },
            # Córdoba
            {
                "username": "presidente_cba",
                "nombre": "Sofía",
                "apellido": "Gómez",
                "documento": "24567890",
                "email": "sofia.gomez@estudiantes.com",
                "telefono": "+54 351 422-3456",
                "fecha_nacimiento": date(1984, 5, 20),
                "rol": Integrante.Rol.PRESIDENTE,
                "filial": filiales["Filial Córdoba"],
                "estado_membresia": "ACTIVO",
            },
            {
                "username": "socio_cba1",
                "nombre": "Diego",
                "apellido": "Pérez",
                "documento": "29678901",
                "email": "diego.perez@estudiantes.com",
                "telefono": "+54 351 456-7890",
                "fecha_nacimiento": date(1991, 9, 8),
                "rol": Integrante.Rol.INTEGRANTE,
                "filial": filiales["Filial Córdoba"],
                "estado_membresia": "ACTIVO",
            },
            # Rosario
            {
                "username": "presidente_rosario",
                "nombre": "Martín",
                "apellido": "Sánchez",
                "documento": "26789012",
                "email": "martin.sanchez@estudiantes.com",
                "telefono": "+54 341 480-6789",
                "fecha_nacimiento": date(1986, 2, 12),
                "rol": Integrante.Rol.PRESIDENTE,
                "filial": filiales["Filial Rosario"],
                "estado_membresia": "ACTIVO",
            },
            {
                "username": "socio_rosario1",
                "nombre": "Lucía",
                "apellido": "Torres",
                "documento": "31890123",
                "email": "lucia.torres@estudiantes.com",
                "telefono": "+54 341 567-8901",
                "fecha_nacimiento": date(1993, 6, 25),
                "rol": Integrante.Rol.INTEGRANTE,
                "filial": filiales["Filial Rosario"],
                "estado_membresia": "ACTIVO",
            },
            # Mendoza
            {
                "username": "presidente_mendoza",
                "nombre": "Patricia",
                "apellido": "Rodríguez",
                "documento": "28901234",
                "email": "patricia.rodriguez@estudiantes.com",
                "telefono": "+54 261 423-5678",
                "fecha_nacimiento": date(1987, 10, 3),
                "rol": Integrante.Rol.PRESIDENTE,
                "filial": filiales["Filial Mendoza"],
                "estado_membresia": "ACTIVO",
            },
        ]

        integrantes = {}
        for data in integrantes_data:
            password = data.pop("password", "password123")
            integrante, created = Integrante.objects.get_or_create(
                username=data["username"],
                defaults=data
            )
            integrantes[data["username"]] = integrante
            if created or not integrante.password:
                integrante.set_password(password)
                integrante.save()
                emoji = "👔" if integrante.rol == "PRESIDENTE" else "👤"
                self.stdout.write(self.style.SUCCESS(f"{emoji} {integrante.nombre} {integrante.apellido} ({integrante.username})"))

        # ==========================================
        # ACCIONES
        # ==========================================
        self.stdout.write("\n📸 Creando acciones...")

        acciones_data = [
            {
                "filial": filiales["Filial La Plata"],
                "titulo": "Campaña de socios",
                "descripcion": "Gran campaña para sumar nuevos socios a la filial",
                "fecha": date.today() - timedelta(days=30),
                "creador": integrantes["presidente_lp"],
                "estado": Accion.Estado.PUBLICADA,
            },
            {
                "filial": filiales["Filial Buenos Aires"],
                "titulo": "Cena solidaria",
                "descripcion": "Cena anual para recaudar fondos para causas benéficas",
                "fecha": date.today() - timedelta(days=20),
                "creador": integrantes["presidente_ba"],
                "estado": Accion.Estado.PUBLICADA,
            },
            {
                "filial": filiales["Filial Córdoba"],
                "titulo": "Clínica deportiva",
                "descripcion": "Entrenamiento con jugadores del primer equipo",
                "fecha": date.today() - timedelta(days=15),
                "creador": integrantes["presidente_cba"],
                "estado": Accion.Estado.PUBLICADA,
            },
            {
                "filial": filiales["Filial La Plata"],
                "titulo": "Caravana al estadio",
                "descripcion": "Organización de viaje para hinchada visitante",
                "fecha": date.today() - timedelta(days=10),
                "creador": integrantes["presidente_lp"],
                "estado": Accion.Estado.PUBLICADA,
            },
            {
                "filial": filiales["Filial Rosario"],
                "titulo": "Peña pincharrata",
                "descripcion": "Reunión mensual de socios en sede de la filial",
                "fecha": date.today() - timedelta(days=5),
                "creador": integrantes["presidente_rosario"],
                "estado": Accion.Estado.PUBLICADA,
            },
            {
                "filial": filiales["Filial Buenos Aires"],
                "titulo": "Día del niño",
                "descripcion": "Festejo del día del niño con actividades recreativas",
                "fecha": date.today() - timedelta(days=3),
                "creador": integrantes["presidente_ba"],
                "estado": Accion.Estado.PUBLICADA,
            },
            {
                "filial": filiales["Filial Mendoza"],
                "titulo": "Proyección de partido histórico",
                "descripcion": "Proyección del partido vs River por Copa Libertadores 2009",
                "fecha": date.today() - timedelta(days=1),
                "creador": integrantes["presidente_mendoza"],
                "estado": Accion.Estado.PUBLICADA,
            },
        ]

        for data in acciones_data:
            accion, created = Accion.objects.get_or_create(
                filial=data["filial"],
                titulo=data["titulo"],
                defaults=data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ {accion.titulo} - {accion.filial.nombre}"))

        # ==========================================
        # SOLICITUDES DE ENTRADAS
        # ==========================================
        self.stdout.write("\n🎫 Creando solicitudes de entradas...")

        entradas_data = [
            # PENDIENTES
            {
                "filial": filiales["Filial La Plata"],
                "solicitante": integrantes["presidente_lp"],
                "motivo": "Clásico platense - Alta demanda de socios",
                "cantidad_solicitada": 50,
                "estado": SolicitudEntrada.Estado.PENDIENTE,
            },
            {
                "filial": filiales["Filial Córdoba"],
                "solicitante": integrantes["presidente_cba"],
                "motivo": "Partido importante - Solicitud urgente",
                "cantidad_solicitada": 35,
                "estado": SolicitudEntrada.Estado.PENDIENTE,
            },
            {
                "filial": filiales["Filial Rosario"],
                "solicitante": integrantes["presidente_rosario"],
                "motivo": "Excursión de filial con familias",
                "cantidad_solicitada": 40,
                "estado": SolicitudEntrada.Estado.PENDIENTE,
            },
            {
                "filial": filiales["Filial Mendoza"],
                "solicitante": integrantes["presidente_mendoza"],
                "motivo": "Grupo de socios que viajan desde Mendoza",
                "cantidad_solicitada": 30,
                "estado": SolicitudEntrada.Estado.PENDIENTE,
            },
            # APROBADAS
            {
                "filial": filiales["Filial Buenos Aires"],
                "solicitante": integrantes["presidente_ba"],
                "motivo": "Para socios activos - Sorteo interno",
                "cantidad_solicitada": 30,
                "cantidad_aprobada": 25,
                "estado": SolicitudEntrada.Estado.APROBADA,
                "fecha_resolucion": timezone.now() - timedelta(days=2),
                "resolvio": admin,
            },
            {
                "filial": filiales["Filial Buenos Aires"],
                "solicitante": integrantes["presidente_ba"],
                "motivo": "Sorteo entre socios nuevos",
                "cantidad_solicitada": 60,
                "cantidad_aprobada": 45,
                "estado": SolicitudEntrada.Estado.APROBADA,
                "fecha_resolucion": timezone.now() - timedelta(days=5),
                "resolvio": federico,
            },
            {
                "filial": filiales["Filial Mendoza"],
                "solicitante": integrantes["presidente_mendoza"],
                "motivo": "Aniversario de la filial",
                "cantidad_solicitada": 25,
                "cantidad_aprobada": 25,
                "estado": SolicitudEntrada.Estado.APROBADA,
                "fecha_resolucion": timezone.now() - timedelta(days=7),
                "resolvio": admin,
            },
            {
                "filial": filiales["Filial La Plata"],
                "solicitante": integrantes["presidente_lp"],
                "motivo": "Evento especial de la filial",
                "cantidad_solicitada": 20,
                "cantidad_aprobada": 20,
                "estado": SolicitudEntrada.Estado.APROBADA,
                "fecha_resolucion": timezone.now() - timedelta(days=10),
                "resolvio": federico,
            },
            # RECHAZADAS
            {
                "filial": filiales["Filial Córdoba"],
                "solicitante": integrantes["presidente_cba"],
                "motivo": "Solicitud masiva para evento",
                "cantidad_solicitada": 100,
                "cantidad_aprobada": 0,
                "estado": SolicitudEntrada.Estado.RECHAZADA,
                "fecha_resolucion": timezone.now() - timedelta(days=3),
                "resolvio": admin,
            },
            {
                "filial": filiales["Filial Rosario"],
                "solicitante": integrantes["presidente_rosario"],
                "motivo": "Solicitud tardía sin justificación",
                "cantidad_solicitada": 80,
                "cantidad_aprobada": 0,
                "estado": SolicitudEntrada.Estado.RECHAZADA,
                "fecha_resolucion": timezone.now() - timedelta(days=1),
                "resolvio": federico,
            },
        ]

        for idx, data in enumerate(entradas_data):
            entrada, created = SolicitudEntrada.objects.get_or_create(
                filial=data["filial"],
                solicitante=data["solicitante"],
                motivo=data["motivo"],
                defaults=data
            )
            if created:
                emoji = "⏳" if entrada.estado == "PENDIENTE" else "✅" if entrada.estado == "APROBADA" else "❌"
                self.stdout.write(
                    self.style.SUCCESS(
                        f"{emoji} Solicitud #{entrada.id} - {entrada.filial.nombre} ({entrada.estado})"
                    )
                )

        # ==========================================
        # FORO - CATEGORÍAS
        # ==========================================
        self.stdout.write("\n💬 Creando foro...")

        categorias_data = [
            {
                "nombre": "General",
                "descripcion": "Temas generales sobre Estudiantes",
                "slug": "general",
            },
            {
                "nombre": "Organización",
                "descripcion": "Coordinación entre filiales",
                "slug": "organizacion",
            },
            {
                "nombre": "Eventos",
                "descripcion": "Anuncio y organización de eventos",
                "slug": "eventos",
            },
            {
                "nombre": "Actualidad",
                "descripcion": "Noticias del club",
                "slug": "actualidad",
            },
        ]

        categorias = {}
        for data in categorias_data:
            categoria, created = Categoria.objects.get_or_create(
                slug=data["slug"],
                defaults=data
            )
            categorias[data["slug"]] = categoria
            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ Categoría: {categoria.nombre}"))

        # ==========================================
        # FORO - TEMAS Y RESPUESTAS
        # ==========================================
        temas_data = [
            {
                "categoria": categorias["general"],
                "titulo": "¡Bienvenidos al foro de filiales!",
                "autor": admin,
                "filial": None,
                "contenido": "Este es el espacio para que todas las filiales puedan comunicarse, compartir experiencias y coordinar actividades. ¡Bienvenidos!",
                "fijado": True,
                "respuestas": [
                    {
                        "autor": integrantes["presidente_lp"],
                        "contenido": "¡Excelente iniciativa! Gracias por crear este espacio.",
                    },
                    {
                        "autor": integrantes["presidente_ba"],
                        "contenido": "Muy bueno para coordinar entre filiales. ¡Vamos Pincha!",
                    },
                ],
            },
            {
                "categoria": categorias["organizacion"],
                "titulo": "Coordinación para el clásico",
                "autor": integrantes["presidente_lp"],
                "filial": filiales["Filial La Plata"],
                "contenido": "¿Cómo organizamos la logística para el próximo clásico platense? Necesitamos coordinar entradas y caravana.",
                "fijado": False,
                "respuestas": [
                    {
                        "autor": integrantes["presidente_ba"],
                        "contenido": "Desde Buenos Aires podemos organizar micros. ¿Cuántos socios necesitan traslado?",
                    },
                    {
                        "autor": integrantes["presidente_cba"],
                        "contenido": "Nosotros también queremos sumarnos a la caravana.",
                    },
                    {
                        "autor": integrantes["socio_lp1"],
                        "contenido": "Contamos con 40 personas aproximadamente que necesitan transporte.",
                    },
                ],
            },
            {
                "categoria": categorias["eventos"],
                "titulo": "Cena anual de confraternidad",
                "autor": integrantes["presidente_ba"],
                "filial": filiales["Filial Buenos Aires"],
                "contenido": "Estamos organizando la cena anual. ¿Qué fecha les vendría bien a las demás filiales para coordinar presencia?",
                "fijado": False,
                "respuestas": [
                    {
                        "autor": integrantes["presidente_rosario"],
                        "contenido": "Nosotros podríamos asistir en marzo o abril.",
                    },
                    {
                        "autor": integrantes["presidente_mendoza"],
                        "contenido": "Confirmamos asistencia. Envíen detalles por privado.",
                    },
                ],
            },
            {
                "categoria": categorias["actualidad"],
                "titulo": "Gran victoria en el último partido",
                "autor": integrantes["socio_lp2"],
                "filial": filiales["Filial La Plata"],
                "contenido": "¡Qué partidazo! ¿Vieron el gol de último minuto? Así se defiende la camiseta pincharrata.",
                "fijado": False,
                "respuestas": [
                    {
                        "autor": integrantes["socio_ba1"],
                        "contenido": "¡Increíble! Lo festejamos a los gritos acá en Buenos Aires.",
                    },
                    {
                        "autor": integrantes["socio_cba1"],
                        "contenido": "Se escucharon los festejos hasta Córdoba. ¡VAMOS ESTUDIANTES!",
                    },
                    {
                        "autor": integrantes["socio_rosario1"],
                        "contenido": "Emocionante partido. El equipo está para grandes cosas.",
                    },
                ],
            },
            {
                "categoria": categorias["general"],
                "titulo": "Propuesta: intercambio de merchandising",
                "autor": integrantes["socio_ba2"],
                "filial": filiales["Filial Buenos Aires"],
                "contenido": "¿Qué les parece si organizamos un intercambio de camisetas, banderines y otros artículos del club entre filiales?",
                "fijado": False,
                "respuestas": [
                    {
                        "autor": integrantes["presidente_lp"],
                        "contenido": "Me parece excelente idea. Podemos coordinarlo en el próximo encuentro.",
                    },
                    {
                        "autor": integrantes["socio_lp1"],
                        "contenido": "Yo tengo varias camisetas antiguas para intercambiar.",
                    },
                ],
            },
        ]

        for tema_data in temas_data:
            respuestas = tema_data.pop("respuestas", [])
            tema, created = Tema.objects.get_or_create(
                categoria=tema_data["categoria"],
                titulo=tema_data["titulo"],
                defaults=tema_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ Tema: {tema.titulo}"))
                
                for respuesta_data in respuestas:
                    Respuesta.objects.get_or_create(
                        tema=tema,
                        autor=respuesta_data["autor"],
                        contenido=respuesta_data["contenido"]
                    )

        # ==========================================
        # RESUMEN FINAL
        # ==========================================
        self.stdout.write(self.style.SUCCESS("\n" + "="*60))
        self.stdout.write(self.style.SUCCESS("🎉 DATOS DE DEMOSTRACIÓN CREADOS CORRECTAMENTE"))
        self.stdout.write(self.style.SUCCESS("="*60))
        
        self.stdout.write("\n📊 Resumen:")
        self.stdout.write(f"   👥 {Integrante.objects.count()} integrantes")
        self.stdout.write(f"   🏛️  {Filial.objects.count()} filiales")
        self.stdout.write(f"   📸 {Accion.objects.count()} acciones")
        self.stdout.write(f"   💬 {Categoria.objects.count()} categorías de foro")
        self.stdout.write(f"   📝 {Tema.objects.count()} temas en foro")
        self.stdout.write(f"   💭 {Respuesta.objects.count()} respuestas en foro")
        
        total_entradas = SolicitudEntrada.objects.count()
        pendientes = SolicitudEntrada.objects.filter(estado='PENDIENTE').count()
        aprobadas = SolicitudEntrada.objects.filter(estado='APROBADA').count()
        rechazadas = SolicitudEntrada.objects.filter(estado='RECHAZADA').count()
        
        self.stdout.write(f"   🎫 {total_entradas} solicitudes de entradas:")
        self.stdout.write(f"      ⏳ {pendientes} pendientes")
        self.stdout.write(f"      ✅ {aprobadas} aprobadas")
        self.stdout.write(f"      ❌ {rechazadas} rechazadas")
        
        self.stdout.write("\n🔑 Credenciales de acceso:")
        self.stdout.write("="*60)
        self.stdout.write(self.style.SUCCESS("   ADMIN:"))
        self.stdout.write("   • Usuario: admin / Password: admin1234")
        self.stdout.write("   • Usuario: federico / Password: Lasmalvinas1*")
        self.stdout.write(self.style.WARNING("\n   PRESIDENTES:"))
        self.stdout.write("   • presidente_lp / password123 (La Plata)")
        self.stdout.write("   • presidente_ba / password123 (Buenos Aires)")
        self.stdout.write("   • presidente_cba / password123 (Córdoba)")
        self.stdout.write("   • presidente_rosario / password123 (Rosario)")
        self.stdout.write("   • presidente_mendoza / password123 (Mendoza)")
        self.stdout.write(self.style.HTTP_INFO("\n   INTEGRANTES:"))
        self.stdout.write("   • socio_lp1 / password123 (La Plata)")
        self.stdout.write("   • socio_ba1 / password123 (Buenos Aires)")
        self.stdout.write("   • socio_cba1 / password123 (Córdoba)")
        self.stdout.write("   • socio_rosario1 / password123 (Rosario)")
        
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS("✨ ¡Sistema listo para usar! ✨"))
        self.stdout.write("="*60 + "\n")