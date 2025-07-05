"""
Point d'entrée pour l'exécutable autonome (backend.exe) compilé avec PyInstaller.
Il délègue simplement à la fonction main du module cli_generate afin de conserver
exactement la même interface en ligne de commande :

    backend.exe --skeleton PATH [--swagger PATH] [--output PATH] [--pretty]

Ainsi, aucun changement n'est nécessaire côté Electron : on appelle juste
backend.exe avec les mêmes arguments que précédemment.
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