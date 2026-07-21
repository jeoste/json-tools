"""Shim: canonical modules live in lib/. Electron/CLI keep importing from src/."""
from __future__ import annotations

import sys
from pathlib import Path

_LIB = Path(__file__).resolve().parent.parent / "lib"
if str(_LIB) not in sys.path:
    sys.path.insert(0, str(_LIB))

from data_anonymizer import *  # noqa: E402,F401,F403
from data_anonymizer import DataAnonymizer  # noqa: E402
