'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Send, Clock, CheckCircle2, FileEdit } from 'lucide-react';

const mockPosts = [
  { day: 'Mon', status: 'published', delay: 0 },
  { day: 'Mon', status: 'approved', delay: 0.1 },
  { day: 'Tue', status: 'scheduled', delay: 0.2 },
  { day: 'Tue', status: 'draft', delay: 0.3 },
  { day: 'Wed', status: 'approved', delay: 0.4 },
  { day: 'Wed', status: 'scheduled', delay: 0.5 },
  { day: 'Wed', status: 'draft', delay: 0.6 },
  { day: 'Thu', status: 'published', delay: 0.7 },
  { day: 'Thu', status: 'draft', delay: 0.8 },
  { day: 'Fri', status: 'scheduled', delay: 0.9 },
  { day: 'Fri', status: 'approved', delay: 1.0 },
];

function StatusBadge({ status }: { status: string }) {
  const base =
    'flex size-5 shrink-0 items-center justify-center rounded-full border'

  if (status === 'published') {
    return (
      <div
        className={`${base} border-emerald-500/30 bg-emerald-500/20 text-emerald-400`}
        title="Published"
        aria-label="Published"
      >
        <Send className="h-2.5 w-2.5" aria-hidden="true" />
      </div>
    )
  }
  if (status === 'scheduled') {
    return (
      <div
        className={`${base} border-sky-500/30 bg-sky-500/20 text-sky-300`}
        title="Scheduled"
        aria-label="Scheduled"
      >
        <Clock className="h-2.5 w-2.5" aria-hidden="true" />
      </div>
    )
  }
  if (status === 'approved') {
    return (
      <div
        className={`${base} border-sky-400/25 bg-sky-500/15 text-sky-300`}
        title="Approved"
        aria-label="Approved"
      >
        <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />
      </div>
    )
  }
  return (
    <div
      className={`${base} border-white/10 bg-white/5 text-white/30`}
      title="Draft"
      aria-label="Draft"
    >
      <FileEdit className="h-2.5 w-2.5" aria-hidden="true" />
    </div>
  )
}

export function HeroCalendarVisual() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative aspect-[4/3] w-full max-w-none overflow-hidden sm:aspect-video">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, transform: 'translateY(16px) scale(0.98)' }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, transform: 'translateY(0px) scale(1)' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_80px_-24px_rgba(0,0,0,0.55)]"
      >
        <div className="relative flex h-10 items-center justify-between border-b border-border bg-background/80 px-3 sm:h-12 sm:px-4">
          <div className="z-10 flex gap-1.5" aria-hidden="true">
            <div className="h-2.5 w-2.5 rounded-full border border-white/20 bg-white/10 sm:h-3 sm:w-3" />
            <div className="h-2.5 w-2.5 rounded-full border border-white/20 bg-white/10 sm:h-3 sm:w-3" />
            <div className="h-2.5 w-2.5 rounded-full border border-white/20 bg-white/10 sm:h-3 sm:w-3" />
          </div>
          <div className="pointer-events-none absolute inset-0 hidden items-center justify-center sm:flex">
            <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-white/40">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              </span>
              Marketme — Content Calendar
            </div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-3 divide-x divide-border md:grid-cols-5">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, dayIndex) => (
            <div
              key={day}
              className={`flex min-w-0 flex-col ${dayIndex >= 3 ? 'hidden md:flex' : ''}`}
            >
              <div className="flex h-8 items-center justify-center border-b border-border bg-background/40 text-[10px] font-medium uppercase tracking-widest text-white/40">
                {day}
              </div>
              <div className="relative flex flex-1 flex-col gap-1.5 overflow-hidden bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[100%_40px] p-1.5 sm:gap-2 sm:p-2">
                {mockPosts
                  .filter((p) => p.day === day)
                  .map((post, j) => (
                    <motion.div
                      key={`${day}-${j}`}
                      initial={
                        prefersReducedMotion
                          ? false
                          : { opacity: 0, transform: 'translateY(8px) scale(0.97)' }
                      }
                      animate={
                        prefersReducedMotion
                          ? undefined
                          : { opacity: 1, transform: 'translateY(0px) scale(1)' }
                      }
                      transition={{ delay: 0.45 + post.delay * 0.35, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="relative shrink-0 rounded-lg border border-border bg-background p-1.5 sm:p-2.5"
                    >
                      <div className="mb-1.5 flex items-center justify-between sm:mb-2">
                        <div className="h-3 w-3 shrink-0 rounded bg-white/10 sm:h-4 sm:w-4" />
                        <StatusBadge status={post.status} />
                      </div>
                      <div className="space-y-1 sm:space-y-1.5">
                        <div className="h-1 w-full rounded-full bg-white/10 sm:h-1.5" />
                        <div className="h-1 w-2/3 rounded-full bg-white/10 sm:h-1.5" />
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
