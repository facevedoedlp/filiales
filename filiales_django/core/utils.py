"""Utilidades generales del proyecto."""
from __future__ import annotations

from typing import Any, Dict


def respuesta_estandar(mensaje: str, datos: Dict[str, Any] | None = None) -> Dict[str, Any]:
    """Genera un formato homogéneo de respuestas para acciones personalizadas."""

    return {"mensaje": mensaje, "datos": datos or {}}
