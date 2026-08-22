import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function SettingsHeading({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-pretty font-sans text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function SettingsCard({
  title,
  description,
  children,
  className,
}: {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-5 rounded-2xl border border-border bg-card p-6',
        className
      )}
    >
      {title ? (
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  )
}
