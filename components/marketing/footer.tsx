import Link from 'next/link'
import { Activity } from 'lucide-react'
import { legalCompany } from '@/lib/legal-company'

const productLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Changelog', href: '/changelog' },
  { label: 'Help', href: '/help' },
]

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: "Who it's for", href: '/customers' },
  { label: 'Contact', href: '/contact' },
]

const legalNavLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'DPA', href: '/dpa' },
  { label: 'Refunds', href: '/refunds' },
  { label: 'Acceptable Use', href: '/acceptable-use' },
  { label: 'AI Ethics', href: '/ai-ethics' },
  { label: 'Do Not Sell', href: '/do-not-sell' },
]

const bottomLegalLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'DPA', href: '/dpa' },
]

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/8 bg-transparent pt-20 pb-8">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 flex flex-col gap-6 md:col-span-4 lg:col-span-2">
            <Link href="/" className="flex w-fit items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.3)]">
                <Activity className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="font-serif text-xl font-medium tracking-tighter text-white">
                Marketme
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/50">
              Draft with AI, design in Studio, and schedule across connected accounts — with a
              human review before anything goes live.
            </p>
            <div className="max-w-sm space-y-1 text-xs leading-relaxed text-white/35">
              <p>{legalCompany.legalEntityName}</p>
              <p>
                {legalCompany.address}, {legalCompany.country}
              </p>
              <p>
                <a
                  href={`mailto:${legalCompany.supportEmail}`}
                  className="transition-colors hover:text-white/60"
                >
                  {legalCompany.supportEmail}
                </a>
              </p>
              {legalCompany.registrationNumber ? (
                <p>Reg. {legalCompany.registrationNumber}</p>
              ) : null}
            </div>
          </div>

          <nav aria-label="Product navigation">
            <h3 className="mb-6 text-xs font-semibold tracking-widest text-white uppercase">
              Product
            </h3>
            <ul className="space-y-4">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company navigation">
            <h3 className="mb-6 text-xs font-semibold tracking-widest text-white uppercase">
              Company
            </h3>
            <ul className="space-y-4">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal navigation">
            <h3 className="mb-6 text-xs font-semibold tracking-widest text-white uppercase">
              Legal
            </h3>
            <ul className="space-y-3">
              {legalNavLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} Marketme. Based in Jamaica.
            </p>
            {bottomLegalLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-white/40 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <a
            href={`mailto:${legalCompany.supportEmail}`}
            className="text-sm text-white/40 transition-colors hover:text-white"
          >
            {legalCompany.supportEmail}
          </a>
        </div>
      </div>
    </footer>
  )
}
