import 'server-only'

import { isAutoPublishEnabled } from '@/lib/auto-publish'
import {
  MarketingAIError,
  publishToInstagram,
} from '@/lib/services/marketing-ai.service'
import { supabaseAdmin } from '@/lib/supabase/admin'

export type ScheduledPublishResult = {
  success: boolean
  count: number
  failed: number
  deferred: number
  skipped?: boolean
  postIds: string[]
  errors: Array<{ postId: string; error: string; retryable?: boolean }>
}

type DuePostRow = {
  id: string
  image_url: string | null
  content_plans: { business_profile_id: string | null } | null
}

/** Auth / permission failures — user must reconnect; do not keep retrying forever. */
function isAuthPublishError(message: string, status?: number): boolean {
  if (status === 401 || status === 403) return true
  return /oauth|token.*(expir|invalid|revok)|invalid.?access.?token|session.?has.?been.?invalidated|#190\b|needs.?reconnect|not.?connected|no.?instagram|permission.?denied|user.?not.?authorized/i.test(
    message
  )
}

/** Transient failures — leave post scheduled so the next cron can retry. */
function isRetryablePublishError(message: string, status?: number): boolean {
  if (isAuthPublishError(message, status)) return false
  if (status !== undefined && status >= 500) return true
  return /abort|timeout|timed?\s*out|econnreset|econnrefused|fetch failed|network|503|502|504|cold.?start|temporar/i.test(
    message
  )
}

/**
 * Publish all due scheduled posts to Instagram.
 * Safe to call from Trigger.dev cron or a Next.js / Vercel cron route.
 * Does not require the user to be online — tokens live on MarketMe AI.
 */
export async function publishDueScheduledPosts(): Promise<ScheduledPublishResult> {
  if (!isAutoPublishEnabled()) {
    return {
      success: true,
      count: 0,
      failed: 0,
      deferred: 0,
      skipped: true,
      postIds: [],
      errors: [],
    }
  }

  const now = new Date().toISOString()

  const { data: posts, error } = await supabaseAdmin
    .from('posts')
    .select('id, image_url, content_plans(business_profile_id)')
    .eq('status', 'scheduled')
    .not('approved_at', 'is', null)
    .lte('scheduled_at', now)

  if (error) {
    throw new Error(`Failed to query scheduled posts: ${error.message}`)
  }

  const rawPosts = (posts ?? []) as unknown as Array<{
    id: string
    image_url: string | null
    content_plans:
      | { business_profile_id: string | null }
      | Array<{ business_profile_id: string | null }>
      | null
  }>

  const due: DuePostRow[] = rawPosts.map((post) => ({
    id: post.id,
    image_url: post.image_url,
    content_plans: Array.isArray(post.content_plans)
      ? (post.content_plans[0] ?? null)
      : post.content_plans,
  }))

  if (due.length === 0) {
    return {
      success: true,
      count: 0,
      failed: 0,
      deferred: 0,
      postIds: [],
      errors: [],
    }
  }

  console.log(
    `[scheduled-publishing] due=${due.length} at ${now} ids=${due.map((p) => p.id).join(',')}`
  )

  const postIds: string[] = []
  const errors: Array<{ postId: string; error: string; retryable?: boolean }> = []
  let count = 0
  let failed = 0
  let deferred = 0

  for (const post of due) {
    try {
      const businessId = post.content_plans?.business_profile_id
      if (!businessId) {
        throw new Error(`Post ${post.id} content plan does not specify business_profile_id.`)
      }

      const imageUrl = post.image_url?.trim().replace(/\?+$/, '')
      if (!imageUrl) {
        throw new Error(`Post ${post.id} is missing an image_url.`)
      }

      // Long timeout: Render free/dev instances often cold-start at morning publish windows.
      await publishToInstagram(
        {
          post_id: post.id,
          business_profile_id: businessId,
          image_url: imageUrl,
        },
        { timeoutMs: 120_000, retries: 4 }
      )

      await supabaseAdmin
        .from('posts')
        .update({
          status: 'published',
          error_message: null,
          image_url: imageUrl,
        })
        .eq('id', post.id)

      postIds.push(post.id)
      count += 1
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      const status = err instanceof MarketingAIError ? err.status : undefined
      const retryable = isRetryablePublishError(message, status)
      const auth = isAuthPublishError(message, status)

      console.error(
        `[scheduled-publishing] failed for post ${post.id}:`,
        message,
        { retryable, auth, status }
      )

      if (retryable) {
        // Keep status=scheduled so the next cron attempt can succeed once AI is warm.
        await supabaseAdmin
          .from('posts')
          .update({
            error_message: `Retrying: ${message}`.slice(0, 500),
          })
          .eq('id', post.id)
        errors.push({ postId: post.id, error: message, retryable: true })
        deferred += 1
        continue
      }

      await supabaseAdmin
        .from('posts')
        .update({
          status: 'failed',
          error_message: (
            auth
              ? `Instagram needs reconnect: ${message}`
              : message
          ).slice(0, 500),
        })
        .eq('id', post.id)

      errors.push({ postId: post.id, error: message, retryable: false })
      failed += 1
    }
  }

  return {
    success: failed === 0,
    count,
    failed,
    deferred,
    postIds,
    errors,
  }
}
