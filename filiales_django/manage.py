#!/usr/bin/env python
"""Punto de entrada principal para la administración del proyecto Django."""
import os
import sys


def main() -> None:
    """Ejecuta tareas administrativas de Django."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "No se pudo importar Django. Asegúrate de que esté instalado y disponible en tu PATH."
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
