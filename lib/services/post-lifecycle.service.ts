import { isAutoPublishEnabled } from '@/lib/auto-publish'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { moderatePost } from '@/lib/services/moderation.service'
import {
  recordApprovalSignal,
  recordRejectFeedback,
} from '@/lib/services/brand-memory.service'
import { publishToInstagram } from '@/lib/services/marketing-ai.service'
import type { Post, PostStatus } from '@/types/content-plan'

export class PostLifecycleError extends Error {
  readonly status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'PostLifecycleError'
    this.status = status
  }
}

const ALLOWED_TRANSITIONS: Record<PostStatus, PostStatus[]> = {
  draft: ['approved', 'rejected'],
  approved: ['scheduled', 'draft', 'rejected'],
  scheduled: ['published', 'failed', 'approved'],
  published: [],
  failed: ['draft', 'scheduled'],
  rejected: ['draft'],
}

export function canTransition(from: PostStatus, to: PostStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}

async function getOwnedPost(userId: string, postId: string): Promise<Post> {
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('*')
    .eq('id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw new PostLifecycleError(error.message, 500)
  }

  if (!data) {
    throw new PostLifecycleError('Post not found', 404)
  }

  return data as Post
}

export async function verifyPostOwnership(
  userId: string,
  postId: string
): Promise<Post> {
  return getOwnedPost(userId, postId)
}

export async function transitionPostStatus(
  userId: string,
  postId: string,
  nextStatus: PostStatus,
  options?: {
    scheduledAt?: string
    skipModeration?: boolean
    /** Optional “why” when rejecting — stored as brand memory */
    feedback?: string
    /** Stored on the post when moving to failed; cleared when leaving failed */
    errorMessage?: string
  }
): Promise<{ data: Post | null; error: string | null }> {
  try {
    const post = await getOwnedPost(userId, postId)
    const current = post.status as PostStatus

    if (current === nextStatus) {
      return { data: post, error: null }
    }

    if (!canTransition(current, nextStatus)) {
      throw new PostLifecycleError(
        `Cannot transition post from "${current}" to "${nextStatus}"`
      )
    }

    if (nextStatus === 'approved' && !options?.skipModeration) {
      const moderation = await moderatePost({
        id: post.id,
        user_id: post.user_id,
        content: post.content,
        image_url: post.image_url,
      })

      if (!moderation.passed) {
        throw new PostLifecycleError(
          moderation.blockingMessages[0] ?? 'Post failed moderation review',
          422
        )
      }
    }

    if (nextStatus === 'scheduled') {
      const scheduledAt = options?.scheduledAt ?? post.scheduled_at

      if (!scheduledAt) {
        throw new PostLifecycleError(
          'A scheduled date is required before queuing a post'
        )
      }
    }

    if (nextStatus === 'published' && !isAutoPublishEnabled()) {
      throw new PostLifecycleError(
        'Instagram auto-publish is disabled. Set ENABLE_AUTO_PUBLISH=true (or INSTAGRAM_PUBLISH_ENABLED=true) and connect Instagram.',
        503
      )
    }

    const updateData: Record<string, unknown> = {
      status: nextStatus,
    }

    if (options?.scheduledAt) {
      updateData.scheduled_at = options.scheduledAt
    }

    if (nextStatus === 'approved') {
      updateData.approved_at = new Date().toISOString()
      updateData.approved_by = userId
    }

    if (nextStatus === 'draft' || nextStatus === 'rejected') {
      updateData.approved_at = null
      updateData.approved_by = null
    }

    if (nextStatus === 'failed') {
      updateData.error_message =
        options?.errorMessage?.trim().slice(0, 500) ||
        'Publishing failed. Retry only if this post is not already live.'
    } else if (current === 'failed') {
      updateData.error_message = null
    }

    const { data, error } = await supabaseAdmin
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new PostLifecycleError(error.message, 500)
    }

    const updated = data as Post

    try {
      if (nextStatus === 'approved' || nextStatus === 'scheduled') {
        await recordApprovalSignal({
          userId,
          finalCaption: updated.content ?? '',
        })
      }

      if (nextStatus === 'rejected') {
        await recordRejectFeedback({
          userId,
          feedback: options?.feedback,
          caption: updated.content,
        })
      }
    } catch (memoryErr) {
      console.error('Brand memory signal failed:', memoryErr)
    }

    return {
      data: updated,
      error: null,
    }
  } catch (error) {
    if (error instanceof PostLifecycleError) {
      return {
        data: null,
        error: error.message,
      }
    }

    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error',
    }
  }
}

/** Approve then queue for publishing at the scheduled time. */
export async function approveAndSchedulePost(
  userId: string,
  postId: string,
  scheduledAt?: string
): Promise<{ data: Post | null; error: string | null }> {
  const post = await getOwnedPost(userId, postId)

  if (post.status === 'scheduled') {
    return { data: post, error: null }
  }

  if (post.status === 'draft' || post.status === 'rejected') {
    const approved = await transitionPostStatus(userId, postId, 'approved')

    if (approved.error || !approved.data) {
      return {
        data: null,
        error: approved.error ?? 'Approval failed',
      }
    }
  }

  return transitionPostStatus(userId, postId, 'scheduled', {
    scheduledAt: scheduledAt ?? post.scheduled_at ?? undefined,
  })
}

