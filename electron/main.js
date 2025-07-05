const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs-extra');
const os = require('os');

let mainWindow;
let isDev = process.env.NODE_ENV === 'development';
let pythonPath = 'python';

// Détecter si on est en mode développement ou empaquetage
const isPackaged = app.isPackaged;

// Ajout : nom de l'exécutable autonome et fonction utilitaire
const backendExeName = 'backend.exe';
const getBackendPath = () => path.join(process.resourcesPath, backendExeName);

// Chemins pour les ressources
const getResourcePath = (relativePath) => {
  if (isPackaged) {
    return path.join(process.resourcesPath, relativePath);
  } else {
    return path.join(__dirname, '..', relativePath);
  }
};

// Fonction pour vérifier et installer Python si nécessaire
async function checkPythonInstallation() {
  return new Promise((resolve) => {
    // Essayer différentes commandes Python
    const pythonCommands = ['python', 'python3', 'py'];
    
    const tryPython = (index) => {
      if (index >= pythonCommands.length) {
        resolve(false);
        return;
      }
      
      const cmd = pythonCommands[index];
      const pythonProcess = spawn(cmd, ['--version'], { shell: true });
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          pythonPath = cmd;
          resolve(true);
        } else {
          tryPython(index + 1);
        }
      });
      
      pythonProcess.on('error', () => {
        tryPython(index + 1);
      });
    };
    
    tryPython(0);
  });
}

// Fonction pour installer les dépendances Python
async function installPythonDependencies() {
  return new Promise((resolve, reject) => {
    const requirementsPath = getResourcePath('requirements.txt');
    
    if (!fs.existsSync(requirementsPath)) {
      resolve(true); // Pas de requirements.txt, on continue
      return;
    }
    
    const installProcess = spawn(pythonPath, ['-m', 'pip', 'install', '-r', requirementsPath], {
      shell: true,
      stdio: 'pipe'
    });
    
    installProcess.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`Installation des dépendances Python échouée (code ${code})`));
      }
    });
    
    installProcess.on('error', (error) => {
      reject(error);
    });
  });
}

function createWindow() {
  // Create main window
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
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false,
    titleBarStyle: 'default',
    autoHideMenuBar: true // Masquer la barre de menu par défaut
  });

  // Load user interface
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Show window once ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Vérifier Python au démarrage
    checkPythonAndDependencies();
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// Fonction pour vérifier Python et les dépendances
async function checkPythonAndDependencies() {
  // En mode packagé, nous utilisons backend.exe (Python embarqué), donc pas de vérification nécessaire
  if (isPackaged) {
    mainWindow.webContents.send('python-ready');
    return;
  }
  try {
    const pythonInstalled = await checkPythonInstallation();
    
    if (!pythonInstalled) {
      dialog.showErrorBox(
        'Python requis',
        'Python n\'est pas installé sur votre système.\n\nVeuillez installer Python 3.7+ depuis https://python.org\n\nN\'oubliez pas de cocher "Add Python to PATH" lors de l\'installation.'
      );
      app.quit();
      return;
    }
    
    // Installer les dépendances Python
    await installPythonDependencies();
    
    // Notifier que tout est prêt
    mainWindow.webContents.send('python-ready');
    
  } catch (error) {
    dialog.showErrorBox(
      'Erreur d\'initialisation',
      `Impossible d'initialiser Python:\n${error.message}`
    );
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS, recreate a window when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
});

// IPC handlers for communication with renderer

// Open file dialog
ipcMain.handle('open-file-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: options.filters || [
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  return result.canceled ? null : result.filePaths[0];
});

// Open save dialog
ipcMain.handle('save-file-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: options.defaultPath || 'generated_data.json',
    filters: options.filters || [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  return result.canceled ? null : result.filePath;
});

