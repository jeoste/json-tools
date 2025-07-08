import { useState, useEffect } from 'react';

export function useUpdater() {
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [appVersion, setAppVersion] = useState<string>('');

  useEffect(() => {
    // Récupérer la version de l'application
    if (window.electronAPI?.getAppVersion) {
      window.electronAPI.getAppVersion().then((version: string) => {
        setAppVersion(version);
      });
    }

    // Écouter les événements de mise à jour
    const handleUpdateStatus = (event: any, status: string) => {
      setUpdateStatus(status);
      
      // Arrêter le loading si on reçoit certains statuts
      if (status.includes('Aucune mise à jour') || 
          status.includes('Erreur') || 
          status.includes('téléchargée')) {
        setIsCheckingForUpdates(false);
      }
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

  const checkForUpdates = async () => {
    if (!window.electronAPI?.checkForUpdates) {
      console.warn('electronAPI.checkForUpdates n\'est pas disponible');
      return;
    }

    setIsCheckingForUpdates(true);
    setUpdateStatus('Vérification des mises à jour...');
    
    try {
      await window.electronAPI.checkForUpdates();
    } catch (error) {
      console.error('Erreur lors de la vérification des mises à jour:', error);
      setUpdateStatus('Erreur lors de la vérification des mises à jour');
      setIsCheckingForUpdates(false);
    }
  };

  return {
    isCheckingForUpdates,
    updateStatus,
    appVersion,
    checkForUpdates
  };
} 