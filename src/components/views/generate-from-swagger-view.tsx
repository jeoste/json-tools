import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FileText, Loader2, Copy, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast-simple'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/lib/api-client'
import { FileUpload, readFileAsText, downloadFile } from '@/components/file-upload'
import * as yaml from 'yaml'
import { ToolWorkspace } from '@/components/tool-workspace'

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
  const [swaggerContent, setSwaggerContent] = useState('')
  const [swaggerSpec, setSwaggerSpec] = useState<any>(null)
  const [generatedJson, setGeneratedJson] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleFileSelect = async (file: File) => {
    try {
      const content = await readFileAsText(file)
      let parsed: any

      // Parse YAML or JSON
      if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
        parsed = yaml.parse(content)
        setSwaggerContent(JSON.stringify(parsed, null, 2))
      } else {
        parsed = JSON.parse(content)
        setSwaggerContent(content)
      }

      setSwaggerSpec(parsed)
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
    if (!swaggerContent || !swaggerSpec) return
    setLoading(true)
    try {
      const spec = swaggerSpec || JSON.parse(swaggerContent)
      if (!spec.components || !spec.components.schemas) {
        throw new Error(t('swaggerToJson.toast.noSchemaError'))
      }
      const firstSchemaName = Object.keys(spec.components.schemas)[0]
      const firstSchema = spec.components.schemas[firstSchemaName]
      const skeletonObj = buildSkeletonFromSchema(firstSchema)

      const response = await apiClient.generate(
        skeletonObj,
        spec, // Pass swagger spec
        {}
      )

      if (response.success && response.data) {
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

  const saveJson = () => {
    if (!generatedJson) return
    downloadFile(generatedJson, 'generated-from-swagger.json', 'application/json')
    toast({ 
      title: t('common.success'), 
      description: t('swaggerToJson.saveToastDesc') 
    })
  }

  return (
    <ToolWorkspace>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('swaggerToJson.inputTitle')}
            </CardTitle>
            <CardDescription>{t('swaggerToJson.instruction')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={t('swaggerToJson.placeholder')}
              value={swaggerContent}
              onChange={(e) => setSwaggerContent(e.target.value)}
              className="min-h-[12rem] flex-1 font-mono text-sm"
            />
            <FileUpload
              accept=".json,.yaml,.yml"
              maxSize={10}
              onFileSelect={handleFileSelect}
              disabled={loading}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleGenerate} disabled={!swaggerContent || loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                {t('swaggerToJson.button.generate')}
              </Button>
              <Button variant="outline" onClick={() => { setSwaggerContent(''); setGeneratedJson(null); setSwaggerSpec(null) }}>
                {t('common.clear')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
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
                <pre className="min-h-[10rem] max-h-[28rem] flex-1 overflow-auto rounded-lg bg-muted/40 p-3 text-sm">
                  <code>{generatedJson}</code>
                </pre>
              </div>
            ) : (
              <div className="flex min-h-[10rem] flex-1 items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="mx-auto mb-2 h-5 w-5 opacity-50" />
                  <p>{t('swaggerToJson.noDataTitle')}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
    </ToolWorkspace>
  )
} 