"""
Module d'anonymisation des données JSON.
Permet de mélanger les données sensibles tout en gardant la structure.
"""

import json
import random
from typing import Dict, Any, List, Optional, Union
from faker import Faker
import re


class DataAnonymizer:
    """Anonymiseur de données JSON."""
    
    def __init__(self, locale: str = 'fr_FR'):
        """
        Initialise l'anonymiseur avec un locale spécifique.
        
        Args:
            locale: Locale pour la génération (défaut français)
        """
        self.fake = Faker(locale)
        
        # Pools de données anonymisées
        self.pools = {
            'firstNames': [self.fake.first_name() for _ in range(100)],
            'lastNames': [self.fake.last_name() for _ in range(100)],
            'emails': [self.fake.email() for _ in range(100)],
            'phones': [self.fake.phone_number() for _ in range(100)],
            'addresses': [self.fake.address() for _ in range(100)],
            'streets': [self.fake.street_address() for _ in range(100)],
            'cities': [self.fake.city() for _ in range(100)],
            'postcodes': [self.fake.postcode() for _ in range(100)],
            'countries': [self.fake.country() for _ in range(100)],
            'companies': [self.fake.company() for _ in range(100)],
            'urls': [self.fake.url() for _ in range(100)],
            'sentences': [self.fake.sentence() for _ in range(100)],
            'paragraphs': [self.fake.paragraph() for _ in range(100)],
            'dates': [self.fake.date().isoformat() for _ in range(100)],
            'datetimes': [self.fake.date_time().isoformat() for _ in range(100)]
        }
        
        # Définir des patterns pour identifier les champs sensibles
        self.sensitive_patterns = {
            'firstName': ['prenom', 'firstname', 'fname', 'given_name', 'first_name'],
            'lastName': ['nom', 'lastname', 'lname', 'surname', 'last_name', 'family_name'],
            'email': ['email', 'mail', 'e_mail', 'e-mail', 'adresse_email'],
            'phone': ['telephone', 'phone', 'tel', 'mobile', 'cellphone', 'numero'],
            'address': ['adresse', 'address', 'addr'],
            'street': ['rue', 'street', 'street_address', 'voie'],
            'city': ['ville', 'city', 'localite'],
            'postcode': ['code_postal', 'postal_code', 'zip', 'zip_code', 'postcode'],
            'country': ['pays', 'country', 'nation'],
            'company': ['entreprise', 'company', 'societe', 'organization'],
            'url': ['url', 'website', 'site', 'lien'],
            'description': ['description', 'commentaire', 'comment', 'note'],
            'date': ['date', 'created_at', 'updated_at', 'created', 'updated'],
            'datetime': ['datetime', 'timestamp', 'time']
        }
    
    def anonymize_json(self, data: Union[Dict, List, str]) -> Union[Dict, List, str]:
        """
        Anonymise un objet JSON en mélangeant les données sensibles.
        
        Args:
            data: Données JSON à anonymiser (dict, liste ou string JSON)
            
        Returns:
            Données anonymisées
        """
        # Si c'est une string JSON, la parser
        if isinstance(data, str):
            try:
                parsed_data = json.loads(data)
                anonymized = self._anonymize_recursive(parsed_data)
                return json.dumps(anonymized, indent=2, ensure_ascii=False)
            except json.JSONDecodeError:
                return data
        
        # Sinon, traiter directement
        return self._anonymize_recursive(data)
    
    def _anonymize_recursive(self, data: Any, current_path: str = "") -> Any:
        """
        Anonymise récursivement une structure de données.
        
        Args:
            data: Données à anonymiser
            current_path: Chemin actuel dans la structure
            
        Returns:
            Données anonymisées
        """
        if isinstance(data, dict):
            result = {}
            
            for key, value in data.items():
                new_path = f"{current_path}.{key}" if current_path else key
                
                # Anonymiser la valeur si le champ est sensible
                if self._is_sensitive_field(key) and self._is_anonymizable_value(value):
                    result[key] = self._anonymize_field(key, value)
                else:
                    # Traitement récursif pour les objets et listes
                    result[key] = self._anonymize_recursive(value, new_path)
            
            return result
        
        elif isinstance(data, list):
            return [self._anonymize_recursive(item, f"{current_path}[{i}]") 
                   for i, item in enumerate(data)]
        
        else:
            # Valeur primitive - retourner telle quelle
            return data
    
    def _is_sensitive_field(self, field_name: str) -> bool:
        """
        Détermine si un champ est sensible et doit être anonymisé.
        
        Args:
            field_name: Nom du champ
            
        Returns:
            True si le champ est sensible
        """
        field_name_lower = field_name.lower()
        
        # Vérifier tous les patterns
        for category, patterns in self.sensitive_patterns.items():
            if any(pattern in field_name_lower for pattern in patterns):
                return True
        
        return False
    
    def _is_anonymizable_value(self, value: Any) -> bool:
        """
        Détermine si une valeur peut être anonymisée.
        
        Args:
            value: Valeur à tester
            
        Returns:
            True si la valeur peut être anonymisée
        """
        # Seulement les strings non vides
        if isinstance(value, str) and value.strip():
            return True
        
        return False
    
    def _anonymize_field(self, field_name: str, value: str) -> str:
        """
        Anonymise une valeur selon le type de champ.
        
        Args:
            field_name: Nom du champ
            value: Valeur à anonymiser
            
        Returns:
            Valeur anonymisée
        """
        field_name_lower = field_name.lower()
        
        # Prénom
        if any(pattern in field_name_lower for pattern in self.sensitive_patterns['firstName']):
            return random.choice(self.pools['firstNames'])
        
        # Nom
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['lastName']):
            return random.choice(self.pools['lastNames'])
        
        # Email
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['email']):
            return random.choice(self.pools['emails'])
        
        # Téléphone
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['phone']):
            return random.choice(self.pools['phones'])
        
        # Adresse complète
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['address']):
            return random.choice(self.pools['addresses'])
        
        # Rue
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['street']):
            return random.choice(self.pools['streets'])
        
        # Ville
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['city']):
            return random.choice(self.pools['cities'])
        
        # Code postal
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['postcode']):
            return random.choice(self.pools['postcodes'])
        
        # Pays
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['country']):
            return random.choice(self.pools['countries'])
        
        # Entreprise
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['company']):
            return random.choice(self.pools['companies'])
        
        # URL
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['url']):
            return random.choice(self.pools['urls'])
        
        # Description/commentaire
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['description']):
            if len(value) > 100:
                return random.choice(self.pools['paragraphs'])
            else:
                return random.choice(self.pools['sentences'])
        
        # Date
        elif any(pattern in field_name_lower for pattern in self.sensitive_patterns['date']):
            # Essayer de préserver le format
            if 'T' in value or ':' in value:
                return random.choice(self.pools['datetimes'])
            else:
                return random.choice(self.pools['dates'])
        
        # Par défaut, mélanger avec des données génériques
        return self._anonymize_generic_string(value)
    
    def _anonymize_generic_string(self, value: str) -> str:
        """
        Anonymise une chaîne générique.
        
        Args:
            value: Valeur à anonymiser
            
        Returns:
            Valeur anonymisée
        """
        # Préserver la longueur approximative
        if len(value) <= 10:
            return self.fake.word()
        elif len(value) <= 50:
            return self.fake.sentence(nb_words=3)
        else:
            return self.fake.paragraph(nb_sentences=2)
    
    def add_to_pool(self, pool_name: str, values: List[str]):
        """
        Ajoute des valeurs à un pool d'anonymisation.
        
        Args:
            pool_name: Nom du pool
            values: Valeurs à ajouter
        """
        if pool_name not in self.pools:
            self.pools[pool_name] = []
        
        self.pools[pool_name].extend(values)
    
    def get_sensitive_fields(self, data: Union[Dict, List, str]) -> List[str]:
        """
        Retourne la liste des champs sensibles détectés.
        
        Args:
            data: Données à analyser
            
        Returns:
            Liste des champs sensibles trouvés
        """
        sensitive_fields = []
        
        # Si c'est une string JSON, la parser
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                return sensitive_fields
        
        self._collect_sensitive_fields(data, sensitive_fields)
        return list(set(sensitive_fields))  # Supprimer les doublons
    
    def _collect_sensitive_fields(self, data: Any, sensitive_fields: List[str], current_path: str = ""):
        """
        Collecte récursivement les champs sensibles.
        
        Args:
            data: Données à analyser
            sensitive_fields: Liste à remplir
            current_path: Chemin actuel
        """
        if isinstance(data, dict):
            for key, value in data.items():
                new_path = f"{current_path}.{key}" if current_path else key
                
                if self._is_sensitive_field(key) and self._is_anonymizable_value(value):
                    sensitive_fields.append(new_path)
                
                self._collect_sensitive_fields(value, sensitive_fields, new_path)
        
        elif isinstance(data, list):
            for i, item in enumerate(data):
                self._collect_sensitive_fields(item, sensitive_fields, f"{current_path}[{i}]") 