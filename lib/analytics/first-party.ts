import 'server-only'

import { createHash, randomBytes } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const PRODUCT_EVENTS = {
  onboardingCompleted: 'onboarding_completed',
  instagramConnected: 'instagram_connected',
  postPublished: 'post_published',
  postPublishFailed: 'post_publish_failed',
  postScheduled: 'post_scheduled',
} as const

export type ProductEventName =
  (typeof PRODUCT_EVENTS)[keyof typeof PRODUCT_EVENTS]

/** Fire-and-forget product event. Never throws to callers. */
export async function trackProductEvent(input: {
  userId?: string | null
  event: ProductEventName | string
  props?: Record<string, unknown>
}): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from('product_events').insert({
      user_id: input.userId ?? null,
      event: input.event,
      props: input.props ?? {},
    })
    if (error) {
      console.error('[analytics] product event failed:', error.message)
    }
  } catch (err) {
    console.error('[analytics] product event failed:', err)
  }
}

export async function insertPerformanceSamples(
  samples: Array<{
    metric: string
    value: number
    rating?: string | null
    path?: string | null
    navigationType?: string | null
  }>
): Promise<void> {
  if (samples.length === 0) return
  const rows = samples
    .filter(
      (s) =>
        typeof s.metric === 'string' &&
        s.metric.length > 0 &&
        s.metric.length < 32 &&
        Number.isFinite(s.value)
    )
    .slice(0, 20)
    .map((s) => ({
      metric: s.metric,
      value: s.value,
      rating: s.rating?.slice(0, 32) ?? null,
      path: (s.path ?? '/').slice(0, 500),
      navigation_type: s.navigationType?.slice(0, 32) ?? null,
    }))

  if (rows.length === 0) return
  const { error } = await supabaseAdmin.from('performance_events').insert(rows)
  if (error) throw new Error(error.message)
}

export async function insertPageview(input: {
  path: string
  referrer?: string | null
  ip?: string | null
  userAgent?: string | null
}): Promise<void> {
  const path = input.path.trim().slice(0, 500) || '/'
  if (!path.startsWith('/')) return

  const day = new Date().toISOString().slice(0, 10)
  const salt = process.env.ANALYTICS_VISITOR_SALT?.trim() || day
  const material = `${salt}|${day}|${input.ip ?? ''}|${(input.userAgent ?? '').slice(0, 120)}`
  const visitorHash = createHash('sha256').update(material).digest('hex').slice(0, 32)

  const { error } = await supabaseAdmin.from('page_events').insert({
    path,
    referrer: input.referrer?.slice(0, 500) || null,
    visitor_hash: visitorHash,
  })
  if (error) throw new Error(error.message)
}

/** Percentile helper (nearest-rank). */
export function percentile(sortedAsc: number[], p: number): number | null {
  if (sortedAsc.length === 0) return null
  const idx = Math.min(
    sortedAsc.length - 1,
    Math.max(0, Math.ceil((p / 100) * sortedAsc.length) - 1)
  )
  return sortedAsc[idx] ?? null
}

export function randomBeaconToken(): string {
  return randomBytes(8).toString('hex')
}
