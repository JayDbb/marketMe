import Link from 'next/link'
import { Suspense } from 'react'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { ContactForm } from '@/components/marketing/contact-form'
import { createPageMetadata } from '@/lib/metadata'
import { legalCompany } from '@/lib/legal-company'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata = createPageMetadata({
  title: 'Contact',
  description:
    'Contact Marketme support, privacy, or legal — based in Jamaica. We respond within 1–2 business days.',
  path: '/contact',
})

export const dynamic = 'force-static'

const channels = [
  {
    title: 'Product & account support',
    body: 'Connections, Generate, Studio, Calendar, billing questions, and account access.',
    email: legalCompany.supportEmail,
    cta: 'Email support',
  },
  {
    title: 'Privacy requests',
    body: 'Access, deletion, and questions about how we process personal data.',
    email: legalCompany.privacyEmail,
    cta: 'Email privacy',
  },
  {
    title: 'Legal',
    body: 'Contracts, notices, and formal correspondence for the company.',
    email: legalCompany.legalEmail,
    cta: 'Email legal',
  },
]

export default function ContactPage() {
  return (
    <MarketingPageShell mainClassName="pb-24">
      <div className="mx-auto max-w-6xl px-6 pt-36 md:pt-40">
        <p className="mb-4 text-[11px] font-semibold tracking-[0.22em] text-sky-400/80 uppercase">
          Contact
        </p>
        <div className="grid gap-8 border-b border-white/8 pb-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <h1 className="max-w-xl font-serif text-4xl font-light tracking-tighter text-white md:text-6xl">
            We are easy to reach
          </h1>
          <p className="max-w-md text-base leading-relaxed text-white/50 md:text-lg">
            Send a message below or use a direct inbox. We usually reply within{' '}
            <span className="text-white/70">1–2 business days</span> (Jamaica time).
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <Suspense
            fallback={
              <div className="h-80 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
            }
          >
            <ContactForm />
          </Suspense>

          <div className="space-y-4">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-white/35 uppercase">
              Direct email
            </p>
            <ul className="space-y-3">
              {channels.map((channel) => (
                <li
                  key={channel.email}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <h2 className="font-serif text-lg text-white">{channel.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/45">{channel.body}</p>
                  <a
                    href={`mailto:${channel.email}`}
                    className={cn(
                      buttonVariants({ size: 'sm', variant: 'outline' }),
                      'mt-4 min-h-11 rounded-full border-white/15 bg-transparent text-white hover:bg-white/5'
                    )}
                  >
                    {channel.cta}
                  </a>
                  <p className="mt-2 text-xs text-white/35">{channel.email}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <section className="mt-16 grid gap-6 border-t border-white/8 pt-12 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl font-light text-white">Company</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              {legalCompany.legalEntityName}
              <br />
              {legalCompany.address}
              <br />
              {legalCompany.country}
            </p>
            {legalCompany.registrationNumber ? (
              <p className="mt-2 text-sm text-white/40">
                Reg. {legalCompany.registrationNumber}
              </p>
            ) : (
              <p className="mt-2 text-xs text-amber-200/60">
                Registered office details will be published when company registration is filed.
              </p>
            )}
          </div>
          <div>
            <h2 className="font-serif text-2xl font-light text-white">Prefer docs first?</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              Help covers setup, connections, credits, and billing. Privacy covers data rights
              requests.
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <Link href="/help" className="text-sm font-medium text-sky-300 hover:text-sky-200">
                Help center →
              </Link>
              <Link href="/privacy" className="text-sm font-medium text-sky-300 hover:text-sky-200">
                Privacy →
              </Link>
              <Link href="/help/connect-instagram" className="text-sm font-medium text-sky-300 hover:text-sky-200">
                Connect Instagram →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MarketingPageShell>
  )
}
