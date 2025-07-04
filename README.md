# Générateur de Données JSON de Test

Application de bureau pour générer des fichiers JSON de test à partir d'un squelette JSON et d'un schéma Swagger/OpenAPI.

## Fonctionnalités

- **Génération automatique** : Remplit automatiquement les champs vides d'un squelette JSON
- **Anonymisation cohérente** : Génère des données réalistes et cohérentes (emails valides, numéros de téléphone, etc.)
- **Respect des contraintes Swagger** : Utilise les définitions OpenAPI pour respecter les formats et contraintes
- **Traitement local** : Toutes les données sont générées localement, sans recours au cloud
- **Interface simple** : Interface utilisateur intuitive avec prévisualisation

## Prérequis

- Python 3.7 ou supérieur
- pip (gestionnaire de paquets Python)

## Installation

1. **Cloner le projet** :
   ```bash
   git clone <votre-repo>
   cd api-test-generation
   ```

2. **Installer les dépendances** :
   ```bash
   pip install -r requirements.txt
   ```

## Utilisation

### Interface Electron (recommandée)

1. **Installation** :
   ```bash
   # Installer les dépendances Python et Node.js
   npm run install
   ```

2. **Lancement** :
   ```bash
   # Lancer l'application Electron
   npm start
   # ou
   npm run electron
   ```

3. **Interface utilisateur moderne** :
   - **Fichier squelette JSON** : Cliquez sur "Parcourir" pour sélectionner votre fichier JSON
   - **Fichier Swagger/OpenAPI** : (Optionnel) Sélectionnez votre fichier de spécification API
   - **Génération** : Cliquez sur "Générer les données" pour créer le JSON complet
   - **Prévisualisation** : Visualisez le résultat avec coloration syntaxique
   - **Sauvegarde** : Cliquez sur "Sauvegarder" pour exporter le résultat

### Interface Tkinter (alternative)

```bash
# Lancer l'interface Tkinter classique
npm run tkinter
# ou
python src/main.py
```

### Interface en ligne de commande

```bash
# Utilisation directe via CLI
python src/cli_generate.py --skeleton examples/skeleton_example.json --swagger examples/swagger_example.yaml --output result.json
```

### Exemples

Des exemples sont fournis dans le dossier `examples/` :
- `skeleton_example.json` : Exemple de squelette JSON
- `swagger_example.yaml` : Exemple de spécification OpenAPI
- `generated_example.json` : Résultat généré

## Format du squelette JSON

Le squelette JSON peut contenir :
- **Valeurs `null`** : Seront remplacées par des données générées
- **Chaînes vides `""`** : Seront remplacées par des données générées
- **Tableaux vides `[]`** : Seront remplis avec des éléments générés
- **Objets vides `{}`** : Seront remplis avec des propriétés générées
- **Valeurs existantes** : Seront conservées telles quelles

### Exemple de squelette

```json
{
  "user": {
    "id": null,
    "email": "",
    "firstName": "",
    "lastName": "",
    "age": null,
    "isActive": null,
    "address": {
      "street": "",
      "city": "",
      "postalCode": "",
      "country": ""
    },
    "phoneNumbers": [],
    "tags": []
  }
}
```

## Génération intelligente

L'application détecte automatiquement le type de données à générer selon :

1. **Le nom du champ** :
   - `email`, `mail` → Adresse email valide
   - `phone`, `telephone` → Numéro de téléphone
   - `firstName`, `prenom` → Prénom
   - `lastName`, `nom` → Nom de famille
   - `address`, `adresse` → Adresse complète
   - `city`, `ville` → Nom de ville
   - `country`, `pays` → Nom de pays
   - `id`, `identifier` → Identifiant unique
   - `date`, `created`, `updated` → Date au format ISO
   - `url`, `website` → URL valide
   - `company`, `entreprise` → Nom d'entreprise

2. **Les contraintes Swagger** (si fichier fourni) :
   - Types de données (`string`, `integer`, `number`, `boolean`)
   - Formats (`email`, `date-time`, `uri`)
   - Contraintes de longueur (`minLength`, `maxLength`)
   - Contraintes numériques (`minimum`, `maximum`)
   - Motifs regex (`pattern`)
   - Énumérations (`enum`)
   - Contraintes de tableaux (`minItems`, `maxItems`)

## Architecture

Le projet est organisé en modules :

```
genieration/
├── src/                    # Back-end Python
│   ├── main.py            # Interface utilisateur Tkinter (legacy)
│   ├── cli_generate.py    # Interface CLI pour Electron
│   ├── data_generator.py  # Génération de données avec Faker
│   ├── swagger_parser.py  # Parsing des fichiers Swagger/OpenAPI
│   └── json_processor.py  # Traitement des squelettes JSON
├── electron/              # Front-end Electron
│   ├── main.js           # Processus principal Electron
│   ├── preload.js        # Pont sécurisé Node.js
│   └── renderer/         # Interface utilisateur
│       ├── index.html    # Structure HTML
│       ├── styles.css    # Styles modernes
│       └── renderer.js   # Logique JavaScript
└── examples/             # Exemples d'utilisation
```

