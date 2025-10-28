from __future__ import annotations

from datetime import date

import pytest
from apps.auditoria.models import Accion
from apps.entradas.models import SolicitudEntrada
from apps.filiales.models import Autoridad
from apps.mensajes.models import Conversacion
from apps.pedidos.models import Pedido
from apps.usuarios.models import PerfilUsuario
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
def test_admin_puede_crear_filial(api_client, admin_user):
    api_client.force_authenticate(admin_user)
    data = {
        "nombre": "Filial Centro",
        "codigo": "FIL-999",
        "activa": True,
        "direccion": "Calle 45",
        "ciudad": "La Plata",
        "provincia": "Buenos Aires",
        "pais": "Argentina",
        "contacto_email": "centro@edlp.com",
        "contacto_telefono": "2211234567",
    }
    response = api_client.post("/api/filiales/", data, format="json")
    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
def test_coordinador_no_puede_crear_filial(api_client, coordinator_user):
    api_client.force_authenticate(coordinator_user)
    response = api_client.post(
        "/api/filiales/",
        {
            "nombre": "Filial Test",
            "codigo": "FIL-888",
            "ciudad": "Berisso",
            "provincia": "Buenos Aires",
            "pais": "Argentina",
        },
        format="json",
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_usuario_filial_solo_ve_su_filial(api_client, filial_user, filial, otra_filial):
    api_client.force_authenticate(filial_user)
    response = api_client.get("/api/filiales/")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["results"]) == 1
    assert response.data["results"][0]["id"] == filial.id


@pytest.mark.django_db
def test_scoping_en_solicitudes(
    api_client, filial_user, solicitud, otra_filial, admin_user
):
    SolicitudEntrada.objects.create(
        filial=otra_filial,
        partido=solicitud.partido,
        cantidad_solicitada=10,
        motivo="Otra filial",
        created_by=admin_user,
    )
    api_client.force_authenticate(filial_user)
    response = api_client.get("/api/solicitudes-entrada/")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["results"]) == 1
    assert response.data["results"][0]["filial"] == solicitud.filial.id


@pytest.mark.django_db
def test_aprobar_solicitud_generates_auditoria(
    api_client, admin_user, solicitud, monkeypatch
):
    eventos = []
    emails = []

    def fake_webhook(event, payload):
        eventos.append((event, payload))

    def fake_email(subject, message, recipients, html_message=None):
        emails.append((subject, recipients))

    monkeypatch.setattr("apps.entradas.views.dispatch_webhook", fake_webhook)
    monkeypatch.setattr("apps.entradas.views.send_notification_email", fake_email)

    solicitud.filial.contacto_email = "contacto@test.com"
    solicitud.filial.save(update_fields=["contacto_email"])
    api_client.force_authenticate(admin_user)
    response = api_client.post(
        f"/api/solicitudes-entrada/{solicitud.id}/aprobar/",
        {"cantidad_asignada": 5, "comentario": "Aprobado parcialmente"},
        format="json",
    )
    assert response.status_code == status.HTTP_200_OK
    solicitud.refresh_from_db()
    assert solicitud.estado == SolicitudEntrada.Estados.PARCIAL
    assert Accion.objects.filter(
        recurso__icontains="SolicitudEntrada", accion=Accion.Tipos.APROBAR
    ).exists()
    assert eventos
    assert emails


@pytest.mark.django_db
def test_rechazar_solicitud_registra_auditoria(
    api_client, admin_user, solicitud, monkeypatch
):
    eventos = []
    monkeypatch.setattr(
        "apps.entradas.views.dispatch_webhook",
        lambda *args, **kwargs: eventos.append(args),
    )
    api_client.force_authenticate(admin_user)
    response = api_client.post(
        f"/api/solicitudes-entrada/{solicitud.id}/rechazar/",
        {"motivo": "Sin cupo"},
        format="json",
    )
    assert response.status_code == status.HTTP_200_OK
    solicitud.refresh_from_db()
    assert solicitud.estado == SolicitudEntrada.Estados.RECHAZADA
    assert Accion.objects.filter(
        accion=Accion.Tipos.RECHAZAR, recurso_id=str(solicitud.id)
    ).exists()


