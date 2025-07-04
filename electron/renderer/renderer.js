// Variables globales
let skeletonPath = null;
let swaggerPath = null;
let generatedData = null;

// Éléments DOM
const skeletonFileInput = document.getElementById('skeleton-file');
const swaggerFileInput = document.getElementById('swagger-file');
const browseSkeletonBtn = document.getElementById('browse-skeleton');
const browseSwaggerBtn = document.getElementById('browse-swagger');
const generateBtn = document.getElementById('generate-btn');
const saveBtn = document.getElementById('save-btn');
const copyBtn = document.getElementById('copy-btn');
const formatBtn = document.getElementById('format-btn');
const jsonPreview = document.getElementById('json-preview');
const statusText = document.getElementById('status-text');
const loadingIndicator = document.getElementById('loading');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    updateUI();
});

// Gestionnaires d'événements
function initializeEventListeners() {
    // Parcourir les fichiers
    browseSkeletonBtn.addEventListener('click', () => browseFile('skeleton'));
    browseSwaggerBtn.addEventListener('click', () => browseFile('swagger'));
    
    // Actions principales
    generateBtn.addEventListener('click', generateData);
    saveBtn.addEventListener('click', saveData);
    copyBtn.addEventListener('click', copyToClipboard);
    formatBtn.addEventListener('click', formatJson);
    
    // Raccourcis clavier
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Parcourir les fichiers
async function browseFile(type) {
    try {
        let filters;
        let title;
        
        if (type === 'skeleton') {
            filters = [
                { name: 'Fichiers JSON', extensions: ['json'] },
                { name: 'Tous les fichiers', extensions: ['*'] }
            ];
            title = 'Sélectionner le fichier squelette JSON';
        } else {
            filters = [
                { name: 'Fichiers Swagger', extensions: ['yaml', 'yml', 'json'] },
                { name: 'Tous les fichiers', extensions: ['*'] }
            ];
            title = 'Sélectionner le fichier Swagger/OpenAPI';
        }
        
        const filePath = await window.electronAPI.openFileDialog({ filters, title });
        
        if (filePath) {
            if (type === 'skeleton') {
                skeletonPath = filePath;
                skeletonFileInput.value = getFileName(filePath);
                updateStatus(`Squelette sélectionné: ${getFileName(filePath)}`);
            } else {
                swaggerPath = filePath;
                swaggerFileInput.value = getFileName(filePath);
                updateStatus(`Swagger sélectionné: ${getFileName(filePath)}`);
            }
            updateUI();
        }
    } catch (error) {
        showError('Erreur de sélection', `Impossible de sélectionner le fichier: ${error.message}`);
    }
}

// Générer les données
async function generateData() {
    if (!skeletonPath) {
        showError('Erreur', 'Veuillez sélectionner un fichier squelette JSON.');
        return;
    }
    
    try {
        showLoading(true);
        updateStatus('Génération des données en cours...');
        
        // Appel au processus principal pour générer les données
        generatedData = await window.electronAPI.generateJson(skeletonPath, swaggerPath);
        
        // Afficher les données générées
        displayGeneratedData(generatedData);
        
        updateStatus('Données générées avec succès!');
        updateUI();
        
    } catch (error) {
        showError('Erreur de génération', `Impossible de générer les données: ${error.message}`);
        updateStatus('Erreur lors de la génération');
    } finally {
        showLoading(false);
    }
}

// Sauvegarder les données
async function saveData() {
    if (!generatedData) {
        showError('Erreur', 'Aucune donnée à sauvegarder.');
        return;
    }
    
    try {
        const filePath = await window.electronAPI.saveFileDialog({
            defaultPath: 'generated_data.json',
            filters: [
                { name: 'Fichiers JSON', extensions: ['json'] },
                { name: 'Tous les fichiers', extensions: ['*'] }
            ]
        });
        
        if (filePath) {
            const result = await window.electronAPI.saveJsonFile(filePath, generatedData);
            
            if (result.success) {
                await window.electronAPI.showInfo('Succès', `Données sauvegardées dans ${getFileName(filePath)}`);
                updateStatus(`Sauvegardé: ${getFileName(filePath)}`);
            } else {
                showError('Erreur de sauvegarde', result.error);
            }
        }
    } catch (error) {
        showError('Erreur de sauvegarde', `Impossible de sauvegarder: ${error.message}`);
    }
}

// Copier dans le presse-papiers
async function copyToClipboard() {
    if (!generatedData) return;
    
    try {
        const jsonString = JSON.stringify(generatedData, null, 2);
        await navigator.clipboard.writeText(jsonString);
        updateStatus('Données copiées dans le presse-papiers');
        
        // Feedback visuel
        copyBtn.innerHTML = '<span class="icon">✓</span>Copié';
        setTimeout(() => {
            copyBtn.innerHTML = '<span class="icon">📋</span>Copier';
        }, 2000);
    } catch (error) {
        showError('Erreur', 'Impossible de copier dans le presse-papiers');
    }
}

// Formater le JSON
function formatJson() {
    if (!generatedData) return;
    
    try {
        displayGeneratedData(generatedData);
        updateStatus('JSON formaté');
    } catch (error) {
        showError('Erreur', 'Impossible de formater le JSON');
    }
}

// Afficher les données générées avec coloration syntaxique
function displayGeneratedData(data) {
    const jsonString = JSON.stringify(data, null, 2);
    const highlightedJson = highlightJson(jsonString);
    jsonPreview.innerHTML = highlightedJson;
}

// Coloration syntaxique JSON basique
function highlightJson(jsonString) {
    return jsonString
        .replace(/(".*?")(\s*:)/g, '<span class="json-key">$1</span>$2')
        .replace(/:\s*(".*?")/g, ': <span class="json-string">$1</span>')
        .replace(/:\s*(\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
        .replace(/:\s*(true|false)/g, ': <span class="json-boolean">$1</span>')
        .replace(/:\s*(null)/g, ': <span class="json-null">$1</span>');
}

// Mettre à jour l'interface utilisateur
function updateUI() {
    // Activer/désactiver le bouton générer
    generateBtn.disabled = !skeletonPath;
    
    // Activer/désactiver les boutons de prévisualisation
    const hasData = generatedData !== null;
    saveBtn.disabled = !hasData;
    copyBtn.disabled = !hasData;
    formatBtn.disabled = !hasData;
    
    // Afficher l'état vide si pas de données
    if (!hasData) {
        jsonPreview.innerHTML = `
            <div class="empty-state">
                <span class="icon">📄</span>
                <p>Aucune donnée générée</p>
                <p class="empty-state-subtitle">Sélectionnez un fichier squelette et cliquez sur "Générer"</p>
            </div>
        `;
    }
}

// Afficher/masquer l'indicateur de chargement
function showLoading(show) {
    loadingIndicator.style.display = show ? 'flex' : 'none';
    generateBtn.disabled = show || !skeletonPath;
}

// Mettre à jour le statut
function updateStatus(message) {
    statusText.textContent = message;
}

// Afficher une erreur
async function showError(title, message) {
    console.error(`${title}: ${message}`);
    await window.electronAPI.showError(title, message);
}

// Obtenir le nom du fichier depuis le chemin
function getFileName(filePath) {
    return filePath.split(/[\\/]/).pop();
}

// Raccourcis clavier
function handleKeyboardShortcuts(event) {
    // Ctrl+G : Générer
    if (event.ctrlKey && event.key === 'g') {
        event.preventDefault();
        if (!generateBtn.disabled) {
            generateData();
        }
    }
    
    // Ctrl+S : Sauvegarder
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        if (!saveBtn.disabled) {
            saveData();
        }
    }
    
    // Ctrl+C : Copier (quand focus sur la prévisualisation)
    if (event.ctrlKey && event.key === 'c' && document.activeElement === jsonPreview) {
        event.preventDefault();
        if (!copyBtn.disabled) {
            copyToClipboard();
        }
    }
    
    // F5 : Actualiser/Régénérer
    if (event.key === 'F5') {
        event.preventDefault();
        if (!generateBtn.disabled) {
            generateData();
        }
    }
}

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
    console.error('Erreur JavaScript:', event.error);
    showError('Erreur interne', 'Une erreur inattendue s\'est produite. Consultez la console pour plus de détails.');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesse rejetée:', event.reason);
    showError('Erreur interne', 'Une erreur asynchrone s\'est produite.');
}); 