"""
Module de traitement des squelettes JSON.
Combine la génération de données avec les contraintes Swagger.
"""

import json
from typing import Dict, Any, Optional, List, Union
from data_generator import DataGenerator
from swagger_parser import SwaggerParser


class JSONProcessor:
    """Processeur de squelettes JSON."""
    
    def __init__(self):
        pass
    
    def process_json(self, skeleton: Dict[str, Any], 
                    swagger_spec: Optional[Dict[str, Any]] = None,
                    data_generator: Optional[DataGenerator] = None) -> Dict[str, Any]:
        """
        Traite un squelette JSON et génère les données finales.
        
        Args:
            skeleton: Squelette JSON à remplir
            swagger_spec: Spécification Swagger (optionnel)
            data_generator: Générateur de données
            
        Returns:
            JSON avec les données générées
        """
        if not data_generator:
            data_generator = DataGenerator()
        
        # Création du parser Swagger si disponible
        swagger_parser = None
        if swagger_spec:
            swagger_parser = SwaggerParser()
            swagger_parser.swagger_spec = swagger_spec
            swagger_parser._extract_schemas()
        
        # Traitement récursif
        return self._process_recursive(skeleton, data_generator, swagger_parser)
    
    def _process_recursive(self, data: Any, generator: DataGenerator, 
                          swagger_parser: Optional[SwaggerParser] = None,
                          current_path: str = "") -> Any:
        """
        Traite récursivement la structure de données.
        
        Args:
            data: Données à traiter
            generator: Générateur de données
            swagger_parser: Parser Swagger (optionnel)
            current_path: Chemin actuel dans la structure
            
        Returns:
            Données traitées
        """
        if isinstance(data, dict):
            result = {}
            
            for key, value in data.items():
                new_path = f"{current_path}.{key}" if current_path else key
                
                if self._is_empty_value(value):
                    # Génération de données pour les valeurs vides
                    result[key] = self._generate_value_for_field(
                        key, new_path, generator, swagger_parser
                    )
                else:
                    # Traitement récursif
                    result[key] = self._process_recursive(
                        value, generator, swagger_parser, new_path
                    )
            
            return result
        
        elif isinstance(data, list):
            # Traitement des tableaux
            if not data:
                # Tableau vide - génération d'éléments
                return self._generate_array_elements(current_path, generator, swagger_parser)
            else:
                # Traitement récursif des éléments
                return [
                    self._process_recursive(item, generator, swagger_parser, f"{current_path}[{i}]")
                    for i, item in enumerate(data)
                ]
        
        elif self._is_empty_value(data):
            # Valeur vide - génération
            return self._generate_value_for_field(
                current_path.split('.')[-1] if current_path else "",
                current_path,
                generator,
                swagger_parser
            )
        
        else:
            # Valeur non vide - conservation
            return data
    
    def _is_empty_value(self, value: Any) -> bool:
        """
        Détermine si une valeur est considérée comme vide.
        
        Args:
            value: Valeur à tester
            
        Returns:
            True si la valeur est vide
        """
        if value is None:
            return True
        
        if isinstance(value, str):
            return value == "" or value.strip() == ""
        
        if isinstance(value, (list, dict)):
            return len(value) == 0
        
        # Valeurs spéciales indiquant une génération nécessaire
        if isinstance(value, str) and value.startswith("@"):
            return True
        
        return False
    
    def _generate_value_for_field(self, field_name: str, field_path: str,
                                generator: DataGenerator,
                                swagger_parser: Optional[SwaggerParser] = None) -> Any:
        """
        Génère une valeur pour un champ donné.
        
        Args:
            field_name: Nom du champ
            field_path: Chemin complet du champ
            generator: Générateur de données
            swagger_parser: Parser Swagger (optionnel)
            
        Returns:
            Valeur générée
        """
        constraints = {}
        field_type = "string"  # Par défaut
        
        # Récupération des contraintes depuis Swagger
        if swagger_parser:
            swagger_constraints = swagger_parser.get_constraints_for_field(field_path)
            if swagger_constraints:
                constraints.update(swagger_constraints)
                field_type = constraints.get('type', 'string')
        
        # Déduction du type depuis le nom du champ si pas de contraintes Swagger
        if not constraints:
            field_type = self._infer_type_from_name(field_name)
        
        return generator.generate_by_type(field_type, field_name, constraints)
    
    def _infer_type_from_name(self, field_name: str) -> str:
        """
        Déduit le type d'un champ depuis son nom.
        
        Args:
            field_name: Nom du champ
            
        Returns:
            Type inféré
        """
        field_name_lower = field_name.lower()
        
        # Entiers
        if any(keyword in field_name_lower for keyword in ['id', 'count', 'number', 'age', 'year']):
            return "integer"
        
        # Nombres décimaux
        if any(keyword in field_name_lower for keyword in ['price', 'amount', 'cost', 'rate', 'percent']):
            return "number"
        
        # Booléens
        if any(keyword in field_name_lower for keyword in ['is_', 'has_', 'can_', 'active', 'enabled']):
            return "boolean"
        
        # Tableaux
        if field_name_lower.endswith('s') or 'list' in field_name_lower:
            return "array"
        
        # Par défaut : string
        return "string"
    
    def _generate_array_elements(self, field_path: str, generator: DataGenerator,
                               swagger_parser: Optional[SwaggerParser] = None) -> List[Any]:
        """
        Génère les éléments d'un tableau vide.
        
        Args:
            field_path: Chemin du champ tableau
            generator: Générateur de données
            swagger_parser: Parser Swagger (optionnel)
            
        Returns:
            Liste d'éléments générés
        """
        constraints = {}
        
        # Récupération des contraintes depuis Swagger
        if swagger_parser:
            swagger_constraints = swagger_parser.get_constraints_for_field(field_path)
            if swagger_constraints:
                constraints.update(swagger_constraints)
        
        # Paramètres par défaut
        min_items = constraints.get('minItems', 2)
        max_items = constraints.get('maxItems', 5)
        items_schema = constraints.get('items', {'type': 'string'})
        
        # Génération des éléments
        import random
        num_items = random.randint(min_items, max_items)
        
        elements = []
        for i in range(num_items):
            if 'type' in items_schema:
                element = generator.generate_by_type(
                    items_schema['type'],
                    f"{field_path}[{i}]",
                    items_schema
                )
            else:
                element = generator.generate_by_type("string", f"{field_path}[{i}]")
            
            elements.append(element)
        
        return elements
    
    def validate_generated_data(self, data: Dict[str, Any],
                              swagger_parser: Optional[SwaggerParser] = None) -> List[str]:
        """
        Valide les données générées.
        
        Args:
            data: Données à valider
            swagger_parser: Parser Swagger (optionnel)
            
        Returns:
            Liste des erreurs de validation
        """
        errors = []
        
        if not swagger_parser:
            return errors
        
        # Validation basique
        self._validate_recursive(data, swagger_parser, errors)
        
        return errors
    
    def _validate_recursive(self, data: Any, swagger_parser: SwaggerParser,
                          errors: List[str], current_path: str = ""):
        """
        Valide récursivement les données.
        
        Args:
            data: Données à valider
            swagger_parser: Parser Swagger
            errors: Liste des erreurs
            current_path: Chemin actuel
        """
        if isinstance(data, dict):
            for key, value in data.items():
                new_path = f"{current_path}.{key}" if current_path else key
                
                # Récupération des contraintes
                constraints = swagger_parser.get_constraints_for_field(new_path)
                
                if constraints:
                    self._validate_field(value, constraints, new_path, errors)
                
                # Validation récursive
                self._validate_recursive(value, swagger_parser, errors, new_path)
        
        elif isinstance(data, list):
            for i, item in enumerate(data):
                self._validate_recursive(item, swagger_parser, errors, f"{current_path}[{i}]")
    
    def _validate_field(self, value: Any, constraints: Dict[str, Any],
                       field_path: str, errors: List[str]):
        """
        Valide un champ selon ses contraintes.
        
        Args:
            value: Valeur à valider
            constraints: Contraintes du champ
            field_path: Chemin du champ
            errors: Liste des erreurs
        """
        # Validation du type
        expected_type = constraints.get('type')
        if expected_type and not self._check_type(value, expected_type):
            errors.append(f"Champ '{field_path}': type incorrect, attendu {expected_type}")
        
        # Validation des contraintes de longueur
        if isinstance(value, str):
            if 'minLength' in constraints and len(value) < constraints['minLength']:
                errors.append(f"Champ '{field_path}': longueur minimale non respectée")
            if 'maxLength' in constraints and len(value) > constraints['maxLength']:
                errors.append(f"Champ '{field_path}': longueur maximale dépassée")
        
        # Validation des contraintes numériques
        if isinstance(value, (int, float)):
            if 'minimum' in constraints and value < constraints['minimum']:
                errors.append(f"Champ '{field_path}': valeur minimale non respectée")
            if 'maximum' in constraints and value > constraints['maximum']:
                errors.append(f"Champ '{field_path}': valeur maximale dépassée")
    
    def _check_type(self, value: Any, expected_type: str) -> bool:
        """
        Vérifie si une valeur correspond au type attendu.
        
        Args:
            value: Valeur à vérifier
            expected_type: Type attendu
            
        Returns:
            True si le type correspond
        """
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