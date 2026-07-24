import Link from 'next/link'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { createPageMetadata } from '@/lib/metadata'
import {
  changelogTagLabels,
  formatChangelogDate,
  getChangelogEntries,
  type ChangelogTag,
} from '@/lib/changelog-entries'
import { cn } from '@/lib/utils'

export const metadata = createPageMetadata({
  title: 'Changelog',
  description:
    'What shipped in Marketme — features, fixes, legal updates, and platform improvements, newest first.',
  path: '/changelog',
})

export const dynamic = 'force-static'

const tagStyles: Record<ChangelogTag, string> = {
  feature: 'border-sky-400/35 bg-sky-500/10 text-sky-300',
  improvement: 'border-white/15 bg-white/5 text-white/70',
  fix: 'border-amber-400/30 bg-amber-500/10 text-amber-200/90',
  legal: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200/90',
  security: 'border-rose-400/30 bg-rose-500/10 text-rose-200/90',
}

export default function ChangelogPage() {
  const entries = getChangelogEntries()

  return (
    <MarketingPageShell mainClassName="pb-24">
      <div className="mx-auto max-w-6xl px-6 pt-36 md:pt-40">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400/80">
          Ship log
        </p>
        <div className="grid gap-8 border-b border-white/8 pb-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <h1 className="max-w-xl font-serif text-4xl font-light tracking-tighter text-white md:text-6xl">
            What we{' '}
            <span className="italic font-medium text-sky-400">shipped</span>
          </h1>
          <p className="max-w-md text-base leading-relaxed text-white/50 md:text-lg">
            Product updates in plain language — features, fixes, and compliance work that affects
            how you generate, review, and publish. Newest first.
          </p>
        </div>

        <ol className="relative mt-14 space-y-0">
          {entries.map((entry, index) => (
            <li
              key={entry.id}
              className="relative grid gap-4 border-b border-white/8 py-10 md:grid-cols-[140px_1fr] md:gap-10"
            >
              <div className="md:pt-1">
                <time
                  dateTime={entry.date}
                  className="block text-xs tabular-nums text-white/40"
                >
                  {formatChangelogDate(entry.date)}
                </time>
                {entry.version ? (
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-sky-300/80">
                    {entry.version.startsWith('v') || entry.version.includes(' ')
                      ? entry.version
                      : `v${entry.version}`}
                  </p>
                ) : null}
                {index === 0 ? (
                  <p className="mt-3 inline-flex rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-300">
                    Latest
                  </p>
                ) : null}
              </div>

              <div>
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className={cn(
                        'rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                        tagStyles[tag]
                      )}
                    >
                      {changelogTagLabels[tag]}
                    </span>
                  ))}
                </div>
                <h2 className="mt-3 font-serif text-2xl font-light tracking-tight text-white md:text-3xl">
                  {entry.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/50 md:text-base">
                  {entry.summary}
                </p>
                <ul className="mt-5 space-y-2">
                  {entry.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2.5 text-sm text-white/55"
                    >
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
          ))}
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
    </MarketingPageShell>
  )
}
