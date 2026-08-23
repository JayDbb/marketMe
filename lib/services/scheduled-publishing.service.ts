import 'server-only'

import { isAutoPublishEnabled } from '@/lib/auto-publish'
import { publishToInstagram } from '@/lib/services/marketing-ai.service'
import { supabaseAdmin } from '@/lib/supabase/admin'

export type ScheduledPublishResult = {
  success: boolean
  count: number
  failed: number
  skipped?: boolean
  postIds: string[]
  errors: Array<{ postId: string; error: string }>
}

type DuePostRow = {
  id: string
  image_url: string | null
  content_plans: { business_profile_id: string | null } | null
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

  const due = (posts ?? []) as DuePostRow[]
  if (due.length === 0) {
    return {
      success: true,
      count: 0,
      failed: 0,
      postIds: [],
      errors: [],
    }
  }

  const postIds: string[] = []
  const errors: Array<{ postId: string; error: string }> = []
  let count = 0
  let failed = 0

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

      await publishToInstagram({
        post_id: post.id,
        business_profile_id: businessId,
        image_url: imageUrl,
      })

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
      console.error(`[scheduled-publishing] failed for post ${post.id}:`, message)
      await supabaseAdmin
        .from('posts')
        .update({
          status: 'failed',
          error_message: message.slice(0, 500),
        })
        .eq('id', post.id)
      errors.push({ postId: post.id, error: message })
      failed += 1
    }
  }

  return {
    success: failed === 0,
    count,
    failed,
    postIds,
    errors,
  }
}
