import Link from 'next/link'
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
}

export function LegalDocument({
  title,
  description,
  intro,
  sections,
  relatedLinks = [],
}: LegalDocumentProps) {
  return (
    <MarketingPageShell mainClassName="justify-center min-h-[80vh] px-6 pt-32 pb-24 w-full max-w-4xl mx-auto">
      <article className="w-full border border-white/8 bg-white/4 p-10 shadow-[0_0_80px_rgba(59,130,246,0.05)] backdrop-blur-xl md:p-16 rounded-3xl text-left">
        <header className="mb-10 border-b border-white/10 pb-6">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
            Legal · Jamaica-based service
          </p>
          <h1 className="font-serif text-4xl font-light tracking-tighter text-white md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-white/55">
            {description}
          </p>
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
                set <code className="text-[11px]">NEXT_PUBLIC_COMPANY_REGISTRATION</code>.
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
            </section>
          ))}

          {relatedLinks.length > 0 ? (
            <nav
              aria-label="Related legal documents"
              className="border-t border-white/10 pt-8"
            >
              <p className="mb-3 text-xs uppercase tracking-widest text-white/35">
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
            Last updated: {legalCompany.lastUpdated}. These documents are provided
            for transparency and operational compliance. They are not a substitute
            for legal advice. Have a Jamaican attorney review them before relying
            on them for regulated or paid use.
          </p>
        </div>
      </article>
    </MarketingPageShell>
  )
}
