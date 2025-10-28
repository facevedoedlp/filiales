from __future__ import annotations

import logging
from typing import Any

from apps.core.services import dispatch_webhook
from django.db import transaction

logger = logging.getLogger(__name__)


def log_action(
    *,
    usuario,
    recurso: str,
    recurso_id: Any,
    accion: str,
    payload: dict[str, Any] | None = None,
    filial=None,
    request=None,
) -> None:
    from apps.auditoria.models import Accion

    ip = None
    user_agent = None
    if request:
        ip = request.META.get("REMOTE_ADDR")
        user_agent = request.META.get("HTTP_USER_AGENT")
    payload = payload or {}
    with transaction.atomic():
        registro = Accion.objects.create(
            usuario=usuario,
            filial=filial,
            recurso=recurso,
            recurso_id=str(recurso_id),
            accion=accion,
            payload=payload,
            ip=ip,
            user_agent=user_agent,
        )
    try:
        dispatch_webhook(
            "auditoria",
            {
                "id": registro.id,
                "usuario": usuario.pk if usuario else None,
                "filial": filial.pk if filial else None,
                "recurso": recurso,
                "recurso_id": registro.recurso_id,
                "accion": accion,
                "payload": payload,
            },
        )
    except Exception as exc:  # pragma: no cover - logging safeguard
        logger.exception("Error enviando webhook de auditoria: %%s", exc)
