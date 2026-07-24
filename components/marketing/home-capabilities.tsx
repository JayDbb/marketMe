import Link from 'next/link'
import {
  CalendarDays,
  ImageIcon,
  Link2,
  Sparkles,
} from 'lucide-react'

const capabilities = [
  {
    href: '/features#generate',
    label: 'Generate',
    body: 'AI drafts matched to your brand — you review before publish.',
    icon: Sparkles,
  },
  {
    href: '/features#studio',
    label: 'Studio',
    body: 'Templates and layouts for visuals that stay on-brand.',
    icon: ImageIcon,
  },
  {
    href: '/features#calendar',
    label: 'Calendar',
    body: 'See the week, drag posts, and keep channels organized.',
    icon: CalendarDays,
  },
  {
    href: '/features#connections',
    label: 'Connections',
    body: 'Link accounts with OAuth — never by sharing passwords.',
    icon: Link2,
  },
] as const

export function HomeCapabilities() {
  return (
    <section
      aria-labelledby="home-capabilities-heading"
      className="border-t border-white/8 px-6 py-20 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400/80">
              Product
            </p>
            <h2
              id="home-capabilities-heading"
              className="max-w-md font-serif text-3xl font-light tracking-tighter text-white md:text-4xl"
            >
              Everything you need to ship the{' '}
              <span className="italic font-medium text-sky-400">week</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-white/45 md:text-base md:justify-self-end">
            The same capabilities as the Features page — short version. Pick a lane or
            open the full map.
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-sky-400/35 hover:bg-sky-500/[0.06]"
              >
                <item.icon
                  className="mb-4 h-5 w-5 text-sky-400/90"
                  aria-hidden="true"
                  strokeWidth={1.5}
                />
                <h3 className="font-serif text-lg font-medium text-white group-hover:text-sky-100">
                  {item.label}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/45">
                  {item.body}
                </p>
                <span className="mt-4 text-xs font-medium text-sky-300/80">
                  Learn more →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 text-center md:text-left">
          <Link
            href="/features"
            className="text-sm font-medium text-white/50 transition-colors hover:text-sky-300"
          >
            Full feature map →
          </Link>
        </div>
      </div>
    </section>
  )
}
