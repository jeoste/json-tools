import { useState, useEffect, useCallback } from 'react';

export interface UpdateStatus {
  status: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  message: string;
  timestamp?: string;
  percent?: number;
  transferred?: number;
  total?: number;
  bytesPerSecond?: number;
}

export function useUpdater() {
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
    status: 'idle',
    message: ''
  });
  const [appVersion, setAppVersion] = useState<string>('');

  useEffect(() => {
    // Récupérer la version de l'application au démarrage
    const getAppVersion = async () => {
      try {
        if (window.electronAPI?.getAppVersion) {
          const version = await window.electronAPI.getAppVersion();
          setAppVersion(version);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la version:', error);
      }
    };

    getAppVersion();

    // Écouter les événements de mise à jour
    const handleUpdateStatus = (event: any, statusData: UpdateStatus) => {
      console.log('📦 Update status received:', statusData);
      setUpdateStatus(statusData);
      
      // Gérer l'état de vérification
      setIsCheckingForUpdates(statusData.status === 'checking');
    };

    if (window.electronAPI?.onUpdateStatus) {
      window.electronAPI.onUpdateStatus(handleUpdateStatus);
    }

    // Nettoyage
    return () => {
      if (window.electronAPI?.removeUpdateStatusListener) {
        window.electronAPI.removeUpdateStatusListener(handleUpdateStatus);
      }
    };
  }, []);

  // Vérifier les mises à jour manuellement (avec dialogue "pas de mise à jour")
  const checkForUpdates = useCallback(async () => {
    if (!window.electronAPI?.checkForUpdates) {
      console.warn('electronAPI.checkForUpdates n\'est pas disponible');
      setUpdateStatus({
        status: 'error',
        message: 'Service de mise à jour non disponible'
      });
      return;
    }

    if (isCheckingForUpdates) {
      console.log('⏳ Vérification déjà en cours');
      return;
    }

    try {
      setIsCheckingForUpdates(true);
      setUpdateStatus({
        status: 'checking',
        message: 'Vérification des mises à jour...'
      });
      
      await window.electronAPI.checkForUpdates();
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des mises à jour:', error);
      setUpdateStatus({
        status: 'error',
        message: 'Erreur lors de la vérification des mises à jour'
      });
      setIsCheckingForUpdates(false);
    }
  }, [isCheckingForUpdates]);

  // Vérifier les mises à jour silencieusement (au lancement)
  const checkForUpdatesAndNotify = useCallback(async () => {
    if (!window.electronAPI?.checkForUpdatesAndNotify) {
      console.warn('electronAPI.checkForUpdatesAndNotify n\'est pas disponible');
      return;
    }

    if (isCheckingForUpdates) {
      return;
    }

    try {
      await window.electronAPI.checkForUpdatesAndNotify();
    } catch (error) {
      console.error('❌ Erreur lors de la vérification automatique:', error);
    }
  }, [isCheckingForUpdates]);

  // Forcer l'installation de la mise à jour
  const quitAndInstall = useCallback(async () => {
    if (!window.electronAPI?.quitAndInstall) {
      console.warn('electronAPI.quitAndInstall n\'est pas disponible');
      return;
    }

    try {
      await window.electronAPI.quitAndInstall();
    } catch (error) {
      console.error('❌ Erreur lors de l\'installation:', error);
    }
  }, []);

  // Helpers pour les statuts
  const isUpdateAvailable = updateStatus.status === 'available';
  const isUpdateDownloaded = updateStatus.status === 'downloaded';
  const isDownloading = updateStatus.status === 'downloading';
  const hasError = updateStatus.status === 'error';

  // Formater la progress du téléchargement
  const downloadProgress = updateStatus.percent ? Math.round(updateStatus.percent) : 0;

  return {
    // État général
    isCheckingForUpdates,
    updateStatus,
    appVersion,
    
    // Actions
    checkForUpdates,
    checkForUpdatesAndNotify,
    quitAndInstall,
    
    // États dérivés pour faciliter l'usage
    isUpdateAvailable,
    isUpdateDownloaded,
    isDownloading,
    hasError,
    downloadProgress
  };
} 