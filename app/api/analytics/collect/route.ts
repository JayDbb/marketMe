import { NextRequest, NextResponse } from 'next/server'
import {
  insertPageview,
  insertPerformanceSamples,
} from '@/lib/analytics/first-party'
import { isRateLimitError, rateLimitOrThrow } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_METRICS = new Set(['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB', 'Next.js-hydration', 'Next.js-route-change-to-render', 'Next.js-render'])

export async function POST(request: NextRequest) {
  try {
    rateLimitOrThrow(`analytics:ingest:${request.headers.get('x-forwarded-for') ?? 'anon'}`, 120, 60_000)
  } catch (e) {
    if (isRateLimitError(e)) {
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    throw e
  }

  const body = (await request.json().catch(() => null)) as
    | {
        type?: 'vitals' | 'pageview'
        samples?: Array<{
          name?: string
          metric?: string
          value?: number
          rating?: string
          path?: string
          navigationType?: string
        }>
        path?: string
        referrer?: string
      }
    | null

  if (!body?.type) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  try {
    if (body.type === 'vitals') {
      const samples = (body.samples ?? [])
        .map((s) => ({
          metric: String(s.name ?? s.metric ?? ''),
          value: Number(s.value),
          rating: s.rating ?? null,
          path: s.path ?? null,
          navigationType: s.navigationType ?? null,
        }))
        .filter((s) => ALLOWED_METRICS.has(s.metric) || s.metric.startsWith('Next.js'))

      await insertPerformanceSamples(samples)
      return NextResponse.json({ ok: true, count: samples.length })
    }

    if (body.type === 'pageview') {
      const path = String(body.path ?? '')
      if (!path.startsWith('/')) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
      }
      // Skip noisy admin/auth internals
      if (
        path.startsWith('/api/') ||
        path.startsWith('/_next/') ||
        path.startsWith('/dashboard/admin')
      ) {
        return NextResponse.json({ ok: true, skipped: true })
      }

      await insertPageview({
        path,
        referrer: body.referrer ?? null,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
        userAgent: request.headers.get('user-agent'),
      })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ingest failed'
    // Tables may not exist until migration 042 — soft-fail so clients don't retry-storm.
    if (/relation .* does not exist|schema cache/i.test(message)) {
      return NextResponse.json({ ok: false, skipped: true }, { status: 202 })
    }
    console.error('[analytics/collect]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
