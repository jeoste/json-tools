"""
Module de génération de données anonymisées cohérentes.
Utilise la librairie Faker pour générer des données réalistes.
"""

from faker import Faker
import random
import uuid
import re
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional


class DataGenerator:
    """Générateur de données anonymisées cohérentes."""
    
    def __init__(self, locale: str = 'fr_FR'):
        """
        Initialise le générateur avec une locale spécifique.
        
        Args:
            locale: Locale pour la génération (par défaut français)
        """
        self.fake = Faker(locale)
        Faker.seed(42)  # Pour la reproductibilité
        
        # Cache pour maintenir la cohérence
        self._cached_data = {}
        
    def generate_by_type(self, field_type: str, field_name: str = "", 
                        constraints: Optional[Dict] = None) -> Any:
        """
        Génère une donnée selon le type spécifié.
        
        Args:
            field_type: Type de données à générer
            field_name: Nom du champ (pour déduire le type)
            constraints: Contraintes additionnelles
            
        Returns:
            Donnée générée
        """
        constraints = constraints or {}
        
        # Génération selon le type
        if field_type == "string":
            return self._generate_string(field_name, constraints)
        elif field_type == "integer":
            return self._generate_integer(constraints)
        elif field_type == "number":
            return self._generate_number(constraints)
        elif field_type == "boolean":
            return self._generate_boolean()
        elif field_type == "array":
            return self._generate_array(field_name, constraints)
        elif field_type == "object":
            return self._generate_object(constraints)
        else:
            return self._generate_string(field_name, constraints)
    
    def _generate_string(self, field_name: str, constraints: Dict) -> str:
        """Génère une chaîne de caractères selon le nom du champ."""
        field_name_lower = field_name.lower()
        
        # Détection du type selon le nom du champ
        if any(keyword in field_name_lower for keyword in ['email', 'mail', 'e-mail']):
            return self._get_cached_or_generate(f"email_{field_name}", self.fake.email)
        
        elif any(keyword in field_name_lower for keyword in ['phone', 'telephone', 'tel']):
            return self._get_cached_or_generate(f"phone_{field_name}", self.fake.phone_number)
        
        elif any(keyword in field_name_lower for keyword in ['nom', 'name', 'surname']):
            return self._get_cached_or_generate(f"name_{field_name}", self.fake.last_name)
        
        elif any(keyword in field_name_lower for keyword in ['prenom', 'firstname', 'given']):
            return self._get_cached_or_generate(f"firstname_{field_name}", self.fake.first_name)
        
        elif any(keyword in field_name_lower for keyword in ['address', 'adresse']):
            return self._get_cached_or_generate(f"address_{field_name}", self.fake.address)
        
        elif any(keyword in field_name_lower for keyword in ['city', 'ville']):
            return self._get_cached_or_generate(f"city_{field_name}", self.fake.city)
        
        elif any(keyword in field_name_lower for keyword in ['postal', 'zip']):
            return self._get_cached_or_generate(f"postal_{field_name}", self.fake.postcode)
        
        elif any(keyword in field_name_lower for keyword in ['country', 'pays']):
            return self._get_cached_or_generate(f"country_{field_name}", self.fake.country)
        
        elif any(keyword in field_name_lower for keyword in ['company', 'entreprise']):
            return self._get_cached_or_generate(f"company_{field_name}", self.fake.company)
        
        elif any(keyword in field_name_lower for keyword in ['url', 'website', 'site']):
            return self._get_cached_or_generate(f"url_{field_name}", self.fake.url)
        
        elif any(keyword in field_name_lower for keyword in ['uuid', 'id', 'identifier']):
            return self._get_cached_or_generate(f"uuid_{field_name}", lambda: str(uuid.uuid4()))
        
        elif any(keyword in field_name_lower for keyword in ['date', 'created', 'updated']):
            return self._get_cached_or_generate(f"date_{field_name}", 
                                               lambda: self.fake.date_time_between(start_date='-1y', end_date='now').isoformat())
        
        elif any(keyword in field_name_lower for keyword in ['description', 'comment']):
            return self._get_cached_or_generate(f"text_{field_name}", 
                                               lambda: self.fake.sentence(nb_words=10))
        
        # Contraintes de format
        if 'pattern' in constraints:
            return self._generate_pattern_string(constraints['pattern'])
        
        # Contraintes de longueur
        min_length = constraints.get('minLength', 1)
        max_length = constraints.get('maxLength', 50)
        
        if 'enum' in constraints:
            return random.choice(constraints['enum'])
        
        # Génération par défaut
        return self.fake.lexify('?' * random.randint(min_length, max_length))
    
    def _generate_integer(self, constraints: Dict) -> int:
        """Génère un entier selon les contraintes."""
        minimum = constraints.get('minimum', 0)
        maximum = constraints.get('maximum', 1000)
        
        if 'enum' in constraints:
            return random.choice(constraints['enum'])
        
        return random.randint(minimum, maximum)
    
    def _generate_number(self, constraints: Dict) -> float:
        """Génère un nombre décimal selon les contraintes."""
        minimum = constraints.get('minimum', 0.0)
        maximum = constraints.get('maximum', 1000.0)
        
        if 'enum' in constraints:
            return random.choice(constraints['enum'])
        
        return round(random.uniform(minimum, maximum), 2)
    
    def _generate_boolean(self) -> bool:
        """Génère un booléen."""
        return random.choice([True, False])
    
    def _generate_array(self, field_name: str, constraints: Dict) -> List[Any]:
        """Génère un tableau selon les contraintes."""
        min_items = constraints.get('minItems', 1)
        max_items = constraints.get('maxItems', 5)
        items_schema = constraints.get('items', {})
        
        size = random.randint(min_items, max_items)
        
        # Type des éléments
        item_type = items_schema.get('type', 'string')
        
        return [self.generate_by_type(item_type, field_name, items_schema) 
                for _ in range(size)]
    
    def _generate_object(self, constraints: Dict) -> Dict[str, Any]:
        """Génère un objet selon les contraintes."""
        properties = constraints.get('properties', {})
        
        result = {}
        for prop_name, prop_schema in properties.items():
            prop_type = prop_schema.get('type', 'string')
            result[prop_name] = self.generate_by_type(prop_type, prop_name, prop_schema)
        
        return result
    
    def _generate_pattern_string(self, pattern: str) -> str:
        """Génère une chaîne selon un pattern regex."""
        # Simplification : quelques patterns courants
        if pattern == r'^\d{4}-\d{2}-\d{2}$':
            return self.fake.date().strftime('%Y-%m-%d')
        elif pattern == r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$':
            return self.fake.email()
        elif pattern == r'^\d{10}$':
            return ''.join([str(random.randint(0, 9)) for _ in range(10)])
        else:
            # Pattern générique
            return self.fake.lexify(pattern)
    
    def _get_cached_or_generate(self, key: str, generator_func) -> Any:
        """Récupère une valeur du cache ou la génère."""
        if key not in self._cached_data:
            self._cached_data[key] = generator_func()
        return self._cached_data[key]
    
    def reset_cache(self):
        """Remet à zéro le cache."""
        self._cached_data = {} 