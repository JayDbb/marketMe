import Link from 'next/link'
import { Activity } from 'lucide-react'

const links = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
]

const legal = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
]

export function Footer() {
  return (
    <footer className="relative border-t border-white/6 bg-transparent z-10">
      <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.4)]">
              <Activity className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-serif font-light text-lg tracking-tighter text-white">
              Marketme
            </span>
          </Link>
          <p className="text-xs text-white/35 max-w-xs leading-relaxed">
            AI-powered marketing automation for modern teams. Deploy campaigns, route leads, and predict revenue — without code.
          </p>
        </div>

        {/* Navigation */}
        <nav aria-label="Footer navigation">
          <h3 className="text-[10px] uppercase tracking-widest font-semibold text-white/25 mb-4">
            Platform
          </h3>
          <ul className="space-y-3">
            {links.map((l) => {
              const isAnchor = l.href.includes('#');
              const className = "text-xs text-white/45 hover:text-white/75 transition-colors duration-200";
              
              if (isAnchor) {
                return (
                  <li key={l.href}>
                    <a href={l.href} className={className}>
                      {l.label}
                    </a>
                  </li>
                );
              }
              
              return (
                <li key={l.href}>
                  <Link href={l.href} className={className}>
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Legal */}
        <nav aria-label="Legal navigation">
          <h3 className="text-[10px] uppercase tracking-widest font-semibold text-white/25 mb-4">
            Legal
          </h3>
          <ul className="space-y-3">
            {legal.map((l) => {
              const isAnchor = l.href.includes('#');
              const className = "text-xs text-white/45 hover:text-white/75 transition-colors duration-200";
              
              if (isAnchor) {
                return (
                  <li key={l.href}>
                    <a href={l.href} className={className}>
                      {l.label}
                    </a>
                  </li>
                );
              }
              
              return (
                <li key={l.href}>
                  <Link href={l.href} className={className}>
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/6">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-white/20 font-mono tracking-wide">
            © {new Date().getFullYear()} Marketme. All rights reserved.
          </p>
          <p className="text-[11px] text-white/20">
            Built for ambitious teams.
          </p>
        </div>
      </div>
    </footer>
  )
}
