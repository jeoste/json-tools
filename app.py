#!/usr/bin/env python3
"""
Application principale pour lancer le générateur de données JSON.
"""

import sys
from pathlib import Path

# Ajouter le répertoire src au chemin Python
sys.path.insert(0, str(Path(__file__).parent / "src"))

from src.main import main

if __name__ == "__main__":
    main() 