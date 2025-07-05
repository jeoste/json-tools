// Global variables
let skeletonPath = null;
let skeletonContent = null;
let swaggerPath = null;
let generatedData = null;
let currentSkeletonMode = 'file'; // 'file' or 'content'
let currentMode = 'generate'; // 'generate' or 'anonymize'
let anonymizeFilePath = null;
let anonymizeContent = null;
let currentAnonymizeMode = 'file'; // 'file' or 'content'
let anonymizedData = null;
let sensitiveFieldsAnalysis = null;

// DOM elements
const skeletonFileInput = document.getElementById('skeleton-file');
const skeletonTextarea = document.getElementById('skeleton-textarea');
const swaggerFileInput = document.getElementById('swagger-file');
const browseSkeletonBtn = document.getElementById('browse-skeleton');
const browseSwaggerBtn = document.getElementById('browse-swagger');
const generateBtn = document.getElementById('generate-btn');
const saveBtn = document.getElementById('save-btn');
const copyBtn = document.getElementById('copy-btn');
const formatBtn = document.getElementById('format-btn');
const jsonPreview = document.getElementById('json-preview');
const statusText = document.getElementById('status-text');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText = document.getElementById('loading-text');

// Navigation elements
const navLinks = document.querySelectorAll('.nav-link');
const views = document.querySelectorAll('.view');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Anonymization elements
const anonymizeFileInput = document.getElementById('anonymize-file');
const anonymizeTextarea = document.getElementById('anonymize-textarea');
const browseAnonymizeBtn = document.getElementById('browse-anonymize');
const analyzeBtn = document.getElementById('analyze-btn');
const anonymizeBtn = document.getElementById('anonymize-btn');
const saveAnonymizedBtn = document.getElementById('save-anonymized-btn');
const analyzeFirstCheckbox = document.getElementById('analyze-first');
const anonymizedPreview = document.getElementById('anonymized-preview');
const copyAnonymizedBtn = document.getElementById('copy-anonymized-btn');
const formatAnonymizedBtn = document.getElementById('format-anonymized-btn');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    updateUI();
});

// Event handlers
function initializeEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', () => switchView(link.dataset.view));
    });
    
    // Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Skeleton textarea
    skeletonTextarea.addEventListener('input', () => {
        skeletonContent = skeletonTextarea.value.trim();
        updateUI();
    });
    
    // Anonymize textarea
    anonymizeTextarea.addEventListener('input', () => {
        anonymizeContent = anonymizeTextarea.value.trim();
        updateUI();
    });
    
    // Browse files
    browseSkeletonBtn.addEventListener('click', () => browseFile('skeleton'));
    browseSwaggerBtn.addEventListener('click', () => browseFile('swagger'));
    browseAnonymizeBtn.addEventListener('click', () => browseFile('anonymize'));
    
    // Main actions
    generateBtn.addEventListener('click', generateData);
    saveBtn.addEventListener('click', saveData);
    copyBtn.addEventListener('click', () => copyToClipboard(generatedData));
    formatBtn.addEventListener('click', () => formatJson('json-preview'));
    
    // Anonymization actions
    analyzeBtn.addEventListener('click', analyzeData);
    anonymizeBtn.addEventListener('click', anonymizeData);
    saveAnonymizedBtn.addEventListener('click', saveAnonymizedData);
    copyAnonymizedBtn.addEventListener('click', () => copyToClipboard(anonymizedData));
    formatAnonymizedBtn.addEventListener('click', () => formatJson('anonymized-preview'));
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Switch views (navigation)
function switchView(viewId) {
    // Update active nav link
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.view === viewId);
    });
    
    // Update active view
    views.forEach(view => {
        view.classList.toggle('active', view.id === viewId + '-view');
    });
    
    // Update current mode
    currentMode = viewId;
    updateStatus(`Mode ${viewId === 'generate' ? 'génération' : 'anonymisation'} sélectionné`);
    updateUI();
}

