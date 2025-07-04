#!/usr/bin/env python3
"""
Script de test pour vérifier le fonctionnement du générateur de données JSON.
"""

import sys
import json
from pathlib import Path

# Ajouter le répertoire src au chemin Python
sys.path.insert(0, str(Path(__file__).parent / "src"))

from data_generator import DataGenerator
from swagger_parser import SwaggerParser
from json_processor import JSONProcessor


def test_data_generator():
    """Test du générateur de données."""
    print("🧪 Test du générateur de données...")
    
    generator = DataGenerator()
    
    # Test de génération par type
    email = generator.generate_by_type("string", "email")
    print(f"  Email généré: {email}")
    
    age = generator.generate_by_type("integer", "age")
    print(f"  Age généré: {age}")
    
    is_active = generator.generate_by_type("boolean", "isActive")
    print(f"  Statut actif: {is_active}")
    
    print("✅ Générateur de données OK\n")


def test_swagger_parser():
    """Test du parseur Swagger."""
    print("🧪 Test du parseur Swagger...")
    
    parser = SwaggerParser()
    
    # Test de chargement du fichier Swagger exemple
    swagger_file = Path("examples/swagger_example.yaml")
    
    if swagger_file.exists():
        try:
            spec = parser.load_swagger(str(swagger_file))
            print(f"  Fichier Swagger chargé avec succès")
            print(f"  Nombre de schémas: {len(parser.get_all_schemas())}")
            
            # Test de récupération des contraintes
            constraints = parser.get_constraints_for_field("User.email")
            print(f"  Contraintes pour User.email: {constraints}")
            
            print("✅ Parseur Swagger OK\n")
        except Exception as e:
            print(f"  ❌ Erreur lors du chargement Swagger: {e}\n")
    else:
        print("  ⚠️  Fichier Swagger exemple non trouvé\n")


def test_json_processor():
    """Test du processeur JSON."""
    print("🧪 Test du processeur JSON...")
    
    processor = JSONProcessor()
    generator = DataGenerator()
    
    # Test avec un squelette simple
    skeleton = {
        "user": {
            "id": None,
            "email": "",
            "firstName": "",
            "lastName": "",
            "age": None,
            "isActive": None,
            "phoneNumbers": [],
            "preferences": {
                "theme": "",
                "notifications": None
            }
        }
    }
    
    try:
        result = processor.process_json(skeleton, None, generator)
        print("  Squelette traité avec succès")
        print(f"  Données générées: {json.dumps(result, indent=2, ensure_ascii=False)}")
        print("✅ Processeur JSON OK\n")
    except Exception as e:
        print(f"  ❌ Erreur lors du traitement: {e}\n")


def test_complete_workflow():
    """Test du workflow complet avec fichiers exemples."""
    print("🧪 Test du workflow complet...")
    
    skeleton_file = Path("examples/skeleton_example.json")
    swagger_file = Path("examples/swagger_example.yaml")
    
    if not skeleton_file.exists():
        print("  ⚠️  Fichier squelette exemple non trouvé")
        return
    
    try:
        # Chargement du squelette
        with open(skeleton_file, 'r', encoding='utf-8') as f:
            skeleton = json.load(f)
        
        # Chargement du Swagger (optionnel)
        swagger_spec = None
        if swagger_file.exists():
            parser = SwaggerParser()
            swagger_spec = parser.load_swagger(str(swagger_file))
        
        # Génération des données
        processor = JSONProcessor()
        generator = DataGenerator()
        
        result = processor.process_json(skeleton, swagger_spec, generator)
        
        # Sauvegarde du résultat
        output_file = Path("test_output.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"  ✅ Workflow complet terminé avec succès")
        print(f"  Résultat sauvegardé dans: {output_file}")
        print(f"  Taille du résultat: {len(json.dumps(result))} caractères")
        
    except Exception as e:
        print(f"  ❌ Erreur lors du workflow: {e}")


def main():
    """Fonction principale de test."""
    print("🚀 Démarrage des tests du générateur de données JSON\n")
    
    test_data_generator()
    test_swagger_parser()
    test_json_processor()
    test_complete_workflow()
    
    print("🎉 Tests terminés !")


if __name__ == "__main__":
    main() 