/** Re-queue a failed post, or return it to draft if it has no time. */
export async function retryFailedPost(
  userId: string,
  postId: string
): Promise<{ data: Post | null; error: string | null }> {
  try {
    const post = await getOwnedPost(userId, postId)
    if (post.status !== 'failed') {
      throw new PostLifecycleError('Only failed posts can be retried')
    }

    const nextStatus: PostStatus = post.scheduled_at ? 'scheduled' : 'draft'
    return transitionPostStatus(userId, postId, nextStatus)
  } catch (error) {
    if (error instanceof PostLifecycleError) {
      return { data: null, error: error.message }
    }
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export type UpdateExistingPostForScheduleInput = {
  platform: string
  content: string
  scheduledAt: string
  canvasData?: unknown
  templateId?: string | null
  imageUrl?: string | null
}

/**
 * Update a post that already exists in the canonical `posts` table, then
 * approve and schedule that same row.
 *
 * This is used for pipeline-generated posts so scheduling does not create a
 * duplicate post record.
 */
export async function updateExistingPostForSchedule(
  userId: string,
  postId: string,
  input: UpdateExistingPostForScheduleInput
): Promise<{ data: Post | null; error: string | null }> {
  try {
    const existingPost = await getOwnedPost(userId, postId)
    const content = input.content.trim()
    const platform = input.platform.trim()

    if (!content) {
      throw new PostLifecycleError('Post content cannot be empty')
    }

    if (!platform) {
      throw new PostLifecycleError('A platform is required')
    }

    if (!input.scheduledAt) {
      throw new PostLifecycleError('A scheduled date is required')
    }

    const updateData: Record<string, unknown> = {
      platform,
      content,
      scheduled_at: input.scheduledAt,
      canvas_data: input.canvasData ?? existingPost.canvas_data ?? null,
      template_id: input.templateId ?? null,
    }

    if (input.imageUrl !== undefined) {
      updateData.image_url = input.imageUrl
    }

    const { error: updateError } = await supabaseAdmin
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .eq('user_id', userId)

    if (updateError) {
      throw new PostLifecycleError(updateError.message, 500)
    }

    return approveAndSchedulePost(userId, postId, input.scheduledAt)
  } catch (error) {
    if (error instanceof PostLifecycleError) {
      return { data: null, error: error.message }
    }

    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function resolveBusinessProfileId(post: Post): Promise<string | null> {
  if (post.business_profile_id) {
    return post.business_profile_id
  }

  if (!post.content_plan_id) {
    return null
  }

  const { data } = await supabaseAdmin
    .from('content_plans')
    .select('business_profile_id')
    .eq('id', post.content_plan_id)
    .maybeSingle()

  return (data?.business_profile_id as string | undefined) ?? null
}

/**
 * Publish a post to Instagram immediately (not via the scheduled cron).
 * Approves drafts first when needed.
 */
export async function publishPostNow(
  userId: string,
  postId: string
): Promise<{ data: Post | null; error: string | null; instagramPostId?: string }> {
  try {
    let post = await getOwnedPost(userId, postId)
    const status = post.status as PostStatus

    if (status === 'published') {
      throw new PostLifecycleError('This post is already published')
    }

    if (status === 'draft' || status === 'rejected') {
      const approved = await transitionPostStatus(userId, postId, 'approved')
      if (approved.error || !approved.data) {
        return {
          data: null,
          error: approved.error ?? 'Approval failed before publishing',
        }
      }
      post = approved.data
    }

    const imageUrl = post.image_url?.trim().replace(/\?+$/, '')
    if (!imageUrl) {
      throw new PostLifecycleError(
        'Add an image before publishing to Instagram',
        422
      )
    }

    const businessProfileId = await resolveBusinessProfileId(post)
    if (!businessProfileId) {
      throw new PostLifecycleError(
        'Connect a business profile before publishing',
        422
      )
    }

    let instagramPostId: string | undefined

    try {
      const result = await publishToInstagram({
        post_id: post.id,
        business_profile_id: businessProfileId,
        image_url: imageUrl,
      })
      instagramPostId = result.instagram_post_id
        ? String(result.instagram_post_id)
        : undefined
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Instagram publishing failed'

      await supabaseAdmin
        .from('posts')
        .update({
          status: 'failed',
          error_message: message.slice(0, 500),
        })
        .eq('id', postId)
        .eq('user_id', userId)

      const { trackProductEvent, PRODUCT_EVENTS } = await import(
        '@/lib/analytics/first-party'
      )
      void trackProductEvent({
        userId,
        event: PRODUCT_EVENTS.postPublishFailed,
        props: { post_id: postId, error: message.slice(0, 200) },
      })

      return { data: null, error: message }
    }

    const { data, error } = await supabaseAdmin
      .from('posts')
      .update({
        status: 'published',
        error_message: null,
        image_url: imageUrl,
      })
      .eq('id', postId)
      .eq('user_id', userId)
      .select()
      .single()

    const { trackProductEvent, PRODUCT_EVENTS } = await import(
      '@/lib/analytics/first-party'
    )
    void trackProductEvent({
      userId,
      event: PRODUCT_EVENTS.postPublished,
      props: {
        post_id: postId,
        instagram_post_id: instagramPostId ?? null,
      },
    })

    if (error || !data) {
      // Instagram already succeeded — surface a soft warning via returned data shape
      return {
        data: post,
        error: null,
        instagramPostId,
      }
    }

    return {
      data: data as Post,
      error: null,
      instagramPostId,
    }
  } catch (error) {
    if (error instanceof PostLifecycleError) {
      return { data: null, error: error.message }
    }
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}