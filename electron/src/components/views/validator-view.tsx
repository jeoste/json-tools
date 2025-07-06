import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Copy, FileText, FilePlus, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast-simple'

export function ValidatorView() {
  const [jsonInput, setJsonInput] = useState('')
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    error?: string
    formatted?: string
  } | null>(null)
  const { toast } = useToast()

  const importJsonFile = async () => {
    try {
      const filePath = await window.electronAPI.openFileDialog({
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        title: 'Sélectionner un fichier JSON',
      })
      if (!filePath) return
      const result = await window.electronAPI.readJsonFile(filePath)
      if (result.success) {
        setJsonInput(result.content)
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Import échoué', variant: 'destructive' })
    }
  }

  const saveFormattedJson = async () => {
    if (!validationResult?.formatted) return
    try {
      const savePath = await window.electronAPI.saveFileDialog({
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        title: 'Sauvegarder le JSON formaté',
        defaultPath: 'formatted.json',
      })
      if (!savePath) return
      await window.electronAPI.saveFile(savePath, validationResult.formatted)
      toast({ title: 'Sauvegardé', description: 'Fichier JSON enregistré.' })
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Sauvegarde échouée', variant: 'destructive' })
    }
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
        title: "JSON valide",
        description: "Votre JSON est correctement formaté.",
      })
    } catch (error) {
      setValidationResult({
        isValid: false,
        error: error instanceof Error ? error.message : 'Erreur de validation',
      })
      toast({
        title: "JSON invalide",
        description: "Veuillez corriger les erreurs dans votre JSON.",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = async () => {
    if (validationResult?.formatted) {
      try {
        await navigator.clipboard.writeText(validationResult.formatted)
        toast({
          title: "Copié !",
          description: "JSON formaté copié dans le presse-papiers.",
        })
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de copier dans le presse-papiers.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Saisie JSON
            </CardTitle>
            <CardDescription>
              Collez votre JSON ici pour le valider et le formater
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Collez votre JSON ici..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={validateJson} disabled={!jsonInput.trim()}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Valider JSON
              </Button>
              <Button variant="outline" onClick={importJsonFile}>
                <FilePlus className="w-4 h-4 mr-2" />
                Importer fichier
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setJsonInput('')
                  setValidationResult(null)
                }}
              >
                Effacer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult?.isValid ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  Résultat - JSON Valide
                </>
              ) : validationResult?.error ? (
                <>
                  <XCircle className="w-5 h-5 text-destructive" />
                  Résultat - JSON Invalide
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Résultat
                </>
              )}
            </CardTitle>
            <CardDescription>
              {validationResult?.isValid && "JSON formaté et validé"}
              {validationResult?.error && "Erreurs de validation détectées"}
              {!validationResult && "Le résultat apparaîtra ici après validation"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {validationResult?.isValid && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-green-600 dark:text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Valide
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copier
                    </Button>
                    <Button variant="outline" size="sm" onClick={saveFormattedJson}>
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </Button>
                  </div>
                </div>
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[350px] text-sm">
                  <code>{validationResult.formatted}</code>
                </pre>
              </div>
            )}
            
            {validationResult?.error && (
              <div className="space-y-4">
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Invalide
                </Badge>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive font-medium mb-2">
                    Erreur de validation :
                  </p>
                  <p className="text-destructive/80 text-sm font-mono">
                    {validationResult.error}
                  </p>
                </div>
              </div>
            )}
            
            {!validationResult && (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun JSON à valider</p>
                  <p className="text-sm">Collez votre JSON et cliquez sur "Valider"</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 