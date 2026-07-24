'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { PLANS } from '@/lib/billing-utils'
import type { PlanId } from '@/types/billing'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const planOrder: PlanId[] = ['free', 'pro', 'team']

const extras: Record<
  PlanId,
  { highlights: string[]; cta: string; recommended?: boolean }
> = {
  free: {
    highlights: [
      'Generate + Studio + Calendar',
      '1 social profile',
      'Human review before publish',
    ],
    cta: 'Start free',
  },
  pro: {
    highlights: [
      'Higher AI credits (500/mo)',
      'Up to 5 social profiles',
      '100 posts per month',
    ],
    cta: 'Upgrade to Pro',
    recommended: true,
  },
  team: {
    highlights: [
      'Unlimited posts & AI credits',
      'Up to 25 social profiles',
      '10 team members / 10 workspaces',
    ],
    cta: 'Choose Team',
  },
}

const comparisonRows: { label: string; key: keyof typeof PLANS.free.limits }[] = [
  { label: 'Workspaces', key: 'workspaces' },
  { label: 'Team members', key: 'teamMembers' },
  { label: 'Social profiles', key: 'socialProfiles' },
  { label: 'Posts / month', key: 'postsPerMonth' },
  { label: 'AI credits / month', key: 'aiCredits' },
]

const pricingFaqs = [
  {
    q: 'Is Free really free?',
    a: 'Yes. Free includes core Generate, Studio, and Calendar with limited posts and AI credits. No card required to start.',
  },
  {
    q: 'What happens when I hit my credit limit?',
    a: 'Generation pauses until credits reset with your billing period, or you upgrade. You can still edit and schedule existing drafts.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel before renewal to stop future charges. Access continues through the paid period you already bought. See Refunds & Billing for details.',
  },
  {
    q: 'Do you offer annual billing?',
    a: 'Annual options may appear at checkout when billing is enabled. The toggle below shows an illustrative yearly total at two months free.',
  },
]

function formatLimit(value: number | null): string {
  if (value === null) return 'Unlimited'
  return value.toLocaleString()
}

function priceFor(planId: PlanId, annual: boolean): { display: string; note?: string } {
  const monthly = PLANS[planId].priceMonthly
  if (monthly === 0) return { display: '$0' }
  if (!annual) return { display: `$${monthly}`, note: '/month' }
  const yearly = monthly * 10 // 2 months free illustrative
  return { display: `$${yearly}`, note: '/year' }
}

export function PricingPageContent() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="w-full">
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-36 md:pt-40">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400/80"
        >
          Billing
        </motion.p>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl font-serif text-4xl font-light tracking-tighter text-white md:text-6xl"
          >
            Plans that meter{' '}
            <span className="italic font-medium text-sky-400">credits</span>, not vanity features
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="space-y-4"
          >
            <p className="text-base leading-relaxed text-white/50 md:text-lg">
              Numbers below match Marketme’s live plan limits — Free, Pro, and Team — so you can
              pick based on profiles, posts, and AI credits.
            </p>
            <p className="text-sm text-white/40">
              Renewals and refunds:{' '}
              <Link
                href="/refunds"
                className="text-sky-300 underline underline-offset-2 hover:text-sky-200"
              >
                Refunds &amp; Billing
              </Link>
            </p>
          </motion.div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <div
            className="inline-flex rounded-full border border-white/10 bg-white/4 p-1"
            role="group"
            aria-label="Billing period"
          >
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                !annual ? 'bg-white text-zinc-900' : 'text-white/50 hover:text-white/80'
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                annual ? 'bg-white text-zinc-900' : 'text-white/50 hover:text-white/80'
              )}
            >
              Yearly
              <span className="ml-1.5 text-[10px] text-emerald-600/90">2 mo free</span>
            </button>
          </div>
          <span className="text-[11px] text-white/35">
            Yearly total is illustrative until checkout is enabled.
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-5 lg:grid-cols-3">
          {planOrder.map((id, index) => {
            const plan = PLANS[id]
            const meta = extras[id]
            const price = priceFor(id, annual)
            return (
              <motion.article
                key={id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-7',
                  meta.recommended
                    ? 'border-sky-400/40 bg-sky-500/8 shadow-[0_24px_80px_-40px_rgba(56,189,248,0.55)]'
                    : 'border-white/10 bg-white/[0.03]'
                )}
              >
                {meta.recommended ? (
                  <span className="absolute -top-3 left-6 rounded-full bg-sky-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    Popular
                  </span>
                ) : null}
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  {plan.badge}
                </p>
                <h2 className="mt-2 font-serif text-3xl font-light text-white">{plan.label}</h2>
                <p className="mt-2 min-h-10 text-sm text-white/45">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-serif text-5xl font-light text-white">{price.display}</span>
                  {price.note ? (
                    <span className="text-sm text-white/40">{price.note}</span>
                  ) : null}
                </div>

                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'mt-6 h-11 w-full rounded-xl',
                    meta.recommended
                      ? 'bg-sky-500 text-white hover:bg-sky-400'
                      : 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
                  )}
                >
                  {meta.cta}
                </Link>

                <ul className="mt-8 space-y-3 border-t border-white/8 pt-6">
                  {meta.highlights.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm text-white/70">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.article>
            )
          })}
        </div>
      </section>

      <section className="border-t border-white/8 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="font-serif text-3xl font-light tracking-tight text-white md:text-4xl">
            Limits side by side
          </h2>
          <p className="mt-3 text-sm text-white/45">
            Straight from plan configuration — not marketing fluff.
          </p>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Limit</th>
                  {planOrder.map((id) => (
                    <th key={id} className="px-4 py-3 font-medium">
                      {PLANS[id].label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8 text-white/70">
                {comparisonRows.map((row) => (
                  <tr key={row.key}>
                    <td className="px-4 py-3.5 text-white/50">{row.label}</td>
                    {planOrder.map((id) => (
                      <td key={id} className="px-4 py-3.5">
                        {formatLimit(PLANS[id].limits[row.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="font-serif text-3xl font-light text-white">Billing questions</h2>
        <div className="mt-8 divide-y divide-white/8 border-y border-white/8">
          {pricingFaqs.map((faq) => (
            <details key={faq.q} className="group py-5">
              <summary className="cursor-pointer list-none text-sm font-medium text-white/80 marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {faq.q}
                  <span className="text-white/30 transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/45">{faq.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'h-10 rounded-xl bg-sky-500 px-5 text-white hover:bg-sky-400'
            )}
          >
            Create account
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
          <Link
            href="/features"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'h-10 rounded-xl border-white/15 bg-transparent px-5 text-white hover:bg-white/5'
            )}
          >
            See features
          </Link>
        </div>
      </section>
    </div>
  )
}
