import Link from 'next/link'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { createPageMetadata } from '@/lib/metadata'
import { formatBlogDate, getAllBlogPosts } from '@/lib/blog-posts'

export const metadata = createPageMetadata({
  title: 'Blog',
  description:
    'Practical notes on AI content review, scheduling rhythms, Studio templates, and social connections for Marketme users.',
  path: '/blog',
})

export const dynamic = 'force-static'

export default function BlogPage() {
  const posts = getAllBlogPosts()
  const featured = posts.filter((p) => p.featured)
  const rest = posts.filter((p) => !p.featured)

  return (
    <MarketingPageShell mainClassName="pb-24">
      <div className="mx-auto max-w-6xl px-6 pt-36 md:pt-40">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400/80">
          Journal
        </p>
        <div className="grid gap-8 border-b border-white/8 pb-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <h1 className="max-w-xl font-serif text-4xl font-light tracking-tighter text-white md:text-6xl">
            Field notes for{' '}
            <span className="italic font-medium text-sky-400">operators</span>
          </h1>
          <p className="max-w-md text-base leading-relaxed text-white/50 md:text-lg">
            Short, practical pieces on generation, review, calendars, and connections — written for
            people who ship weekly content, not for buzzword bingo.
          </p>
        </div>

        {featured.length > 0 ? (
          <section className="mt-12 grid gap-5 md:grid-cols-2" aria-label="Featured posts">
            {featured.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-colors hover:border-sky-400/35 hover:bg-sky-500/[0.06]"
              >
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-white/35">
                  <span className="text-sky-300/80">{post.category}</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{post.readMinutes} min</span>
                </div>
                <h2 className="mt-4 font-serif text-2xl font-light tracking-tight text-white transition-colors group-hover:text-sky-100 md:text-3xl">
                  {post.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/45">{post.excerpt}</p>
                <span className="mt-6 text-xs font-medium text-sky-300/90">Read article →</span>
              </Link>
            ))}
          </section>
        ) : null}

        <section className="mt-16" aria-label="All posts">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
            All posts
          </h2>
          <ul className="mt-6 divide-y divide-white/8 border-y border-white/8">
            {(rest.length > 0 ? rest : posts).map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="grid gap-2 py-5 transition-colors hover:bg-white/[0.02] md:grid-cols-[140px_1fr_auto] md:items-baseline md:gap-6"
                >
                  <time
                    dateTime={post.date}
                    className="text-xs text-white/35 md:pt-1"
                  >
                    {formatBlogDate(post.date)}
                  </time>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-sky-300/70">
                      {post.category}
                    </p>
                    <h3 className="mt-1 font-serif text-xl font-light text-white md:text-2xl">
                      {post.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm text-white/45">{post.excerpt}</p>
                  </div>
                  <span className="text-xs text-white/30 md:pt-1">{post.readMinutes} min</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </MarketingPageShell>
  )
}