// Generate JSON data via Python script
ipcMain.handle('generate-json', async (event, { skeletonPath, swaggerPath }) => {
  return new Promise((resolve, reject) => {
    let command;
    let args = [];

    if (isPackaged) {
      // Utilise l'exécutable autonome embarqué
      command = getBackendPath();
      args = ['--skeleton', skeletonPath, '--pretty'];
      if (swaggerPath) {
        args.push('--swagger', swaggerPath);
      }
    } else {
      // En développement : appelle l'interpréteur Python avec le script CLI
      const pythonScriptPath = getResourcePath('src/cli_generate.py');
      if (!fs.existsSync(pythonScriptPath)) {
        reject(new Error('Script Python introuvable'));
        return;
      }
      command = pythonPath;
      args = [pythonScriptPath, '--skeleton', skeletonPath, '--pretty'];
      if (swaggerPath) {
        args.push('--swagger', swaggerPath);
      }
    }

    const child = spawn(command, args, { shell: true });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        try {
          const jsonData = JSON.parse(output);
          resolve(jsonData);
        } catch (parseError) {
          reject(new Error(`Erreur de parsing JSON: ${parseError.message}`));
        }
      } else {
        reject(new Error(`Erreur backend (code ${code}): ${errorOutput}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Erreur d'exécution backend: ${error.message}`));
    });
  });
});

