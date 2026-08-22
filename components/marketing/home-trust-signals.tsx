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
<<<<<<< HEAD
    title: 'Transparent plans',
    body: 'Real Free / Pro / Team limits — no invented SOC2 badges or fake logos.',
=======
    title: 'Published plan limits',
    body: 'Free, Pro, and Team are listed on Pricing — credits, profiles, and seats included.',
>>>>>>> origin/development
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
<<<<<<< HEAD
        <div className="mb-10 max-w-xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400/80">
            Trust
          </p>
          <h2
            id="trust-signals-heading"
            className="font-serif text-3xl font-light tracking-tighter text-white md:text-4xl"
          >
            Proof without the fiction
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
=======
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div className="max-w-md lg:sticky lg:top-28">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400/80">
              Trust
            </p>
            <h2
              id="trust-signals-heading"
              className="font-serif text-3xl font-light tracking-tighter text-white md:text-4xl"
            >
              Proof you can verify
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/45 md:text-base">
              Product behavior and legal pages — not invented customer counts or
              certification badges.
            </p>
          </div>

          <ul className="divide-y divide-white/8 border-y border-white/8">
            {signals.map((signal) => (
              <li key={signal.title}>
                <Link
                  href={signal.href}
                  className="group flex gap-4 py-6 transition-colors duration-200 hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80"
                >
                  <signal.icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-sky-400/90"
                    aria-hidden="true"
                    strokeWidth={1.5}
                  />
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg text-white group-hover:text-sky-100">
                      {signal.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/45">{signal.body}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
>>>>>>> origin/development
      </div>
    </section>
  )
}
