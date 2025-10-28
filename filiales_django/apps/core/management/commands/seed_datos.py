from __future__ import annotations

import random
from datetime import datetime, timedelta

from apps.entradas.models import AsignacionEntrada, SolicitudEntrada
from apps.filiales.models import Autoridad, Filial
from apps.mensajes.models import Conversacion, Mensaje
from apps.partidos.models import Partido
from apps.pedidos.models import Pedido, PedidoItem, Producto
from apps.usuarios.models import PerfilUsuario
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from faker import Faker

User = get_user_model()


class Command(BaseCommand):
    help = "Crea datos de prueba para el sistema de filiales"

    def handle(self, *args, **options):
        fake = Faker("es_AR")
        Faker.seed(1234)
        random.seed(1234)
        filiales = self._crear_filiales(fake)
        self.stdout.write(
            self.style.SUCCESS(f"Filiales disponibles: {Filial.objects.count()}")
        )
        self._crear_autoridades(filiales)
        usuarios = self._crear_usuarios(filiales)
        productos = self._crear_productos()
        partidos = self._crear_partidos()
        self._crear_solicitudes(partidos, usuarios, fake)
        self._crear_pedidos(productos, usuarios, fake)
        self._crear_conversaciones(usuarios, fake)
        self.stdout.write(
            self.style.SUCCESS("Datos de demostración generados correctamente.")
        )

    def _crear_filiales(self, fake: Faker) -> list[Filial]:
        ciudades = [
            ("La Plata", "Buenos Aires"),
            ("Ensenada", "Buenos Aires"),
            ("Berisso", "Buenos Aires"),
            ("City Bell", "Buenos Aires"),
            ("Tolosa", "Buenos Aires"),
            ("Villa Elisa", "Buenos Aires"),
            ("Gonnet", "Buenos Aires"),
            ("Ringuelet", "Buenos Aires"),
            ("CABA", "Ciudad Autónoma de Buenos Aires"),
            ("Mar del Plata", "Buenos Aires"),
            ("Pinamar", "Buenos Aires"),
            ("Rosario", "Santa Fe"),
            ("Córdoba", "Córdoba"),
            ("Mendoza", "Mendoza"),
            ("San Juan", "San Juan"),
            ("Posadas", "Misiones"),
            ("Neuquén", "Neuquén"),
            ("Bariloche", "Río Negro"),
            ("Bahía Blanca", "Buenos Aires"),
            ("Pergamino", "Buenos Aires"),
        ]
        filiales = []
        for idx in range(1, 157):
            codigo = f"FIL-{idx:03d}"
            ciudad, provincia = ciudades[(idx - 1) % len(ciudades)]
            filial, created = Filial.objects.get_or_create(
                codigo=codigo,
                defaults={
                    "nombre": f"Filial {ciudad} {idx:03d}",
                    "ciudad": ciudad,
                    "provincia": provincia,
                    "pais": "Argentina",
                    "direccion": fake.street_address(),
                    "contacto_email": f"filial{idx:03d}@edlp.com",
                    "contacto_telefono": fake.phone_number(),
                },
            )
            filiales.append(filial)
        return filiales

    def _crear_autoridades(self, filiales: list[Filial]) -> None:
        hoy = datetime.now().date()
        for filial in filiales[:5]:
            Autoridad.objects.get_or_create(
                filial=filial,
                cargo=Autoridad.Cargos.PRESIDENTE,
                persona_nombre=f"Presidente {filial.codigo}",
                defaults={
                    "persona_documento": f"{random.randint(20000000, 45000000)}",
                    "email": filial.contacto_email,
                    "telefono": filial.contacto_telefono,
                    "desde": hoy - timedelta(days=365),
                    "activo": True,
                },
            )

    def _crear_usuarios(self, filiales: list[Filial]) -> dict[str, User]:
        usuarios: dict[str, User] = {}

        def crear_usuario(
            username: str,
            rol: str,
            filial: Filial | None = None,
            email: str | None = None,
        ):
            user, created = User.objects.get_or_create(
                username=username, defaults={"email": email or f"{username}@edlp.com"}
            )
            if created:
                user.set_password("pass1234")
                user.first_name = username.split("_")[0].capitalize()
                user.last_name = "EDLP"
                user.save()
            PerfilUsuario.objects.update_or_create(
                user=user,
                defaults={"rol": rol, "filial": filial},
            )
            user.refresh_from_db()
            usuarios[username] = user

        crear_usuario("admin_global", PerfilUsuario.Roles.ADMINISTRADOR)
        crear_usuario("coordinador_global", PerfilUsuario.Roles.COORDINADOR)
        crear_usuario(
            "admin_filial_1",
            PerfilUsuario.Roles.ADMINISTRADOR,
            filial=None,
            email="admin1@edlp.com",
        )
        crear_usuario(
            "user_filial_1", PerfilUsuario.Roles.USUARIO_FILIAL, filial=filiales[0]
        )
        crear_usuario("admin_filial_2", PerfilUsuario.Roles.ADMINISTRADOR, filial=None)
        crear_usuario(
            "user_filial_2", PerfilUsuario.Roles.USUARIO_FILIAL, filial=filiales[1]
        )

        for filial in filiales[2:10]:
            crear_usuario(
                f"user_{filial.codigo.lower()}",
                PerfilUsuario.Roles.USUARIO_FILIAL,
                filial=filial,
            )

        return usuarios

    def _crear_productos(self) -> list[Producto]:
        catalogo = [
            ("Bandera oficial", "BN-001", "Merchandising", "unidad"),
            ("Bombo grande", "BM-010", "Instrumentos", "unidad"),
            ("Remeras rojas", "RM-020", "Indumentaria", "caja"),
            ("Bufandas albirrojas", "BF-030", "Indumentaria", "caja"),
            ("Gorras edición especial", "GR-040", "Indumentaria", "caja"),
            ("Posters históricos", "PS-050", "Merchandising", "paquete"),
            ("Bandas elásticas", "BE-060", "Entrenamiento", "set"),
            ("Conos de entrenamiento", "CN-070", "Entrenamiento", "set"),
            ("Pelotas oficiales", "PL-080", "Entrenamiento", "unidad"),
            ("Parlante portátil", "PR-090", "Logística", "unidad"),
            ("Micrófono inalámbrico", "MI-100", "Logística", "unidad"),
            ("Telas decorativas", "TL-110", "Decoración", "rollo"),
            ("Banderines", "BD-120", "Decoración", "paquete"),
            ("Stickers EDLP", "ST-130", "Merchandising", "paquete"),
            ("Tazas personalizadas", "TZ-140", "Merchandising", "caja"),
            ("Llaveros", "LL-150", "Merchandising", "paquete"),
            ("Carpas modulares", "CP-160", "Logística", "unidad"),
            ("Roll-ups institucionales", "RU-170", "Merchandising", "unidad"),
        ]
        productos = []
        for nombre, sku, categoria, unidad in catalogo:
            producto, _ = Producto.objects.get_or_create(
                sku=sku,
                defaults={
                    "nombre": nombre,
                    "categoria": categoria,
                    "unidad": unidad,
                    "descripcion": f"{nombre} para eventos de filiales.",
                },
            )
            productos.append(producto)
        return productos

    def _crear_partidos(self) -> list[Partido]:
        base_fecha = datetime.now()
        encuentros = [
            ("Estudiantes vs Boca", base_fecha + timedelta(days=10), "Estadio UNO"),
            (
                "Estudiantes vs River",
                base_fecha + timedelta(days=25),
                "Estadio Monumental",
            ),
            ("Estudiantes vs Racing", base_fecha - timedelta(days=5), "Estadio UNO"),
            (
                "Estudiantes vs Independiente",
                base_fecha - timedelta(days=20),
                "Estadio Libertadores",
            ),
        ]
        partidos = []
        for titulo, fecha, lugar in encuentros:
            partido, _ = Partido.objects.update_or_create(
                titulo=titulo,
                defaults={
                    "fecha": fecha,
                    "lugar": lugar,
                    "descripcion": f"Encuentro de {titulo}",
                    "cupo_total": 500,
                    "cupo_disponible": 500,
                },
            )
            partidos.append(partido)
        return partidos

    def _crear_solicitudes(
        self, partidos: list[Partido], usuarios: dict[str, User], fake: Faker
    ) -> None:
        filiales = list(Filial.objects.filter(activa=True)[:10])
        admin = usuarios.get("admin_global")
        for filial in filiales:
            partido = random.choice(partidos)
            usuario = User.objects.filter(perfil__filial=filial).first() or admin
            solicitud, created = SolicitudEntrada.objects.get_or_create(
                filial=filial,
                partido=partido,
                defaults={
                    "cantidad_solicitada": random.randint(10, 80),
                    "motivo": fake.sentence(),
                    "created_by": usuario,
                },
            )
            if created and random.choice([True, False]):
                cantidad = random.randint(5, solicitud.cantidad_solicitada)
                AsignacionEntrada.objects.get_or_create(
                    solicitud=solicitud,
                    defaults={
                        "cantidad_asignada": cantidad,
                        "asignado_por": admin,
                    },
                )
                solicitud.estado = (
                    SolicitudEntrada.Estados.APROBADA
                    if cantidad == solicitud.cantidad_solicitada
                    else SolicitudEntrada.Estados.PARCIAL
                )
                solicitud.save(update_fields=["estado"])

    def _crear_pedidos(
        self, productos: list[Producto], usuarios: dict[str, User], fake: Faker
    ) -> None:
        filiales = list(Filial.objects.filter(activa=True)[:8])
        admin = usuarios.get("admin_global")
        for filial in filiales:
            usuario = User.objects.filter(perfil__filial=filial).first() or admin
            pedido, _ = Pedido.objects.get_or_create(
                filial=filial,
                defaults={
                    "observaciones": fake.sentence(),
                    "created_by": usuario,
                },
            )
            if pedido.items.count() == 0:
                for producto in random.sample(productos, 3):
                    PedidoItem.objects.create(
                        pedido=pedido,
                        producto=producto,
                        cantidad=random.randint(1, 10),
                        detalle=fake.sentence(),
                    )
            if random.choice([True, False]):
                pedido.estado = random.choice(
                    [
                        Pedido.Estados.APROBADO,
                        Pedido.Estados.RECHAZADO,
                        Pedido.Estados.ENTREGADO,
                        Pedido.Estados.PENDIENTE,
                    ]
                )
                pedido.save(update_fields=["estado"])

    def _crear_conversaciones(self, usuarios: dict[str, User], fake: Faker) -> None:
        admin = usuarios.get("admin_global")
        coordinador = usuarios.get("coordinador_global")
        filial = Filial.objects.first()
        conv_global, _ = Conversacion.objects.get_or_create(
            asunto="Noticias generales",
            visibilidad=Conversacion.Visibilidad.GLOBAL,
            defaults={"creada_por": admin},
        )
        if conv_global.mensajes.count() == 0:
            Mensaje.objects.create(
                conversacion=conv_global,
                emisor=admin,
                texto="Bienvenidos a la red de filiales",
            )
            Mensaje.objects.create(
                conversacion=conv_global,
                emisor=coordinador,
                texto="Coordinemos actividades",
            )

        if filial:
            conv_filial, _ = Conversacion.objects.get_or_create(
                asunto=f"Planificación {filial.nombre}",
                visibilidad=Conversacion.Visibilidad.FILIAL,
                filial=filial,
                defaults={"creada_por": admin},
            )
            if conv_filial.mensajes.count() == 0:
                usuario = User.objects.filter(perfil__filial=filial).first() or admin
                Mensaje.objects.create(
                    conversacion=conv_filial,
                    emisor=usuario,
                    texto=fake.paragraph(),
                )
