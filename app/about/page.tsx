import Link from 'next/link'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { createPageMetadata } from '@/lib/metadata'
import { legalCompany } from '@/lib/legal-company'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata = createPageMetadata({
  title: 'About',
  description:
    'Marketme is a Jamaica-based AI marketing workspace for drafting, designing, and scheduling social content — with a human review before anything goes live.',
  path: '/about',
})

export const dynamic = 'force-static'

const principles = [
  {
    title: 'Assist, do not autopilot',
    body: 'AI fills the blank page. You approve the message. Generation is a draft step so your brand — and Jamaica’s advertising expectations around truthfulness — stay under human control.',
  },
  {
    title: 'One weekly loop',
    body: 'Generate copy, design in Studio, place posts on Calendar, connect accounts with OAuth. Built for operators who ship every week, not for enterprise lead-routing theatre.',
  },
  {
    title: 'Transparent by default',
    body: 'Pricing limits, privacy choices, and AI ethics are published on the site. We would rather say what we do not do yet than invent trust badges we have not earned.',
  },
]

export default function AboutPage() {
  return (
    <MarketingPageShell mainClassName="pb-24">
      <div className="mx-auto max-w-6xl px-6 pt-36 md:pt-40">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400/80">
          Company
        </p>
        <div className="grid gap-8 border-b border-white/8 pb-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <h1 className="max-w-xl font-serif text-4xl font-light tracking-tighter text-white md:text-6xl">
            Built in Jamaica for teams who actually post
          </h1>
          <p className="max-w-md text-base leading-relaxed text-white/50 md:text-lg">
            Marketme helps small businesses and lean marketing teams draft with AI, design
            on-brand visuals, and schedule across connected social accounts — without handing
            the brand keys to a black box.
          </p>
        </div>

        <section className="mt-16 grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <h2 className="font-serif text-2xl font-light text-white md:text-3xl">Why we exist</h2>
          <div className="space-y-5 text-base leading-relaxed text-white/55 md:text-lg">
            <p>
              Most “AI marketing” tools either spam calendars on autopilot or bury you in CRM
              features you never asked for. Operators need something quieter: a place to generate
              a week of drafts, review them, and publish on time.
            </p>
            <p>
              We are based in {legalCompany.country}, building for Caribbean and international
              teams who care about tone, accuracy, and platform rules. {legalCompany.legalEntityName}{' '}
              is the trading name behind the product you use at marketme.app.
            </p>
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
            How we build
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {principles.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <h3 className="font-serif text-xl text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/45">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20 flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-xl font-light text-white">Talk to us</p>
            <p className="mt-1 text-sm text-white/45">
              Product questions, partnerships, or press — we read every note.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'rounded-full border-0 bg-white px-6 text-black hover:bg-white/90'
              )}
            >
              Contact
            </Link>
            <Link
              href="/customers"
              className="inline-flex items-center text-sm font-medium text-sky-300 hover:text-sky-200"
            >
              Who it&apos;s for →
            </Link>
          </div>
        </section>
      </div>
    </MarketingPageShell>
  )
}
