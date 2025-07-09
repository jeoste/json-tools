const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');
const log = require('electron-log');
const path = require('path');

// Configuration du logger
log.transports.file.level = 'info';
autoUpdater.logger = log;

class UpdateManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.isCheckingForUpdates = false;
    this.setupAutoUpdater();
  }

  setupAutoUpdater() {
    // Configuration pour GitHub Releases
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'jeoste',
      repo: 'json-tools', // Nom mis à jour
      private: false
    });

    // Configuration pour le développement
    if (process.env.NODE_ENV === 'development') {
      autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml');
      autoUpdater.forceDevUpdateConfig = true;
    }

    // Événements autoUpdater
    autoUpdater.on('checking-for-update', () => {
      log.info('🔍 Vérification des mises à jour...');
      this.isCheckingForUpdates = true;
      this.sendStatusToWindow('checking', 'Vérification des mises à jour...');
    });

    autoUpdater.on('update-available', (info) => {
      log.info('✅ Mise à jour disponible:', info.version);
      this.isCheckingForUpdates = false;
      this.sendStatusToWindow('available', `Mise à jour disponible: v${info.version}`);
      this.showUpdateAvailableDialog(info);
    });

    autoUpdater.on('update-not-available', (info) => {
      log.info('ℹ️ Aucune mise à jour disponible');
      this.isCheckingForUpdates = false;
      this.sendStatusToWindow('not-available', 'Vous utilisez déjà la dernière version');
      this.showNoUpdateDialog();
    });

    autoUpdater.on('error', (err) => {
      log.error('❌ Erreur lors de la vérification des mises à jour:', err);
      this.isCheckingForUpdates = false;
      this.sendStatusToWindow('error', 'Erreur lors de la vérification des mises à jour');
      this.showUpdateErrorDialog(err);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      const percent = Math.round(progressObj.percent);
      const speed = this.formatBytes(progressObj.bytesPerSecond);
      const transferred = this.formatBytes(progressObj.transferred);
      const total = this.formatBytes(progressObj.total);
      
      const message = `Téléchargement ${percent}% (${transferred}/${total}) - ${speed}/s`;
      log.info(`📥 ${message}`);
      this.sendStatusToWindow('downloading', message, {
        percent,
        transferred: progressObj.transferred,
        total: progressObj.total,
        bytesPerSecond: progressObj.bytesPerSecond
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      log.info('✅ Mise à jour téléchargée');
      this.sendStatusToWindow('downloaded', 'Mise à jour téléchargée et prête à installer');
      this.showUpdateDownloadedDialog();
    });
  }

  // Méthode pour vérifier les mises à jour manuellement (avec dialogue)
  async checkForUpdates(showNoUpdateDialog = true) {
    if (this.isCheckingForUpdates) {
      log.info('⏳ Vérification de mise à jour déjà en cours');
      return;
    }

    try {
      this.showNoUpdateDialog = showNoUpdateDialog;
      await autoUpdater.checkForUpdates();
    } catch (error) {
      log.error('❌ Erreur lors de la vérification manuelle:', error);
      this.isCheckingForUpdates = false;
      this.sendStatusToWindow('error', 'Erreur lors de la vérification des mises à jour');
      if (showNoUpdateDialog) {
        this.showUpdateErrorDialog(error);
      }
    }
  }

  // Méthode pour vérifier les mises à jour silencieusement (au lancement)
  async checkForUpdatesAndNotify() {
    if (this.isCheckingForUpdates) {
      return;
    }

    try {
      this.showNoUpdateDialog = false; // Pas de dialogue si aucune mise à jour
      log.info('🚀 Vérification automatique des mises à jour au lancement');
      await autoUpdater.checkForUpdatesAndNotify();
    } catch (error) {
      log.error('❌ Erreur lors de la vérification automatique:', error);
      this.isCheckingForUpdates = false;
      // Pas de dialogue d'erreur pour les vérifications automatiques
    }
  }

  // Envoyer le statut à la fenêtre principale
  sendStatusToWindow(status, message, extra = {}) {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send('update-status', {
        status,
        message,
        timestamp: new Date().toISOString(),
        ...extra
      });
    }
  }

  // Formater les bytes en format lisible
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Dialogue pour mise à jour disponible
  showUpdateAvailableDialog(info) {
    const response = dialog.showMessageBoxSync(this.mainWindow, {
      type: 'info',
      title: '🆕 Mise à jour disponible',
      message: `Une nouvelle version (${info.version}) est disponible.`,
      detail: info.releaseNotes ? 
        `Voulez-vous télécharger et installer la mise à jour maintenant ?\n\nNouveautés :\n${info.releaseNotes}` :
        'Voulez-vous télécharger et installer la mise à jour maintenant ?',
      buttons: ['Télécharger', 'Plus tard'],
      defaultId: 0,
      cancelId: 1
    });

    if (response === 0) {
      autoUpdater.downloadUpdate();
    }
  }

  // Dialogue pour aucune mise à jour (seulement pour vérifications manuelles)
  showNoUpdateDialog() {
    if (this.showNoUpdateDialog === false) {
      return; // Pas de dialogue pour les vérifications automatiques
    }

    dialog.showMessageBoxSync(this.mainWindow, {
      type: 'info',
      title: '✅ Application à jour',
      message: 'Vous utilisez déjà la dernière version de JSON Tools.',
      buttons: ['OK']
    });
  }

  // Dialogue pour erreur de mise à jour
  showUpdateErrorDialog(error) {
    dialog.showMessageBoxSync(this.mainWindow, {
      type: 'error',
      title: '❌ Erreur de mise à jour',
      message: 'Une erreur s\'est produite lors de la vérification des mises à jour.',
      detail: error.toString(),
      buttons: ['OK']
    });
  }

  // Dialogue pour mise à jour téléchargée
  showUpdateDownloadedDialog() {
    const response = dialog.showMessageBoxSync(this.mainWindow, {
      type: 'info',
      title: '🎉 Mise à jour prête',
      message: 'La mise à jour a été téléchargée avec succès.',
      detail: 'L\'application va redémarrer pour appliquer la mise à jour.',
      buttons: ['Redémarrer maintenant', 'Redémarrer plus tard'],
      defaultId: 0,
      cancelId: 1
    });

    if (response === 0) {
      autoUpdater.quitAndInstall();
    }
  }

  // Forcer l'installation de la mise à jour
  quitAndInstall() {
    autoUpdater.quitAndInstall();
  }
}

module.exports = UpdateManager; 