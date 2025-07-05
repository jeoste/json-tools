# 🚀 Genieration - Générateur de données JSON

> Application desktop moderne pour générer des données de test JSON à partir d'un skeleton et d'un schéma Swagger/OpenAPI.

## 📋 Prérequis

- **Node.js 16.0+** (obligatoire) - [Télécharger ici](https://nodejs.org)
- **Python 3.7+** (obligatoire) - [Télécharger ici](https://python.org)

## 🚀 Installation et lancement

1. **Clonez ou téléchargez** le projet
2. **Ouvrez un terminal** dans le dossier du projet
3. **Installez les dépendances** :
   ```bash
   npm run install
   ```
4. **Lancez l'application** :
   ```bash
   npm start
   ```

## 📖 Utilisation

1. **Sélectionnez un fichier skeleton** (structure JSON de vos données)
2. **Optionnel : Ajoutez un fichier Swagger** (contraintes API)
3. **Cliquez sur "Generate"** pour créer vos données de test
4. **Sauvegardez** le résultat

## 📂 Exemples

Des exemples de fichiers sont disponibles dans le dossier `examples/` :
- `skeleton_example.json` - Structure de base
- `swagger_example.yaml` - Contraintes API
- `user_example.json` - Exemple utilisateur

## 🎯 Fonctionnalités

✅ **Interface moderne** avec Electron  
✅ **Génération de données réalistes** avec Faker  
✅ **Support Swagger/OpenAPI** pour les contraintes  
✅ **Prévisualisation en temps réel**  
✅ **Sauvegarde et copie** des données générées  
✅ **Validation automatique** des données  

## 🔧 Scripts disponibles

```bash
npm start          # Lancer l'application
npm run dev        # Mode développement
npm run build      # Compiler pour distribution
```

## 🆘 Résolution des problèmes

### "Python n'est pas installé"
1. Installez Python depuis https://python.org
2. Cochez "Add Python to PATH" lors de l'installation
3. Redémarrez votre ordinateur

### "npm n'est pas installé"
1. Installez Node.js depuis https://nodejs.org
2. Redémarrez votre ordinateur
3. Relancez l'application

---

**Développé avec ❤️ par l'équipe Genieration** 