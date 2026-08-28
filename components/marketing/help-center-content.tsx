'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { legalCompany } from '@/lib/legal-company'
import type { HelpArticle } from '@/lib/help-articles'

type FaqItem = {
  q: string
  a: string
  href?: string
  linkLabel?: string
}

type Topic = {
  title: string
  items: FaqItem[]
}

export function HelpCenterContent({
  topics,
  articles,
}: {
  topics: Topic[]
  articles: HelpArticle[]
}) {
  const [query, setQuery] = useState('')

  const filteredTopics = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return topics
    return topics
      .map((topic) => ({
        ...topic,
        items: topic.items.filter(
          (item) =>
            item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
        ),
      }))
      .filter((topic) => topic.items.length > 0)
  }, [query, topics])

  const filteredArticles = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return articles
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    )
  }, [query, articles])

  return (
    <div className="mx-auto max-w-6xl px-6 pt-36 pb-24 md:pt-40">
      <p className="mb-4 text-[11px] font-semibold tracking-[0.22em] text-sky-400/80 uppercase">
        Help center
      </p>
      <div className="grid gap-8 border-b border-white/8 pb-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <h1 className="max-w-xl font-serif text-4xl font-light tracking-tighter text-white md:text-6xl">
          Answers for operators who ship weekly
        </h1>
        <div className="space-y-4">
          <p className="max-w-md text-base leading-relaxed text-white/50 md:text-lg">
            Search guides and FAQs. Still stuck? Email{' '}
            <a
              href={`mailto:${legalCompany.supportEmail}`}
              className="text-sky-300 hover:text-sky-200"
            >
              {legalCompany.supportEmail}
            </a>
            .
          </p>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ size: 'default' }),
              'min-h-11 rounded-full border-0 bg-white text-black hover:bg-white/90'
            )}
          >
            Contact support
          </Link>
        </div>
      </div>

      <label className="relative mt-10 block max-w-xl">
        <span className="sr-only">Search help</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/35"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help…"
          className="min-h-11 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-white/35 outline-none focus-visible:border-sky-400/50 focus-visible:ring-2 focus-visible:ring-sky-400/30"
        />
      </label>

      {filteredArticles.length > 0 ? (
        <section className="mt-12" aria-label="Guides">
          <h2 className="text-[11px] font-semibold tracking-[0.2em] text-white/35 uppercase">
            Guides
          </h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {filteredArticles.map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/help/${article.slug}`}
                  className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-sky-400/35 hover:bg-sky-500/[0.06]"
                >
                  <span className="text-[10px] tracking-wider text-sky-300/80 uppercase">
                    {article.category}
                  </span>
                  <span className="mt-2 font-serif text-lg text-white">{article.title}</span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-white/45">
                    {article.description}
                  </span>
                  <span className="mt-4 text-xs font-medium text-sky-300">Read guide →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-14 space-y-10">
        {filteredTopics.length === 0 ? (
          <p className="text-sm text-white/45">No FAQ matches. Try a different search or Contact.</p>
        ) : (
          filteredTopics.map((topic) => (
            <section key={topic.title}>
              <h2 className="font-serif text-2xl font-light text-white">{topic.title}</h2>
              <div className="mt-4 space-y-2">
                {topic.items.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-white/10 bg-white/[0.03] px-4 py-1 open:bg-white/[0.05]"
                  >
                    <summary className="cursor-pointer list-none py-3 text-sm font-medium text-white marker:content-none [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center justify-between gap-3">
                        {item.q}
                        <span className="text-white/30 transition-transform group-open:rotate-45">
                          +
                        </span>
                      </span>
                    </summary>
                    <div className="border-t border-white/8 pb-4 pt-3 text-sm leading-relaxed text-white/50">
                      <p>{item.a}</p>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="mt-3 inline-block text-sky-300 hover:text-sky-200"
                        >
                          {item.linkLabel ?? 'Learn more'} →
                        </Link>
                      ) : null}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <aside className="mt-16 grid gap-4 border-t border-white/8 pt-10 sm:grid-cols-3">
        {[
          { href: '/changelog', label: 'Changelog', body: 'What we shipped recently.' },
          { href: '/blog', label: 'Blog', body: 'Field notes for operators.' },
          { href: '/pricing', label: 'Pricing', body: 'Credits and plan limits.' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-sky-400/30"
          >
            <p className="font-medium text-white">{item.label}</p>
            <p className="mt-1 text-sm text-white/45">{item.body}</p>
          </Link>
        ))}
      </aside>
    </div>
  )
}
