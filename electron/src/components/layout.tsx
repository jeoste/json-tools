import { Lock, Zap, FileText, CheckCircle, Search, Info, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ViewType } from '@/App'
import logoPng from '../../assets/logo_bracket.png'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { LanguageSelector } from '@/components/language-selector'

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

  const appVersion = '0.1.0' // TODO: dynamically load from package.json or env

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <img
              src={logoPng}
              alt="JSONnymous logo"
              className="w-8 h-8 rounded-md object-cover"
            />
            <h1 className="text-xl font-medium">JSONnymous</h1>
          </div>
          
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.key}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start font-normal",
                    currentView === item.key
                      ? "border-l-4 border-primary bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  )}
                  onClick={() => onViewChange(item.key)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              )
            })}
          </nav>

          {/* Sélecteur de langue */}
          <div className="mt-6">
            <LanguageSelector />
          </div>
        </div>

        {/* Account & About section */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex items-center gap-2 p-6 border-t border-border text-muted-foreground hover:text-foreground hover:bg-accent/40">
              <User className="w-4 h-4" />
              Account
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Account</SheetTitle>
              <SheetDescription>
                Manage your profile and synchronize settings between web & desktop (coming soon).
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <p>Feature under development.</p>
            </div>
          </SheetContent>
        </Sheet>

        {/* About section */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex items-center gap-2 p-6 border-t border-border text-muted-foreground hover:text-foreground hover:bg-accent/40">
              <Info className="w-4 h-4" />
              About
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>About JSONnymous</SheetTitle>
              <SheetDescription>
                Version {appVersion}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <p>You can reach us at <a href="mailto:contact@neungbo.com" className="underline text-primary">contact@neungbo.com</a>.</p>
              <Button onClick={() => {/* TODO: implement updater */}}>
                Check for updates
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-col gap-1 px-6 py-3">
            <h2 className="text-lg font-medium">
              {getViewTitle(currentView)}
            </h2>
            <p className="max-w-prose text-sm leading-relaxed text-foreground/80">
              {viewDescriptions[currentView]}
            </p>
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