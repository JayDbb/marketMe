import { getChangelogEntries, changelogTagLabels } from '@/lib/changelog-entries'
import { siteConfig } from '@/lib/site'

export const dynamic = 'force-static'
export const revalidate = 3600

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export async function GET() {
  const base = siteConfig.url.replace(/\/$/, '')
  const entries = getChangelogEntries()

  const items = entries
    .map((entry) => {
      const link = `${base}/changelog#${entry.id}`
      const categories = entry.tags
        .map((t) => `<category>${escapeXml(changelogTagLabels[t])}</category>`)
        .join('')
      return `
    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="false">${escapeXml(entry.id)}</guid>
      <pubDate>${new Date(entry.date).toUTCString()}</pubDate>
      <description>${escapeXml(entry.summary)}</description>
      ${categories}
    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Marketme Changelog</title>
    <link>${base}/changelog</link>
    <description>Product updates for Marketme — features, fixes, and legal changes.</description>
    <language>en-us</language>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
