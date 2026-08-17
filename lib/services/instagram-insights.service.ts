import 'server-only'

import { MarketingAIError, getPublishInsights } from '@/lib/services/marketing-ai.service'
import type { PublishInsightsPayload } from '@/lib/social/publish-api-contract'
import { supabaseAdmin } from '@/lib/supabase/admin'

export type InsightsSyncStatus =
  | 'empty'
  | 'ready'
  | 'stale'
  | 'unavailable'
  | 'error'

export type InstagramAccountInsights = {
  id: string
  businessProfileId: string
  userId: string
  platform: string
  handle: string | null
  externalAccountId: string | null
  periodDays: number
  totals: Record<string, number | null>
  bestPostingTimes: Array<Record<string, unknown>>
  topPosts: Array<Record<string, unknown>>
  learningNotes: string[]
  status: InsightsSyncStatus
  lastError: string | null
  fetchedAt: string | null
  updatedAt: string
}

function asNotes(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((n) => (typeof n === 'string' ? n.trim() : ''))
    .filter(Boolean)
    .slice(0, 12)
}

function asObjectArray(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return []
  return value
    .filter((row): row is Record<string, unknown> => !!row && typeof row === 'object')
    .slice(0, 20)
}

function rowToInsights(row: Record<string, unknown>): InstagramAccountInsights {
  return {
    id: String(row.id),
    businessProfileId: String(row.business_profile_id),
    userId: String(row.user_id),
    platform: String(row.platform ?? 'instagram'),
    handle: (row.handle as string | null) ?? null,
    externalAccountId: (row.external_account_id as string | null) ?? null,
    periodDays: Number(row.period_days ?? 30),
    totals:
      row.totals && typeof row.totals === 'object'
        ? (row.totals as Record<string, number | null>)
        : {},
    bestPostingTimes: asObjectArray(row.best_posting_times),
    topPosts: asObjectArray(row.top_posts),
    learningNotes: asNotes(row.learning_notes),
    status: (row.status as InsightsSyncStatus) || 'empty',
    lastError: (row.last_error as string | null) ?? null,
    fetchedAt: (row.fetched_at as string | null) ?? null,
    updatedAt: String(row.updated_at ?? row.created_at ?? new Date().toISOString()),
  }
}

export async function getCachedInstagramInsights(
  businessProfileId: string,
  userId: string
): Promise<InstagramAccountInsights | null> {
  const { data, error } = await supabaseAdmin
    .from('instagram_account_insights')
    .select('*')
    .eq('business_profile_id', businessProfileId)
    .eq('user_id', userId)
    .eq('platform', 'instagram')
    .maybeSingle()

  if (error) {
    // Table may not exist until migration 035 is applied.
    console.error('[insights] cache load failed:', error.message)
    return null
  }
  if (!data) return null
  return rowToInsights(data as Record<string, unknown>)
}

export function formatInsightsPromptBlock(
  insights: InstagramAccountInsights | null | undefined
): string {
  if (!insights || insights.status !== 'ready') return ''

  const parts: string[] = []
  const totals = insights.totals
  const metricBits = [
    totals.reach != null ? `reach ${totals.reach}` : null,
    totals.likes != null ? `likes ${totals.likes}` : null,
    totals.comments != null ? `comments ${totals.comments}` : null,
    totals.saves != null ? `saves ${totals.saves}` : null,
  ].filter(Boolean)

  parts.push(
    `Instagram performance${insights.handle ? ` (@${insights.handle.replace(/^@/, '')})` : ''} last ${insights.periodDays} days${
      metricBits.length ? `: ${metricBits.join(', ')}` : ''
    }.`
  )

  if (insights.learningNotes.length > 0) {
    parts.push(
      `What worked (prefer these patterns):\n${insights.learningNotes
        .map((n) => `- ${n}`)
        .join('\n')}`
    )
  }

  const top = insights.topPosts.slice(0, 3)
  if (top.length > 0) {
    parts.push(
      `Top posts to emulate (do not copy verbatim):\n${top
        .map((p, i) => {
          const excerpt =
            typeof p.caption_excerpt === 'string'
              ? p.caption_excerpt.slice(0, 120)
              : typeof p.why_it_worked === 'string'
                ? p.why_it_worked.slice(0, 120)
                : 'strong engagement'
          const likes = typeof p.likes === 'number' ? ` · ${p.likes} likes` : ''
          return `${i + 1}. ${excerpt}${likes}`
        })
        .join('\n')}`
    )
  }

  const windows = insights.bestPostingTimes.slice(0, 3)
  if (windows.length > 0) {
    parts.push(
      `Preferred posting windows:\n${windows
        .map((w) => {
          const day = typeof w.day === 'string' ? w.day : 'day'
          const hour =
            typeof w.hour_local === 'number' ? `${w.hour_local}:00` : ''
          const reason = typeof w.reason === 'string' ? ` (${w.reason})` : ''
          return `- ${day}${hour ? ` ${hour}` : ''}${reason}`
        })
        .join('\n')}`
    )
  }

  return `\n\nAccount insights (optimize for this brand's real performance):\n${parts.join('\n\n')}`
}

