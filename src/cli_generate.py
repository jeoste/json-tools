#!/usr/bin/env python3
"""
CLI interface for the test JSON data generator.
Used by the Electron interface to communicate with the Python backend.
"""

import argparse
import json
import sys
import os
from pathlib import Path

from data_generator import DataGenerator
from swagger_parser import SwaggerParser
from json_processor import JSONProcessor
from data_anonymizer import DataAnonymizer


def main():
    parser = argparse.ArgumentParser(description="Test JSON Data Generator - CLI Interface")
    parser.add_argument("--skeleton", help="Path to the JSON skeleton file")
    parser.add_argument("--swagger", help="Path to the Swagger/OpenAPI file (optional)")
    parser.add_argument("--output", help="Path to the output file (optional)")
    parser.add_argument("--pretty", action="store_true", help="Indented JSON formatting")
    parser.add_argument("--anonymize", help="Path to the JSON file to anonymize (alternative to --skeleton)")
    parser.add_argument("--analyze", help="Path to the JSON file to analyze for sensitive fields")
    
    args = parser.parse_args()
    
    try:
        # Mode d'anonymisation
        if args.anonymize:
            if not os.path.exists(args.anonymize):
                raise FileNotFoundError(f"Le fichier à anonymiser '{args.anonymize}' n'existe pas.")
            
            # Charger le fichier JSON à anonymiser
            with open(args.anonymize, 'r', encoding='utf-8') as f:
                data_to_anonymize = json.load(f)
            
            # Anonymiser les données
            anonymizer = DataAnonymizer()
            anonymized_data = anonymizer.anonymize_json(data_to_anonymize)
            
            # Sortie des données anonymisées
            if args.output:
                with open(args.output, 'w', encoding='utf-8') as f:
                    json.dump(anonymized_data, f, indent=2 if args.pretty else None, ensure_ascii=False)
                print(f"Données anonymisées sauvegardées dans {args.output}", file=sys.stderr)
            else:
                json.dump(anonymized_data, sys.stdout, indent=2 if args.pretty else None, ensure_ascii=False)
            
            return
        
        # Mode d'analyse des champs sensibles
        if args.analyze:
            if not os.path.exists(args.analyze):
                raise FileNotFoundError(f"Le fichier à analyser '{args.analyze}' n'existe pas.")
            
            # Charger le fichier JSON à analyser
            with open(args.analyze, 'r', encoding='utf-8') as f:
                data_to_analyze = json.load(f)
            
            # Analyser les champs sensibles
            anonymizer = DataAnonymizer()
            sensitive_fields = anonymizer.get_sensitive_fields(data_to_analyze)
            
            # Sortie de l'analyse
            analysis_result = {
                "sensitive_fields": sensitive_fields,
                "total_fields": len(sensitive_fields),
                "message": f"Trouvé {len(sensitive_fields)} champ(s) sensible(s)"
            }
            
            if args.output:
                with open(args.output, 'w', encoding='utf-8') as f:
                    json.dump(analysis_result, f, indent=2 if args.pretty else None, ensure_ascii=False)
                print(f"Analyse sauvegardée dans {args.output}", file=sys.stderr)
            else:
                json.dump(analysis_result, sys.stdout, indent=2 if args.pretty else None, ensure_ascii=False)
            
            return
        
        # Mode de génération (mode par défaut)
        if not args.skeleton:
            raise ValueError("L'option --skeleton est requise pour la génération de données.")
        
        # Check skeleton file existence
        if not os.path.exists(args.skeleton):
            raise FileNotFoundError(f"The skeleton file '{args.skeleton}' does not exist.")
        
        # Load JSON skeleton
        with open(args.skeleton, 'r', encoding='utf-8') as f:
            skeleton = json.load(f)
        
        # Load Swagger schema if provided
        swagger_schema = None
        if args.swagger:
            if not os.path.exists(args.swagger):
                raise FileNotFoundError(f"The Swagger file '{args.swagger}' does not exist.")
            swagger_parser = SwaggerParser()
            swagger_schema = swagger_parser.load_swagger(args.swagger)
        
        # Initialize components
        data_generator = DataGenerator()
        json_processor = JSONProcessor()
        
        # Generate data
        generated_data = json_processor.process_json(skeleton, swagger_schema, data_generator)
        
        # Output data
        if args.output:
            # Save to file
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(generated_data, f, indent=2 if args.pretty else None, ensure_ascii=False)
            print(f"Data saved to {args.output}", file=sys.stderr)
        else:
            # Output to stdout for Electron
            json.dump(generated_data, sys.stdout, indent=2 if args.pretty else None, ensure_ascii=False)
            
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main() 