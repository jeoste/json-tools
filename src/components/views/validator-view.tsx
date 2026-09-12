import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Copy, FileText, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast-simple'
import { useTranslation } from 'react-i18next'
import { FileUpload, readFileAsText, downloadFile } from '@/components/file-upload'
import { ToolWorkspace } from '@/components/tool-workspace'

export function ValidatorView() {
  const [jsonInput, setJsonInput] = useState('')
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    error?: string
    formatted?: string
  } | null>(null)
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleFileSelect = async (file: File) => {
    try {
      const content = await readFileAsText(file)
      setJsonInput(content)
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message || t('common.copyErrorDescription'), variant: 'destructive' })
    }
  }

  const saveFormattedJson = () => {
    if (!validationResult?.formatted) return
    downloadFile(validationResult.formatted, 'formatted.json', 'application/json')
    toast({ title: t('validator.save'), description: t('validator.save') + ' OK' })
  }

  const validateJson = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      const formatted = JSON.stringify(parsed, null, 2)
      setValidationResult({
        isValid: true,
        formatted,
      })
      toast({
        title: t('validator.toastValidTitle'),
        description: t('validator.toastValidDesc'),
      })
    } catch (error) {
      setValidationResult({
        isValid: false,
        error: error instanceof Error ? error.message : 'Erreur de validation',
      })
      toast({
        title: t('validator.toastInvalidTitle'),
        description: t('validator.toastInvalidDesc'),
        variant: 'destructive',
      })
    }
  }

  const copyToClipboard = async () => {
    if (validationResult?.formatted) {
      try {
        await navigator.clipboard.writeText(validationResult.formatted)
        toast({
          title: t('common.copiedTitle'),
          description: t('common.copiedDescription', { context: 'JSON' }),
        })
      } catch (_error) {
        toast({
          title: t('common.error'),
          description: t('common.copyErrorDescription'),
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <ToolWorkspace>
        {/* Input Panel */}
        <Card className="flex min-h-0 flex-col lg:h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('validator.inputTitle')}
            </CardTitle>
            <CardDescription>
              {t('validator.inputDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <Textarea
              placeholder={t('validator.placeholder')}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="min-h-[12rem] flex-1 font-mono text-sm"
            />
            <FileUpload
              accept=".json"
              maxSize={10}
              onFileSelect={handleFileSelect}
            />
            <div className="flex flex-wrap gap-2">
              <Button variant="success" onClick={validateJson} disabled={!jsonInput.trim()}>
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('validator.button.validate')}
              </Button>
              <Button 
                variant="warning" 
                onClick={() => {
                  setJsonInput('')
                  setValidationResult(null)
                }}
              >
                {t('common.clear')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result Panel */}
        <Card className="flex min-h-0 flex-col lg:h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult?.isValid ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  {t('validator.result.valid')}
                </>
              ) : validationResult?.error ? (
                <>
                  <XCircle className="h-4 w-4 text-destructive" />
                  {t('validator.result.invalid')}
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  {t('validator.result.title')}
                </>
              )}
            </CardTitle>
            <CardDescription>
              {validationResult?.isValid && t('validator.description.valid')}
              {validationResult?.error && t('validator.description.invalid')}
              {!validationResult && t('validator.description.placeholder')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {validationResult?.isValid && (
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Badge variant="secondary" className="text-green-600 dark:text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {t('validator.badge.valid')}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      {t('common.copy')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={saveFormattedJson}>
                      <Save className="w-4 h-4 mr-2" />
                      {t('validator.save')}
                    </Button>
                  </div>
                </div>
                <pre className="min-h-[10rem] flex-1 overflow-auto rounded-lg bg-muted/40 p-3 text-sm">
                  <code>{validationResult.formatted}</code>
                </pre>
              </div>
            )}
            
            {validationResult?.error && (
              <div className="space-y-4">
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  {t('validator.badge.invalid')}
                </Badge>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive font-medium mb-2">
                    {t('validator.toastInvalidTitle')} :
                  </p>
                  <p className="text-destructive/90 text-sm font-mono">
                    {validationResult.error}
                  </p>
                </div>
              </div>
            )}
            
            {!validationResult && (
              <div className="flex min-h-[10rem] flex-1 items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="mx-auto mb-2 h-5 w-5 opacity-50" />
                  <p>{t('validator.noJson')}</p>
                  <p className="text-sm">{t('validator.submitToValidate')}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
    </ToolWorkspace>
  )
} 