@pytest.mark.django_db
def test_admin_aprueba_pedido(api_client, admin_user, pedido, monkeypatch):
    eventos = []
    monkeypatch.setattr(
        "apps.pedidos.views.dispatch_webhook",
        lambda *args, **kwargs: eventos.append(args),
    )
    api_client.force_authenticate(admin_user)
    response = api_client.post(f"/api/pedidos/{pedido.id}/aprobar/", {}, format="json")
    assert response.status_code == status.HTTP_200_OK
    pedido.refresh_from_db()
    assert pedido.estado == Pedido.Estados.APROBADO
    assert Accion.objects.filter(
        accion=Accion.Tipos.APROBAR, recurso_id=str(pedido.id)
    ).exists()
    assert eventos


@pytest.mark.django_db
def test_usuario_filial_no_puede_ver_auditoria_de_otras(
    api_client, filial_user, otra_filial, admin_user
):
    Accion.objects.create(
        usuario=admin_user,
        filial=otra_filial,
        recurso="Test",
        recurso_id="1",
        accion=Accion.Tipos.CREAR,
        payload={},
    )
    api_client.force_authenticate(filial_user)
    response = api_client.get("/api/auditoria/")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] == 0


@pytest.mark.django_db
def test_busqueda_productos(api_client, admin_user, producto):
    api_client.force_authenticate(admin_user)
    response = api_client.get("/api/productos/?search=Bandera")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] == 1


@pytest.mark.django_db
def test_me_endpoint_devuelve_perfil(api_client, admin_user):
    api_client.force_authenticate(admin_user)
    response = api_client.get("/api/me")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["role"] == PerfilUsuario.Roles.ADMINISTRADOR
    assert response.data["user"]["username"] == admin_user.username


@pytest.mark.django_db
def test_filial_habilitar_y_deshabilitar(api_client, admin_user, filial, monkeypatch):
    emails: list[tuple[str, list[str]]] = []
    eventos: list[tuple[str, dict[str, object]]] = []

    def fake_email(subject, message, recipients, html_message=None):
        emails.append((subject, recipients))

    def fake_webhook(evento, payload):
        eventos.append((evento, payload))

    filial.contacto_email = "filial@test.com"
    filial.save(update_fields=["contacto_email"])
    monkeypatch.setattr("apps.filiales.views.send_notification_email", fake_email)
    monkeypatch.setattr("apps.filiales.views.dispatch_webhook", fake_webhook)
    api_client.force_authenticate(admin_user)

    response = api_client.post(
        f"/api/filiales/{filial.id}/deshabilitar/", format="json"
    )
    assert response.status_code == status.HTTP_200_OK
    filial.refresh_from_db()
    assert not filial.activa

    response = api_client.post(f"/api/filiales/{filial.id}/habilitar/", format="json")
    assert response.status_code == status.HTTP_200_OK
    filial.refresh_from_db()
    assert filial.activa
    assert emails  # se enviaron notificaciones
    assert eventos  # se despacharon webhooks


@pytest.mark.django_db
def test_filial_cambiar_autoridades(api_client, admin_user, filial, monkeypatch):
    filial.contacto_email = "autoridades@test.com"
    filial.save(update_fields=["contacto_email"])
    Autoridad.objects.create(
        filial=filial,
        cargo=Autoridad.Cargos.PRESIDENTE,
        persona_nombre="Antigua",
        persona_documento="10",
        email="antigua@test.com",
        telefono="123",
        desde=date(2020, 1, 1),
        activo=True,
    )
    emails: list[str] = []
    eventos: list[dict[str, object]] = []

    monkeypatch.setattr(
        "apps.filiales.views.send_notification_email",
        lambda subject, message, recipients, html_message=None: emails.append(subject),
    )
    monkeypatch.setattr(
        "apps.filiales.views.dispatch_webhook",
        lambda evento, payload: eventos.append(payload),
    )
    api_client.force_authenticate(admin_user)
    payload = {
        "autoridades": [
            {
                "cargo": Autoridad.Cargos.SECRETARIO,
                "persona_nombre": "Nuevo",
                "persona_documento": "20",
                "email": "nuevo@test.com",
                "telefono": "456",
                "desde": "2024-01-01",
            }
        ]
    }
    response = api_client.post(
        f"/api/filiales/{filial.id}/cambiar-autoridades/", payload, format="json"
    )
    assert response.status_code == status.HTTP_200_OK
    filial.refresh_from_db()
    assert filial.autoridades.filter(activo=True).count() == 1
    assert filial.autoridades.filter(activo=False).count() == 1
    assert emails and eventos


