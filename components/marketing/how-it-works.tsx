'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Link2,
  Sparkles,
  CalendarDays,
  CheckCircle2,
  Camera,
  Plus,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
  {
    id: 0,
    number: '01',
    title: 'Connect Instagram',
    detail: 'Link your Instagram Business or Creator account through the official Meta OAuth flow.',
    icon: Link2,
  },
  {
    id: 1,
    number: '02',
    title: 'Create or generate',
    detail: 'Write yourself or let AI draft — then review before anything schedules.',
    icon: Sparkles,
  },
  {
    id: 2,
    number: '03',
    title: 'Schedule when ready',
    detail: 'Place posts on the calendar and publish on your timeline.',
    icon: CalendarDays,
  },
]

const fade = {
  duration: 0.22,
  ease: [0.23, 1, 0.32, 1] as const,
}

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0)
  const reduceMotion = useReducedMotion()

  return (
    <section className="border-t border-white/8 bg-transparent py-24">
      <div className="mx-auto max-w-6xl space-y-12 px-6">
        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400/80">
              Workflow
            </p>
            <h2 className="font-serif text-3xl font-light leading-tight tracking-tight text-white md:text-5xl">
              How it works
            </h2>
          </div>
          <p className="max-w-md text-sm text-white/45 md:justify-self-end md:text-base">
            Three steps. Generation is a draft step — you stay in the loop.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div
            className="flex flex-col gap-2"
            role="tablist"
            aria-label="How Marketme works"
          >
            {steps.map((step) => {
              const isActive = activeStep === step.id
              return (
                <button
                  key={step.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  id={`how-step-${step.id}`}
                  aria-controls="how-it-works-panel"
                  onClick={() => setActiveStep(step.id)}
                  className={cn(
                    'rounded-2xl border p-5 text-left transition-[border-color,background-color] duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80',
                    'active:scale-[0.99]',
                    isActive
                      ? 'border-sky-400/50 bg-sky-400/10'
                      : 'border-white/8 bg-white/4 hover:border-white/12 hover:bg-white/6'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/6">
                      <step.icon
                        className={cn('h-5 w-5', isActive ? 'text-sky-400' : 'text-white/60')}
                        aria-hidden="true"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <h3 className="font-serif text-lg font-medium text-white">{step.title}</h3>
                        <span
                          className={cn(
                            'font-mono text-xs tracking-widest',
                            isActive ? 'text-sky-400' : 'text-white/30'
                          )}
                        >
                          {step.number}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-white/40">{step.detail}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div
            id="how-it-works-panel"
            role="tabpanel"
            aria-labelledby={`how-step-${activeStep}`}
            className="relative w-full overflow-hidden rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm"
          >
            <div className="flex h-10 items-center border-b border-white/8 bg-black/20 px-4">
              <div className="flex gap-1.5" aria-hidden="true">
                <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 text-[10px] font-medium tracking-wide text-white/30">
                marketme.app
              </div>
            </div>

            <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-background/50 p-6">
              <AnimatePresence mode="wait">
                {activeStep === 0 && (
                  <motion.div
                    key="step0"
                    initial={reduceMotion ? false : { opacity: 0, transform: 'translateY(8px)' }}
                    animate={{ opacity: 1, transform: 'translateY(0px)' }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-8px)' }}
                    transition={fade}
                    className="grid w-full max-w-lg grid-cols-2 gap-4"
                  >
                    {[
                      { icon: Camera, name: 'Instagram', connected: true },
                      { icon: Plus, name: 'More channels later', dashed: true },
                    ].map((platform) => (
                      <div
                        key={platform.name}
                        className={cn(
                          'relative flex flex-col items-center justify-center gap-3 rounded-xl p-5',
                          platform.dashed
                            ? 'border border-dashed border-white/20'
                            : platform.connected
                              ? 'border border-white/10 bg-white/5'
                              : 'opacity-50'
                        )}
                      >
                        <platform.icon
                          className={cn('h-6 w-6', platform.connected ? 'text-white' : 'text-white/40')}
                          aria-hidden="true"
                          strokeWidth={1.5}
                        />
                        <span
                          className={cn(
                            'text-[10px] font-medium uppercase tracking-widest',
                            platform.connected ? 'text-white/80' : 'text-white/40'
                          )}
                        >
                          {platform.name}
                        </span>
                        {platform.connected ? (
                          <CheckCircle2
                            className="absolute top-2.5 right-2.5 h-4 w-4 text-sky-400"
                            aria-hidden="true"
                          />
                        ) : null}
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={reduceMotion ? false : { opacity: 0, transform: 'translateY(8px)' }}
                    animate={{ opacity: 1, transform: 'translateY(0px)' }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-8px)' }}
                    transition={fade}
                    className="flex w-full max-w-lg flex-col gap-4 rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-center gap-2 font-mono text-xs text-white/50">
                      <Sparkles className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                      AI draft
                    </div>
                    <div className="min-h-[100px] rounded-lg border border-border bg-background p-4 text-sm leading-relaxed text-white/80">
                      Weekend brunch specials are live — two courses, courtyard seats, and
                      coffee on the house before noon.
                      <br />
                      <br />
                      <span className="text-sky-400">#KingstonEats #WeekendBrunch</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex h-8 items-center gap-1.5 rounded border border-amber-500/30 bg-amber-500/15 px-3 text-xs text-amber-200/90">
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        Needs your review
                      </div>
                      <div className="flex h-8 items-center rounded border border-white/10 bg-white/5 px-3 text-xs text-white/40">
                        Instagram
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={reduceMotion ? false : { opacity: 0, transform: 'translateY(8px)' }}
                    animate={{ opacity: 1, transform: 'translateY(0px)' }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-8px)' }}
                    transition={fade}
                    className="flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <div className="flex h-10 items-center justify-between border-b border-border px-4 text-xs">
                      <span className="text-white/40">Calendar</span>
                      <span className="flex items-center gap-1.5 text-sky-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-400" aria-hidden="true" />
                        Next publish in 2h 14m
                      </span>
                    </div>
                    <div className="grid h-[200px] grid-cols-5 divide-x divide-border bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[100%_40px]">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                        <div key={day} className="relative flex flex-col gap-2 p-2">
                          <span className="text-[9px] uppercase tracking-widest text-white/30">
                            {day}
                          </span>
                          {i === 0 ? (
                            <div className="h-10 w-full rounded border border-emerald-500/30 bg-emerald-500/20" />
                          ) : null}
                          {i === 1 ? (
                            <div className="h-10 w-full rounded border border-sky-500/30 bg-sky-500/20" />
                          ) : null}
                          {i === 3 ? (
                            <div className="h-10 w-full rounded border border-white/15 bg-white/10" />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
