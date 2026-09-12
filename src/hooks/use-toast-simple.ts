import { toast as sonnerToast } from 'sonner'

type ToastProps = {
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info'
}

const quiet = {
  background: 'hsl(var(--card))',
  color: 'hsl(var(--foreground))',
  border: '1px solid hsl(var(--border))',
} as const

export const useToast = () => {
  const toast = ({ title, description, variant = 'success' }: ToastProps) => {
    const options = { description, style: quiet }

    switch (variant) {
      case 'destructive':
        sonnerToast.error(title, options)
        break
      case 'warning':
        sonnerToast.warning(title, options)
        break
      case 'info':
        sonnerToast.info(title, options)
        break
      case 'success':
      default:
        sonnerToast.success(title, options)
        break
    }
  }

  return { toast }
}