// Switch tabs
function switchTab(tabId) {
    // Find the parent view to scope the tab switching
    const activeView = document.querySelector('.view.active');
    const tabBtnsInView = activeView.querySelectorAll('.tab-btn');
    const tabContentsInView = activeView.querySelectorAll('.tab-content');
    
    // Update active tab
    tabBtnsInView.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    
    // Update active content
    tabContentsInView.forEach(content => {
        content.classList.toggle('active', content.id === tabId + '-content');
    });
    
    // Handle mode switching
    if (tabId === 'skeleton-file' || tabId === 'skeleton-content') {
        // Update skeleton mode
        currentSkeletonMode = tabId === 'skeleton-file' ? 'file' : 'content';
        
        // Reset data for the previous mode
        if (currentSkeletonMode === 'file') {
            skeletonContent = null;
            skeletonTextarea.value = '';
            updateStatus('Mode fichier sélectionné');
        } else {
            skeletonPath = null;
            skeletonFileInput.value = '';
            updateStatus('Mode contenu sélectionné');
        }
    } else if (tabId === 'anonymize-file' || tabId === 'anonymize-content') {
        // Update anonymize mode
        currentAnonymizeMode = tabId === 'anonymize-file' ? 'file' : 'content';
        
        // Reset data for the previous mode
        if (currentAnonymizeMode === 'file') {
            anonymizeContent = null;
            anonymizeTextarea.value = '';
            updateStatus('Mode fichier sélectionné');
        } else {
            anonymizeFilePath = null;
            anonymizeFileInput.value = '';
            updateStatus('Mode contenu sélectionné');
        }
    }
    
    updateUI();
}

