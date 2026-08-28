'use client'

import { Check, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type AppSelectProps = {
  value: string
  placeholder?: string
  options: readonly string[]
  onChange: (value: string) => void
  /** Dark marketing/onboarding shell vs light dashboard forms */
  tone?: 'onboarding' | 'surface'
  className?: string
  'aria-label'?: string
}

export function AppSelect({
  value,
  placeholder = 'Select…',
  options,
  onChange,
  tone = 'surface',
  className,
  'aria-label': ariaLabel,
}: AppSelectProps) {
  const isOnboarding = tone === 'onboarding'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        aria-label={ariaLabel}
        className={cn(
          'group flex h-12 w-full items-center justify-between gap-2 rounded-xl border px-3 text-left text-base outline-none ui-transition',
          isOnboarding
            ? 'border-white/15 bg-white/8 text-white hover:border-white/25 focus-visible:border-blue-400/60 data-popup-open:border-blue-400/60'
            : 'border-zinc-200 bg-white text-zinc-900 shadow-inner hover:border-zinc-300 focus-visible:ring-1 focus-visible:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/20',
          !value && (isOnboarding ? 'text-white/30' : 'text-zinc-400 dark:text-white/30'),
          className
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 transition-transform group-data-popup-open:rotate-180',
            isOnboarding ? 'text-white/40' : 'text-zinc-400 dark:text-white/35'
          )}
          aria-hidden
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className={cn(
          'max-h-64 w-(--anchor-width) overflow-y-auto rounded-xl p-1.5 shadow-xl ring-0',
          isOnboarding
            ? 'border border-white/12 bg-[#12161e] text-white'
            : 'border border-zinc-200 bg-white text-zinc-900 dark:border-white/12 dark:bg-[#12161e] dark:text-white'
        )}
      >
        {options.map((opt) => {
          const selected = value === opt
          return (
            <DropdownMenuItem
              key={opt}
              onClick={() => onChange(opt)}
              className={cn(
                'cursor-pointer justify-between rounded-lg px-3 py-2.5 text-sm transition-colors',
                selected
                  ? isOnboarding
                    ? 'bg-blue-500/15 text-blue-300 focus:bg-blue-500/20 focus:text-blue-200'
                    : 'bg-blue-500/10 text-blue-600 focus:bg-blue-500/15 focus:text-blue-600 dark:text-blue-300 dark:focus:text-blue-200'
                  : isOnboarding
                    ? 'text-white/65 focus:bg-white/8 focus:text-white'
                    : 'text-zinc-600 focus:bg-zinc-100 focus:text-zinc-900 dark:text-white/60 dark:focus:bg-white/8 dark:focus:text-white'
              )}
            >
              <span className="truncate">{opt}</span>
              {selected ? (
                <Check
                  className={cn(
                    'size-3.5 shrink-0',
                    isOnboarding ? 'text-blue-400' : 'text-blue-500 dark:text-blue-400'
                  )}
                />
              ) : null}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
