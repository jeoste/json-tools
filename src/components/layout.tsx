import {
  Lock,
  Zap,
  FileText,
  CheckCircle,
  Search,
  ChevronDown,
  ChevronRight,
  Code2,
  FileCode,
  Shuffle,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ViewType } from '@/App'
import logoPng from '@/assets/logo.png'
import { cn } from '@/lib/utils'
import { LanguageSelector } from '@/components/language-selector'
import { ThemeSelector } from '@/components/theme-selector'
import { useTranslation } from 'react-i18next'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useIsMobile } from '@/hooks/use-mobile'
import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

interface NavigationItem {
  key: ViewType
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavigationCategory {
  category: string
  icon: React.ComponentType<{ className?: string }>
  tools: NavigationItem[]
}

export function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    JSON: true,
    XML: true,
  })

  const allTools: Record<ViewType, NavigationItem> = {
    anonymize: {
      key: 'anonymize',
      label: t('layout.navigation.anonymize'),
      icon: Lock,
    },
    generate: {
      key: 'generate',
      label: t('layout.navigation.generate'),
      icon: Zap,
    },
    swagger: {
      key: 'swagger',
      label: t('layout.navigation.swagger'),
      icon: FileText,
    },
    swaggerToJson: {
      key: 'swaggerToJson',
      label: t('layout.navigation.swaggerToJson'),
      icon: FileText,
    },
    validator: {
      key: 'validator',
      label: t('layout.navigation.validator'),
      icon: CheckCircle,
    },
    jsonpath: {
      key: 'jsonpath',
      label: t('layout.navigation.jsonpath'),
      icon: Search,
    },
    xmlValidate: {
      key: 'xmlValidate',
      label: t('layout.navigation.xmlValidate'),
      icon: CheckCircle,
    },
    xmlPath: {
      key: 'xmlPath',
      label: t('layout.navigation.xmlPath'),
      icon: Search,
    },
    generateXml: {
      key: 'generateXml',
      label: t('layout.navigation.generateXml'),
      icon: Zap,
    },
    randomJson: {
      key: 'randomJson',
      label: t('layout.navigation.randomJson'),
      icon: Shuffle,
    },
    randomXml: {
      key: 'randomXml',
      label: t('layout.navigation.randomXml'),
      icon: Shuffle,
    },
  }

  const navigationCategories: NavigationCategory[] = [
    {
      category: 'JSON',
      icon: Code2,
      tools: [
        allTools.generate,
        allTools.randomJson,
        allTools.anonymize,
        allTools.validator,
        allTools.jsonpath,
        allTools.swagger,
        allTools.swaggerToJson,
      ],
    },
    {
      category: 'XML',
      icon: FileCode,
      tools: [
        allTools.generateXml,
        allTools.randomXml,
        allTools.xmlValidate,
        allTools.xmlPath,
      ],
    },
  ]

  const viewDescriptions: Record<ViewType, string> = {
    anonymize: t('layout.descriptions.anonymize'),
    generate: t('layout.descriptions.generate'),
    swagger: t('layout.descriptions.swagger'),
    swaggerToJson: t('layout.descriptions.swaggerToJson'),
    validator: t('layout.descriptions.validator'),
    jsonpath: t('layout.descriptions.jsonpath'),
    xmlValidate: t('layout.descriptions.xmlValidate'),
    xmlPath: t('layout.descriptions.xmlPath'),
    generateXml: t('layout.descriptions.generateXml'),
    randomJson: t('layout.descriptions.randomJson'),
    randomXml: t('layout.descriptions.randomXml'),
  }

  const handleNavigate = (view: ViewType) => {
    onViewChange(view)
    setMobileOpen(false)
  }

  const sidebar = (
    <SidebarPanel
      appName={t('layout.appName')}
      categories={navigationCategories}
      currentView={currentView}
      openCategories={openCategories}
      onToggleCategory={(category) =>
        setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }))
      }
      onNavigate={handleNavigate}
    />
  )

  return (
    <div className="flex h-dvh bg-background">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        {sidebar}
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-56 gap-0 bg-sidebar p-0 text-sidebar-foreground duration-200"
        >
          <SheetTitle className="sr-only">{t('layout.appName')}</SheetTitle>
          {sidebar}
        </SheetContent>
      </Sheet>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border px-4 py-2.5 md:items-start md:px-5 md:py-3">
          {isMobile && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setMobileOpen(true)}
              aria-label={t('layout.openMenu')}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <div className="min-w-0">
            <h2 className="text-[15px] font-medium leading-tight">
              {allTools[currentView]?.label || t('layout.appName')}
            </h2>
            <p className="mt-1 hidden max-w-3xl text-xs leading-relaxed text-muted-foreground md:block">
              {viewDescriptions[currentView]}
            </p>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </main>
    </div>
  )
}

function SidebarPanel({
  appName,
  categories,
  currentView,
  openCategories,
  onToggleCategory,
  onNavigate,
}: {
  appName: string
  categories: NavigationCategory[]
  currentView: ViewType
  openCategories: Record<string, boolean>
  onToggleCategory: (category: string) => void
  onNavigate: (view: ViewType) => void
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 px-3 py-3">
        <img
          src={logoPng}
          alt=""
          className="h-7 w-7 rounded-md object-cover"
        />
        <p className="text-sm font-medium tracking-tight">{appName}</p>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {categories.map((category) => {
          const CategoryIcon = category.icon
          const isOpen = openCategories[category.category]
          return (
            <Collapsible
              key={category.category}
              open={isOpen}
              onOpenChange={() => onToggleCategory(category.category)}
            >
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex h-8 w-full items-center justify-between rounded-md px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <span className="flex items-center gap-2">
                    <CategoryIcon className="h-3.5 w-3.5" />
                    {category.category}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mb-2 mt-0.5 space-y-0.5">
                {category.tools.map((tool) => {
                  const ToolIcon = tool.icon
                  const active = currentView === tool.key
                  return (
                    <button
                      key={tool.key}
                      type="button"
                      className={cn(
                        'flex h-8 w-full items-center rounded-md px-2 text-[13px]',
                        active
                          ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                          : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                      )}
                      onClick={() => onNavigate(tool.key)}
                    >
                      <ToolIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{tool.label}</span>
                    </button>
                  )
                })}
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </nav>

      <div className="mt-auto flex items-center gap-1 border-t border-sidebar-border p-2">
        <LanguageSelector compact />
        <ThemeSelector compact />
      </div>
    </div>
  )
}
