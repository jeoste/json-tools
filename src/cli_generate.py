#!/usr/bin/env python3
"""
Interface CLI pour le générateur de données JSON de test.
Utilisé par l'interface Electron pour communiquer avec le back-end Python.
"""

import argparse
import json
import sys
import os
from pathlib import Path

from data_generator import DataGenerator
from swagger_parser import SwaggerParser
from json_processor import JSONProcessor


def main():
    parser = argparse.ArgumentParser(description="Générateur de données JSON de test - Interface CLI")
    parser.add_argument("--skeleton", required=True, help="Chemin vers le fichier squelette JSON")
    parser.add_argument("--swagger", help="Chemin vers le fichier Swagger/OpenAPI (optionnel)")
    parser.add_argument("--output", help="Chemin vers le fichier de sortie (optionnel)")
    parser.add_argument("--pretty", action="store_true", help="Formatage JSON indenté")
    
    args = parser.parse_args()
    
    try:
        # Vérification de l'existence du fichier squelette
        if not os.path.exists(args.skeleton):
            raise FileNotFoundError(f"Le fichier squelette '{args.skeleton}' n'existe pas.")
        
        # Chargement du squelette JSON
        with open(args.skeleton, 'r', encoding='utf-8') as f:
            skeleton = json.load(f)
        
        # Chargement du schéma Swagger si fourni
        swagger_schema = None
        if args.swagger:
            if not os.path.exists(args.swagger):
                raise FileNotFoundError(f"Le fichier Swagger '{args.swagger}' n'existe pas.")
            swagger_parser = SwaggerParser()
            swagger_schema = swagger_parser.load_swagger(args.swagger)
        
        # Initialisation des composants
        data_generator = DataGenerator()
        json_processor = JSONProcessor()
        
        # Génération des données
        generated_data = json_processor.process_json(skeleton, swagger_schema, data_generator)
        
        # Sortie des données
        if args.output:
            # Sauvegarde dans un fichier
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(generated_data, f, indent=2 if args.pretty else None, ensure_ascii=False)
            print(f"Données sauvegardées dans {args.output}", file=sys.stderr)
        else:
            # Sortie sur stdout pour Electron
            json.dump(generated_data, sys.stdout, indent=2 if args.pretty else None, ensure_ascii=False)
            
    except Exception as e:
        print(f"Erreur: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main() 