import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, FilePlus, Copy, Loader2, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast-simple'

export function GenerateView() {
  const [skeleton, setSkeleton] = useState('')
  const [generated, setGenerated] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    setLoading(true)
    try {
      // Validation rapide du JSON
      JSON.parse(skeleton)

      const response = await window.electronAPI.generateData({
        skeleton_content: skeleton,
      })

      if (response?.success) {
        const formatted = JSON.stringify(response.data, null, 2)
        setGenerated(formatted)
        toast({ title: 'Données générées', description: 'Les données de test ont été créées avec succès.' })
      } else {
        throw new Error('Generation failed')
      }
    } catch (error: any) {
      toast({ title: 'Erreur', description: error?.message || 'Génération échouée', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const importSkeletonFile = async () => {
    try {
      const filePath = await window.electronAPI.openFileDialog({
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        title: 'Sélectionner un squelette JSON',
      })
      if (!filePath) return

      // On génère directement depuis le chemin pour éviter de charger lourdement le JSON dans le renderer
      setLoading(true)
      const response = await window.electronAPI.generateData({
        skeleton_path: filePath,
      })
      if (response?.success) {
        const formatted = JSON.stringify(response.data, null, 2)
        setGenerated(formatted)
        toast({ title: 'Données générées', description: 'Les données de test ont été créées avec succès.' })
      }
    } catch (error: any) {
      toast({ title: 'Erreur', description: error?.message || 'Import échoué', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!generated) return
    try {
      await navigator.clipboard.writeText(generated)
      toast({ title: 'Copié !', description: 'JSON généré copié dans le presse-papiers.' })
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de copier dans le presse-papiers.', variant: 'destructive' })
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panneau de saisie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Squelette JSON
            </CardTitle>
            <CardDescription>
              Collez un squelette JSON ou importez un fichier, puis cliquez sur « Generate »
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Collez votre squelette JSON ici..."
              className="min-h-[400px] font-mono text-sm"
              value={skeleton}
              onChange={(e) => setSkeleton(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleGenerate} disabled={!skeleton.trim() || loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                Generate
              </Button>
              <Button variant="outline" onClick={importSkeletonFile} disabled={loading}>
                <FilePlus className="w-4 h-4 mr-2" />
                Importer fichier
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSkeleton('')
                  setGenerated(null)
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
              <Zap className="w-5 h-5" />
              Données générées
            </CardTitle>
            <CardDescription>{generated ? 'JSON généré' : 'Le résultat apparaîtra ici'}</CardDescription>
          </CardHeader>
          <CardContent>
            {generated ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">JSON</Badge>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copier
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[350px] text-sm">
                  <code>{generated}</code>
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center">
                  <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune donnée générée pour le moment.</p>
                  <p className="text-sm">Soumettez un squelette JSON pour lancer la génération.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 