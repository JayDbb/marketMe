import Link from 'next/link'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { createPageMetadata } from '@/lib/metadata'
import { legalCompany } from '@/lib/legal-company'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata = createPageMetadata({
  title: 'Help Center',
  description:
    'Get help with Marketme — Generate, Studio, Calendar, connections, credits, billing, and account support.',
  path: '/help',
})

export const dynamic = 'force-static'

const topics = [
  {
    title: 'Getting started',
    items: [
      {
        q: 'How do I create an account?',
        a: 'Sign up with Google or an email magic link. No password required on login. After signup you can complete onboarding and open the dashboard.',
        href: '/signup',
        linkLabel: 'Sign up',
      },
      {
        q: 'What should I do first?',
        a: 'Connect a social account (OAuth), generate a small batch of drafts, review them, then place approved posts on Calendar. Features explains each step in depth.',
        href: '/features',
        linkLabel: 'Feature map',
      },
    ],
  },
  {
    title: 'Generate, Studio & Calendar',
    items: [
      {
        q: 'Does AI publish without me?',
        a: 'No. Generation creates drafts for you to review. Schedule only what you approve — that is intentional for brand safety and advertising honesty.',
        href: '/blog/human-review-before-you-publish-ai',
        linkLabel: 'Read the review guide',
      },
      {
        q: 'How do AI credits work?',
        a: 'Free and paid plans meter generation. Check the balance in Generate before large batches. Exact limits live on Pricing.',
        href: '/pricing',
        linkLabel: 'View plans',
      },
    ],
  },
  {
    title: 'Connections & billing',
    items: [
      {
        q: 'How do I connect Instagram or Facebook?',
        a: 'Use Connections and complete the official Meta OAuth flow. Never enter your social password into Marketme. If a token expires, reconnect before a big launch week.',
        href: '/blog/connecting-instagram-the-right-way',
        linkLabel: 'OAuth guide',
      },
      {
        q: 'Where do I manage billing?',
        a: 'Plan details are on Pricing. Account billing controls live under dashboard Settings when paid billing is enabled. Refunds policy covers cancellations and disputes.',
        href: '/refunds',
        linkLabel: 'Refunds policy',
      },
    ],
  },
]

export default function HelpPage() {
  return (
    <MarketingPageShell mainClassName="pb-24">
      <div className="mx-auto max-w-6xl px-6 pt-36 md:pt-40">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400/80">
          Help
        </p>
        <div className="grid gap-8 border-b border-white/8 pb-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <h1 className="max-w-xl font-serif text-4xl font-light tracking-tighter text-white md:text-6xl">
            Answers for operators, not jargon
          </h1>
          <p className="max-w-md text-base leading-relaxed text-white/50 md:text-lg">
            Short guides for setup, generation, connections, and billing. Still stuck? Email
            support — we reply as soon as we can.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={`mailto:${legalCompany.supportEmail}`}
            className={cn(
              buttonVariants({ size: 'lg' }),
              'rounded-full border-0 bg-white px-6 text-black hover:bg-white/90'
            )}
          >
            Email support
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center text-sm font-medium text-sky-300 hover:text-sky-200"
          >
            All contact options →
          </Link>
        </div>

        <div className="mt-16 space-y-14">
          {topics.map((topic) => (
            <section key={topic.title}>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
                {topic.title}
              </h2>
              <ul className="mt-5 divide-y divide-white/8 border-y border-white/8">
                {topic.items.map((item) => (
                  <li key={item.q} className="grid gap-3 py-6 md:grid-cols-[1fr_auto] md:items-start">
                    <div>
                      <h3 className="font-serif text-xl text-white">{item.q}</h3>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
                        {item.a}
                      </p>
                    </div>
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-sky-300 hover:text-sky-200 md:pt-1"
                    >
                      {item.linkLabel} →
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <aside className="mt-16 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:grid-cols-3 md:p-8">
          <Link href="/changelog" className="group block">
            <p className="text-[11px] uppercase tracking-wider text-white/35">Ship log</p>
            <p className="mt-1 font-serif text-lg text-white group-hover:text-sky-100">
              Changelog →
            </p>
          </Link>
          <Link href="/blog" className="group block">
            <p className="text-[11px] uppercase tracking-wider text-white/35">Guides</p>
            <p className="mt-1 font-serif text-lg text-white group-hover:text-sky-100">
              Blog →
            </p>
          </Link>
          <Link href="/pricing" className="group block">
            <p className="text-[11px] uppercase tracking-wider text-white/35">Plans</p>
            <p className="mt-1 font-serif text-lg text-white group-hover:text-sky-100">
              Pricing →
            </p>
          </Link>
        </aside>
      </div>
    </MarketingPageShell>
  )
}