// Generate JSON data from content via Python script
ipcMain.handle('generate-json-from-content', async (event, { skeletonContent, swaggerPath }) => {
  return new Promise(async (resolve, reject) => {
    let tempFile = null;
    
    try {
      // Create temporary file with the JSON content
      const tempDir = os.tmpdir();
      tempFile = path.join(tempDir, `skeleton_${Date.now()}.json`);
      
      // Validate JSON content
      JSON.parse(skeletonContent);
      
      // Write content to temporary file
      await fs.writeFile(tempFile, skeletonContent, 'utf8');
      
      let command;
      let args = [];

      if (isPackaged) {
        // Utilise l'exécutable autonome embarqué
        command = getBackendPath();
        args = ['--skeleton', tempFile, '--pretty'];
        if (swaggerPath) {
          args.push('--swagger', swaggerPath);
        }
      } else {
        // En développement : appelle l'interpréteur Python avec le script CLI
        const pythonScriptPath = getResourcePath('src/cli_generate.py');
        if (!fs.existsSync(pythonScriptPath)) {
          reject(new Error('Script Python introuvable'));
          return;
        }
        command = pythonPath;
        args = [pythonScriptPath, '--skeleton', tempFile, '--pretty'];
        if (swaggerPath) {
          args.push('--swagger', swaggerPath);
        }
      }

      const child = spawn(command, args, { shell: true });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        // Clean up temp file
        if (tempFile && fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
        
        if (code === 0) {
          try {
            const jsonData = JSON.parse(output);
            resolve(jsonData);
          } catch (parseError) {
            reject(new Error(`Erreur de parsing JSON: ${parseError.message}`));
          }
        } else {
          reject(new Error(`Erreur backend (code ${code}): ${errorOutput}`));
        }
      });

      child.on('error', (error) => {
        // Clean up temp file
        if (tempFile && fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
        reject(new Error(`Erreur d'exécution backend: ${error.message}`));
      });
      
    } catch (error) {
      // Clean up temp file on error
      if (tempFile && fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      reject(new Error(`Erreur de préparation: ${error.message}`));
    }
  });
});

// Save data to file
ipcMain.handle('save-json-file', async (event, { filePath, data }) => {
  try {
    await fs.writeJson(filePath, data, { spaces: 2 });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Read JSON file for preview
ipcMain.handle('read-json-file', async (event, filePath) => {
  try {
    const data = await fs.readJson(filePath);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get example files
ipcMain.handle('get-examples', async () => {
  try {
    const examplesPath = getResourcePath('examples');
    
    if (!fs.existsSync(examplesPath)) {
      return { success: false, error: 'Dossier examples introuvable' };
    }
    
    const files = await fs.readdir(examplesPath);
    const examples = files
      .filter(file => file.endsWith('.json') || file.endsWith('.yaml') || file.endsWith('.yml'))
      .map(file => ({
        name: file,
        path: path.join(examplesPath, file)
      }));
    
    return { success: true, examples };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handler for error messages
ipcMain.handle('show-error', async (event, { title, message }) => {
  dialog.showErrorBox(title, message);
});

// Handler for information messages
ipcMain.handle('show-info', async (event, { title, message }) => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: title,
    message: message,
    buttons: ['OK']
  });
});

// Open external link
ipcMain.handle('open-external', async (event, url) => {
  shell.openExternal(url);
});

// Analyze JSON data for sensitive fields
ipcMain.handle('analyze-json', async (event, filePath) => {
  return new Promise((resolve, reject) => {
    let command;
    let args = [];

    if (isPackaged) {
      // Utilise l'exécutable autonome embarqué
      command = getBackendPath();
      args = ['--analyze', filePath, '--pretty'];
    } else {
      // En développement : appelle l'interpréteur Python avec le script CLI
      const pythonScriptPath = getResourcePath('src/cli_generate.py');
      if (!fs.existsSync(pythonScriptPath)) {
        reject(new Error('Script Python introuvable'));
        return;
      }
      command = pythonPath;
      args = [pythonScriptPath, '--analyze', filePath, '--pretty'];
    }

    const child = spawn(command, args, { shell: true });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        try {
          const analysisData = JSON.parse(output);
          resolve(analysisData);
        } catch (parseError) {
          reject(new Error(`Erreur de parsing JSON: ${parseError.message}`));
        }
      } else {
        reject(new Error(`Erreur backend (code ${code}): ${errorOutput}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Erreur d'exécution backend: ${error.message}`));
    });
  });
});

// Analyze JSON data from content for sensitive fields
ipcMain.handle('analyze-json-from-content', async (event, content) => {
  return new Promise(async (resolve, reject) => {
    let tempFile = null;
    
    try {
      // Create temporary file with the JSON content
      const tempDir = os.tmpdir();
      tempFile = path.join(tempDir, `analyze_${Date.now()}.json`);
      
      // Validate JSON content
      JSON.parse(content);
      
      // Write content to temporary file
      await fs.writeFile(tempFile, content, 'utf8');
      
      let command;
      let args = [];

      if (isPackaged) {
        // Utilise l'exécutable autonome embarqué
        command = getBackendPath();
        args = ['--analyze', tempFile, '--pretty'];
      } else {
        // En développement : appelle l'interpréteur Python avec le script CLI
        const pythonScriptPath = getResourcePath('src/cli_generate.py');
        if (!fs.existsSync(pythonScriptPath)) {
          reject(new Error('Script Python introuvable'));
          return;
        }
        command = pythonPath;
        args = [pythonScriptPath, '--analyze', tempFile, '--pretty'];
      }

      const child = spawn(command, args, { shell: true });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        // Clean up temp file
        if (tempFile && fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
        
        if (code === 0) {
          try {
            const analysisData = JSON.parse(output);
            resolve(analysisData);
          } catch (parseError) {
            reject(new Error(`Erreur de parsing JSON: ${parseError.message}`));
          }
        } else {
          reject(new Error(`Erreur backend (code ${code}): ${errorOutput}`));
        }
      });

      child.on('error', (error) => {
        // Clean up temp file
        if (tempFile && fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
        reject(new Error(`Erreur d'exécution backend: ${error.message}`));
      });
      
    } catch (error) {
      // Clean up temp file on error
      if (tempFile && fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      reject(new Error(`Erreur de préparation: ${error.message}`));
    }
  });
});

// Anonymize JSON data
ipcMain.handle('anonymize-json', async (event, filePath) => {
  return new Promise((resolve, reject) => {
    let command;
    let args = [];

    if (isPackaged) {
      // Utilise l'exécutable autonome embarqué
      command = getBackendPath();
      args = ['--anonymize', filePath, '--pretty'];
    } else {
      // En développement : appelle l'interpréteur Python avec le script CLI
      const pythonScriptPath = getResourcePath('src/cli_generate.py');
      if (!fs.existsSync(pythonScriptPath)) {
        reject(new Error('Script Python introuvable'));
        return;
      }
      command = pythonPath;
      args = [pythonScriptPath, '--anonymize', filePath, '--pretty'];
    }

    const child = spawn(command, args, { shell: true });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        try {
          const anonymizedData = JSON.parse(output);
          resolve(anonymizedData);
        } catch (parseError) {
          reject(new Error(`Erreur de parsing JSON: ${parseError.message}`));
        }
      } else {
        reject(new Error(`Erreur backend (code ${code}): ${errorOutput}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Erreur d'exécution backend: ${error.message}`));
    });
  });
});

// Anonymize JSON data from content
ipcMain.handle('anonymize-json-from-content', async (event, content) => {
  return new Promise(async (resolve, reject) => {
    let tempFile = null;
    
    try {
      // Create temporary file with the JSON content
      const tempDir = os.tmpdir();
      tempFile = path.join(tempDir, `anonymize_${Date.now()}.json`);
      
      // Validate JSON content
      JSON.parse(content);
      
      // Write content to temporary file
      await fs.writeFile(tempFile, content, 'utf8');
      
      let command;
      let args = [];

      if (isPackaged) {
        // Utilise l'exécutable autonome embarqué
        command = getBackendPath();
        args = ['--anonymize', tempFile, '--pretty'];
      } else {
        // En développement : appelle l'interpréteur Python avec le script CLI
        const pythonScriptPath = getResourcePath('src/cli_generate.py');
        if (!fs.existsSync(pythonScriptPath)) {
          reject(new Error('Script Python introuvable'));
          return;
        }
        command = pythonPath;
        args = [pythonScriptPath, '--anonymize', tempFile, '--pretty'];
      }

      const child = spawn(command, args, { shell: true });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        // Clean up temp file
        if (tempFile && fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
        
        if (code === 0) {
          try {
            const anonymizedData = JSON.parse(output);
            resolve(anonymizedData);
          } catch (parseError) {
            reject(new Error(`Erreur de parsing JSON: ${parseError.message}`));
          }
        } else {
          reject(new Error(`Erreur backend (code ${code}): ${errorOutput}`));
        }
      });

      child.on('error', (error) => {
        // Clean up temp file
        if (tempFile && fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
        reject(new Error(`Erreur d'exécution backend: ${error.message}`));
      });
      
    } catch (error) {
      // Clean up temp file on error
      if (tempFile && fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      reject(new Error(`Erreur de préparation: ${error.message}`));
    }
  });
});

// Unified handler for data generation
ipcMain.handle('generate-data', async (event, requestData) => {
  try {
    const { skeleton_path, skeleton_content, swagger_path } = requestData;
    
    let result;
    if (skeleton_path) {
      // Use file-based generation
      result = await new Promise((resolve, reject) => {
        let command;
        let args = [];

        if (isPackaged) {
          command = getBackendPath();
          args = ['--skeleton', skeleton_path, '--pretty'];
          if (swagger_path) {
            args.push('--swagger', swagger_path);
          }
        } else {
          const pythonScriptPath = getResourcePath('src/cli_generate.py');
          if (!fs.existsSync(pythonScriptPath)) {
            reject(new Error('Script Python introuvable'));
            return;
          }
          command = pythonPath;
          args = [pythonScriptPath, '--skeleton', skeleton_path, '--pretty'];
          if (swagger_path) {
            args.push('--swagger', swagger_path);
          }
        }

        const child = spawn(command, args, { shell: true });

        let output = '';
        let errorOutput = '';

        child.stdout.on('data', (data) => {
          output += data.toString();
        });

        child.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        child.on('close', (code) => {
          if (code === 0) {
            try {
              const jsonData = JSON.parse(output);
              resolve(jsonData);
            } catch (parseError) {
              reject(new Error(`Erreur de parsing JSON: ${parseError.message}`));
            }
          } else {
            reject(new Error(`Erreur backend (code ${code}): ${errorOutput}`));
          }
        });

        child.on('error', (error) => {
          reject(new Error(`Erreur d'exécution backend: ${error.message}`));
        });
      });
    } else if (skeleton_content) {
      // Use content-based generation
      result = await new Promise(async (resolve, reject) => {
        let tempFile = null;
        
        try {
          const tempDir = os.tmpdir();
          tempFile = path.join(tempDir, `skeleton_${Date.now()}.json`);
          
          JSON.parse(skeleton_content);
          await fs.writeFile(tempFile, skeleton_content, 'utf8');
          
          let command;
          let args = [];

          if (isPackaged) {
            command = getBackendPath();
            args = ['--skeleton', tempFile, '--pretty'];
            if (swagger_path) {
              args.push('--swagger', swagger_path);
            }
          } else {
            const pythonScriptPath = getResourcePath('src/cli_generate.py');
            if (!fs.existsSync(pythonScriptPath)) {
              reject(new Error('Script Python introuvable'));
              return;
            }
            command = pythonPath;
            args = [pythonScriptPath, '--skeleton', tempFile, '--pretty'];
            if (swagger_path) {
              args.push('--swagger', swagger_path);
            }
          }

          const child = spawn(command, args, { shell: true });

          let output = '';
          let errorOutput = '';

          child.stdout.on('data', (data) => {
            output += data.toString();
          });

          child.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });

          child.on('close', (code) => {
            if (tempFile && fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile);
            }
            
            if (code === 0) {
              try {
                const jsonData = JSON.parse(output);
                resolve(jsonData);
              } catch (parseError) {
                reject(new Error(`Erreur de parsing JSON: ${parseError.message}`));
              }
            } else {
              reject(new Error(`Erreur backend (code ${code}): ${errorOutput}`));
            }
          });

          child.on('error', (error) => {
            if (tempFile && fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile);
            }
            reject(new Error(`Erreur d'exécution backend: ${error.message}`));
          });
          
        } catch (error) {
          if (tempFile && fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
          reject(new Error(`Erreur de préparation: ${error.message}`));
        }
      });
    } else {
      throw new Error('Aucune donnée skeleton fournie');
    }
    
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Unified handler for data analysis
ipcMain.handle('analyze-data', async (event, requestData) => {
  try {
    const { data_path, data_content } = requestData;
    
    let result;
    if (data_path) {
      // Use file-based analysis - call the existing analyze-json handler logic
      result = await new Promise((resolve, reject) => {
        let command;
        let args = [];

        if (isPackaged) {
          command = getBackendPath();
          args = ['--analyze', data_path, '--pretty'];
        } else {
          const pythonScriptPath = getResourcePath('src/cli_generate.py');
          if (!fs.existsSync(pythonScriptPath)) {
            reject(new Error('Script Python introuvable'));
            return;
          }
          command = pythonPath;
          args = [pythonScriptPath, '--analyze', data_path, '--pretty'];
        }

        const child = spawn(command, args, { shell: true });

        let output = '';
        let errorOutput = '';

        child.stdout.on('data', (data) => {
          output += data.toString();
        });

        child.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        child.on('close', (code) => {
          if (code === 0) {
            try {
              const analysisData = JSON.parse(output);
              resolve(analysisData);
            } catch (parseError) {
              reject(new Error(`Erreur de parsing JSON: ${parseError.message}`));
            }
          } else {
            reject(new Error(`Erreur backend (code ${code}): ${errorOutput}`));
          }
        });

        child.on('error', (error) => {
          reject(new Error(`Erreur d'exécution backend: ${error.message}`));
        });
      });
    } else if (data_content) {
      // Use content-based analysis
      result = await new Promise(async (resolve, reject) => {
        let tempFile = null;
        
        try {
          const tempDir = os.tmpdir();
          tempFile = path.join(tempDir, `analyze_${Date.now()}.json`);
          
          JSON.parse(data_content);
          await fs.writeFile(tempFile, data_content, 'utf8');
          
          let command;
          let args = [];

          if (isPackaged) {
            command = getBackendPath();
            args = ['--analyze', tempFile, '--pretty'];
          } else {
            const pythonScriptPath = getResourcePath('src/cli_generate.py');
            if (!fs.existsSync(pythonScriptPath)) {
              reject(new Error('Script Python introuvable'));
              return;
            }
            command = pythonPath;
            args = [pythonScriptPath, '--analyze', tempFile, '--pretty'];
          }

          const child = spawn(command, args, { shell: true });

          let output = '';
          let errorOutput = '';

          child.stdout.on('data', (data) => {
            output += data.toString();
          });

          child.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });

          child.on('close', (code) => {
            if (tempFile && fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile);
            }
            
            if (code === 0) {
              try {
                const analysisData = JSON.parse(output);
                resolve(analysisData);
              } catch (parseError) {
                reject(new Error(`Erreur de parsing JSON: ${parseError.message}`));
              }
            } else {
              reject(new Error(`Erreur backend (code ${code}): ${errorOutput}`));
            }
          });

          child.on('error', (error) => {
            if (tempFile && fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile);
            }
            reject(new Error(`Erreur d'exécution backend: ${error.message}`));
          });
          
        } catch (error) {
          if (tempFile && fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
          reject(new Error(`Erreur de préparation: ${error.message}`));
        }
      });
    } else {
      throw new Error('Aucune donnée fournie pour l\'analyse');
    }
    
    return { success: true, analysis: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Unified handler for data anonymization
ipcMain.handle('anonymize-data', async (event, requestData) => {
  try {
    const { data_path, data_content, analyze_first } = requestData;
    
    let result;
    if (data_path) {
      // Use file-based anonymization
      result = await new Promise((resolve, reject) => {
        let command;
        let args = [];

        if (isPackaged) {
          command = getBackendPath();
          args = ['--anonymize', data_path, '--pretty'];
        } else {
          const pythonScriptPath = getResourcePath('src/cli_generate.py');
          if (!fs.existsSync(pythonScriptPath)) {
            reject(new Error('Script Python introuvable'));
            return;
          }
          command = pythonPath;
          args = [pythonScriptPath, '--anonymize', data_path, '--pretty'];
        }

        const child = spawn(command, args, { shell: true });

        let output = '';
        let errorOutput = '';

        child.stdout.on('data', (data) => {
          output += data.toString();
        });

        child.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        child.on('close', (code) => {
          if (code === 0) {
            try {
              const anonymizedData = JSON.parse(output);
              resolve(anonymizedData);
            } catch (parseError) {
              reject(new Error(`Erreur de parsing JSON: ${parseError.message}`));
            }
          } else {
            reject(new Error(`Erreur backend (code ${code}): ${errorOutput}`));
          }
        });

        child.on('error', (error) => {
          reject(new Error(`Erreur d'exécution backend: ${error.message}`));
        });
      });
    } else if (data_content) {
      // Use content-based anonymization
      result = await new Promise(async (resolve, reject) => {
        let tempFile = null;
        
        try {
          const tempDir = os.tmpdir();
          tempFile = path.join(tempDir, `anonymize_${Date.now()}.json`);
          
          JSON.parse(data_content);
          await fs.writeFile(tempFile, data_content, 'utf8');
          
          let command;
          let args = [];

          if (isPackaged) {
            command = getBackendPath();
            args = ['--anonymize', tempFile, '--pretty'];
          } else {
            const pythonScriptPath = getResourcePath('src/cli_generate.py');
            if (!fs.existsSync(pythonScriptPath)) {
              reject(new Error('Script Python introuvable'));
              return;
            }
            command = pythonPath;
            args = [pythonScriptPath, '--anonymize', tempFile, '--pretty'];
          }

          const child = spawn(command, args, { shell: true });

          let output = '';
          let errorOutput = '';

          child.stdout.on('data', (data) => {
            output += data.toString();
          });

          child.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });

          child.on('close', (code) => {
            if (tempFile && fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile);
            }
            
            if (code === 0) {
              try {
                const anonymizedData = JSON.parse(output);
                resolve(anonymizedData);
              } catch (parseError) {
                reject(new Error(`Erreur de parsing JSON: ${parseError.message}`));
              }
            } else {
              reject(new Error(`Erreur backend (code ${code}): ${errorOutput}`));
            }
          });

          child.on('error', (error) => {
            if (tempFile && fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile);
            }
            reject(new Error(`Erreur d'exécution backend: ${error.message}`));
          });
          
        } catch (error) {
          if (tempFile && fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
          reject(new Error(`Erreur de préparation: ${error.message}`));
        }
      });
    } else {
      throw new Error('Aucune donnée fournie pour l\'anonymisation');
    }
    
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Unified handler for file saving
ipcMain.handle('save-file', async (event, { filePath, data }) => {
  try {
    await fs.writeFile(filePath, data, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});