@pytest.mark.django_db
def test_pedido_rechazar_y_marcar_entregado(
    api_client, admin_user, pedido, monkeypatch
):
    pedido.filial.contacto_email = "pedido@test.com"
    pedido.filial.save(update_fields=["contacto_email"])
    eventos: list[tuple[str, dict[str, object]]] = []
    monkeypatch.setattr(
        "apps.pedidos.views.dispatch_webhook",
        lambda evento, payload: eventos.append((evento, payload)),
    )
    api_client.force_authenticate(admin_user)

    response = api_client.post(
        f"/api/pedidos/{pedido.id}/rechazar/",
        {"motivo": "Sin stock"},
        format="json",
    )
    assert response.status_code == status.HTTP_200_OK
    pedido.refresh_from_db()
    assert pedido.estado == Pedido.Estados.RECHAZADO

    response = api_client.post(
        f"/api/pedidos/{pedido.id}/marcar-entregado/", {}, format="json"
    )
    assert response.status_code == status.HTTP_200_OK
    pedido.refresh_from_db()
    assert pedido.estado == Pedido.Estados.ENTREGADO
    assert eventos


@pytest.mark.django_db
def test_partido_cerrar_y_cancelar(api_client, admin_user, partido, monkeypatch):
    eventos: list[tuple[str, dict[str, object]]] = []
    monkeypatch.setattr(
        "apps.partidos.views.dispatch_webhook",
        lambda evento, payload: eventos.append((evento, payload)),
    )
    api_client.force_authenticate(admin_user)

    response = api_client.post(f"/api/partidos/{partido.id}/cerrar/", format="json")
    assert response.status_code == status.HTTP_200_OK
    partido.refresh_from_db()
    assert partido.estado == partido.Estados.CERRADO

    response = api_client.post(f"/api/partidos/{partido.id}/cancelar/", format="json")
    assert response.status_code == status.HTTP_200_OK
    partido.refresh_from_db()
    assert partido.estado == partido.Estados.CANCELADO
    assert eventos


@pytest.mark.django_db
def test_conversacion_filial_y_mensajes(
    api_client, filial_user, otra_filial, admin_user
):
    api_client.force_authenticate(filial_user)
    response = api_client.post(
        "/api/conversaciones/",
        {"asunto": "Planificacion"},
        format="json",
    )
    assert response.status_code == status.HTTP_201_CREATED
    conversacion_id = response.data["id"]

    response = api_client.post(
        "/api/mensajes/",
        {"conversacion": conversacion_id, "texto": "Hola a todos"},
        format="json",
    )
    assert response.status_code == status.HTTP_201_CREATED
    mensaje_id = response.data["id"]

    response = api_client.get("/api/conversaciones/")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] == 1

    response = api_client.post(
        f"/api/mensajes/{mensaje_id}/marcar-leido/", format="json"
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # usuario de otra filial no puede enviar mensaje en conversación privada
    otro_usuario = User.objects.create_user("otro", password="pass1234")
    otro_perfil = otro_usuario.perfil
    otro_perfil.filial = otra_filial
    otro_perfil.save(update_fields=["filial"])
    api_client.force_authenticate(otro_usuario)
    response = api_client.post(
        "/api/mensajes/",
        {"conversacion": conversacion_id, "texto": "Intruso"},
        format="json",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_conversacion_global_requires_admin(api_client, filial_user, admin_user):
    api_client.force_authenticate(filial_user)
    response = api_client.post(
        "/api/conversaciones/",
        {"asunto": "Global", "visibilidad": Conversacion.Visibilidad.GLOBAL},
        format="json",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    api_client.force_authenticate(admin_user)
    response = api_client.post(
        "/api/conversaciones/",
        {"asunto": "Global", "visibilidad": Conversacion.Visibilidad.GLOBAL},
        format="json",
    )
    assert response.status_code == status.HTTP_201_CREATED
    conversacion = Conversacion.objects.get(id=response.data["id"])
    assert conversacion.visibilidad == Conversacion.Visibilidad.GLOBAL
    assert conversacion.filial is None


@pytest.mark.django_db
def test_auditoria_exportar_csv(api_client, admin_user, filial):
    Accion.objects.create(
        usuario=admin_user,
        filial=filial,
        recurso="Test",
        recurso_id="1",
        accion=Accion.Tipos.CREAR,
        payload={},
    )
    api_client.force_authenticate(admin_user)
    response = api_client.get("/api/auditoria/exportar/")
    assert response.status_code == status.HTTP_200_OK
    assert response["Content-Type"] == "text/csv"
    assert "Test" in response.content.decode()
