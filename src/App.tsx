import { lazy, Suspense, useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { Layout } from '@/components/layout'
import { Skeleton } from '@/components/ui/skeleton'

export type ViewType =
  | 'anonymize'
  | 'generate'
  | 'swagger'
  | 'swaggerToJson'
  | 'validator'
  | 'jsonpath'
  | 'xmlValidate'
  | 'xmlPath'
  | 'generateXml'
  | 'randomJson'
  | 'randomXml'

const AnonymizeView = lazy(() =>
  import('@/components/views/anonymize-view').then((m) => ({ default: m.AnonymizeView }))
)
const GenerateView = lazy(() =>
  import('@/components/views/generate-view').then((m) => ({ default: m.GenerateView }))
)
const SwaggerView = lazy(() =>
  import('@/components/views/swagger-view').then((m) => ({ default: m.SwaggerView }))
)
const ValidatorView = lazy(() =>
  import('@/components/views/validator-view').then((m) => ({ default: m.ValidatorView }))
)
const GenerateFromSwaggerView = lazy(() =>
  import('@/components/views/generate-from-swagger-view').then((m) => ({
    default: m.GenerateFromSwaggerView,
  }))
)
const JsonPathView = lazy(() =>
  import('@/components/views/jsonpath-view').then((m) => ({ default: m.JsonPathView }))
)
const XmlValidateView = lazy(() =>
  import('@/components/views/xml-validate-view').then((m) => ({ default: m.XmlValidateView }))
)
const XmlPathView = lazy(() =>
  import('@/components/views/xml-path-view').then((m) => ({ default: m.XmlPathView }))
)
const GenerateXmlView = lazy(() =>
  import('@/components/views/generate-xml-view').then((m) => ({ default: m.GenerateXmlView }))
)
const RandomJsonView = lazy(() =>
  import('@/components/views/random-json-view').then((m) => ({ default: m.RandomJsonView }))
)
const RandomXmlView = lazy(() =>
  import('@/components/views/random-xml-view').then((m) => ({ default: m.RandomXmlView }))
)

function ViewFallback() {
  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('generate')

  const renderView = () => {
    switch (currentView) {
      case 'anonymize':
        return <AnonymizeView />
      case 'generate':
        return <GenerateView />
      case 'swagger':
        return <SwaggerView />
      case 'validator':
        return <ValidatorView />
      case 'swaggerToJson':
        return <GenerateFromSwaggerView />
      case 'jsonpath':
        return <JsonPathView />
      case 'xmlValidate':
        return <XmlValidateView />
      case 'xmlPath':
        return <XmlPathView />
      case 'generateXml':
        return <GenerateXmlView />
      case 'randomJson':
        return <RandomJsonView />
      case 'randomXml':
        return <RandomXmlView />
      default:
        return <GenerateView />
    }
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="my-data-toolbox-ui-theme">
      <Layout currentView={currentView} onViewChange={setCurrentView}>
        <Suspense fallback={<ViewFallback />}>{renderView()}</Suspense>
      </Layout>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
