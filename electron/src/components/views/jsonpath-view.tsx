import { useState } from 'react'
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

export function JsonPathView() {
  const [jsonInput, setJsonInput] = useState('')
  const [pathExpr, setPathExpr] = useState('$.')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const importJsonFile = async () => {
    try {
      const filePath = await window.electronAPI.openFileDialog({
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        title: 'Sélectionner un fichier JSON',
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
        title: 'Erreur',
        description: error?.message || 'Import échoué',
        variant: 'destructive',
      })
    }
  }

  const evaluatePath = () => {
    setLoading(true)
    try {
      const json = JSON.parse(jsonInput)
      const extracted = JSONPath({ path: pathExpr, json })
      const formatted = JSON.stringify(extracted, null, 2)
      setResult(formatted)
      toast({
        title: 'Extraction réussie',
        description: 'Les données ont été extraites avec succès.',
      })
    } catch (error: any) {
      setResult(null)
      toast({
        title: 'Erreur',
        description: error?.message || 'Extraction échouée',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      toast({ title: 'Copié !', description: 'Résultat copié dans le presse-papiers.' })
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier dans le presse-papiers.',
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
              Données JSON & Expression
            </CardTitle>
            <CardDescription>
              Collez votre JSON, saisissez une expression JSONPath puis cliquez sur « Extract »
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Collez votre JSON ici..."
              className="min-h-[300px] font-mono text-sm"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
            <Input
              placeholder="Expression JSONPath, ex: $.body"
              value={pathExpr}
              onChange={(e) => setPathExpr(e.target.value)}
              className="font-mono text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={evaluatePath} disabled={!jsonInput.trim() || !pathExpr.trim() || loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Extract
              </Button>
              <Button variant="outline" onClick={importJsonFile} disabled={loading}>
                <FilePlus className="w-4 h-4 mr-2" />
                Importer fichier
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setJsonInput('')
                  setResult(null)
                }}
                disabled={loading}
              >
                Effacer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Panneau de résultat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Résultat
            </CardTitle>
            <CardDescription>
              {result ? 'Données extraites' : 'Le résultat apparaîtra ici'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">JSON</Badge>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copier
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[350px] text-sm">
                  <code>{result}</code>
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun résultat pour le moment.</p>
                  <p className="text-sm">Soumettez un JSON et une expression JSONPath pour lancer l'extraction.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 