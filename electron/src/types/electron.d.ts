export {}

declare global {
  interface ElectronAPI {
    anonymizeData: (request: {
      data_content?: string
      data_path?: string
      analyze_first?: boolean
    }) => Promise<{ success: boolean; data: any }>
    // Autres méthodes exposées ; nous les marquons optionnelles pour l'instant
    openFileDialog: (options: any) => Promise<string | null>
    saveFileDialog: (options: any) => Promise<string | null>
    readJsonFile: (filePath: string) => Promise<{ success: boolean; content: string; error?: string }>
    saveFile: (filePath: string, data: string) => Promise<{ success: boolean; error?: string }>
    generateData: (request: {
      skeleton_path?: string
      skeleton_content?: string
      swagger_path?: string
    }) => Promise<{ success: boolean; data: any }>
    
    // Update management
    checkForUpdates: () => Promise<void>
    getAppVersion: () => Promise<string>
    onUpdateStatus: (callback: (event: any, status: string) => void) => void
    removeUpdateStatusListener: (callback: (event: any, status: string) => void) => void
  }

  interface Window {
    electronAPI: ElectronAPI
  }
} 