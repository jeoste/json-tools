const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs-extra');

let mainWindow;

function createWindow() {
  // Créer la fenêtre principale
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // Optionnel
    show: false // Ne pas afficher tant que la page n'est pas prête
  });

  // Charger l'interface utilisateur
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Afficher la fenêtre une fois prête
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Ouvrir les DevTools en mode développement
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// Cette méthode sera appelée quand Electron aura fini de s'initialiser
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // Sur macOS, recréer une fenêtre quand l'icône du dock est cliquée
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quitter quand toutes les fenêtres sont fermées
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Gestionnaires IPC pour la communication avec le renderer

// Ouvrir une boîte de dialogue pour sélectionner un fichier
ipcMain.handle('open-file-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: options.filters || [
      { name: 'Tous les fichiers', extensions: ['*'] }
    ]
  });
  
  return result.canceled ? null : result.filePaths[0];
});

// Ouvrir une boîte de dialogue pour sauvegarder un fichier
ipcMain.handle('save-file-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: options.defaultPath || 'generated_data.json',
    filters: options.filters || [
      { name: 'Fichiers JSON', extensions: ['json'] },
      { name: 'Tous les fichiers', extensions: ['*'] }
    ]
  });
  
  return result.canceled ? null : result.filePath;
});

// Générer les données JSON via le script Python
ipcMain.handle('generate-json', async (event, { skeletonPath, swaggerPath }) => {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(__dirname, '..', 'src', 'cli_generate.py');
    
    // Arguments pour le script Python
    const args = [
      pythonScriptPath,
      '--skeleton', skeletonPath,
      '--pretty'
    ];
    
    if (swaggerPath) {
      args.push('--swagger', swaggerPath);
    }
    
    // Exécuter le script Python
    const pythonProcess = spawn('python', args);
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const jsonData = JSON.parse(output);
          resolve(jsonData);
        } catch (parseError) {
          reject(new Error(`Erreur de parsing JSON: ${parseError.message}`));
        }
      } else {
        reject(new Error(`Erreur Python (code ${code}): ${errorOutput}`));
      }
    });
    
    pythonProcess.on('error', (error) => {
      reject(new Error(`Erreur d'exécution Python: ${error.message}`));
    });
  });
});

// Sauvegarder les données dans un fichier
ipcMain.handle('save-json-file', async (event, { filePath, data }) => {
  try {
    await fs.writeJson(filePath, data, { spaces: 2 });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Lire un fichier JSON pour prévisualisation
ipcMain.handle('read-json-file', async (event, filePath) => {
  try {
    const data = await fs.readJson(filePath);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Gestionnaire pour afficher les messages d'erreur
ipcMain.handle('show-error', async (event, { title, message }) => {
  dialog.showErrorBox(title, message);
});

// Gestionnaire pour afficher les messages d'information
ipcMain.handle('show-info', async (event, { title, message }) => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: title,
    message: message,
    buttons: ['OK']
  });
}); 