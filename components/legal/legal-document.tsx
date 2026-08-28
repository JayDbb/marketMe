import Link from 'next/link'
import type { ReactNode } from 'react'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { legalCompany } from '@/lib/legal-company'

export type LegalSection = {
  id: string
  title: string
  paragraphs?: string[]
  bullets?: string[]
  note?: string
}

type LegalDocumentProps = {
  title: string
  description: string
  intro: string
  sections: LegalSection[]
  relatedLinks?: { href: string; label: string }[]
  /** Override shared company last-updated stamp when this policy changed alone. */
  lastUpdated?: string
  /** Optional actions under the header (e.g. Manage cookies). */
  headerActions?: ReactNode
  /** Extra content after sections (tables, forms). */
  children?: ReactNode
  /** When set, render `children` immediately after this section id. */
  childrenAfterId?: string
}

export function LegalDocument({
  title,
  description,
  intro,
  sections,
  relatedLinks = [],
  lastUpdated = legalCompany.lastUpdated,
  headerActions,
  children,
  childrenAfterId,
}: LegalDocumentProps) {
  return (
    <MarketingPageShell mainClassName="min-h-[80vh] w-full px-6 pt-32 pb-24">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
        <nav
          aria-label="On this page"
          className="hidden lg:sticky lg:top-28 lg:block lg:self-start"
        >
          <p className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-white/35 uppercase">
            On this page
          </p>
          <ol className="space-y-1.5 border-l border-white/10 pl-3">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="block py-1 text-xs leading-snug text-white/45 transition-colors hover:text-sky-300"
                >
                  <span className="text-white/25 tabular-nums">{index + 1}.</span>{' '}
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="w-full rounded-3xl border border-white/8 bg-white/4 p-8 text-left shadow-[0_0_80px_rgba(59,130,246,0.05)] backdrop-blur-xl md:p-12">
          <header className="mb-10 border-b border-white/10 pb-6">
            <p className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-white/35 uppercase">
              Legal · Jamaica-based service
            </p>
            <h1 className="font-serif text-4xl font-light tracking-tighter text-white md:text-5xl">
              {title}
            </h1>
            <p className="mt-3 text-xs text-white/40">
              Effective / last updated:{' '}
              <time className="text-white/60">{lastUpdated}</time>
            </p>
            <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-white/55">
              {description}
            </p>
            {headerActions ? <div className="mt-5">{headerActions}</div> : null}

            <div className="mt-6 lg:hidden">
              <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-white/35 uppercase">
                Jump to
              </p>
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white/60 hover:border-sky-400/40 hover:text-sky-300"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </div>
          </header>

          <div className="space-y-8 text-sm font-light leading-relaxed text-white/60">
            <p>{intro}</p>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-xs text-white/50">
              <p>
                <span className="text-white/80">Controller / provider:</span>{' '}
                {legalCompany.legalEntityName} ({legalCompany.tradingName}),{' '}
                {legalCompany.address}, {legalCompany.country}.
              </p>
              <p className="mt-2">
                Privacy requests:{' '}
                <a
                  className="text-sky-300 underline underline-offset-2 hover:text-sky-200"
                  href={`mailto:${legalCompany.privacyEmail}`}
                >
                  {legalCompany.privacyEmail}
                </a>
                {' · '}
                Legal:{' '}
                <a
                  className="text-sky-300 underline underline-offset-2 hover:text-sky-200"
                  href={`mailto:${legalCompany.legalEmail}`}
                >
                  {legalCompany.legalEmail}
                </a>
              </p>
              {legalCompany.registrationNumber ? (
                <p className="mt-2">
                  Company registration: {legalCompany.registrationNumber}
                </p>
              ) : (
                <p className="mt-2 text-amber-200/70">
                  Company registration number will be published here once filed —
                  set{' '}
                  <code className="text-[11px]">NEXT_PUBLIC_COMPANY_REGISTRATION</code>.
                </p>
              )}
            </div>

            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="mb-3 font-serif text-lg text-white">
                  {index + 1}. {section.title}
                </h2>
                {section.paragraphs?.map((p) => (
                  <p key={p.slice(0, 48)} className="mb-3 last:mb-0">
                    {p}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-white/30">
                    {section.bullets.map((item) => (
                      <li key={item.slice(0, 64)}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {section.note ? (
                  <p className="mt-3 text-xs italic text-white/40">{section.note}</p>
                ) : null}
                {children && childrenAfterId === section.id ? (
                  <div className="mt-5">{children}</div>
                ) : null}
              </section>
            ))}

            {children && !childrenAfterId ? children : null}

            {relatedLinks.length > 0 ? (
              <nav
                aria-label="Related legal documents"
                className="border-t border-white/10 pt-8"
              >
                <p className="mb-3 text-xs tracking-widest text-white/35 uppercase">
                  Related
                </p>
                <ul className="flex flex-wrap gap-x-5 gap-y-2">
                  {relatedLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sky-300 underline-offset-2 hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            <p className="pt-4 text-xs italic text-white/30">
              Last updated: {lastUpdated}. These documents are provided for transparency and
              operational compliance. They are not a substitute for legal advice. Have a Jamaican
              attorney review them before relying on them for regulated or paid use.
            </p>
          </div>
        </article>
      </div>
    </MarketingPageShell>
  )
}
