#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Script de création de release pour JSONnymous JSON Generator

.DESCRIPTION
    Ce script automatise la création d'une nouvelle release :
    - Met à jour la version dans package.json
    - Crée un tag Git
    - Pousse vers GitHub pour déclencher le workflow de release

.PARAMETER Version
    Version à publier (ex: 1.0.0, 1.2.3)

.PARAMETER Push
    Pousse automatiquement vers GitHub

.EXAMPLE
    .\scripts\release.ps1 -Version "1.0.0" -Push
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$Version,
    
    [Parameter(Mandatory = $false)]
    [switch]$Push
)

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Error "❌ Ce script doit être exécuté depuis la racine du projet"
    exit 1
}

# Valider le format de version
if ($Version -notmatch '^\d+\.\d+\.\d+$') {
    Write-Error "❌ Format de version invalide. Utilisez le format x.y.z (ex: 1.0.0)"
    exit 1
}

$TagName = "v$Version"

Write-Host "🚀 Création de la release $TagName" -ForegroundColor Green

# Vérifier l'état de Git
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Warning "⚠️  Il y a des modifications non commitées :"
    git status --short
    $response = Read-Host "Voulez-vous continuer ? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "❌ Release annulée"
        exit 1
    }
}

# Mettre à jour la version dans package.json
Write-Host "📝 Mise à jour de la version dans package.json..."
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$packageJson.version = $Version
$packageJson | ConvertTo-Json -Depth 100 | Set-Content "package.json"

# Mettre à jour la version dans electron/package.json
Write-Host "📝 Mise à jour de la version dans electron/package.json..."
$electronPackageJson = Get-Content "electron/package.json" -Raw | ConvertFrom-Json
$electronPackageJson.version = $Version
$electronPackageJson | ConvertTo-Json -Depth 100 | Set-Content "electron/package.json"

# Créer un commit pour la version
Write-Host "📝 Création du commit de version..."
git add package.json electron/package.json
git commit -m "chore: bump version to $Version"

# Créer le tag
Write-Host "🏷️  Création du tag $TagName..."
git tag -a $TagName -m "Release $TagName"

# Afficher les informations
Write-Host "`n✅ Release préparée avec succès !" -ForegroundColor Green
Write-Host "📋 Informations de la release :" -ForegroundColor Cyan
Write-Host "   Version: $Version"
Write-Host "   Tag: $TagName"
Write-Host "   Commit: $(git rev-parse HEAD)"

if ($Push) {
    Write-Host "`n🚀 Envoi vers GitHub..." -ForegroundColor Yellow
    git push origin
    git push origin $TagName
    
    Write-Host "`n✅ Release envoyée vers GitHub !" -ForegroundColor Green
    Write-Host "🔗 Consultez l'avancement sur : https://github.com/$(git config --get remote.origin.url | Select-String -Pattern '([^/]+/[^/]+)\.git$' | ForEach-Object { $_.Matches[0].Groups[1].Value })/actions"
} else {
    Write-Host "`n📋 Prochaines étapes :" -ForegroundColor Yellow
    Write-Host "   1. Vérifiez les modifications avec : git log --oneline -5"
    Write-Host "   2. Poussez vers GitHub avec : git push origin && git push origin $TagName"
    Write-Host "   3. Le workflow GitHub Actions se déclenchera automatiquement"
}

Write-Host "`n🎉 Release $TagName prête !" -ForegroundColor Green 