'use client'

import { useState, useCallback } from 'react'
import { useIsClient } from '@/hooks/use-is-client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  Circle,
  Rocket,
  User,
  Link2,
  CalendarCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

export interface OnboardingState {
  profileComplete: boolean
  socialConnected: boolean
  firstPostScheduled: boolean
  contentGenerated: boolean
}

interface ChecklistItem {
  id: keyof OnboardingState
  label: string
  description: string
  icon: React.ElementType
  href: string
  cta: string
}

function checklistItems(state: OnboardingState): ChecklistItem[] {
  return [
    {
      id: 'profileComplete',
      label: 'Complete your profile',
      description: 'A 2-minute brief gives the AI your audience, voice, and offer.',
      icon: User,
      href: state.profileComplete
        ? '/dashboard/settings?tab=Workspace'
        : '/onboarding',
      cta: 'Complete profile',
    },
    {
      id: 'socialConnected',
      label: 'Connect Instagram',
      description: 'Link a Business or Creator account so you can publish and inbox.',
      icon: Link2,
      href: '/dashboard/connections',
      cta: 'Connect Instagram',
    },
    {
      id: 'contentGenerated',
      label: 'Generate a content plan',
      description: 'Create a week of posts tailored to your brand.',
      icon: Sparkles,
      href: '/dashboard/generate',
      cta: 'Generate plan',
    },
    {
      id: 'firstPostScheduled',
      label: 'Schedule a post',
      description: 'Pick a date and time to publish from Planner.',
      icon: CalendarCheck,
      href: '/dashboard/calendar',
      cta: 'Open planner',
    },
  ]
}

const STORAGE_KEY = 'mm_onboarding_dismissed'

export function OnboardingChecklist({ state }: { state: OnboardingState }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })
  const mounted = useIsClient()

  const handleDismiss = useCallback(() => {
    setIsDismissed(true)
    localStorage.setItem(STORAGE_KEY, 'true')
  }, [])

  const items = checklistItems(state)
  const completedCount = items.filter((item) => state[item.id]).length
  const totalCount = items.length
  const allDone = completedCount === totalCount
  const progress = (completedCount / totalCount) * 100

  if (!mounted || isDismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card"
      >
        <div className="relative z-10 flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
            <Rocket className="size-5 text-blue-400" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                {allDone ? "You're all set" : 'Getting started'}
              </h2>
              {allDone ? (
                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-blue-400">
                  Complete
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                {completedCount}/{totalCount}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setIsCollapsed((c) => !c)}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground ui-transition hover:bg-muted hover:text-foreground"
              aria-label={isCollapsed ? 'Expand checklist' : 'Collapse checklist'}
            >
              {isCollapsed ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronUp className="size-4" />
              )}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground ui-transition hover:bg-muted hover:text-foreground"
              aria-label="Dismiss onboarding checklist"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              key="checklist-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <div className="relative z-10 flex flex-col gap-1 px-4 pb-4 sm:px-6 sm:pb-5">
                <div className="mb-4 h-px bg-border" />
                {items.map((item) => {
                  const done = state[item.id]
                  const Icon = item.icon
                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col gap-2.5 rounded-xl px-2 py-3 sm:flex-row sm:items-start sm:gap-4 sm:px-4 ${
                        done ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {done ? (
                          <CheckCircle2 className="size-5 text-blue-400" />
                        ) : (
                          <Circle className="size-5 text-muted-foreground/40" />
                        )}
                      </div>

                      <div
                        className={`hidden size-8 shrink-0 items-center justify-center rounded-lg border sm:flex ${
                          done
                            ? 'border-blue-500/15 bg-blue-500/8'
                            : 'border-border bg-muted/40'
                        }`}
                      >
                        <Icon
                          className={`size-4 ${done ? 'text-blue-400/70' : 'text-muted-foreground'}`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-[13px] font-medium leading-snug ${
                            done ? 'text-muted-foreground line-through' : 'text-foreground'
                          }`}
                        >
                          {item.label}
                        </p>
                        {!done ? (
                          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                      </div>

                      {!done ? (
                        <Link
                          href={item.href}
                          className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/8 px-3 text-[11px] font-semibold text-blue-400 ui-transition hover:border-blue-500/30 hover:bg-blue-500/14 hover:text-blue-300 sm:mt-0.5 sm:h-auto sm:w-auto sm:justify-start sm:py-1.5"
                        >
                          {item.cta}
                          <ArrowRight className="size-3" />
                        </Link>
                      ) : null}
                    </div>
                  )
                })}

                {allDone ? (
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/8 px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Setup complete</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Connect, generate, and schedule from here.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="rounded-lg border border-blue-500/20 bg-blue-500/12 px-3 py-1.5 text-[11px] font-semibold text-blue-400 ui-transition hover:bg-blue-500/20 hover:text-blue-300"
                    >
                      Dismiss
                    </button>
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
