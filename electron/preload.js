const { contextBridge, ipcRenderer } = require('electron');

// Securely expose APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // File management
  openFileDialog: (options) => ipcRenderer.invoke('open-file-dialog', options),
  saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options),
  readJsonFile: (filePath) => ipcRenderer.invoke('read-json-file', filePath),
  saveFile: (filePath, data) => ipcRenderer.invoke('save-file', { filePath, data }),
  
  // Data generation - unified API
  generateData: (requestData) => ipcRenderer.invoke('generate-data', requestData),
  
  // Data generation - legacy API
  generateJson: (skeletonPath, swaggerPath) => ipcRenderer.invoke('generate-json', { skeletonPath, swaggerPath }),
  generateJsonFromContent: (skeletonContent, swaggerPath) => ipcRenderer.invoke('generate-json-from-content', { skeletonContent, swaggerPath }),
  
  // Data anonymization - unified API
  analyzeData: (requestData) => ipcRenderer.invoke('analyze-data', requestData),
  anonymizeData: (requestData) => ipcRenderer.invoke('anonymize-data', requestData),
  
  // Data anonymization - legacy API
  analyzeJson: (filePath) => ipcRenderer.invoke('analyze-json', filePath),
  analyzeJsonFromContent: (content) => ipcRenderer.invoke('analyze-json-from-content', content),
  anonymizeJson: (filePath) => ipcRenderer.invoke('anonymize-json', filePath),
  anonymizeJsonFromContent: (content) => ipcRenderer.invoke('anonymize-json-from-content', content),
  
  // Messages and notifications
  showError: (title, message) => ipcRenderer.invoke('show-error', { title, message }),
  showInfo: (title, message) => ipcRenderer.invoke('show-info', { title, message })
}); 