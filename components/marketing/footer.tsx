import Link from 'next/link'
import { Activity } from 'lucide-react'

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const productLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Changelog', href: '/changelog' },
]

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Customers', href: '/customers' },
  { label: 'Contact', href: '/contact' },
]

const resourcesLinks = [
  { label: 'Blog', href: '/blog' },
  { label: 'Help Center', href: '/help' },
  { label: 'API Docs', href: '/docs' },
]

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
]

export function Footer() {
  return (
    <footer className="relative border-t border-white/8 bg-transparent z-10 pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* 4-column top section */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand Column (takes 2 cols on lg) */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                <Activity className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span className="font-serif font-medium text-xl tracking-tighter text-white">
                Marketme
              </span>
            </Link>
            <p className="text-sm text-white/50 max-w-xs leading-relaxed">
              Plan, schedule, and publish across every platform — powered by AI.
            </p>
          </div>

          {/* Product */}
          <nav aria-label="Product navigation">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-white mb-6">
              Product
            </h3>
            <ul className="space-y-4">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company navigation">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-white mb-6">
              Company
            </h3>
            <ul className="space-y-4">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Resources navigation">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-white mb-6">
              Resources
            </h3>
            <ul className="space-y-4">
              {resourcesLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} Marketme.
            </p>
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-white/40 hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <TwitterIcon className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
              <span className="sr-only">LinkedIn</span>
              <LinkedinIcon className="w-5 h-5" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}