function deriveLearningNotes(payload: PublishInsightsPayload): string[] {
  if (Array.isArray(payload.learning_notes) && payload.learning_notes.length > 0) {
    return asNotes(payload.learning_notes)
  }

  const notes: string[] = []
  for (const post of payload.top_posts ?? []) {
    if (typeof post.why_it_worked === 'string' && post.why_it_worked.trim()) {
      notes.push(post.why_it_worked.trim().slice(0, 200))
    } else if (typeof post.media_type === 'string' && post.media_type.trim()) {
      notes.push(`Strong engagement on ${post.media_type} posts`)
    }
  }
  return notes.slice(0, 8)
}

/**
 * Pull insights from MarketMe AI publish API and cache locally.
 * Safe when the Render endpoint is not deployed yet (status: unavailable).
 */
export async function syncInstagramInsights(input: {
  businessProfileId: string
  userId: string
}): Promise<{
  insights: InstagramAccountInsights | null
  source: 'marketme-ai' | 'cache' | 'unavailable' | 'error'
  warning?: string
}> {
  const cached = await getCachedInstagramInsights(
    input.businessProfileId,
    input.userId
  )

  try {
    const raw = await getPublishInsights(input.businessProfileId, {
      platform: 'instagram',
    })
    const payload = (raw ?? {}) as PublishInsightsPayload
    const learningNotes = deriveLearningNotes(payload)
    const now = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('instagram_account_insights')
      .upsert(
        {
          business_profile_id: input.businessProfileId,
          user_id: input.userId,
          platform: 'instagram',
          handle: payload.handle ?? null,
          external_account_id: payload.instagram_user_id ?? null,
          period_days: payload.period_days ?? 30,
          totals: payload.totals ?? {},
          best_posting_times: payload.best_posting_times ?? [],
          top_posts: payload.top_posts ?? [],
          learning_notes: learningNotes,
          raw: payload,
          status: 'ready',
          last_error: null,
          fetched_at: payload.fetched_at ?? now,
          updated_at: now,
        },
        { onConflict: 'business_profile_id,platform' }
      )
      .select('*')
      .single()

    if (error) {
      console.error('[insights] upsert failed:', error.message)
      return {
        insights: cached,
        source: cached ? 'cache' : 'error',
        warning: error.message,
      }
    }

    return {
      insights: rowToInsights(data as Record<string, unknown>),
      source: 'marketme-ai',
    }
  } catch (error) {
    const message =
      error instanceof MarketingAIError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Insights sync failed'
    const unavailable =
      error instanceof MarketingAIError &&
      (error.status === 404 || /not found/i.test(message))

    const status: InsightsSyncStatus = unavailable ? 'unavailable' : 'error'
    const now = new Date().toISOString()

    await supabaseAdmin.from('instagram_account_insights').upsert(
      {
        business_profile_id: input.businessProfileId,
        user_id: input.userId,
        platform: 'instagram',
        status,
        last_error: message.slice(0, 500),
        updated_at: now,
        ...(cached
          ? {}
          : {
              totals: {},
              best_posting_times: [],
              top_posts: [],
              learning_notes: [],
            }),
      },
      { onConflict: 'business_profile_id,platform' }
    )

    return {
      insights: cached?.status === 'ready' ? { ...cached, status: 'stale' } : cached,
      source: unavailable ? 'unavailable' : cached ? 'cache' : 'error',
      warning: unavailable
        ? 'Instagram insights are not enabled on the publish API yet.'
        : message,
    }
  }
}
