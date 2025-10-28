from __future__ import annotations

import os
from datetime import datetime, timedelta

import pytest
from apps.entradas.models import SolicitudEntrada
from apps.filiales.models import Filial
from apps.partidos.models import Partido
from apps.pedidos.models import Pedido, Producto
from apps.usuarios.models import PerfilUsuario
from django.contrib.auth import get_user_model

os.environ.setdefault("USE_SQLITE", "true")
os.environ.setdefault("EMAILS_ENABLED", "true")
os.environ.setdefault("WEBHOOKS_ENABLED", "true")

User = get_user_model()


@pytest.fixture
def filial():
    return Filial.objects.create(
        nombre="Filial Test",
        codigo="FIL-TEST",
        activa=True,
        direccion="Calle 123",
        ciudad="La Plata",
        provincia="Buenos Aires",
        pais="Argentina",
    )


@pytest.fixture
def otra_filial():
    return Filial.objects.create(
        nombre="Filial Otra",
        codigo="FIL-OTRA",
        activa=True,
        direccion="Calle 999",
        ciudad="Berisso",
        provincia="Buenos Aires",
        pais="Argentina",
    )


def _crear_usuario(username: str, rol: str, filial: Filial | None = None) -> User:
    user = User.objects.create_user(username=username, password="pass1234")
    PerfilUsuario.objects.update_or_create(
        user=user, defaults={"rol": rol, "filial": filial}
    )
    user.refresh_from_db()
    return user


@pytest.fixture
def admin_user():
    return _crear_usuario("admin", PerfilUsuario.Roles.ADMINISTRADOR)


@pytest.fixture
def coordinator_user():
    return _crear_usuario("coord", PerfilUsuario.Roles.COORDINADOR)


@pytest.fixture
def filial_user(filial):
    return _crear_usuario("filial_user", PerfilUsuario.Roles.USUARIO_FILIAL, filial)


@pytest.fixture
def partido():
    return Partido.objects.create(
        titulo="Estudiantes vs Gimnasia",
        fecha=datetime.now() + timedelta(days=5),
        lugar="Estadio UNO",
        descripcion="Partido clásico",
        cupo_total=200,
        cupo_disponible=200,
    )


@pytest.fixture
def producto():
    return Producto.objects.create(
        nombre="Bandera",
        sku="SKU-01",
        categoria="Merchandising",
        unidad="unidad",
        descripcion="Bandera oficial",
    )


@pytest.fixture
def pedido(filial, filial_user):
    pedido = Pedido.objects.create(
        filial=filial,
        observaciones="Necesitamos materiales",
        created_by=filial_user,
    )
    return pedido


@pytest.fixture
def solicitud(filial, partido, filial_user):
    return SolicitudEntrada.objects.create(
        filial=filial,
        partido=partido,
        cantidad_solicitada=20,
        motivo="Viaje de hinchas",
        created_by=filial_user,
    )
