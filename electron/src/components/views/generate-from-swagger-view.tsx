import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FileText, FilePlus, Loader2, Copy, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast-simple'
import { useTranslation } from 'react-i18next'

// Simple helper to construire un squelette à partir d'un schéma OpenAPI 3.0 (objet uniquement)
function buildSkeletonFromSchema(schema: any): any {
  if (!schema || typeof schema !== 'object') return {}
  if (schema.type === 'object' && schema.properties) {
    const obj: Record<string, any> = {}
    for (const [prop, propSchema] of Object.entries<any>(schema.properties)) {
      if (propSchema.type === 'object') {
        obj[prop] = buildSkeletonFromSchema(propSchema)
      } else if (propSchema.type === 'array') {
        obj[prop] = [buildSkeletonFromSchema(propSchema.items || {})]
      } else {
        // Valeur placeholder selon le type
        switch (propSchema.type) {
          case 'string':
            obj[prop] = ''
            break
          case 'integer':
          case 'number':
            obj[prop] = 0
            break
          case 'boolean':
            obj[prop] = false
            break
          default:
            obj[prop] = null
        }
      }
    }
    return obj
  }
  return {}
}

export function GenerateFromSwaggerView() {
  const [swaggerPath, setSwaggerPath] = useState<string | null>(null)
  const [swaggerContent, setSwaggerContent] = useState('')
  const [generatedJson, setGeneratedJson] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslation()

  const importSwaggerFile = async () => {
    try {
      const path = await window.electronAPI.openFileDialog({
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'YAML Files', extensions: ['yaml', 'yml'] },
        ],
        title: t('swaggerToJson.importDialog.title'),
      })
      if (!path) return
      const result = await window.electronAPI.readJsonFile(path)
      if (!result.success) throw new Error(result.error)
      setSwaggerPath(path)
      setSwaggerContent(result.content)
      toast({ 
        title: t('swaggerToJson.toast.importTitle'), 
        description: t('swaggerToJson.toast.importDesc') 
      })
    } catch (error: any) {
      toast({ 
        title: t('common.error'), 
        description: error.message || t('swaggerToJson.toast.errorDesc'), 
        variant: 'destructive' 
      })
    }
  }

  const handleGenerate = async () => {
    if (!swaggerContent || !swaggerPath) return
    setLoading(true)
    try {
      const spec = JSON.parse(swaggerContent)
      if (!spec.components || !spec.components.schemas) {
        throw new Error(t('swaggerToJson.toast.noSchemaError'))
      }
      const firstSchemaName = Object.keys(spec.components.schemas)[0]
      const firstSchema = spec.components.schemas[firstSchemaName]
      const skeletonObj = buildSkeletonFromSchema(firstSchema)
      const skeletonContent = JSON.stringify(skeletonObj, null, 2)

      const response = await window.electronAPI.generateData({
        skeleton_content: skeletonContent,
        swagger_path: swaggerPath,
      })
      if (response.success) {
        const formatted = JSON.stringify(response.data, null, 2)
        setGeneratedJson(formatted)
        toast({ 
          title: t('swaggerToJson.toast.successTitle'), 
          description: t('swaggerToJson.toast.successDesc') 
        })
      } else {
        throw new Error('Generation failed')
      }
    } catch (error: any) {
      toast({ 
        title: t('common.error'), 
        description: error.message || t('swaggerToJson.toast.errorDesc'), 
        variant: 'destructive' 
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!generatedJson) return
    try {
      await navigator.clipboard.writeText(generatedJson)
      toast({ 
        title: t('common.copiedTitle'), 
        description: t('swaggerToJson.copyToastDesc') 
      })
    } catch {
      toast({ 
        title: t('common.error'), 
        description: t('common.copyErrorDescription'), 
        variant: 'destructive' 
      })
    }
  }

  const saveJson = async () => {
    if (!generatedJson) return
    try {
      const path = await window.electronAPI.saveFileDialog({
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        title: t('swaggerToJson.saveDialog.title'),
        defaultPath: t('swaggerToJson.saveDialog.defaultName'),
      })
      if (!path) return
      await window.electronAPI.saveFile(path, generatedJson)
      toast({ 
        title: t('common.success'), 
        description: t('swaggerToJson.saveToastDesc') 
      })
    } catch (error: any) {
      toast({ 
        title: t('common.error'), 
        description: error.message || t('swaggerToJson.toast.errorDesc'), 
        variant: 'destructive' 
      })
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('swaggerToJson.inputTitle')}
            </CardTitle>
            <CardDescription>{t('swaggerToJson.instruction')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={t('swaggerToJson.placeholder')}
              value={swaggerContent}
              onChange={(e) => setSwaggerContent(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={importSwaggerFile}>
                <FilePlus className="w-4 h-4 mr-2" />
                {t('swaggerToJson.button.import')}
              </Button>
              <Button onClick={handleGenerate} disabled={!swaggerContent || loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                {t('swaggerToJson.button.generate')}
              </Button>
              <Button variant="outline" onClick={() => { setSwaggerContent(''); setGeneratedJson(null); setSwaggerPath(null) }}>
                {t('common.clear')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('swaggerToJson.resultTitle')}
            </CardTitle>
            <CardDescription>{generatedJson ? t('swaggerToJson.resultLabel') : t('swaggerToJson.resultPlaceholder')}</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedJson ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{t('common.json')}</Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      {t('common.copy')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={saveJson}>
                      <Save className="w-4 h-4 mr-2" />
                      {t('common.save')}
                    </Button>
                  </div>
                </div>
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[350px] text-sm">
                  <code>{generatedJson}</code>
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('swaggerToJson.noDataTitle')}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 