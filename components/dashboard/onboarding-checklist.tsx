'use client'

import { useState, useEffect, useCallback } from 'react'
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
  FileText,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OnboardingState {
  profileComplete: boolean
  socialConnected: boolean
  firstPostCreated: boolean
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

const ITEMS: ChecklistItem[] = [
  {
    id: 'profileComplete',
    label: 'Set up your business profile',
    description: 'Tell us about your business so we can tailor your content strategy.',
    icon: User,
    href: '/onboarding',
    cta: 'Complete profile',
  },
  {
    id: 'socialConnected',
    label: 'Connect a social account',
    description: 'Link Instagram, Facebook, or LinkedIn to start scheduling posts.',
    icon: Link2,
    href: '/dashboard/connections',
    cta: 'Connect accounts',
  },
  {
    id: 'contentGenerated',
    label: 'Generate your first content plan',
    description: "Use AI to generate a week's worth of posts tailored to your brand.",
    icon: Sparkles,
    href: '/dashboard',
    cta: 'Generate plan',
  },
  {
    id: 'firstPostCreated',
    label: 'Create your first post',
    description: 'Write or AI-draft a post and add it to your content library.',
    icon: FileText,
    href: '/dashboard/posts',
    cta: 'Create post',
  },
  {
    id: 'firstPostScheduled',
    label: 'Schedule a post',
    description: 'Pick a date and time to automatically publish your content.',
    icon: CalendarCheck,
    href: '/dashboard/calendar',
    cta: 'Open planner',
  },
]

const STORAGE_KEY = 'mm_onboarding_dismissed'

// ─── Component ────────────────────────────────────────────────────────────────

export function OnboardingChecklist({ state }: { state: OnboardingState }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (dismissed === 'true') setIsDismissed(true)
  }, [])

  const handleDismiss = useCallback(() => {
    setIsDismissed(true)
    localStorage.setItem(STORAGE_KEY, 'true')
  }, [])

  const completedCount = ITEMS.filter((item) => state[item.id]).length
  const totalCount = ITEMS.length
  const allDone = completedCount === totalCount
  const progress = (completedCount / totalCount) * 100

  if (!mounted || isDismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 120, damping: 22 }}
        className="relative rounded-2xl overflow-hidden border border-transparent dark:border-white/8 bg-white dark:bg-white/3 backdrop-blur-xl shadow-xl mb-6"
      >
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-blue-500/60 via-indigo-400/40 to-transparent" />

        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-blue-600/8 blur-[80px] rounded-full pointer-events-none" />

        {/* ── Header ── */}
        <div className="flex items-center gap-4 px-6 py-5 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.12)]">
            <Rocket className="w-5 h-5 text-blue-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">
                {allDone ? "You're all set! 🎉" : 'Getting started'}
              </h2>
              {allDone && (
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                  Complete
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Progress bar */}
              <div className="flex-1 h-1 rounded-full bg-white dark:bg-white/8 border-zinc-200 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-linear-to-r from-blue-500 to-indigo-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-white/40 font-mono shrink-0">
                {completedCount}/{totalCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsCollapsed((c) => !c)}
              className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-white/6 text-zinc-500 hover:text-zinc-900 dark:hover:text-white/60 flex items-center justify-center transition-colors border-transparent"
              aria-label={isCollapsed ? 'Expand checklist' : 'Collapse checklist'}
            >
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-white/6 text-zinc-500 hover:text-zinc-900 dark:hover:text-white/60 flex items-center justify-center transition-colors border-transparent"
              aria-label="Dismiss onboarding checklist"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Checklist Items ── */}
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              key="checklist-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-5 space-y-1 relative z-10">
                <div className="h-px bg-white dark:bg-white/5 border-zinc-200 mb-4" />
                {ITEMS.map((item, i) => {
                  const done = state[item.id]
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 + 0.05 }}
                      className={`group flex items-start gap-4 rounded-xl px-4 py-3 transition-colors ${
                        done
                          ? 'opacity-50'
                          : 'hover:bg-white/[0.035] cursor-default'
                      }`}
                    >
                      {/* Status icon */}
                      <div className="mt-0.5 shrink-0">
                        {done ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-zinc-500 dark:text-white/20" />
                        )}
                      </div>

                      {/* Step icon */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                          done
                            ? 'bg-blue-500/8 border-blue-500/15'
                            : 'bg-white dark:bg-white/4 border-transparent dark:border-white/8 group-hover:bg-white dark:group-hover:bg-white/6 dark:group-hover:border-white/12'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${done ? 'text-blue-400/70' : 'text-zinc-500 dark:text-white/40'}`} />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[13px] font-medium leading-snug ${
                            done ? 'line-through text-zinc-500 dark:text-white/30' : 'text-zinc-500 dark:text-white/80'
                          }`}
                        >
                          {item.label}
                        </p>
                        {!done && (
                          <p className="text-[11px] text-zinc-500 dark:text-white/30 mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* CTA */}
                      {!done && (
                        <Link
                          href={item.href}
                          className="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/8 hover:bg-blue-500/14 border border-blue-500/20 hover:border-blue-500/30 px-3 py-1.5 rounded-lg transition-all mt-0.5 whitespace-nowrap"
                        >
                          {item.cta}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </motion.div>
                  )
                })}

                {allDone && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/8 px-5 py-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">Setup complete!</p>
                      <p className="text-xs text-zinc-500 dark:text-white/40 mt-0.5">
                        You're ready to grow your business with Marketme.
                      </p>
                    </div>
                    <button
                      onClick={handleDismiss}
                      className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/12 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1.5 rounded-lg transition-all"
                    >
                      Dismiss
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
