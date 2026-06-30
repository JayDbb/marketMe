'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

/** Full-bleed backdrop: deep navy + sky mesh, on-brand with the dashboard. */
export function AuthBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[#0a0e14]" />
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 15% 20%, rgba(56, 189, 248, 0.22) 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 85% 75%, rgba(59, 130, 246, 0.18) 0%, transparent 50%),
            radial-gradient(ellipse 50% 40% at 70% 15%, rgba(20, 184, 166, 0.1) 0%, transparent 45%),
            linear-gradient(160deg, #0a0e14 0%, #0d1520 40%, #0a1018 100%)
          `,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[48px_48px] opacity-60" />
      {/* Abstract floating "scheduled post" shapes */}
      <div className="absolute top-[12%] left-[8%] h-28 w-44 rotate-[-8deg] rounded-2xl border border-sky-400/15 bg-sky-500/8 blur-[0.5px] shadow-[0_20px_60px_rgba(14,165,233,0.12)]" />
      <div className="absolute bottom-[18%] right-[10%] h-32 w-48 rotate-[6deg] rounded-2xl border border-blue-400/12 bg-blue-500/6 blur-[0.5px] shadow-[0_24px_70px_rgba(59,130,246,0.1)]" />
      <div className="absolute top-[42%] right-[18%] h-20 w-32 rotate-[12deg] rounded-xl border border-white/6 bg-white/4" />
      <div className="absolute bottom-[32%] left-[14%] h-16 w-28 rotate-[-4deg] rounded-xl border border-teal-400/10 bg-teal-500/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0e14_78%)]" />
    </div>
  )
}

export function AuthShell({
  mode,
  headline,
  alternatePrompt,
  alternateHref,
  alternateLabel,
  children,
}: {
  mode: 'login' | 'signup'
  headline: string
  alternatePrompt: string
  alternateHref: string
  alternateLabel: string
  children: React.ReactNode
}) {
  return (
    <main id="main-content" className="relative min-h-dvh font-sans text-zinc-900 selection:bg-sky-500/20">
      <AuthBackdrop />
      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 24 }}
          className="w-full max-w-[440px] rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.45)] sm:p-10"
        >
          <Link href="/" className="mb-8 inline-flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-transform group-hover:scale-[1.02]">
              <Activity className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-serif text-lg tracking-tight text-zinc-900">Marketme</span>
          </Link>

          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{headline}</h1>
          <p className="mt-2 text-sm text-zinc-500">
            {alternatePrompt}{' '}
            <Link
              href={alternateHref}
              className="font-medium text-zinc-900 underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-500"
            >
              {alternateLabel}
            </Link>
          </p>

          <div className="mt-8">{children}</div>

          <p className="mt-8 text-center text-[11px] text-zinc-400">
            {mode === 'login' ? 'Secure sign-in' : '14-day free trial'} · Marketme
          </p>
        </motion.div>
      </div>
    </main>
  )
}
