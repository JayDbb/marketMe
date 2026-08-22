import Link from 'next/link'
import {
  CalendarDays,
  ImageIcon,
  Link2,
<<<<<<< HEAD
  Sparkles,
} from 'lucide-react'
=======
  Mail,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
>>>>>>> origin/development

const capabilities = [
  {
    href: '/features#generate',
    label: 'Generate',
    body: 'AI drafts matched to your brand — you review before publish.',
    icon: Sparkles,
<<<<<<< HEAD
=======
    className: 'md:col-span-4 md:row-span-2 min-h-[220px]',
>>>>>>> origin/development
  },
  {
    href: '/features#studio',
    label: 'Studio',
    body: 'Templates and layouts for visuals that stay on-brand.',
    icon: ImageIcon,
<<<<<<< HEAD
=======
    className: 'md:col-span-2',
>>>>>>> origin/development
  },
  {
    href: '/features#calendar',
    label: 'Calendar',
    body: 'See the week, drag posts, and keep channels organized.',
    icon: CalendarDays,
<<<<<<< HEAD
=======
    className: 'md:col-span-2',
  },
  {
    href: '/features#inbox',
    label: 'Inbox',
    body: 'Triage DMs and comments without leaving the workspace.',
    icon: Mail,
    className: 'md:col-span-3',
>>>>>>> origin/development
  },
  {
    href: '/features#connections',
    label: 'Connections',
    body: 'Link accounts with OAuth — never by sharing passwords.',
    icon: Link2,
<<<<<<< HEAD
=======
    className: 'md:col-span-3',
>>>>>>> origin/development
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
              Everything you need to ship the week
            </h2>
          </div>
<<<<<<< HEAD
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
=======
          <p className="max-w-md text-sm leading-relaxed text-white/45 md:justify-self-end md:text-base">
            Generate, Studio, Calendar, Inbox, and Connections — the same map as the
            Features page, in short form.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-3 md:grid-cols-6">
          {capabilities.map((item) => (
            <li key={item.href} className={item.className}>
              <Link
                href={item.href}
                className={cn(
                  'group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5',
                  'transition-[border-color,background-color,color] duration-200',
                  'hover:border-sky-400/35 hover:bg-sky-500/[0.06]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80'
                )}
>>>>>>> origin/development
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
<<<<<<< HEAD
                  Learn more →
=======
                  Learn more
>>>>>>> origin/development
                </span>
              </Link>
            </li>
          ))}
        </ul>

<<<<<<< HEAD
        <div className="mt-8 text-center md:text-left">
          <Link
            href="/features"
            className="text-sm font-medium text-white/50 transition-colors hover:text-sky-300"
          >
            Full feature map →
=======
        <div className="mt-8">
          <Link
            href="/features"
            className="text-sm font-medium text-white/50 transition-colors duration-200 hover:text-sky-300"
          >
            Full feature map
>>>>>>> origin/development
          </Link>
        </div>
      </div>
    </section>
  )
}
