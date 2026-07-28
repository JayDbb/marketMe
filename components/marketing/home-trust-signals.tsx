import Link from 'next/link'
import { Eye, Link2, MapPin, Shield } from 'lucide-react'

const signals = [
  {
    icon: Eye,
    title: 'Human review first',
    body: 'AI drafts. You approve. Nothing is meant to publish on autopilot.',
    href: '/ai-ethics',
  },
  {
    icon: Link2,
    title: 'OAuth connections',
    body: 'Link accounts the official way — never by sharing passwords with us.',
    href: '/features#connections',
  },
  {
    icon: MapPin,
    title: 'Based in Jamaica',
    body: 'Built with Jamaica-first privacy framing and clear legal pages.',
    href: '/about',
  },
  {
    icon: Shield,
    title: 'Transparent plans',
    body: 'Real Free / Pro / Team limits — no invented SOC2 badges or fake logos.',
    href: '/pricing',
  },
] as const

/** Honest trust signals — facts about the product, not invented social proof. */
export function HomeTrustSignals() {
  return (
    <section
      aria-labelledby="trust-signals-heading"
      className="border-t border-white/8 px-6 py-20 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400/80">
            Trust
          </p>
          <h2
            id="trust-signals-heading"
            className="font-serif text-3xl font-light tracking-tighter text-white md:text-4xl"
          >
            Proof without the{' '}
            <span className="italic font-medium text-sky-400">fiction</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/45 md:text-base">
            We would rather show how the product works than invent customer counts. These are
            commitments you can verify in the product and on our legal pages.
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {signals.map((signal) => (
            <li key={signal.title}>
              <Link
                href={signal.href}
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-sky-400/35 hover:bg-sky-500/[0.06]"
              >
                <signal.icon
                  className="mb-4 h-5 w-5 text-sky-400/90"
                  aria-hidden="true"
                  strokeWidth={1.5}
                />
                <h3 className="font-serif text-lg text-white group-hover:text-sky-100">
                  {signal.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/45">{signal.body}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
