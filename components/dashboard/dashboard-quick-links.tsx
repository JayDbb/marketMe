'use client'

import Link from 'next/link'
import {
  Sparkles,
  FileText,
  CalendarDays,
  Inbox,
  Link2,
  ArrowRight,
} from 'lucide-react'

const LINKS = [
  {
    href: '/dashboard/generate',
    label: 'Generate',
    description: 'AI content',
    icon: Sparkles,
    accent: 'from-blue-500/20 to-fuchsia-600/10 border-blue-500/25 text-blue-400',
  },
  {
    href: '/dashboard/posts',
    label: 'Posts',
    description: 'All content',
    icon: FileText,
    accent: 'from-blue-500/15 to-blue-600/10 border-blue-500/20 text-blue-400',
  },
  {
    href: '/dashboard/calendar',
    label: 'Planner',
    description: 'Schedule',
    icon: CalendarDays,
    accent: 'from-blue-500/15 to-sky-600/10 border-blue-500/20 text-blue-400',
  },
  {
    href: '/dashboard/inbox',
    label: 'Inbox',
    description: 'DMs & comments',
    icon: Inbox,
    accent: 'from-fuchsia-500/15 to-pink-600/10 border-fuchsia-500/20 text-fuchsia-400',
  },
  {
    href: '/dashboard/connections',
    label: 'Connect',
    description: 'Instagram',
    icon: Link2,
    accent: 'from-emerald-500/15 to-teal-600/10 border-emerald-500/20 text-emerald-400',
  },
]

export function DashboardQuickLinks() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`group flex flex-col gap-2 rounded-xl border bg-linear-to-br p-4 transition-all hover:scale-[1.02] hover:shadow-lg ${link.accent}`}
        >
          <link.icon className="w-5 h-5" />
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">{link.label}</p>
            <p className="text-[11px] text-zinc-500 dark:text-white/40">{link.description}</p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all ml-auto" />
        </Link>
      ))}
    </div>
  )
}