// Browse files
async function browseFile(type) {
    try {
        let filters;
        let title;
        
        if (type === 'skeleton') {
            filters = [
                { name: 'Fichiers JSON', extensions: ['json'] },
                { name: 'Tous les fichiers', extensions: ['*'] }
            ];
            title = 'Sélectionner un fichier JSON skeleton';
        } else if (type === 'anonymize') {
            filters = [
                { name: 'Fichiers JSON', extensions: ['json'] },
                { name: 'Tous les fichiers', extensions: ['*'] }
            ];
            title = 'Sélectionner un fichier JSON à anonymiser';
        } else {
            filters = [
                { name: 'Fichiers Swagger', extensions: ['yaml', 'yml', 'json'] },
                { name: 'Tous les fichiers', extensions: ['*'] }
            ];
            title = 'Sélectionner un fichier Swagger/OpenAPI';
        }
        
        const filePath = await window.electronAPI.openFileDialog({ filters, title });
        
        if (filePath) {
            if (type === 'skeleton') {
                skeletonPath = filePath;
                skeletonFileInput.value = getFileName(filePath);
                updateStatus(`Skeleton sélectionné: ${getFileName(filePath)}`);
            } else if (type === 'anonymize') {
                anonymizeFilePath = filePath;
                anonymizeFileInput.value = getFileName(filePath);
                updateStatus(`Fichier à anonymiser sélectionné: ${getFileName(filePath)}`);
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

// Generate data
async function generateData() {
    // Check if we have skeleton data
    const hasSkeletonData = (currentSkeletonMode === 'file' && skeletonPath) || 
                           (currentSkeletonMode === 'content' && skeletonContent);
    
    if (!hasSkeletonData) {
        showError('Erreur', 'Veuillez sélectionner un fichier JSON skeleton ou coller du contenu JSON.');
        return;
    }
    
    // Validate JSON content if in content mode
    if (currentSkeletonMode === 'content') {
        try {
            JSON.parse(skeletonContent);
        } catch (error) {
            showError('Erreur JSON', 'Le contenu JSON collé n\'est pas valide.');
            return;
        }
    }
    
    showLoading(true, 'Génération des données en cours...');
    
    try {
        const requestData = {
            skeleton_path: currentSkeletonMode === 'file' ? skeletonPath : null,
            skeleton_content: currentSkeletonMode === 'content' ? skeletonContent : null,
            swagger_path: swaggerPath || null
        };
        
        const result = await window.electronAPI.generateData(requestData);
        
        if (result.success) {
            generatedData = result.data;
            displayGeneratedData(generatedData);
            updateStatus('Données générées avec succès');
        } else {
            showError('Erreur de génération', result.error);
        }
    } catch (error) {
        showError('Erreur', `Erreur lors de la génération: ${error.message}`);
    } finally {
        showLoading(false);
        updateUI();
    }
}

// Analyze data
async function analyzeData() {
    const hasData = (currentAnonymizeMode === 'file' && anonymizeFilePath) || 
                   (currentAnonymizeMode === 'content' && anonymizeContent);
    
    if (!hasData) {
        showError('Erreur', 'Veuillez sélectionner un fichier JSON ou coller du contenu JSON.');
        return;
    }
    
    // Validate JSON content if in content mode
    if (currentAnonymizeMode === 'content') {
        try {
            JSON.parse(anonymizeContent);
        } catch (error) {
            showError('Erreur JSON', 'Le contenu JSON collé n\'est pas valide.');
            return;
        }
    }
    
    showLoading(true, 'Analyse des données en cours...');
    
    try {
        const requestData = {
            data_path: currentAnonymizeMode === 'file' ? anonymizeFilePath : null,
            data_content: currentAnonymizeMode === 'content' ? anonymizeContent : null
        };
        
        const result = await window.electronAPI.analyzeData(requestData);
        
        if (result.success) {
            sensitiveFieldsAnalysis = result.analysis;
            displayAnalysisResults(sensitiveFieldsAnalysis);
            updateStatus('Analyse terminée');
        } else {
            showError('Erreur d\'analyse', result.error);
        }
    } catch (error) {
        showError('Erreur', `Erreur lors de l'analyse: ${error.message}`);
    } finally {
        showLoading(false);
        updateUI();
    }
}

// Anonymize data
async function anonymizeData() {
    const hasData = (currentAnonymizeMode === 'file' && anonymizeFilePath) || 
                   (currentAnonymizeMode === 'content' && anonymizeContent);
    
    if (!hasData) {
        showError('Erreur', 'Veuillez sélectionner un fichier JSON ou coller du contenu JSON.');
        return;
    }
    
    // Validate JSON content if in content mode
    if (currentAnonymizeMode === 'content') {
        try {
            JSON.parse(anonymizeContent);
        } catch (error) {
            showError('Erreur JSON', 'Le contenu JSON collé n\'est pas valide.');
            return;
        }
    }
    
    showLoading(true, 'Anonymisation des données en cours...');
    
    try {
        const requestData = {
            data_path: currentAnonymizeMode === 'file' ? anonymizeFilePath : null,
            data_content: currentAnonymizeMode === 'content' ? anonymizeContent : null,
            analyze_first: analyzeFirstCheckbox.checked
        };
        
        const result = await window.electronAPI.anonymizeData(requestData);
        
        if (result.success) {
            anonymizedData = result.data;
            displayAnonymizedData(anonymizedData);
            updateStatus('Données anonymisées avec succès');
        } else {
            showError('Erreur d\'anonymisation', result.error);
        }
    } catch (error) {
        showError('Erreur', `Erreur lors de l'anonymisation: ${error.message}`);
    } finally {
        showLoading(false);
        updateUI();
    }
}

// Save anonymized data
async function saveAnonymizedData() {
    if (!anonymizedData) {
        showError('Erreur', 'Aucune donnée anonymisée à sauvegarder.');
        return;
    }
    
    try {
        const filePath = await window.electronAPI.saveFileDialog({
            filters: [
                { name: 'Fichiers JSON', extensions: ['json'] },
                { name: 'Tous les fichiers', extensions: ['*'] }
            ],
            title: 'Sauvegarder les données anonymisées'
        });
        
        if (filePath) {
            const result = await window.electronAPI.saveFile(filePath, JSON.stringify(anonymizedData, null, 2));
            
            if (result.success) {
                updateStatus(`Données anonymisées sauvegardées: ${getFileName(filePath)}`);
            } else {
                showError('Erreur de sauvegarde', result.error);
            }
        }
    } catch (error) {
        showError('Erreur', `Erreur lors de la sauvegarde: ${error.message}`);
    }
}

// Save data
async function saveData() {
    if (!generatedData) {
        showError('Erreur', 'Aucune donnée à sauvegarder.');
        return;
    }
    
    try {
        const filePath = await window.electronAPI.saveFileDialog({
            filters: [
                { name: 'Fichiers JSON', extensions: ['json'] },
                { name: 'Tous les fichiers', extensions: ['*'] }
            ],
            title: 'Sauvegarder les données générées'
        });
        
        if (filePath) {
            const result = await window.electronAPI.saveFile(filePath, JSON.stringify(generatedData, null, 2));
            
            if (result.success) {
                updateStatus(`Données sauvegardées: ${getFileName(filePath)}`);
            } else {
                showError('Erreur de sauvegarde', result.error);
            }
        }
    } catch (error) {
        showError('Erreur', `Erreur lors de la sauvegarde: ${error.message}`);
    }
}

// Copy to clipboard
async function copyToClipboard(data) {
    if (!data) {
        showError('Erreur', 'Aucune donnée à copier.');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        updateStatus('Données copiées dans le presse-papiers');
    } catch (error) {
        showError('Erreur', `Erreur lors de la copie: ${error.message}`);
    }
}

// Format JSON
function formatJson(previewId) {
    const preview = document.getElementById(previewId);
    if (!preview) return;
    
    const data = previewId === 'json-preview' ? generatedData : anonymizedData;
    if (!data) return;
    
    try {
        const formatted = JSON.stringify(data, null, 2);
        const highlighted = highlightJson(formatted);
        preview.innerHTML = highlighted;
        updateStatus('JSON formaté');
    } catch (error) {
        showError('Erreur', `Erreur lors du formatage: ${error.message}`);
    }
}

// Display generated data
function displayGeneratedData(data) {
    const preview = document.getElementById('json-preview');
    if (preview) {
        const highlighted = highlightJson(JSON.stringify(data, null, 2));
        preview.innerHTML = highlighted;
    }
}

// Display analysis results
function displayAnalysisResults(analysis) {
    const preview = document.getElementById('anonymized-preview');
    if (preview) {
        let output = "=== ANALYSE DES CHAMPS SENSIBLES ===\n\n";
        
        if (analysis.sensitive_fields && analysis.sensitive_fields.length > 0) {
            output += "Champs sensibles détectés:\n";
            analysis.sensitive_fields.forEach(field => {
                output += `- ${field.path}: ${field.type} (confiance: ${field.confidence})\n`;
            });
        } else {
            output += "Aucun champ sensible détecté.\n";
        }
        
        if (analysis.recommendations && analysis.recommendations.length > 0) {
            output += "\nRecommandations:\n";
            analysis.recommendations.forEach(rec => {
                output += `- ${rec}\n`;
            });
        }
        
        preview.textContent = output;
    }
}

// Display anonymized data
function displayAnonymizedData(data) {
    const preview = document.getElementById('anonymized-preview');
    if (preview) {
        const highlighted = highlightJson(JSON.stringify(data, null, 2));
        preview.innerHTML = highlighted;
    }
}

// Highlight JSON
function highlightJson(jsonString) {
    return jsonString
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
}

// Update UI
function updateUI() {
    // Generate mode
    if (currentMode === 'generate') {
        const hasSkeletonData = (currentSkeletonMode === 'file' && skeletonPath) || 
                               (currentSkeletonMode === 'content' && skeletonContent);
        
        generateBtn.disabled = !hasSkeletonData;
        saveBtn.disabled = !generatedData;
        copyBtn.disabled = !generatedData;
        formatBtn.disabled = !generatedData;
    }
    
    // Anonymize mode
    if (currentMode === 'anonymize') {
        const hasData = (currentAnonymizeMode === 'file' && anonymizeFilePath) || 
                       (currentAnonymizeMode === 'content' && anonymizeContent);
        
        analyzeBtn.disabled = !hasData;
        anonymizeBtn.disabled = !hasData;
        saveAnonymizedBtn.disabled = !anonymizedData;
        
        if (copyAnonymizedBtn) copyAnonymizedBtn.disabled = !anonymizedData;
        if (formatAnonymizedBtn) formatAnonymizedBtn.disabled = !anonymizedData;
    }
}

// Show loading
function showLoading(show, message = 'Traitement en cours...') {
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
    if (loadingText) {
        loadingText.textContent = message;
    }
}

// Update status
function updateStatus(message) {
    if (statusText) {
        statusText.textContent = message;
    }
}

// Show error
async function showError(title, message) {
    await window.electronAPI.showErrorDialog(title, message);
}

// Get file name
function getFileName(filePath) {
    return filePath.split(/[/\\]/).pop();
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(event) {
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 'g':
                event.preventDefault();
                if (currentMode === 'generate' && !generateBtn.disabled) {
                    generateData();
                }
                break;
            case 's':
                event.preventDefault();
                if (currentMode === 'generate' && !saveBtn.disabled) {
                    saveData();
                } else if (currentMode === 'anonymize' && !saveAnonymizedBtn.disabled) {
                    saveAnonymizedData();
                }
                break;
            case 'c':
                if (event.shiftKey) {
                    event.preventDefault();
                    if (currentMode === 'generate' && generatedData) {
                        copyToClipboard(generatedData);
                    } else if (currentMode === 'anonymize' && anonymizedData) {
                        copyToClipboard(anonymizedData);
                    }
                }
                break;
            case '1':
                event.preventDefault();
                switchView('generate');
                break;
            case '2':
                event.preventDefault();
                switchView('anonymize');
                break;
        }
    }
}

// Global error handling
window.addEventListener('error', (event) => {
    console.error('JavaScript Error:', event.error);
    showError('Internal Error', 'An unexpected error occurred. Check the console for more details.');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    showError('Internal Error', 'An asynchronous error occurred.');
}); 