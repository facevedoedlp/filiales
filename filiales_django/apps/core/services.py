from __future__ import annotations

import json
import logging
from typing import Iterable

import requests
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_notification_email(
    subject: str,
    message: str,
    recipients: Iterable[str],
    *,
    html_message: str | None = None,
) -> None:
    if not getattr(settings, "EMAILS_ENABLED", False):
        logger.debug("Emails disabled, skipping send for subject %s", subject)
        return
    recipients = [email for email in recipients if email]
    if not recipients:
        return
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            list(recipients),
            html_message=html_message,
        )
    except Exception as exc:  # pragma: no cover - logging safeguard
        logger.exception("Error sending email: %%s", exc)


def dispatch_webhook(event: str, payload: dict[str, object]) -> None:
    if not getattr(settings, "WEBHOOKS_ENABLED", False):
        logger.debug("Webhooks disabled, skipping %s", event)
        return
    url = {
        "auditoria": getattr(settings, "WEBHOOK_URL_AUDITORIA", ""),
        "eventos": getattr(settings, "WEBHOOK_URL_EVENTOS", ""),
    }.get(event)
    if not url:
        logger.debug("No webhook URL configured for %s", event)
        return
    try:
        requests.post(
            url,
            data=json.dumps(payload),
            headers={"Content-Type": "application/json"},
            timeout=5,
        )
    except Exception as exc:  # pragma: no cover - network failures
        logger.exception("Error dispatching webhook %s: %%s", event, exc)
