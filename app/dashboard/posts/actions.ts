'use server'

import { revalidatePath } from 'next/cache'
import {
  approveCalendarPostAction,
  createCalendarPostAction,
  deleteCalendarPostAction,
  scheduleCalendarPostAction,
  updateCalendarPostAction,
} from '@/app/dashboard/calendar/actions'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import {
  publishPostNow,
  retryFailedPost,
} from '@/lib/services/post-lifecycle.service'
import { rateLimitMessage } from '@/lib/rate-limit'

function revalidatePostPaths() {
  revalidatePath('/dashboard/posts')
  revalidatePath('/dashboard/calendar')
}

export async function createPostAction(payload: {
  caption: string
  platform: string
  scheduledDate: string
  imageUrl?: string | null
  imageFile?: File | null
}) {
  const result = await createCalendarPostAction(payload)
  if (result.success) revalidatePostPaths()
  return result
}

export async function updatePostAction(payload: {
  postId: string
  caption: string
  platform: string
  scheduledDate: string
  imageFile?: File | null
}) {
  const result = await updateCalendarPostAction(payload)
  if (result.success) revalidatePostPaths()
  return result
}

export async function deletePostAction(postId: string) {
  const result = await deleteCalendarPostAction(postId)
  if (result.success) revalidatePostPaths()
  return result
}

export async function approvePostAction(postId: string) {
  const result = await approveCalendarPostAction(postId)
  if (result.success) revalidatePostPaths()
  return result
}

export async function schedulePostAction(postId: string) {
  const result = await scheduleCalendarPostAction(postId)
  if (result.success) revalidatePostPaths()
  return result
}

export async function publishPostNowAction(postId: string) {
  const user = await getAuthenticatedUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const limited = rateLimitMessage(`posts:publish-now:${user.id}`, 20, 60_000)
  if (limited) return { success: false, error: limited }

  const { data, error, instagramPostId } = await publishPostNow(user.id, postId)
  if (error || !data) {
    return { success: false, error: error ?? 'Publishing failed' }
  }

  revalidatePostPaths()
  return {
    success: true,
    instagramPostId: instagramPostId ?? null,
  }
}

export async function retryFailedPostAction(postId: string) {
  const user = await getAuthenticatedUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const limited = rateLimitMessage(`posts:retry:${user.id}`, 60, 60_000)
  if (limited) return { success: false, error: limited }

  const { data, error } = await retryFailedPost(user.id, postId)
  if (error || !data) {
    return { success: false, error: error ?? 'Retry failed' }
  }

  revalidatePostPaths()
  return {
    success: true,
    nextStatus: data.status,
  }
}

export async function bulkApprovePostsAction(postIds: string[]) {
  const ids = postIds.slice(0, 20)
  let approved = 0
  const errors: string[] = []

  for (const id of ids) {
    const result = await approveCalendarPostAction(id)
    if (result.success) approved += 1
    else errors.push(result.error ?? 'Approval failed')
  }

  if (approved > 0) revalidatePostPaths()
  return { success: errors.length === 0, approved, error: errors[0] }
}

export async function bulkDeletePostsAction(postIds: string[]) {
  const ids = postIds.slice(0, 20)
  let deleted = 0
  const errors: string[] = []

  for (const id of ids) {
    const result = await deleteCalendarPostAction(id)
    if (result.success) deleted += 1
    else errors.push(result.error ?? 'Delete failed')
  }

  if (deleted > 0) revalidatePostPaths()
  return { success: errors.length === 0, deleted, error: errors[0] }
}
