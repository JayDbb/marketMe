'use client'

import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

type NoticeTone = 'info' | 'success' | 'warning' | 'error'

const NOTICE_STYLES: Record<
  NoticeTone,
  {
    icon: typeof Info
    className: string
  }
> = {
  info: {
    icon: Info,
    className: 'border-sky-500/25 bg-sky-500/10 text-sky-900 dark:text-sky-100',
  },
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100',
  },
  warning: {
    icon: TriangleAlert,
    className: 'border-amber-500/25 bg-amber-500/10 text-amber-900 dark:text-amber-100',
  },
  error: {
    icon: AlertCircle,
    className: 'border-red-500/25 bg-red-500/10 text-red-900 dark:text-red-100',
  },
}

export function InlineNotice({
  tone = 'info',
  title,
  description,
  className,
}: {
  tone?: NoticeTone
  title?: ReactNode
  description: ReactNode
  className?: string
}) {
  const { icon: Icon, className: toneClassName } = NOTICE_STYLES[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={cn('rounded-xl border px-4 py-3', toneClassName, className)}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          {title ? <p className="text-sm font-semibold">{title}</p> : null}
          <div className={cn('text-sm leading-relaxed', title ? 'mt-0.5' : null)}>
            {description}
          </div>
        </div>
      </div>
    </div>
  )
}
