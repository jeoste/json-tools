const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');
const log = require('electron-log');
const path = require('path'); // Added missing import for path

// Configuration du logger
log.transports.file.level = 'info';
autoUpdater.logger = log;

class UpdateManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.setupAutoUpdater();
  }

  setupAutoUpdater() {
    // Configuration pour GitHub Releases
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'jeoste', // À remplacer par votre username GitHub
      repo: 'JSONymous',
      private: false
    });

    // Configuration pour le développement
    if (process.env.NODE_ENV === 'development') {
      autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml');
      autoUpdater.forceDevUpdateConfig = true;
    }

    // Événements autoUpdater
    autoUpdater.on('checking-for-update', () => {
      log.info('Vérification des mises à jour...');
      this.sendStatusToWindow('Vérification des mises à jour...');
    });

    autoUpdater.on('update-available', (info) => {
      log.info('Mise à jour disponible.');
      this.sendStatusToWindow('Mise à jour disponible');
      this.showUpdateAvailableDialog(info);
    });

    autoUpdater.on('update-not-available', (info) => {
      log.info('Aucune mise à jour disponible.');
      this.sendStatusToWindow('Aucune mise à jour disponible');
      this.showNoUpdateDialog();
    });

    autoUpdater.on('error', (err) => {
      log.error('Erreur lors de la vérification des mises à jour:', err);
      this.sendStatusToWindow('Erreur lors de la vérification des mises à jour');
      this.showUpdateErrorDialog(err);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      let log_message = `Vitesse de téléchargement: ${progressObj.bytesPerSecond}`;
      log_message += ` - Téléchargé ${progressObj.percent}%`;
      log_message += ` (${progressObj.transferred}/${progressObj.total})`;
      
      log.info(log_message);
      this.sendStatusToWindow(log_message);
    });

    autoUpdater.on('update-downloaded', (info) => {
      log.info('Mise à jour téléchargée');
      this.sendStatusToWindow('Mise à jour téléchargée');
      this.showUpdateDownloadedDialog();
    });
  }

  // Méthode pour vérifier les mises à jour manuellement
  checkForUpdates() {
    autoUpdater.checkForUpdatesAndNotify();
  }

  // Méthode pour vérifier les mises à jour silencieusement
  checkForUpdatesAndNotify() {
    autoUpdater.checkForUpdatesAndNotify();
  }

  // Envoyer le statut à la fenêtre principale
  sendStatusToWindow(text) {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send('update-status', text);
    }
  }

  // Dialogue pour mise à jour disponible
  showUpdateAvailableDialog(info) {
    const response = dialog.showMessageBoxSync(this.mainWindow, {
      type: 'info',
      title: 'Mise à jour disponible',
      message: `Une nouvelle version (${info.version}) est disponible.`,
      detail: 'Voulez-vous télécharger et installer la mise à jour maintenant ?',
      buttons: ['Télécharger', 'Plus tard'],
      defaultId: 0,
      cancelId: 1
    });

    if (response === 0) {
      autoUpdater.downloadUpdate();
    }
  }

  // Dialogue pour aucune mise à jour
  showNoUpdateDialog() {
    dialog.showMessageBoxSync(this.mainWindow, {
      type: 'info',
      title: 'Aucune mise à jour',
      message: 'Vous utilisez déjà la dernière version de JSONnymous.',
      buttons: ['OK']
    });
  }

  // Dialogue pour erreur de mise à jour
  showUpdateErrorDialog(error) {
    dialog.showMessageBoxSync(this.mainWindow, {
      type: 'error',
      title: 'Erreur de mise à jour',
      message: 'Une erreur s\'est produite lors de la vérification des mises à jour.',
      detail: error.toString(),
      buttons: ['OK']
    });
  }

  // Dialogue pour mise à jour téléchargée
  showUpdateDownloadedDialog() {
    const response = dialog.showMessageBoxSync(this.mainWindow, {
      type: 'info',
      title: 'Mise à jour prête',
      message: 'La mise à jour a été téléchargée.',
      detail: 'L\'application va redémarrer pour appliquer la mise à jour.',
      buttons: ['Redémarrer maintenant', 'Redémarrer plus tard'],
      defaultId: 0,
      cancelId: 1
    });

    if (response === 0) {
      autoUpdater.quitAndInstall();
    }
  }
}

module.exports = UpdateManager; 