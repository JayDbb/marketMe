import 'server-only'

/** Best-effort public website text for research (no JS rendering). */
export async function fetchWebsiteSnapshot(
  website: string | null | undefined
): Promise<string | null> {
  const raw = website?.trim()
  if (!raw) return null

  let url = raw
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8_000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'MarketMeBrandResearch/1.0 (+https://marketme.app)',
        Accept: 'text/html,text/plain',
      },
      redirect: 'follow',
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const html = await res.text()
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 4_000)
    return text || null
  } catch (error) {
    console.error('[website-snapshot] fetch failed', {
      website: raw,
      message: error instanceof Error ? error.message : 'unknown',
    })
    return null
  }
}
