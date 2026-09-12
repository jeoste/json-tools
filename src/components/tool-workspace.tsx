import { cn } from '@/lib/utils'

interface ToolWorkspaceProps {
  children: React.ReactNode
  className?: string
  columns?: 1 | 2
}

export function ToolWorkspace({
  children,
  className,
  columns = 2,
}: ToolWorkspaceProps) {
  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col overflow-x-hidden overflow-y-auto p-4 lg:p-5',
        columns === 2 && 'lg:overflow-hidden',
        className
      )}
    >
      <div
        className={cn(
          'grid min-h-0 gap-4 [&>*]:min-w-0',
          columns === 2
            ? 'grid-cols-1 lg:h-full lg:flex-1 lg:grid-cols-2'
            : 'grid-cols-1 content-start'
        )}
      >
        {children}
      </div>
    </div>
  )
}
