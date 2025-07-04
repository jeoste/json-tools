#!/usr/bin/env python3
"""
Script de test pour l'exemple utilisateur spécifique.
"""

import sys
import json
from pathlib import Path

# Ajouter le répertoire src au chemin Python
sys.path.insert(0, str(Path(__file__).parent / "src"))

from data_generator import DataGenerator
from json_processor import JSONProcessor


def test_user_example():
    """Test avec l'exemple fourni par l'utilisateur."""
    print("🧪 Test avec l'exemple utilisateur...")
    
    # Squelette fourni par l'utilisateur
    skeleton = {
        "firstName": "",
        "lastName": "",
        "age": None,
        "address": {
            "streetAddress": "",
            "city": "",
            "postalCode": ""
        },
        "phoneNumbers": [
            {
                "type": "",
                "number": ""
            },
            {
                "type": "",
                "number": ""
            }
        ]
    }
    
    try:
        # Génération des données
        processor = JSONProcessor()
        generator = DataGenerator()
        
        result = processor.process_json(skeleton, None, generator)
        
        print("✅ Génération réussie !")
        print("\n📋 Résultat généré :")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        # Sauvegarde du résultat
        output_file = Path("user_example_output.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Résultat sauvegardé dans: {output_file}")
        
    except Exception as e:
        print(f"❌ Erreur lors de la génération: {e}")


if __name__ == "__main__":
    test_user_example() 