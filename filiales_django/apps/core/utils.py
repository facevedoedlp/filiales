from __future__ import annotations

from typing import Any


def get_user_profile(user: Any):
    return getattr(user, "perfil", None)
