import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, Copy, Loader2, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast-simple'

export function AnonymizeView() {
  const [jsonInput, setJsonInput] = useState('')
  const [anonymized, setAnonymized] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAnonymize = async () => {
    setLoading(true)
    try {
      // On valide d'abord le JSON localement pour un retour immédiat
      JSON.parse(jsonInput)

      const response = await window.electronAPI.anonymizeData({
        data_content: jsonInput,
        analyze_first: false,
      })

      if (response?.success) {
        const formatted = JSON.stringify(response.data, null, 2)
        setAnonymized(formatted)
        toast({
          title: 'Anonymisation réussie',
          description: 'Les données sensibles ont été anonymisées.',
        })
      } else {
        throw new Error('Anonymization failed')
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.message || 'Anonymisation échouée',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!anonymized) return
    try {
      await navigator.clipboard.writeText(anonymized)
      toast({
        title: 'Copié !',
        description: 'JSON anonymisé copié dans le presse-papiers.',
      })
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
              <Lock className="w-5 h-5" />
              Données brutes
            </CardTitle>
            <CardDescription>
              Collez ici votre JSON provenant de la production puis cliquez sur « Anonymize »
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Collez votre JSON ici..."
              className="min-h-[400px] font-mono text-sm"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleAnonymize} disabled={!jsonInput.trim() || loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                Anonymize
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setJsonInput('')
                  setAnonymized(null)
                }}
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
              Résultat anonymisé
            </CardTitle>
            <CardDescription>
              {anonymized ? 'JSON anonymisé' : 'Le résultat apparaîtra ici'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {anonymized ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">JSON</Badge>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copier
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[350px] text-sm">
                  <code>{anonymized}</code>
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center">
                  <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune donnée anonymisée pour le moment.</p>
                  <p className="text-sm">Soumettez un JSON pour lancer l'anonymisation.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 