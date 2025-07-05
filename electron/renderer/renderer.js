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

// Format states for toggle functionality
let formatStates = {
    'json-preview': 'formatted', // 'formatted' or 'minified'
    'anonymized-preview': 'formatted'
};

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
    updateStatus(`${viewId === 'generate' ? 'Generation' : 'Anonymization'} mode selected`);
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
            updateStatus('File mode selected');
        } else {
            skeletonPath = null;
            skeletonFileInput.value = '';
            updateStatus('Content mode selected');
        }
    } else if (tabId === 'anonymize-file' || tabId === 'anonymize-content') {
        // Update anonymize mode
        currentAnonymizeMode = tabId === 'anonymize-file' ? 'file' : 'content';
        
        // Reset data for the previous mode
        if (currentAnonymizeMode === 'file') {
            anonymizeContent = null;
            anonymizeTextarea.value = '';
            updateStatus('File mode selected');
        } else {
            anonymizeFilePath = null;
            anonymizeFileInput.value = '';
            updateStatus('Content mode selected');
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
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ];
            title = 'Select a JSON skeleton file';
        } else if (type === 'anonymize') {
            filters = [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ];
            title = 'Select a JSON file to anonymize';
        } else {
            filters = [
                { name: 'Swagger Files', extensions: ['yaml', 'yml', 'json'] },
                { name: 'All Files', extensions: ['*'] }
            ];
            title = 'Select a Swagger/OpenAPI file';
        }
        
        const filePath = await window.electronAPI.openFileDialog({ filters, title });
        
        if (filePath) {
            if (type === 'skeleton') {
                skeletonPath = filePath;
                skeletonFileInput.value = getFileName(filePath);
                updateStatus(`Skeleton selected: ${getFileName(filePath)}`);
            } else if (type === 'anonymize') {
                anonymizeFilePath = filePath;
                anonymizeFileInput.value = getFileName(filePath);
                updateStatus(`File to anonymize selected: ${getFileName(filePath)}`);
            } else {
                swaggerPath = filePath;
                swaggerFileInput.value = getFileName(filePath);
                updateStatus(`Swagger selected: ${getFileName(filePath)}`);
            }
            updateUI();
        }
    } catch (error) {
        showError('Selection Error', `Unable to select file: ${error.message}`);
    }
}

// Generate data
async function generateData() {
    // Check if we have skeleton data
    const hasSkeletonData = (currentSkeletonMode === 'file' && skeletonPath) || 
                           (currentSkeletonMode === 'content' && skeletonContent);
    
    if (!hasSkeletonData) {
        showError('Error', 'Please select a JSON skeleton file or paste JSON content.');
        return;
    }
    
    // Validate JSON content if in content mode
    if (currentSkeletonMode === 'content') {
        try {
            JSON.parse(skeletonContent);
        } catch (error) {
            showError('JSON Error', 'The pasted JSON content is not valid.');
            return;
        }
    }
    
    showLoading(true, 'Generating data...');
    
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
            updateStatus('Data generated successfully');
        } else {
            showError('Generation Error', result.error);
        }
    } catch (error) {
        showError('Error', `Error during generation: ${error.message}`);
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
        showError('Error', 'Please select a JSON file or paste JSON content.');
        return;
    }
    
    // Validate JSON content if in content mode
    if (currentAnonymizeMode === 'content') {
        try {
            JSON.parse(anonymizeContent);
        } catch (error) {
            showError('JSON Error', 'The pasted JSON content is not valid.');
            return;
        }
    }
    
    showLoading(true, 'Analyzing data...');
    
    try {
        const requestData = {
            data_path: currentAnonymizeMode === 'file' ? anonymizeFilePath : null,
            data_content: currentAnonymizeMode === 'content' ? anonymizeContent : null
        };
        
        const result = await window.electronAPI.analyzeData(requestData);
        
        if (result.success) {
            sensitiveFieldsAnalysis = result.analysis;
            displayAnalysisResults(sensitiveFieldsAnalysis);
            updateStatus('Analysis completed');
        } else {
            showError('Analysis Error', result.error);
        }
    } catch (error) {
        showError('Error', `Error during analysis: ${error.message}`);
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
        showError('Error', 'Please select a JSON file or paste JSON content.');
        return;
    }
    
    // Validate JSON content if in content mode
    if (currentAnonymizeMode === 'content') {
        try {
            JSON.parse(anonymizeContent);
        } catch (error) {
            showError('JSON Error', 'The pasted JSON content is not valid.');
            return;
        }
    }
    
    showLoading(true, 'Anonymizing data...');
    
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
            updateStatus('Data anonymized successfully');
        } else {
            showError('Anonymization Error', result.error);
        }
    } catch (error) {
        showError('Error', `Error during anonymization: ${error.message}`);
    } finally {
        showLoading(false);
        updateUI();
    }
}

