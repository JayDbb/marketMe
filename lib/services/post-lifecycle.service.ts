import { supabaseAdmin } from '@/lib/supabase/admin'
import { moderatePost } from '@/lib/services/moderation.service'
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

export async function verifyPostOwnership(userId: string, postId: string): Promise<Post> {
  return getOwnedPost(userId, postId)
}

export async function transitionPostStatus(
  userId: string,
  postId: string,
  nextStatus: PostStatus,
  options?: { scheduledAt?: string; skipModeration?: boolean }
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

    if (nextStatus === 'approved') {
      if (!options?.skipModeration) {
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
    }

    if (nextStatus === 'scheduled') {
      const scheduledAt = options?.scheduledAt ?? post.scheduled_at
      if (!scheduledAt) {
        throw new PostLifecycleError('A scheduled date is required before queuing a post')
      }
    }

    if (nextStatus === 'published') {
      if (process.env.ENABLE_AUTO_PUBLISH !== 'true') {
        throw new PostLifecycleError(
          'Publishing is not enabled yet. Connect Instagram to publish posts.',
          503
        )
      }
    }

    const updateData: Record<string, unknown> = { status: nextStatus }

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

    return { data: data as Post, error: null }
  } catch (err) {
    if (err instanceof PostLifecycleError) {
      return { data: null, error: err.message }
    }
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { data: null, error: message }
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
      return { data: null, error: approved.error ?? 'Approval failed' }
    }
  }

  return transitionPostStatus(userId, postId, 'scheduled', {
    scheduledAt: scheduledAt ?? post.scheduled_at ?? undefined,
  })
}
