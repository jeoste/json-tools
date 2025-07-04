"""
Module de parsing des fichiers Swagger/OpenAPI.
Extrait les schémas et contraintes pour la génération de données.
"""

import json
import yaml
from typing import Dict, Any, Optional
from pathlib import Path


class SwaggerParser:
    """Parseur de fichiers Swagger/OpenAPI."""
    
    def __init__(self):
        self.swagger_spec = None
        self.schemas = {}
        
    def load_swagger(self, file_path: str) -> Dict[str, Any]:
        """
        Charge un fichier Swagger/OpenAPI.
        
        Args:
            file_path: Chemin vers le fichier Swagger
            
        Returns:
            Spécification Swagger parsée
        """
        file_path_obj = Path(file_path)
        
        try:
            with open(file_path_obj, 'r', encoding='utf-8') as f:
                if file_path_obj.suffix.lower() in ['.yaml', '.yml']:
                    self.swagger_spec = yaml.safe_load(f)
                else:
                    self.swagger_spec = json.load(f)
            
            # Extraction des schémas
            self._extract_schemas()
            
            return self.swagger_spec
            
        except Exception as e:
            raise ValueError(f"Erreur lors du chargement du fichier Swagger : {str(e)}")
    
    def _extract_schemas(self):
        """Extrait les schémas de la spécification Swagger."""
        if not self.swagger_spec:
            return
        
        # OpenAPI 3.x
        if 'components' in self.swagger_spec:
            self.schemas = self.swagger_spec.get('components', {}).get('schemas', {})
        
        # Swagger 2.x
        elif 'definitions' in self.swagger_spec:
            self.schemas = self.swagger_spec.get('definitions', {})
    
    def get_schema_for_field(self, field_path: str) -> Optional[Dict[str, Any]]:
        """
        Récupère le schéma pour un champ donné.
        
        Args:
            field_path: Chemin du champ (ex: "User.email")
            
        Returns:
            Schéma du champ ou None si non trouvé
        """
        if not self.schemas:
            return None
        
        path_parts = field_path.split('.')
        
        if len(path_parts) < 2:
            return None
        
        schema_name = path_parts[0]
        field_name = path_parts[1]
        
        if schema_name in self.schemas:
            schema = self.schemas[schema_name]
            properties = schema.get('properties', {})
            
            if field_name in properties:
                return properties[field_name]
        
        return None
    
    def get_constraints_for_field(self, field_path: str) -> Dict[str, Any]:
        """
        Récupère les contraintes pour un champ donné.
        
        Args:
            field_path: Chemin du champ
            
        Returns:
            Dictionnaire des contraintes
        """
        schema = self.get_schema_for_field(field_path)
        
        if not schema:
            return {}
        
        constraints = {}
        
        # Contraintes de type
        if 'type' in schema:
            constraints['type'] = schema['type']
        
        # Contraintes de format
        if 'format' in schema:
            constraints['format'] = schema['format']
        
        # Contraintes de longueur
        if 'minLength' in schema:
            constraints['minLength'] = schema['minLength']
        if 'maxLength' in schema:
            constraints['maxLength'] = schema['maxLength']
        
        # Contraintes numériques
        if 'minimum' in schema:
            constraints['minimum'] = schema['minimum']
        if 'maximum' in schema:
            constraints['maximum'] = schema['maximum']
        
        # Pattern regex
        if 'pattern' in schema:
            constraints['pattern'] = schema['pattern']
        
        # Énumération
        if 'enum' in schema:
            constraints['enum'] = schema['enum']
        
        # Contraintes de tableau
        if 'items' in schema:
            constraints['items'] = schema['items']
        if 'minItems' in schema:
            constraints['minItems'] = schema['minItems']
        if 'maxItems' in schema:
            constraints['maxItems'] = schema['maxItems']
        
        # Propriétés d'objet
        if 'properties' in schema:
            constraints['properties'] = schema['properties']
        
        return constraints
    
    def find_matching_schema(self, json_structure: Dict[str, Any]) -> Optional[str]:
        """
        Trouve le schéma qui correspond le mieux à une structure JSON.
        
        Args:
            json_structure: Structure JSON à analyser
            
        Returns:
            Nom du schéma correspondant ou None
        """
        if not self.schemas:
            return None
        
        best_match = None
        best_score = 0
        
        for schema_name, schema in self.schemas.items():
            score = self._calculate_match_score(json_structure, schema)
            
            if score > best_score:
                best_score = score
                best_match = schema_name
        
        return best_match if best_score > 0.5 else None
    
    def _calculate_match_score(self, json_structure: Dict[str, Any], 
                             schema: Dict[str, Any]) -> float:
        """
        Calcule un score de correspondance entre une structure JSON et un schéma.
        
        Args:
            json_structure: Structure JSON
            schema: Schéma Swagger
            
        Returns:
            Score entre 0 et 1
        """
        if 'properties' not in schema:
            return 0.0
        
        schema_properties = schema['properties']
        json_keys = set(json_structure.keys())
        schema_keys = set(schema_properties.keys())
        
        if not json_keys or not schema_keys:
            return 0.0
        
        # Calcul de la correspondance des clés
        common_keys = json_keys & schema_keys
        total_keys = json_keys | schema_keys
        
        key_score = len(common_keys) / len(total_keys)
        
        # Calcul de la correspondance des types
        type_score = 0.0
        if common_keys:
            type_matches = 0
            for key in common_keys:
                json_value = json_structure[key]
                schema_property = schema_properties[key]
                
                if self._types_match(json_value, schema_property):
                    type_matches += 1
            
            type_score = type_matches / len(common_keys)
        
        # Score final (moyenne pondérée)
        return (key_score * 0.6) + (type_score * 0.4)
    
    def _types_match(self, value: Any, schema_property: Dict[str, Any]) -> bool:
        """
        Vérifie si le type d'une valeur correspond au schéma.
        
        Args:
            value: Valeur à vérifier
            schema_property: Propriété du schéma
            
        Returns:
            True si les types correspondent
        """
        if 'type' not in schema_property:
            return True
        
        expected_type = schema_property['type']
        
        if expected_type == 'string':
            return isinstance(value, str)
        elif expected_type == 'integer':
            return isinstance(value, int)
        elif expected_type == 'number':
            return isinstance(value, (int, float))
        elif expected_type == 'boolean':
            return isinstance(value, bool)
        elif expected_type == 'array':
            return isinstance(value, list)
        elif expected_type == 'object':
            return isinstance(value, dict)
        
        return False
    
    def get_all_schemas(self) -> Dict[str, Any]:
        """
        Retourne tous les schémas disponibles.
        
        Returns:
            Dictionnaire des schémas
        """
        return self.schemas 