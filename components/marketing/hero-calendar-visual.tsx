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
  if (status === 'published') {
    return (
      <div className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[9px] text-emerald-400">
        <Send className="h-2.5 w-2.5" aria-hidden="true" /> Published
      </div>
    );
  }
  if (status === 'scheduled') {
    return (
      <div className="flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/20 px-2 py-0.5 text-[9px] text-sky-300">
        <Clock className="h-2.5 w-2.5" aria-hidden="true" /> Scheduled
      </div>
    );
  }
  if (status === 'approved') {
    return (
      <div className="flex items-center gap-1 rounded-full border border-sky-400/25 bg-sky-500/15 px-2 py-0.5 text-[9px] text-sky-300">
        <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" /> Approved
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-white/30">
      <FileEdit className="h-2.5 w-2.5" aria-hidden="true" /> Draft
    </div>
  );
}

export function HeroCalendarVisual() {
  const prefersReducedMotion = useReducedMotion();

  return (
<<<<<<< HEAD
    <div className="relative w-full max-w-[800px] mx-auto mt-16 aspect-video perspective-[1000px]">
      <motion.div 
        initial={prefersReducedMotion ? false : { rotateX: 20, rotateY: -10, opacity: 0, y: 40 }}
        animate={prefersReducedMotion ? undefined : { rotateX: 10, rotateY: -5, opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="w-full h-full bg-[#1c2128] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ transformStyle: 'preserve-3d' }}
=======
    <div className="relative aspect-[4/3] w-full max-w-none sm:aspect-video">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, transform: 'translateY(16px) scale(0.98)' }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, transform: 'translateY(0px) scale(1)' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_80px_-24px_rgba(0,0,0,0.55)]"
>>>>>>> origin/development
      >
        <div className="relative flex h-12 items-center justify-between border-b border-border bg-background/80 px-4">
          <div className="z-10 flex gap-1.5" aria-hidden="true">
            <div className="h-3 w-3 rounded-full border border-white/20 bg-white/10" />
            <div className="h-3 w-3 rounded-full border border-white/20 bg-white/10" />
            <div className="h-3 w-3 rounded-full border border-white/20 bg-white/10" />
          </div>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-white/40">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              </span>
              Marketme — Content Calendar
            </div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-5 divide-x divide-border">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
            <div key={day} className="flex min-w-0 flex-col">
              <div className="flex h-8 items-center justify-center border-b border-border bg-background/40 text-[10px] font-medium uppercase tracking-widest text-white/40">
                {day}
              </div>
<<<<<<< HEAD
              <div className="flex-1 p-2 flex flex-col gap-2 relative bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[100%_40px] overflow-hidden">
                {/* Find post for this day */}
                {mockPosts.filter(p => p.day === day).map((post, j) => (
                  <motion.div
                    key={j}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10, scale: 0.95 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.6 + post.delay, duration: 0.5 }}
                    className="relative bg-[#0d1117] border border-[#30363d] rounded-lg p-2.5 shadow-xl shrink-0"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="w-4 h-4 rounded bg-white/10 shrink-0" />
                      <StatusBadge status={post.status} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 w-full bg-white/10 rounded-full" />
                      <div className="h-1.5 w-2/3 bg-white/10 rounded-full" />
                    </div>
                  </motion.div>
                ))}
=======
              <div className="relative flex flex-1 flex-col gap-2 overflow-hidden bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[100%_40px] p-2">
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
                      className="relative shrink-0 rounded-lg border border-border bg-background p-2.5"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="h-4 w-4 shrink-0 rounded bg-white/10" />
                        <StatusBadge status={post.status} />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-1.5 w-full rounded-full bg-white/10" />
                        <div className="h-1.5 w-2/3 rounded-full bg-white/10" />
                      </div>
                    </motion.div>
                  ))}
>>>>>>> origin/development
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
