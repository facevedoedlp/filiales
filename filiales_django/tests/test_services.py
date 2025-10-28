import pytest
from apps.core.services import dispatch_webhook, send_notification_email
from apps.core.utils import get_user_profile
from apps.usuarios.models import PerfilUsuario
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()


@pytest.mark.django_db
def test_send_notification_email_respects_flags(settings, monkeypatch):
    settings.DEFAULT_FROM_EMAIL = "notificaciones@test.com"
    sent = []

    def fake_send_mail(*args, **kwargs):
        sent.append((args, kwargs))

    monkeypatch.setattr("apps.core.services.send_mail", fake_send_mail)

    settings.EMAILS_ENABLED = False
    send_notification_email("Asunto", "Mensaje", ["dest@test.com"])
    assert not sent

    settings.EMAILS_ENABLED = True
    send_notification_email("Asunto", "Mensaje", ["", "dest@test.com"])
    assert sent


@pytest.mark.django_db
def test_dispatch_webhook_conditions(settings, monkeypatch):
    posted = []

    def fake_post(url, data=None, headers=None, timeout=None):
        posted.append({"url": url, "data": data, "headers": headers})

    monkeypatch.setattr("apps.core.services.requests.post", fake_post)

    settings.WEBHOOKS_ENABLED = False
    dispatch_webhook("eventos", {"a": 1})
    assert not posted

    settings.WEBHOOKS_ENABLED = True
    settings.WEBHOOK_URL_EVENTOS = "https://webhook.test/eventos"
    dispatch_webhook("eventos", {"a": 1})
    assert posted


@pytest.mark.django_db
def test_get_user_profile_returns_profile(admin_user):
    assert get_user_profile(admin_user) == admin_user.perfil


@pytest.mark.django_db
def test_perfil_usuario_clean_and_permisos(filial):
    perfil = PerfilUsuario(
        user=User.objects.create_user("sin_filial", password="pass1234"),
        rol=PerfilUsuario.Roles.USUARIO_FILIAL,
    )
    with pytest.raises(ValidationError):
        perfil.clean()

    perfil.filial = filial
    perfil.clean()
    assert perfil.permisos == ["filial_scope"]

    perfil.rol = PerfilUsuario.Roles.ADMINISTRADOR
    assert perfil.permisos == ["full_access"]


@pytest.mark.django_db
def test_crear_perfil_signal():
    usuario = User.objects.create_user("nuevo_signal", password="pass1234")
    assert hasattr(usuario, "perfil")
    assert usuario.perfil.rol == PerfilUsuario.Roles.USUARIO_FILIAL
