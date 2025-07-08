import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, FileText, Copy, FilePlus, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast-simple'
import { JSONPath } from 'jsonpath-plus'
import { useTranslation } from 'react-i18next'

export function JsonPathView() {
  const [jsonInput, setJsonInput] = useState('')
  const [pathExpr, setPathExpr] = useState('$.')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { t } = useTranslation()

  const importJsonFile = async () => {
    try {
      const filePath = await window.electronAPI.openFileDialog({
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        title: t('jsonpath.importDialog.title'),
      })
      if (!filePath) return
      const fileContent = await window.electronAPI.readJsonFile(filePath)
      if (fileContent.success) {
        setJsonInput(fileContent.content)
      } else {
        throw new Error(fileContent.error)
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error?.message || t('jsonpath.toast.errorDesc'),
        variant: 'destructive',
      })
    }
  }

  const evaluatePath = () => {
    try {
      const json = JSON.parse(jsonInput)
      const extracted = JSONPath({ path: pathExpr, json })
      const formatted = JSON.stringify(extracted, null, 2)
      setResult(formatted)
      setError(null)
    } catch (err: any) {
      setResult(null)
      setError(err?.message || t('jsonpath.toast.extractionError'))
    }
  }

  // Évaluation automatique avec délai pour ne pas surcharger
  useEffect(() => {
    if (!jsonInput.trim() || !pathExpr.trim()) {
      setResult(null)
      setError(null)
      return
    }

    const timer = setTimeout(() => {
      evaluatePath()
    }, 500)

    return () => clearTimeout(timer)
  }, [jsonInput, pathExpr])

  const copyToClipboard = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      toast({ 
        title: t('common.copiedTitle'), 
        description: t('jsonpath.copyToastDesc') 
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
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panneau de saisie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              {t('jsonpath.inputTitle')}
            </CardTitle>
            <CardDescription>
              {t('jsonpath.instruction')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={t('jsonpath.placeholder')}
              className="min-h-[300px] font-mono text-sm"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
            <Input
              placeholder={t('jsonpath.pathPlaceholder')}
              value={pathExpr}
              onChange={(e) => setPathExpr(e.target.value)}
              className="font-mono text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={evaluatePath} variant="secondary" disabled={!jsonInput.trim() || !pathExpr.trim()}>
                <Search className="w-4 h-4 mr-2" />
                {t('jsonpath.button.extract')}
              </Button>
              <Button variant="outline" onClick={importJsonFile} disabled={loading}>
                <FilePlus className="w-4 h-4 mr-2" />
                {t('jsonpath.button.import')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setJsonInput('')
                  setResult(null)
                }}
                disabled={loading}
              >
                {t('common.clear')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Panneau de résultat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('jsonpath.resultTitle')}
            </CardTitle>
            <CardDescription>
              {error ? t('jsonpath.errorLabel') : result ? t('jsonpath.resultLabel') : t('jsonpath.resultPlaceholder')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-destructive">
                {error}
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{t('common.json')}</Badge>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    {t('common.copy')}
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[350px] text-sm">
                  <code>{result}</code>
                </pre>
              </div>
            ) : !error ? (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('jsonpath.noDataTitle')}</p>
                  <p className="text-sm">{t('jsonpath.noDataDesc')}</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 