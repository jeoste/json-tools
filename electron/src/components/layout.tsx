import { Lock, Zap, FileText, CheckCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ViewType } from '@/App'
import logoPng from '../../assets/logo_bracket.png'

interface LayoutProps {
  children: React.ReactNode
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

const navigationItems = [
  {
    key: 'anonymize' as ViewType,
    label: 'Anonymize',
    icon: Lock,
  },
  {
    key: 'generate' as ViewType,
    label: 'Generate',
    icon: Zap,
  },
  {
    key: 'swagger' as ViewType,
    label: 'Swagger Spec',
    icon: FileText,
  },
  {
    key: 'swaggerToJson' as ViewType,
    label: 'Swagger JSON',
    icon: FileText,
  },
  {
    key: 'validator' as ViewType,
    label: 'Validate',
    icon: CheckCircle,
  },
  {
    key: 'jsonpath' as ViewType,
    label: 'JSONPath',
    icon: Search,
  },
]

const viewDescriptions: Record<ViewType, string> = {
  anonymize: 'Anonymize JSON data, masking or replacing sensitive fields to protect privacy.',
  generate: 'Generate synthetic JSON data based on your schema or example for testing and development.',
  swagger: 'Generate a Swagger (OpenAPI) specification from a sample JSON payload.',
  swaggerToJson: 'Generate example JSON payloads directly from a Swagger/OpenAPI specification.',
  validator: 'Validate JSON documents against a specified schema to ensure correctness.',
  jsonpath: 'Extract data from JSON using JSONPath expressions.',
}

export function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const getViewTitle = (view: ViewType) => {
    const item = navigationItems.find(item => item.key === view)
    return item?.label || 'JSONnymous'
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <img
              src={logoPng}
              alt="JSONnymous logo"
              className="w-8 h-8 rounded-md object-cover"
            />
            <h1 className="text-xl font-semibold">JSONnymous</h1>
          </div>
          
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.key}
                  variant={currentView === item.key ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => onViewChange(item.key)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-col gap-1 px-6 py-3">
            <h2 className="text-lg font-semibold">
              {getViewTitle(currentView)}
            </h2>
            <Badge variant="secondary">
              {viewDescriptions[currentView]}
            </Badge>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
} 