import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'ko', label: '한국어', short: 'KO' },
] as const

interface LanguageSelectorProps {
  compact?: boolean
}

export function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage ?? i18n.language
  const currentLang = languages.find((l) => l.code === current) ?? languages[0]

  const handleChange = (value: string) => {
    if (value !== current) {
      i18n.changeLanguage(value)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? 'sm' : 'default'}
          className={cn(
            'font-normal text-muted-foreground hover:text-foreground',
            compact ? 'h-8 flex-1 px-2' : 'w-full justify-start'
          )}
        >
          <span className="text-[11px] font-medium tracking-wide">{currentLang.short}</span>
          {!compact && <span className="ml-2">{currentLang.label}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup value={current} onValueChange={handleChange}>
          {languages.map((lang) => (
            <DropdownMenuRadioItem key={lang.code} value={lang.code}>
              <span className="mr-2 w-6 text-[11px] font-medium tracking-wide text-muted-foreground">
                {lang.short}
              </span>
              {lang.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
