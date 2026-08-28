'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  changelogTagLabels,
  formatChangelogDate,
  type ChangelogEntry,
  type ChangelogTag,
} from '@/lib/changelog-entries'
import { cn } from '@/lib/utils'

const tagStyles: Record<ChangelogTag, string> = {
  feature: 'border-sky-400/35 bg-sky-500/10 text-sky-300',
  improvement: 'border-white/15 bg-white/5 text-white/70',
  fix: 'border-amber-400/30 bg-amber-500/10 text-amber-200/90',
  legal: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200/90',
  security: 'border-rose-400/30 bg-rose-500/10 text-rose-200/90',
}

const ALL_TAGS: Array<ChangelogTag | 'all'> = [
  'all',
  'feature',
  'improvement',
  'fix',
  'legal',
  'security',
]

export function ChangelogContent({ entries }: { entries: ChangelogEntry[] }) {
  const [tag, setTag] = useState<ChangelogTag | 'all'>('all')

  const filtered = useMemo(() => {
    if (tag === 'all') return entries
    return entries.filter((e) => e.tags.includes(tag))
  }, [entries, tag])

  return (
    <div className="mx-auto max-w-6xl px-6 pt-36 md:pt-40 pb-24">
      <p className="mb-4 text-[11px] font-semibold tracking-[0.22em] text-sky-400/80 uppercase">
        Ship log
      </p>
      <div className="grid gap-8 border-b border-white/8 pb-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <h1 className="max-w-xl font-serif text-4xl font-light tracking-tighter text-white md:text-6xl">
          What we shipped
        </h1>
        <div className="space-y-3">
          <p className="max-w-md text-base leading-relaxed text-white/50 md:text-lg">
            Product updates in plain language — features, fixes, and compliance work. Newest first.
          </p>
          <a
            href="/changelog/rss.xml"
            className="inline-flex text-sm font-medium text-sky-300 hover:text-sky-200"
          >
            RSS feed →
          </a>
        </div>
      </div>

      <div
        className="mt-8 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter changelog by tag"
      >
        {ALL_TAGS.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tag === t}
            onClick={() => setTag(t)}
            className={cn(
              'min-h-11 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold tracking-wider uppercase transition-colors',
              tag === t
                ? 'border-sky-400/50 bg-sky-500/15 text-sky-200'
                : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80'
            )}
          >
            {t === 'all' ? 'All' : changelogTagLabels[t]}
          </button>
        ))}
      </div>

      <ol className="relative mt-10 space-y-0">
        {filtered.length === 0 ? (
          <li className="py-10 text-sm text-white/45">No entries for this filter.</li>
        ) : (
          filtered.map((entry, index) => (
            <li
              key={entry.id}
              id={entry.id}
              className="relative grid scroll-mt-28 gap-4 border-b border-white/8 py-10 md:grid-cols-[140px_1fr] md:gap-10"
            >
              <div className="md:pt-1">
                <time dateTime={entry.date} className="block text-xs text-white/40 tabular-nums">
                  {formatChangelogDate(entry.date)}
                </time>
                {entry.version ? (
                  <p className="mt-2 font-mono text-[11px] tracking-wider text-sky-300/80 uppercase">
                    {entry.version.startsWith('v') || entry.version.includes(' ')
                      ? entry.version
                      : `v${entry.version}`}
                  </p>
                ) : null}
                {index === 0 && tag === 'all' ? (
                  <p className="mt-3 inline-flex rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-sky-300 uppercase">
                    Latest
                  </p>
                ) : null}
              </div>

              <div>
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((t) => (
                    <span
                      key={t}
                      className={cn(
                        'rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase',
                        tagStyles[t]
                      )}
                    >
                      {changelogTagLabels[t]}
                    </span>
                  ))}
                </div>
                <h2 className="mt-3 font-serif text-2xl font-light tracking-tight text-white md:text-3xl">
                  <a href={`#${entry.id}`} className="hover:text-sky-100">
                    {entry.title}
                  </a>
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/50 md:text-base">
                  {entry.summary}
                </p>
                <ul className="mt-5 space-y-2">
                  {entry.highlights.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm text-white/55">
                      <span
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sky-400/80"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))
        )}
      </ol>

      <aside className="mt-16 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-7 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-serif text-xl font-light text-white">Want the longer read?</p>
          <p className="mt-1 text-sm text-white/45">
            Field notes and operator guides live on the blog.
          </p>
        </div>
        <Link
          href="/blog"
          className="inline-flex text-sm font-medium text-sky-300 transition-colors hover:text-sky-200"
        >
          Visit the blog →
        </Link>
      </aside>
    </div>
  )
}
