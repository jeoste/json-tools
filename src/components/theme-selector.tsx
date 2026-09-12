import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useTheme, type Theme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

interface ThemeSelectorProps {
  compact?: boolean
}

export function ThemeSelector({ compact = false }: ThemeSelectorProps) {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  const isDark = theme === 'dark'
  const Icon = isDark ? Sun : Moon
  const label = isDark ? t('theme.light') : t('theme.dark')

  return (
    <Button
      variant="ghost"
      size={compact ? 'icon' : 'default'}
      className={cn(
        'font-normal text-muted-foreground hover:text-foreground',
        compact ? 'h-8 w-8 shrink-0' : 'w-full justify-start'
      )}
      onClick={toggleTheme}
      title={t('theme.tooltip')}
      aria-label={t('theme.tooltip')}
    >
      <Icon className="h-4 w-4" />
      {!compact && <span className="ml-2">{label}</span>}
    </Button>
  )
}
