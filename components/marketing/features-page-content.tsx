'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CalendarDays,
  Check,
  ImageIcon,
  Link2,
  Mail,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const capabilities = [
  {
    id: 'generate',
    label: 'Generate',
    icon: Sparkles,
    title: 'AI drafts that match your brand',
    body: 'Turn your business profile into captions, hashtags, and post ideas. Review every draft before anything goes live — Marketme assists, you approve.',
    points: [
      'Goal, tone, and platform-aware copy',
      'Human review before scheduling',
      'Credit-aware generation for paid plans',
    ],
    preview: 'generate' as const,
  },
  {
    id: 'studio',
    label: 'Studio',
    icon: ImageIcon,
    title: 'Design canvases, not just captions',
    body: 'Upload templates, pull stock imagery, and edit layouts in the design studio. Save reusable canvases for your next campaign week.',
    points: [
      'Upload your own brand assets',
      'Stock imagery from Pexels',
      'Editable canvas templates',
    ],
    preview: 'studio' as const,
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: CalendarDays,
    title: 'See the whole week at a glance',
    body: 'Drag posts onto the calendar, adjust timing, and keep Instagram and other channels organized in one dark, focused workspace.',
    points: [
      'Visual weekly scheduling',
      'Draft → scheduled → published states',
      'Batch schedule from Generate',
    ],
    preview: 'calendar' as const,
  },
  {
    id: 'inbox',
    label: 'Inbox',
    icon: Mail,
    title: 'Keep conversations in one place',
    body: 'Surface engagement and replies without hopping between apps. Stay responsive while your calendar runs in the background.',
    points: [
      'Unified engagement view',
      'Quick triage for replies',
      'Built for social operators',
    ],
    preview: 'inbox' as const,
  },
  {
    id: 'connections',
    label: 'Connections',
    icon: Link2,
    title: 'Connect accounts the right way',
    body: 'Link platforms through official OAuth flows — never by sharing passwords. Publish when you are ready, with clear connection status.',
    points: [
      'OAuth-based social connections',
      'Status visibility per channel',
      'Designed for Meta App Review paths',
    ],
    preview: 'connections' as const,
  },
  {
    id: 'assistant',
    label: 'Assistant',
    icon: Wand2,
    title: 'Ask Marketme where to go next',
    body: 'The dashboard assistant routes you into Generate, Studio, or Calendar with prompts that match your current goal — less hunting, more shipping.',
    points: [
      'Context-aware next steps',
      'Deep links into the right tool',
      'Built for busy solo marketers',
    ],
    preview: 'assistant' as const,
  },
]

const matrix = [
  { feature: 'AI post generation', free: true, growth: true },
  { feature: 'Design studio & templates', free: true, growth: true },
  { feature: 'Content calendar', free: true, growth: true },
  { feature: 'Batch scheduling', free: 'Limited', growth: true },
  { feature: 'Social connections', free: true, growth: true },
  { feature: 'Inbox triage', free: true, growth: true },
  { feature: 'Higher AI credits', free: false, growth: true },
  { feature: 'Priority publishing', free: false, growth: true },
]

function PreviewGenerate() {
  return (
    <div className="space-y-3 p-5">
      <div className="rounded-xl border border-white/10 bg-[#0a0e14] p-3">
        <p className="text-[10px] uppercase tracking-wider text-white/35">Prompt</p>
        <p className="mt-1 text-sm text-white/80">3 Instagram posts for a Kingston café launch</p>
      </div>
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 * i }}
          className="rounded-xl border border-sky-400/20 bg-sky-500/5 p-3"
        >
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-[11px] text-sky-300/80">Draft {i + 1}</span>
          </div>
          <div className="space-y-1.5">
            <div className="h-2 w-full rounded bg-white/15" />
            <div className="h-2 w-[80%] rounded bg-white/10" />
            <div className="h-2 w-2/3 rounded bg-white/10" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function PreviewStudio() {
  return (
    <div className="grid grid-cols-2 gap-3 p-5">
      {['Brand board', 'Promo', 'Story', 'Carousel'].map((label, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className="aspect-square rounded-xl border border-white/10 bg-linear-to-br from-white/8 to-white/2 p-3"
        >
          <div className="mb-2 h-1/2 rounded-lg bg-white/8" />
          <p className="text-[11px] text-white/50">{label}</p>
        </motion.div>
      ))}
    </div>
  )
}

