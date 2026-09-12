/**
 * File upload component with drag-and-drop support
 */

import { useRef, useState, DragEvent, ChangeEvent, KeyboardEvent } from 'react'
import { Upload, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  accept?: string
  maxSize?: number // in MB
  onFileSelect: (file: File) => Promise<void> | void
  disabled?: boolean
  className?: string
}

export function FileUpload({
  accept = '.json,.yaml,.yml',
  maxSize = 10, // 10 MB default
  onFileSelect,
  disabled = false,
  className = '',
}: FileUploadProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openPicker = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const validateFile = (file: File): boolean => {
    setError(null)

    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      setError(t('common.fileTooLarge', { max: maxSize }))
      return false
    }

    return true
  }

  const handleFile = async (file: File) => {
    if (!validateFile(file)) {
      return
    }

    try {
      await onFileSelect(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.fileProcessError'))
    }
  }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openPicker()
    }
  }

  return (
    <div className={cn('min-w-0 w-full', className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={openPicker}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-disabled={disabled}
        className={cn(
          'flex min-w-0 w-full items-center gap-3 rounded-lg border border-dashed px-3 py-2.5 text-left transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isDragging ? 'border-primary bg-primary/5' : 'border-border',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-primary/40'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />
        <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">
            {t('common.dropFile')}
          </p>
          {error && (
            <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
              <X className="h-3 w-3 shrink-0" />
              <span className="min-w-0 break-words">{error}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Utility function to read a file as text
 */
export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    reader.readAsText(file)
  })
}

/**
 * Utility function to download a file
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'application/json') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
