import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, Copy, Loader2, FileText, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast-simple'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/lib/api-client'
import { FileUpload, readFileAsText, downloadFile } from '@/components/file-upload'
import { ToolWorkspace } from '@/components/tool-workspace'

export function AnonymizeView() {
  const [jsonInput, setJsonInput] = useState('')
  const [anonymized, setAnonymized] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleAnonymize = async () => {
    if (!jsonInput.trim() || loading) return
    
    setLoading(true)
    setLastError(null)
    try {
      // Validate JSON locally first
      let data
      try {
        data = JSON.parse(jsonInput)
      } catch (_parseError) {
        throw new Error('Invalid JSON format')
      }

      const response = await apiClient.anonymize(data)

      if (response?.success && response.data) {
        const formatted = JSON.stringify(response.data, null, 2)
        setAnonymized(formatted)
        setLastError(null)
        toast({
          title: t('anonymize.toast.successTitle'),
          description: t('anonymize.toast.successDesc'),
          variant: 'success',
        })
      } else {
        throw new Error(response?.error || 'Anonymization failed')
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.details || t('anonymize.toast.errorDesc')
      
      // Only show error if it's different from the last one to avoid duplicates
      if (errorMessage !== lastError) {
        setLastError(errorMessage)
        console.error('Anonymization error:', error)
        toast({
          title: t('common.error'),
          description: errorMessage,
          variant: 'destructive',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (file: File) => {
    if (loading) return
    
    setLoading(true)
    setLastError(null)
    try {
      const content = await readFileAsText(file)
      let data
      try {
        data = JSON.parse(content)
      } catch (_parseError) {
        throw new SyntaxError('Invalid JSON file')
      }
      
      setJsonInput(content)

      // Auto-anonymize after import
      const response = await apiClient.anonymize(data)

      if (response?.success && response.data) {
        const formatted = JSON.stringify(response.data, null, 2)
        setAnonymized(formatted)
        setLastError(null)
        toast({
          title: t('anonymize.toast.successTitle'),
          description: t('anonymize.toast.successDesc'),
          variant: 'success',
        })
      } else {
        throw new Error(response?.error || 'Anonymization failed')
      }
    } catch (error: any) {
      const errorMessage = error instanceof SyntaxError 
        ? 'Invalid JSON file' 
        : (error?.message || error?.details || t('anonymize.toast.errorDesc'))
      
      // Only show error if it's different from the last one
      if (errorMessage !== lastError) {
        setLastError(errorMessage)
        console.error('File import/anonymization error:', error)
        toast({ 
          title: t('common.error'), 
          description: errorMessage, 
          variant: 'destructive' 
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!anonymized) return
    downloadFile(anonymized, 'anonymized-data.json', 'application/json')
    toast({
      title: t('common.exported'),
      description: t('common.exportSuccess'),
      variant: 'info'
    })
  }

  const copyToClipboard = async () => {
    if (!anonymized) return
    try {
      await navigator.clipboard.writeText(anonymized)
      toast({
        title: t('common.copiedTitle'),
        description: t('anonymize.copyToastDesc'),
      })
    } catch {
      toast({
        title: t('common.error'),
        description: t('common.copyErrorDescription'),
        variant: 'destructive',
      })
    }
  }

  return (
    <ToolWorkspace>
        {/* Panneau de saisie */}
        <Card className="flex min-h-0 flex-col lg:h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {t('anonymize.rawData')}
            </CardTitle>
            <CardDescription>
              {t('anonymize.instruction')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col space-y-4">
            <Textarea
              placeholder={t('anonymize.placeholder')}
              className="min-h-[12rem] flex-1 font-mono text-sm"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
            <FileUpload
              accept=".json"
              maxSize={10}
              onFileSelect={handleFileSelect}
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button onClick={handleAnonymize} disabled={!jsonInput.trim() || loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                {t('anonymize.button.anonymize')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setJsonInput('')
                  setAnonymized(null)
                }}
              >
                {t('common.clear')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Panneau de résultat */}
        <Card className="flex min-h-0 flex-col lg:h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('anonymize.resultTitle')}
            </CardTitle>
            {anonymized ? (
              <CardDescription>{t('anonymize.resultLabel')}</CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col">
            {anonymized ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{t('common.json')}</Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      {t('common.copy')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                      <Download className="w-4 h-4 mr-2" />
                      {t('common.export')}
                    </Button>
                  </div>
                </div>
                <pre className="min-h-[10rem] max-h-[28rem] flex-1 overflow-auto rounded-lg bg-muted/40 p-3 text-sm">
                  <code>{anonymized}</code>
                </pre>
              </div>
            ) : (
              <div className="flex min-h-[10rem] flex-1 items-center justify-center px-4 text-muted-foreground">
                <div className="max-w-[16rem] text-center">
                  <Lock className="mx-auto mb-2 h-5 w-5 opacity-50" />
                  <p className="text-sm">{t('anonymize.noDataTitle')}</p>
                  <p className="mt-1 text-xs leading-relaxed">{t('anonymize.noDataDesc')}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
    </ToolWorkspace>
  )
} 