function PreviewCalendar() {
  return (
    <div className="grid grid-cols-3 gap-2 p-5">
      {['Mon', 'Tue', 'Wed'].map((day, i) => (
        <div key={day} className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-white/30">{day}</p>
          <div className="rounded-lg border border-white/10 bg-[#0a0e14] p-2 space-y-2 min-h-24">
            {i !== 1 ? (
              <div className="rounded-md border border-sky-400/30 bg-sky-500/10 px-2 py-1.5 text-[10px] text-sky-200">
                10:00 · Post
              </div>
            ) : null}
            {i === 2 ? (
              <div className="rounded-md border border-teal-400/25 bg-teal-500/10 px-2 py-1.5 text-[10px] text-teal-200">
                16:30 · Story
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

function PreviewInbox() {
  return (
    <div className="space-y-2 p-5">
      {['New comment on Reel', 'DM from @cafe.local', 'Mention in Stories'].map((item, i) => (
        <div
          key={item}
          className={cn(
            'flex items-center gap-3 rounded-xl border px-3 py-2.5',
            i === 0
              ? 'border-sky-400/25 bg-sky-500/10'
              : 'border-white/8 bg-white/3'
          )}
        >
          <div className="h-8 w-8 rounded-full bg-white/10" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-white/80">{item}</p>
            <p className="text-[10px] text-white/35">2m ago</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function PreviewConnections() {
  return (
    <div className="space-y-3 p-5">
      {[
        { name: 'Instagram', status: 'Connected', ok: true },
        { name: 'Meta Business', status: 'Needs auth', ok: false },
      ].map((row) => (
        <div
          key={row.name}
          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/3 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <Link2 className="h-4 w-4 text-white/50" />
            <span className="text-sm text-white/80">{row.name}</span>
          </div>
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-medium',
              row.ok
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'bg-amber-500/15 text-amber-200'
            )}
          >
            {row.status}
          </span>
        </div>
      ))}
    </div>
  )
}

function PreviewAssistant() {
  return (
    <div className="space-y-3 p-5">
      <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
        Want to fill next week’s calendar for brand awareness?
      </div>
      <div className="flex flex-wrap gap-2">
        {['Open Generate', 'Pick a Studio template', 'View Calendar'].map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1 text-[11px] text-sky-200"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  )
}

const previews = {
  generate: PreviewGenerate,
  studio: PreviewStudio,
  calendar: PreviewCalendar,
  inbox: PreviewInbox,
  connections: PreviewConnections,
  assistant: PreviewAssistant,
}

export function FeaturesPageContent() {
  return (
    <div className="w-full">
      {/* Intro — left-aligned product index, not a second homepage hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-36 md:pt-40">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400/80"
        >
          Product capabilities
        </motion.p>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="max-w-xl font-serif text-4xl font-light tracking-tighter text-white md:text-6xl"
          >
            The tools behind{' '}
            <span className="italic font-medium text-sky-400">every scheduled week</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="max-w-md text-base leading-relaxed text-white/50 md:text-lg"
          >
            Features is the product map — Generate, Studio, Calendar, Inbox, and Connections —
            not another marketing overview. Jump to a capability or scroll the deep dives below.
          </motion.p>
        </div>

        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          aria-label="Feature index"
          className="mt-12 flex flex-wrap gap-2 border-y border-white/8 py-5"
        >
          {capabilities.map((cap) => (
            <a
              key={cap.id}
              href={`#${cap.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3.5 py-1.5 text-xs text-white/60 transition-colors hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-sky-200"
            >
              <cap.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {cap.label}
            </a>
          ))}
        </motion.nav>
      </section>

      {/* Deep dives */}
      <section className="mx-auto max-w-6xl space-y-24 px-6 pb-24">
        {capabilities.map((cap, index) => {
          const Preview = previews[cap.preview]
          const reverse = index % 2 === 1
          return (
            <motion.article
              key={cap.id}
              id={cap.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45 }}
              className={cn(
                'grid items-center gap-10 scroll-mt-28 lg:grid-cols-2',
                reverse && 'lg:[&>*:first-child]:order-2'
              )}
            >
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/4 px-2.5 py-1 text-[11px] uppercase tracking-wider text-white/45">
                  <cap.icon className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                  {cap.label}
                </div>
                <h2 className="font-serif text-3xl font-light tracking-tight text-white md:text-4xl">
                  {cap.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/50 md:text-base">
                  {cap.body}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {cap.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm text-white/70">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117]/80 shadow-[0_24px_80px_-32px_rgba(14,165,233,0.35)]">
                <div className="flex items-center gap-1.5 border-b border-white/8 px-4 py-2.5">
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                  <span className="ml-2 text-[10px] text-white/30">marketme · {cap.label}</span>
                </div>
                <Preview />
              </div>
            </motion.article>
          )
        })}
      </section>

      {/* Capability matrix — different from homepage FAQ/CTA pattern */}
      <section className="border-t border-white/8 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="font-serif text-3xl font-light tracking-tight text-white md:text-4xl">
            What ships with each plan
          </h2>
          <p className="mt-3 max-w-xl text-sm text-white/45">
            A quick read of capability coverage. See Pricing for current limits and credits.
          </p>

          <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Capability</th>
                  <th className="px-4 py-3 font-medium">Free</th>
                  <th className="px-4 py-3 font-medium">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {matrix.map((row) => (
                  <tr key={row.feature} className="text-white/70">
                    <td className="px-4 py-3.5">{row.feature}</td>
                    <td className="px-4 py-3.5">
                      {row.free === true ? (
                        <Check className="h-4 w-4 text-sky-400" aria-label="Included" />
                      ) : row.free === false ? (
                        <span className="text-white/25">—</span>
                      ) : (
                        <span className="text-xs text-white/45">{row.free}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {row.growth === true ? (
                        <Check className="h-4 w-4 text-sky-400" aria-label="Included" />
                      ) : (
                        <span className="text-white/25">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'h-10 rounded-xl bg-sky-500 px-5 text-white hover:bg-sky-400'
              )}
            >
              Compare pricing
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'h-10 rounded-xl border-white/15 bg-transparent px-5 text-white hover:bg-white/5'
              )}
            >
              Try free
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