### Modules principaux

- **`DataGenerator`** : Génère des données anonymisées cohérentes
- **`SwaggerParser`** : Analyse les fichiers Swagger/OpenAPI
- **`JSONProcessor`** : Traite les squelettes et combine les données
- **`CLI Interface`** : Communication entre Electron et Python
- **`Electron App`** : Interface utilisateur moderne multiplateforme

## Dépendances

### Python (Back-end)
- **faker** : Génération de données anonymisées
- **pyyaml** : Parsing des fichiers YAML
- **openapi-spec-validator** : Validation des spécifications OpenAPI
- **jsonschema** : Validation des schémas JSON
- **tkinter** : Interface utilisateur legacy (inclus avec Python)

### Node.js (Front-end)
- **electron** : Framework d'application desktop
- **fs-extra** : Gestion avancée des fichiers

## Exemples d'utilisation

### 1. Génération simple

Avec un squelette JSON basique :

```json
{
  "user": {
    "email": "",
    "firstName": "",
    "age": null
  }
}
```

Résultat généré :

```json
{
  "user": {
    "email": "jean.dupont@example.com",
    "firstName": "Jean",
    "age": 32
  }
}
```

### 2. Génération avec contraintes Swagger

Avec un schéma OpenAPI définissant des contraintes :

```yaml
User:
  type: object
  properties:
    age:
      type: integer
      minimum: 18
      maximum: 65
    email:
      type: string
      format: email
```

Le générateur respectera ces contraintes lors de la génération.

### 3. Génération de tableaux

Squelette avec tableaux vides :

```json
{
  "users": [],
  "tags": []
}
```

Résultat généré :

```json
{
  "users": [
    {"name": "Jean Dupont", "age": 25},
    {"name": "Marie Martin", "age": 34}
  ],
  "tags": ["premium", "standard", "vip"]
}
```

## Développement

### Structure du code

- Interface utilisateur : `src/main.py`
- Génération de données : `src/data_generator.py`
- Parsing Swagger : `src/swagger_parser.py`
- Traitement JSON : `src/json_processor.py`

### Tests

Pour tester l'application :

1. Utilisez les exemples fournis dans `examples/`
2. Créez vos propres squelettes JSON
3. Testez avec différents fichiers Swagger

## Limitations

- Parsing regex limité (quelques patterns courants seulement)
- Reconnaissance des types basée sur des mots-clés français/anglais
- Interface utilisateur basique (Tkinter)

## Feuille de route

### 1. Analyse des besoins et définition des spécifications
- Comprendre le format du squelette JSON fourni par l'utilisateur.
- Étudier le Swagger/OpenAPI pour extraire les types, formats et contraintes des champs.
- Définir les règles d'anonymisation et de cohérence (emails valides, numéros de téléphone, identifiants uniques, etc.).
- Préciser les fonctionnalités de l'interface utilisateur : chargement des fichiers, génération, prévisualisation, sauvegarde.

### 2. Choix technologiques
- **Langage** : Python (simplicité, riche écosystème).
- **Parsing Swagger/OpenAPI** : `openapi-spec-validator`, `openapi-schema-validator`, `jsonschema`.
- **Génération de données** : `faker`.
- **Interface** : **Electron + Node.js** pour une interface moderne et intuitive (design sombre, responsive) avec packaging multiplateforme natif.

### 3. Architecture du programme
- **Back-end Python** : 
  - Module de parsing du squelette JSON.
  - Module d'interprétation Swagger/OpenAPI pour récupérer les contraintes.
  - Module de génération et anonymisation des données (règles métier).
  - Interface CLI pour communication avec Electron.
- **Front-end Electron** :
  - Interface graphique moderne (HTML/CSS/JS).
  - Communication sécurisée avec le back-end Python.
  - Gestion des fichiers et prévisualisation avec coloration syntaxique.
- **Gestion centralisée des erreurs et validation.**

### 4. Implémentation (phases)
1. Parser et valider le squelette JSON.
2. Charger et analyser le Swagger/OpenAPI.
3. Mapper chaque champ du JSON avec son type et ses contraintes.
4. Générer des données anonymisées cohérentes pour chaque champ.
5. Intégrer la génération dans l'interface utilisateur.
6. Tester avec plusieurs exemples de squelettes et spécifications.

### 5. Tests et validation
- Tests unitaires pour chaque module (parsing, génération, interface).
- Tests d'intégration avec des squelettes JSON complexes et contraintes Swagger.
- Validation finale de la conformité aux contraintes et règles métier.

### 6. Documentation et communauté
- Guide d'installation et d'utilisation enrichi.
- Documentation technique détaillant l'architecture et les choix.
- Exemples d'entrée/sortie dans `examples/`.
- Changelog et contribution guidelines pour la communauté GitHub.

> Cette feuille de route est un document vivant et pourra évoluer avec les retours de la communauté.

## Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des améliorations
- Soumettre des pull requests
- Améliorer la documentation 