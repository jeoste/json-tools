# Plan de développement JSONnymous

## Fonctionnalités à venir

### 1. Gestion du compte (Desktop & Web)
- [ ] Ajouter une authentification unifiée (JWT OAuth2) pour l'application web et de bureau.
- [ ] Implémenter la synchronisation des préférences/utilisateurs via une API (inspiration Solidtime.io).
- [ ] UI : Formulaire de connexion/inscription et affichage du profil dans le panneau "Account".

### 2. Section About
- [x] Créer le panneau "About" dans l'app de bureau.
- [ ] Récupérer dynamiquement la version depuis `package.json`.
- [ ] Implémenter la vérification des mises à jour (auto-update Electron).
- [ ] Ajouter des infos légales (licence, politique de confidentialité).

### 3. Updates & Distribution
- [ ] Mettre en place un serveur de mise à jour (GitHub Releases ou Squirrel.Windows/auto-update).
- [ ] Processus CI/CD pour builder et publier automatiquement les versions.

### 4. Synchronisation bidirectionnelle Web ↔ Desktop
- [ ] Couche de données unifiée (IndexedDB pour le web, SQLite pour le desktop) ; créer un module d'abstraction capable de stocker localement et de journaliser les changements.
- [ ] Spécifier un schéma de données partagé (settings, projets, historiques) et versionné.
- [ ] Implémenter l'API RESTful de synchronisation :
  - [ ] `POST /api/sync/push` : envoyer les changements locaux.
  - [ ] `GET /api/sync/pull` : récupérer les changements serveur.
  - [ ] `GET /api/sync/changes` : stream SSE des mises à jour.
- [ ] Mettre en place un canal WebSocket dédié pour la diffusion en temps réel des mises à jour critiques.
- [ ] Support "offline-first" pour la PWA : Service Worker + Background Sync afin de synchroniser les actions différées.
- [ ] Stratégie de résolution de conflits :
  - [ ] Last-write-wins pour les cas simples.
  - [ ] Versioning par timestamp + fusion automatique, avec intervention manuelle si nécessaire.
- [ ] File de priorités (high / medium / low) pour optimiser la bande passante et l'ordre d'envoi.
- [ ] Sécurité :
  - [ ] Chiffrement TLS sur toutes les communications.
  - [ ] Authentification via JWT expirables (+ refresh tokens).
  - [ ] Validation & sanitisation côté serveur.
- [ ] Monitoring & observabilité :
  - [ ] Métriques de latence, conflits, taux de réussite.
  - [ ] Logging détaillé des erreurs de synchronisation.
- [ ] Suite de tests automatisés E2E couvrant scénarios online/offline, multi-client et résolution de conflits.

### 5. Tests & QA
- [ ] Tests end-to-end pour la synchronisation.
- [ ] Scénarios de mise à jour automatique.

### 6. Internationalisation (i18n)
- [ ] Langue par défaut : anglais.
- [ ] Ajouter la prise en charge du français (UI, documentation).
- [ ] Ajouter la prise en charge du coréen (UI, documentation).
- [ ] Détecter automatiquement la langue du système et prévoir un sélecteur manuel dans l'application.

### 7. Thème (Clair / Sombre / Système)
- [ ] Implémenter un sélecteur de thème avec trois options : Clair, Sombre, Système.
- [ ] Utiliser `prefers-color-scheme` pour détecter la préférence de l'OS quand « Système » est sélectionné.
- [ ] Persister le choix de l'utilisateur (localStorage / store).
- [ ] Mettre à jour dynamiquement les variables CSS à partir de `globals.css`.
- [ ] Vérifier l'accessibilité (contraste suffisant) pour chaque thème.

---
_Màj : {{DATE}}_ 