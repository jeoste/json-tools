#!/usr/bin/env python3
"""
Entry point for the packaged backend.
This file serves as the main entry point when the Python backend is packaged as a standalone executable.
It simply calls the CLI module with the same arguments.
This way, no changes are needed on the Electron side: we just call
the backend.exe with the same arguments as before.
"""

from __future__ import annotations

import sys
from pathlib import Path

# S'assurer que le répertoire racine du projet est dans sys.path, afin que
# l'import de cli_generate fonctionne, que l'exécutable soit lancé depuis
# n'importe quel emplacement.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Import paresseux pour éviter les temps de démarrage inutiles
from cli_generate import main as cli_main  # type: ignore


def main() -> None:  # pragma: no cover
    """Point d'entrée de l'exécutable."""
    cli_main()


if __name__ == "__main__":
    main() 