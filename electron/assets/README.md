# Icônes de l'application

## Fichiers requis

Pour que l'application fonctionne correctement, vous devez placer les icônes suivantes dans ce dossier :

- **icon.png** (512x512 pixels) - Icône principale pour Linux et preview
- **icon.ico** (formats multiples) - Icône pour Windows
- **icon.icns** (formats multiples) - Icône pour macOS

## Génération des icônes

Si vous avez une icône PNG de base (512x512), vous pouvez utiliser des outils en ligne pour convertir :

### Pour Windows (.ico)
- Utilisez https://convertico.com/
- Incluez les tailles : 16x16, 32x32, 48x48, 64x64, 128x128, 256x256

### Pour macOS (.icns)
- Utilisez https://cloudconvert.com/png-to-icns
- Ou l'outil `iconutil` sur macOS

### Dimensions recommandées

- **PNG** : 512x512 pixels minimum
- **ICO** : Multi-tailles (16, 32, 48, 64, 128, 256)
- **ICNS** : Multi-tailles (16, 32, 64, 128, 256, 512)

## Icônes par défaut

Si aucune icône n'est fournie, Electron utilisera l'icône par défaut du système.

## Conseils de design

- Utilisez un design simple et reconnaissable
- Évitez les détails trop fins qui disparaissent en petite taille
- Testez l'icône sur différents fonds (clair/foncé)
- Respectez les guidelines de chaque plateforme 