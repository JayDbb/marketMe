import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { createPageMetadata } from '@/lib/metadata'
import { getAllHelpArticles, getHelpArticle } from '@/lib/help-articles'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return getAllHelpArticles().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = getHelpArticle(slug)
  if (!article) return {}
  return createPageMetadata({
    title: article.title,
    description: article.description,
    path: `/help/${article.slug}`,
  })
}

export default async function HelpArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = getHelpArticle(slug)
  if (!article) notFound()

  return (
    <MarketingPageShell mainClassName="pb-24">
      <article className="mx-auto max-w-3xl px-6 pt-36 md:pt-40">
        <Link
          href="/help"
          className="text-sm text-white/40 transition-colors hover:text-sky-300"
        >
          ← All help
        </Link>
        <p className="mt-8 text-[11px] font-semibold tracking-[0.2em] text-sky-400/80 uppercase">
          {article.category}
        </p>
        <h1 className="mt-3 font-serif text-4xl font-light tracking-tighter text-white md:text-5xl">
          {article.title}
        </h1>
        <p className="mt-3 text-xs text-white/40">Updated {article.updated}</p>
        <p className="mt-6 text-base leading-relaxed text-white/55">{article.description}</p>

        <div className="mt-10 space-y-4 text-sm leading-relaxed text-white/60">
          {article.body.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>

        {article.steps?.length ? (
          <ol className="mt-10 list-decimal space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 pl-10 text-sm text-white/65">
            {article.steps.map((step) => (
              <li key={step.slice(0, 48)} className="pl-1">
                {step}
              </li>
            ))}
          </ol>
        ) : null}

        <div className="mt-12 flex flex-wrap gap-4 border-t border-white/8 pt-8">
          <Link href="/contact" className="text-sm font-medium text-sky-300 hover:text-sky-200">
            Still need help? Contact →
          </Link>
          <Link href="/changelog" className="text-sm font-medium text-sky-300 hover:text-sky-200">
            Changelog →
          </Link>
        </div>
      </article>
    </MarketingPageShell>
  )
}
