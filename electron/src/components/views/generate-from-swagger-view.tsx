import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FileText, FilePlus, Loader2, Copy, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast-simple'

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

  const importSwaggerFile = async () => {
    try {
      const path = await window.electronAPI.openFileDialog({
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'YAML Files', extensions: ['yaml', 'yml'] },
        ],
        title: 'Sélectionner un fichier Swagger/OpenAPI',
      })
      if (!path) return
      const result = await window.electronAPI.readJsonFile(path)
      if (!result.success) throw new Error(result.error)
      setSwaggerPath(path)
      setSwaggerContent(result.content)
      toast({ title: 'Fichier chargé', description: 'Swagger/OpenAPI importé.' })
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Import échoué', variant: 'destructive' })
    }
  }

  const handleGenerate = async () => {
    if (!swaggerContent || !swaggerPath) return
    setLoading(true)
    try {
      const spec = JSON.parse(swaggerContent)
      if (!spec.components || !spec.components.schemas) {
        throw new Error('Aucun schéma trouvé dans ce Swagger.')
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
        toast({ title: 'Données générées', description: 'JSON généré à partir du Swagger.' })
      } else {
        throw new Error('Generation failed')
      }
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Génération échouée', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!generatedJson) return
    try {
      await navigator.clipboard.writeText(generatedJson)
      toast({ title: 'Copié !', description: 'JSON copié.' })
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de copier.', variant: 'destructive' })
    }
  }

  const saveJson = async () => {
    if (!generatedJson) return
    try {
      const path = await window.electronAPI.saveFileDialog({
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        title: 'Sauvegarder le JSON généré',
        defaultPath: 'generated.json',
      })
      if (!path) return
      await window.electronAPI.saveFile(path, generatedJson)
      toast({ title: 'Sauvegardé', description: 'Fichier JSON enregistré.' })
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Sauvegarde échouée', variant: 'destructive' })
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Swagger / OpenAPI
            </CardTitle>
            <CardDescription>Importez un fichier Swagger/OpenAPI puis générez des exemples JSON</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Contenu Swagger chargé..."
              value={swaggerContent}
              onChange={(e) => setSwaggerContent(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={importSwaggerFile}>
                <FilePlus className="w-4 h-4 mr-2" />
                Importer fichier
              </Button>
              <Button onClick={handleGenerate} disabled={!swaggerContent || loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                Generate JSON
              </Button>
              <Button variant="outline" onClick={() => { setSwaggerContent(''); setGeneratedJson(null); setSwaggerPath(null) }}>
                Effacer
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              JSON généré
            </CardTitle>
            <CardDescription>{generatedJson ? 'Résultat' : 'Le résultat apparaîtra ici'}</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedJson ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">JSON</Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copier
                    </Button>
                    <Button variant="outline" size="sm" onClick={saveJson}>
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
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
                  <p>Aucun JSON généré pour le moment.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 