// Save anonymized data
async function saveAnonymizedData() {
    if (!anonymizedData) {
        showError('Error', 'No anonymized data to save.');
        return;
    }
    
    try {
        const filePath = await window.electronAPI.saveFileDialog({
            filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            title: 'Save anonymized data'
        });
        
        if (filePath) {
            const result = await window.electronAPI.saveFile(filePath, JSON.stringify(anonymizedData, null, 2));
            
            if (result.success) {
                updateStatus(`Anonymized data saved: ${getFileName(filePath)}`);
            } else {
                showError('Save Error', result.error);
            }
        }
    } catch (error) {
        showError('Error', `Error during save: ${error.message}`);
    }
}

// Save data
async function saveData() {
    if (!generatedData) {
        showError('Error', 'No data to save.');
        return;
    }
    
    try {
        const filePath = await window.electronAPI.saveFileDialog({
            filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            title: 'Save generated data'
        });
        
        if (filePath) {
            const result = await window.electronAPI.saveFile(filePath, JSON.stringify(generatedData, null, 2));
            
            if (result.success) {
                updateStatus(`Data saved: ${getFileName(filePath)}`);
            } else {
                showError('Save Error', result.error);
            }
        }
    } catch (error) {
        showError('Error', `Error during save: ${error.message}`);
    }
}

// Copy to clipboard
async function copyToClipboard(data) {
    if (!data) {
        showError('Error', 'No data to copy.');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        updateStatus('Data copied to clipboard');
    } catch (error) {
        showError('Error', `Error during copy: ${error.message}`);
    }
}

// Toggle JSON format between formatted and minified
function formatJson(previewId) {
    const preview = document.getElementById(previewId);
    if (!preview) return;
    
    const data = previewId === 'json-preview' ? generatedData : anonymizedData;
    if (!data) return;
    
    try {
        const currentState = formatStates[previewId];
        let jsonString;
        let statusMessage;
        
        if (currentState === 'formatted') {
            // Switch to minified
            jsonString = JSON.stringify(data);
            formatStates[previewId] = 'minified';
            statusMessage = 'JSON minified';
        } else {
            // Switch to formatted
            jsonString = JSON.stringify(data, null, 2);
            formatStates[previewId] = 'formatted';
            statusMessage = 'JSON formatted';
        }
        
        const highlighted = highlightJson(jsonString);
        preview.innerHTML = highlighted;
        updateStatus(statusMessage);
        
        // Update button text to reflect next action
        updateFormatButtonText(previewId);
    } catch (error) {
        showError('Error', `Error during formatting: ${error.message}`);
    }
}

// Update format button text based on current state
function updateFormatButtonText(previewId) {
    const currentState = formatStates[previewId];
    let buttonText;
    let buttonIcon;
    
    if (currentState === 'formatted') {
        buttonText = 'Minify';
        // Icon for minify (compress)
        buttonIcon = '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/><path d="M9 9h6v6H9z"/>';
    } else {
        buttonText = 'Format';
        // Icon for format (expand/beautify)
        buttonIcon = '<path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3"/><path d="M14 2v6h6"/><path d="M10.5 12.5L13 15l-2.5 2.5"/><path d="M7.5 15h5.5"/>';
    }
    
    // Update the appropriate button
    if (previewId === 'json-preview') {
        const formatBtn = document.getElementById('format-btn');
        if (formatBtn) {
            const icon = formatBtn.querySelector('.btn-icon');
            const textNode = formatBtn.lastChild;
            if (icon) icon.innerHTML = buttonIcon;
            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                textNode.textContent = ` ${buttonText}`;
            }
        }
    } else if (previewId === 'anonymized-preview') {
        const formatBtn = document.getElementById('format-anonymized-btn');
        if (formatBtn) {
            const icon = formatBtn.querySelector('.btn-icon');
            const textNode = formatBtn.lastChild;
            if (icon) icon.innerHTML = buttonIcon;
            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                textNode.textContent = ` ${buttonText}`;
            }
        }
    }
}

// Display generated data
function displayGeneratedData(data) {
    const preview = document.getElementById('json-preview');
    if (preview) {
        formatStates['json-preview'] = 'formatted'; // Reset to formatted state
        const highlighted = highlightJson(JSON.stringify(data, null, 2));
        preview.innerHTML = highlighted;
        updateFormatButtonText('json-preview');
    }
}

// Display analysis results
function displayAnalysisResults(analysis) {
    const preview = document.getElementById('anonymized-preview');
    if (preview) {
        let output = "=== SENSITIVE FIELDS ANALYSIS ===\n\n";
        
        if (analysis.sensitive_fields && analysis.sensitive_fields.length > 0) {
            output += "Detected sensitive fields:\n";
            analysis.sensitive_fields.forEach(field => {
                output += `- ${field.path}: ${field.type} (confidence: ${field.confidence})\n`;
            });
        } else {
            output += "No sensitive fields detected.\n";
        }
        
        if (analysis.recommendations && analysis.recommendations.length > 0) {
            output += "\nRecommendations:\n";
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
        formatStates['anonymized-preview'] = 'formatted'; // Reset to formatted state
        const highlighted = highlightJson(JSON.stringify(data, null, 2));
        preview.innerHTML = highlighted;
        updateFormatButtonText('anonymized-preview');
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
function showLoading(show, message = 'Processing...') {
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