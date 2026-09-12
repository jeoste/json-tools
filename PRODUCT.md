# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pas d’audience unique. My Data Toolbox est un couteau suisse public pour :

- des développeurs API qui ont un skeleton JSON/XML ou une spec OpenAPI et doivent produire des payloads de test tout de suite ;
- des personnes qui extraient du JSON/XML de production et doivent l’anonymiser avant de le coller ailleurs ;
- un usage perso / vitrine (jeoste.com) sur les propres schémas de l’auteur.

Aucune de ces situations n’est prioritaire sur les autres.

## Product Purpose

Rendre possible, dans le navigateur et sans installer d’outil, un **seul établi** : générer, anonymiser, valider et interroger du JSON et du XML, y compris à partir d’OpenAPI.

Succès : quelqu’un arrive avec un skeleton, une spec ou un extrait de prod, fait le travail, copie le résultat, et part. Pas de compte, pas de session à reconstruire.

## Positioning

Un établi unique JSON + XML + OpenAPI dans le navigateur, sans installation. Un voisin (Mockoon, json-generator, playground faker.js) couvre souvent un seul de ces gestes, pas l’établi entier.

## Operating Context

- Production : [https://my-data-toolbox.jeoste.com](https://my-data-toolbox.jeoste.com), sous-domaine de jeoste.com, déployé sur Vercel.
- Dev local : `npm run dev` (UI, Vite, port 5173) ; stack complète via `npx vercel dev`.
- Travail typique : coller ou importer un fichier, lancer une action, copier / exporter le résultat.
- Thèmes clair / sombre. Locales actuelles EN, FR, KO (pas confirmé comme langues de première classe à préserver).

## Capabilities and Constraints

Confirmé :

- Génération JSON/XML (skeleton, aléatoire, contraintes OpenAPI), anonymisation JSON, validation JSON/XML, JSONPath (client), XPath (serveur), JSON → spec OpenAPI, spec → skeleton.
- Frontend React 18 + TypeScript + Vite 6. APIs Python serverless Vercel (`faker`, `lxml`, `jsonschema`, …).
- Pas de compte, pas de base utilisateurs : coller, traiter, repartir.
- Le produit est le web. L’app Electron sous `electron/` est une archive, pas un livrable à maintenir.
- Public, licence MIT. Ne pas inventer de claims commerciaux, clients, ou preuves sociales.

Ouvert :

- Les trois locales restent-elles des langues de première classe ?
- Accessibilité : aucun standard produit n’a été fixé.

## Brand Commitments

- Nom d’affichage : **My Data Toolbox** (ex-json-tools).
- Auteur / domaine : jeoste ; URL canonique `my-data-toolbox.jeoste.com`.
- Logo existant dans `src/assets/logo.png` et favicon `public/favicon.png`.

## Evidence on Hand

- App live et repo `jeoste/my-data-toolbox`.
- Exemples dans `examples/`.
- Police Inter auto-hébergée dans `public/fonts/`.
- Specs de migration dans `.kiro/specs/web-migration-and-rebrand/`.
- Mention portfolio jeoste.com (outil OpenAPI / données de test).

À ne pas fabriquer : témoignages, logos clients, benchmarks, pricing, métriques d’usage.

## Product Principles

1. Un établi, pas une suite de produits séparés.
2. Arrive, traite, copie, pars — zéro identité.
3. Le navigateur est le produit ; rien d’installable n’est requis.
4. Dire seulement ce que l’outil fait vraiment ; pas de preuve inventée.
