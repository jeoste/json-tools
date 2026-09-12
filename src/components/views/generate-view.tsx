import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, Copy, Loader2, FileText, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast-simple'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/lib/api-client'
import { FileUpload, readFileAsText, downloadFile } from '@/components/file-upload'
import { ToolWorkspace } from '@/components/tool-workspace'

export function GenerateView() {
  const [skeleton, setSkeleton] = useState('')
  const [generated, setGenerated] = useState<string | null>(null)
  const [seed, setSeed] = useState<string>('')
  const [count, setCount] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleGenerate = async () => {
    if (!skeleton.trim() || loading) return
    
    setLoading(true)
    setLastError(null)
    try {
      // Validate JSON locally first
      let skeletonData
      try {
        skeletonData = JSON.parse(skeleton)
      } catch (_parseError) {
        throw new Error('Invalid JSON format')
      }

      const response = await apiClient.generate(
        skeletonData,
        undefined, // swagger
        {
          seed: seed && seed.trim() ? Number(seed) : undefined,
          count: count && count.trim() ? Number(count) : undefined,
        }
      )

      if (response?.success && response.data) {
        const formatted = JSON.stringify(response.data, null, 2)
        setGenerated(formatted)
        setLastError(null)
        toast({ 
          title: t('generate.toast.successTitle'), 
          description: t('generate.toast.successDesc'),
          variant: 'success'
        })
      } else {
        throw new Error(response?.error || 'Generation failed')
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.details || t('generate.toast.errorDesc')
      
      // Only show error if it's different from the last one
      if (errorMessage !== lastError) {
        setLastError(errorMessage)
        console.error('Generation error:', error)
        toast({ 
          title: t('common.error'), 
          description: errorMessage, 
          variant: 'destructive' 
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (file: File) => {
    if (loading) return
    
    setLoading(true)
    setLastError(null)
    try {
      const content = await readFileAsText(file)
      let skeletonData
      try {
        skeletonData = JSON.parse(content)
      } catch (_parseError) {
        throw new SyntaxError('Invalid JSON file')
      }
      
      setSkeleton(content)

      // Auto-generate after import
      const response = await apiClient.generate(
        skeletonData,
        undefined,
        {
          seed: seed && seed.trim() ? Number(seed) : undefined,
          count: count && count.trim() ? Number(count) : undefined,
        }
      )

      if (response?.success && response.data) {
        const formatted = JSON.stringify(response.data, null, 2)
        setGenerated(formatted)
        setLastError(null)
        toast({ 
          title: t('generate.toast.successTitle'), 
          description: t('generate.toast.successDesc'),
          variant: 'success'
        })
      } else {
        throw new Error(response?.error || 'Generation failed')
      }
    } catch (error: any) {
      const errorMessage = error instanceof SyntaxError 
        ? 'Invalid JSON file' 
        : (error?.message || error?.details || t('generate.toast.errorDesc'))
      
      // Only show error if it's different from the last one
      if (errorMessage !== lastError) {
        setLastError(errorMessage)
        console.error('File import/generation error:', error)
        toast({ 
          title: t('common.error'), 
          description: errorMessage, 
          variant: 'destructive' 
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!generated) return
    downloadFile(generated, 'generated-data.json', 'application/json')
    toast({
      title: t('common.exported'),
      description: t('common.exportSuccess'),
      variant: 'info'
    })
  }

  const copyToClipboard = async () => {
    if (!generated) return
    try {
      await navigator.clipboard.writeText(generated)
      toast({ 
        title: t('common.copiedTitle'), 
        description: t('generate.copyToastDesc'),
        variant: 'info'
      })
    } catch {
      toast({ 
        title: t('common.error'), 
        description: t('common.copyErrorDescription'), 
        variant: 'destructive' 
      })
    }
  }


  return (
    <ToolWorkspace>
        <Card className="flex min-h-0 flex-col lg:h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('generate.skeletonTitle')}
            </CardTitle>
            <CardDescription>
              {t('generate.instruction')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <Textarea
              placeholder={t('generate.placeholder')}
              className="min-h-[12rem] flex-1 font-mono text-sm"
              value={skeleton}
              onChange={(e) => setSkeleton(e.target.value)}
            />
            <FileUpload
              accept=".json"
              maxSize={10}
              onFileSelect={handleFileSelect}
              disabled={loading}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder={t('generate.seedPlaceholder')}
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
              />
              <Input
                type="number"
                placeholder={t('generate.countPlaceholder')}
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleGenerate} disabled={!skeleton.trim() || loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                {t('generate.button.generate')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSkeleton('')
                  setGenerated(null)
                  setSeed('')
                  setCount('')
                }}
                disabled={loading}
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
              <Zap className="h-4 w-4" />
              {t('generate.resultTitle')}
            </CardTitle>
            {generated ? (
              <CardDescription>{t('generate.resultLabel')}</CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {generated ? (
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Badge variant="secondary">{t('common.json')}</Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      {t('common.copy')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                      <Download className="w-4 h-4 mr-2" />
                      {t('common.export')}
                    </Button>
                  </div>
                </div>
                <pre className="min-h-[10rem] flex-1 overflow-auto rounded-lg bg-muted/40 p-3 text-sm">
                  <code>{generated}</code>
                </pre>
              </div>
            ) : (
              <div className="flex min-h-[10rem] flex-1 items-center justify-center px-4 text-muted-foreground">
                <div className="max-w-[16rem] text-center">
                  <Zap className="mx-auto mb-2 h-5 w-5 opacity-50" />
                  <p className="text-sm">{t('generate.noDataTitle')}</p>
                  <p className="mt-1 text-xs leading-relaxed">{t('generate.noDataDesc')}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
    </ToolWorkspace>
  )
} 