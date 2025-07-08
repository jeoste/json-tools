import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslation } from 'react-i18next'
import { useTheme, type Theme } from '@/components/theme-provider'

const themes = [
  { value: 'light', icon: Sun, labelKey: 'theme.light' },
  { value: 'dark', icon: Moon, labelKey: 'theme.dark' },
  { value: 'system', icon: Monitor, labelKey: 'theme.system' },
] as const

export function ThemeSelector() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()

  const currentTheme = themes.find(t => t.value === theme) ?? themes[2] // default to system
  const CurrentIcon = currentTheme.icon

  const handleThemeChange = (value: string) => {
    if (value === 'light' || value === 'dark' || value === 'system') {
      setTheme(value as Theme)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-start font-normal text-muted-foreground hover:text-foreground"
          title={t('theme.tooltip')}
        >
          <CurrentIcon className="w-4 h-4 mr-2" />
          {t(currentTheme.labelKey)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
          {themes.map(themeOption => {
            const Icon = themeOption.icon
            return (
              <DropdownMenuRadioItem key={themeOption.value} value={themeOption.value}>
                <Icon className="w-4 h-4 mr-2" />
                {t(themeOption.labelKey)}
              </DropdownMenuRadioItem>
            )
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 