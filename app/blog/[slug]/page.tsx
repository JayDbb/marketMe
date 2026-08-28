import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { createPageMetadata } from '@/lib/metadata'
import {
  formatBlogDate,
  getAllBlogPosts,
  getBlogPost,
} from '@/lib/blog-posts'

type PageProps = {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-static'

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) {
    return createPageMetadata({
      title: 'Post not found',
      description: 'This blog post could not be found.',
      path: `/blog/${slug}`,
    })
  }
  return createPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  })
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const others = getAllBlogPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3)

  return (
    <MarketingPageShell mainClassName="pb-24">
      <article className="mx-auto max-w-3xl px-6 pt-36 md:pt-40">
        <Link
          href="/blog"
          className="text-xs font-medium text-white/40 transition-colors hover:text-sky-300"
        >
          ← All posts
        </Link>

        <header className="mt-8 border-b border-white/8 pb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-400/80">
            {post.category}
          </p>
          <h1 className="mt-4 font-serif text-4xl font-light tracking-tighter text-white md:text-5xl">
            {post.title}
          </h1>
          <div className="mt-5 flex flex-wrap gap-3 text-xs text-white/40">
            <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readMinutes} min read</span>
          </div>
        </header>

        <div className="mt-10 space-y-6 text-base leading-relaxed text-white/60 md:text-lg">
          {post.body.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
      </article>

      {others.length > 0 ? (
        <aside className="mx-auto mt-20 max-w-3xl border-t border-white/8 px-6 pt-12">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
            Keep reading
          </h2>
          <ul className="mt-5 space-y-4">
            {others.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/blog/${item.slug}`}
                  className="group block rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 transition-colors hover:border-sky-400/30"
                >
                  <p className="text-[11px] uppercase tracking-wider text-sky-300/70">
                    {item.category}
                  </p>
                  <p className="mt-1 font-serif text-lg text-white group-hover:text-sky-100">
                    {item.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </MarketingPageShell>
  )
}
