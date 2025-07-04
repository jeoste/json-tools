const { contextBridge, ipcRenderer } = require('electron');

// Exposer les APIs de manière sécurisée au processus renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Gestion des fichiers
  openFileDialog: (options) => ipcRenderer.invoke('open-file-dialog', options),
  saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options),
  readJsonFile: (filePath) => ipcRenderer.invoke('read-json-file', filePath),
  saveJsonFile: (filePath, data) => ipcRenderer.invoke('save-json-file', { filePath, data }),
  
  // Génération de données
  generateJson: (skeletonPath, swaggerPath) => ipcRenderer.invoke('generate-json', { skeletonPath, swaggerPath }),
  
  // Messages et notifications
  showError: (title, message) => ipcRenderer.invoke('show-error', { title, message }),
  showInfo: (title, message) => ipcRenderer.invoke('show-info', { title, message })
}); 