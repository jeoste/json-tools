import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Copy, Loader2, Save, Code } from 'lucide-react'
import { useToast } from '@/hooks/use-toast-simple'

function inferSchema(value: any): any {
  if (Array.isArray(value)) {
    return {
      type: 'array',
      items: value.length ? inferSchema(value[0]) : {},
    }
  }
  if (value === null) return { type: 'string', nullable: true }
  switch (typeof value) {
    case 'string':
      return { type: 'string' }
    case 'number':
      return { type: Number.isInteger(value) ? 'integer' : 'number' }
    case 'boolean':
      return { type: 'boolean' }
    case 'object':
      const properties: Record<string, any> = {}
      for (const [k, v] of Object.entries(value)) {
        properties[k] = inferSchema(v)
      }
      return { type: 'object', properties }
    default:
      return { type: 'string' }
  }
}

function generateOpenApi(jsonObj: any) {
  const schema = inferSchema(jsonObj)
  const openapi = {
    openapi: '3.0.0',
    info: {
      title: 'Generated API',
      version: '1.0.0',
    },
    paths: {
      '/example': {
        get: {
          summary: 'Example endpoint',
          responses: {
            200: {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Root',
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Root: schema,
      },
    },
  }
  return JSON.stringify(openapi, null, 2)
}

export function SwaggerView() {
  const [jsonInput, setJsonInput] = useState('')
  const [openapiSpec, setOpenapiSpec] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleGenerate = () => {
    setLoading(true)
    try {
      const obj = JSON.parse(jsonInput)
      const spec = generateOpenApi(obj)
      setOpenapiSpec(spec)
      toast({ title: 'Spécification générée', description: 'OpenAPI généré avec succès.' })
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Génération échouée', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!openapiSpec) return
    try {
      await navigator.clipboard.writeText(openapiSpec)
      toast({ title: 'Copié !', description: 'Spécification OpenAPI copiée.' })
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de copier.', variant: 'destructive' })
    }
  }

  const saveSpec = async () => {
    if (!openapiSpec) return
    try {
      const path = await window.electronAPI.saveFileDialog({
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'YAML Files', extensions: ['yaml', 'yml'] },
        ],
        title: 'Sauvegarder la spécification',
        defaultPath: 'openapi.json',
      })
      if (!path) return
      await window.electronAPI.saveFile(path, openapiSpec)
      toast({ title: 'Sauvegardé', description: 'Fichier enregistré.' })
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Sauvegarde échouée', variant: 'destructive' })
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Exemple JSON
            </CardTitle>
            <CardDescription>Collez un exemple JSON pour générer une spécification OpenAPI 3.0</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Collez votre JSON ici..."
              className="min-h-[400px] font-mono text-sm"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleGenerate} disabled={!jsonInput.trim() || loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                Generate
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setJsonInput('')
                  setOpenapiSpec(null)
                }}
              >
                Effacer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Spécification OpenAPI
            </CardTitle>
            <CardDescription>{openapiSpec ? 'Résultat' : 'Le résultat apparaîtra ici'}</CardDescription>
          </CardHeader>
          <CardContent>
            {openapiSpec ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">JSON</Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copier
                    </Button>
                    <Button variant="outline" size="sm" onClick={saveSpec}>
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </Button>
                  </div>
                </div>
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[350px] text-sm">
                  <code>{openapiSpec}</code>
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune spécification générée pour le moment.</p>
                  <p className="text-sm">Soumettez un JSON pour lancer la génération.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 