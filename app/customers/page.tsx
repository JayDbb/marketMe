import Link from 'next/link'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { createPageMetadata } from '@/lib/metadata'
import { legalCompany } from '@/lib/legal-company'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata = createPageMetadata({
  title: "Who it's for",
  description:
    'Who Marketme is built for — cafés, boutiques, creators, and lean marketing teams who ship weekly social content with human review.',
  path: '/customers',
})

export const dynamic = 'force-static'

const audiences = [
  {
    title: 'Local shops & hospitality',
    body: 'Cafés, boutiques, clinics, and tourism operators who need a steady weekly presence — brunch specials, new stock, event nights — without living in five apps.',
    fit: ['Weekly calendar rhythm', 'Studio templates for offers', 'Human check before publish'],
  },
  {
    title: 'Solo creators & founders',
    body: 'One person wearing the marketing hat. Generate drafts when inspiration is low, keep visuals consistent, schedule when you are ready.',
    fit: ['AI drafts as a starting point', 'Single-profile Free plan', 'Review before anything goes live'],
  },
  {
    title: 'Lean marketing teams',
    body: 'Small teams coordinating captions and visuals across shared workspaces. Pro and Team raise credits, profiles, and seats as you grow.',
    fit: ['Shared workspaces on Team', 'Clear plan limits on Pricing', 'OAuth connections, not passwords'],
  },
]

export default function CustomersPage() {
  return (
    <MarketingPageShell mainClassName="pb-24">
      <div className="mx-auto max-w-6xl px-6 pt-36 md:pt-40">
        <p className="mb-4 text-[11px] font-semibold tracking-[0.22em] text-sky-400/80 uppercase">
          Who it&apos;s for
        </p>
        <div className="grid gap-8 border-b border-white/8 pb-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <h1 className="max-w-xl font-serif text-4xl font-light tracking-tighter text-white md:text-6xl">
            Built for people who ship the week
          </h1>
          <p className="max-w-md text-base leading-relaxed text-white/50 md:text-lg">
            We are early. We will not invent logos or testimonials we do not have. This page is
            our audience map — real customer stories will land here when operators opt in.
          </p>
        </div>

        <ul className="mt-14 space-y-4">
          {audiences.map((audience) => (
            <li
              key={audience.title}
              className="grid gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:grid-cols-[1fr_0.85fr] md:p-8"
            >
              <div>
                <h2 className="font-serif text-2xl font-light text-white">{audience.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/50 md:text-base">
                  {audience.body}
                </p>
              </div>
              <ul className="space-y-2 self-center border-t border-white/8 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-8">
                {audience.fit.map((line) => (
                  <li key={line} className="flex gap-2.5 text-sm text-white/55">
                    <span
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sky-400/80"
                      aria-hidden="true"
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <aside className="mt-16 rounded-2xl border border-sky-400/25 bg-sky-500/[0.06] px-6 py-8 md:px-8">
          <h2 className="font-serif text-2xl font-light text-white">Share your story</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
            Using Marketme in production? Pitch a short write-up of what you schedule weekly —
            if it is a fit, we will feature it here with your permission (no invented quotes).
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'min-h-11 rounded-full border-0 bg-white px-6 text-black hover:bg-white/90'
              )}
            >
              Pitch via Contact
            </Link>
            <a
              href={`mailto:${legalCompany.supportEmail}?subject=Customer%20story%20for%20Marketme`}
              className="inline-flex min-h-11 items-center text-sm font-medium text-sky-300 hover:text-sky-200"
            >
              Or email {legalCompany.supportEmail}
            </a>
            <Link
              href="/signup"
              className="inline-flex min-h-11 items-center text-sm font-medium text-sky-300 hover:text-sky-200"
            >
              Start free →
            </Link>
          </div>
        </aside>
      </div>
    </MarketingPageShell>
  )
}
