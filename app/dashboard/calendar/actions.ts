'use server'

import { revalidatePath } from 'next/cache'
import { Post } from '@/types/content'
import { fetchUserPostsResult } from '@/lib/fetch-user-posts'
import { getBusinessProfile } from '@/app/api/business-profile/_actions'
import { getInitials, resolveDisplayName } from '@/lib/billing-utils'
import { toSocialHandle } from '@/lib/post-schedule-utils'
import { isWithinImageUploadLimit } from '@/lib/upload-limits'
import { ensureContentPlanForUser } from '@/lib/ensure-content-plan'
import { insertScheduledPost } from '@/lib/insert-scheduled-post'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { deletePost, updatePost } from '@/lib/services/content.service'

export type PostModalContext = {
  displayName: string
  handle: string
  initials: string
}

export async function getPostModalContextAction(): Promise<PostModalContext | null> {
  const user = await getAuthenticatedUser()
  if (!user) return null

  const { data: profile } = await getBusinessProfile()
  const displayName = resolveDisplayName(user, profile)
  const email = user.email ?? ''

  return {
    displayName,
    handle: toSocialHandle(displayName, email),
    initials: getInitials(displayName),
  }
}

export async function getPostsAction(): Promise<{
  posts: Post[]
  error: string | null
}> {
  const user = await getAuthenticatedUser()
  if (!user) return { posts: [], error: 'Not authenticated' }

  return fetchUserPostsResult(user.id, {
    scheduledOnly: true,
    requireScheduled: true,
  })
}

async function uploadPostImage(
  userId: string,
  file: File
): Promise<string | null> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) return null
  if (!isWithinImageUploadLimit(file.size)) return null

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filePath = `${userId}/posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabaseAdmin.storage
    .from('studio-templates')
    .upload(filePath, file, { contentType: file.type, upsert: false })

  if (error) {
    console.error('Post image upload error:', error)
    return null
  }

  const { data } = supabaseAdmin.storage.from('studio-templates').getPublicUrl(filePath)
  return data.publicUrl
}

/** @deprecated Use getPostsAction */
export async function getWeekScheduleAction() {
  const { posts } = await getPostsAction()
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return days.map((dayName, index) => {
    const mockDate = new Date()
    const dayOffset = index === 6 ? 0 : index + 1
    mockDate.setDate(mockDate.getDate() - mockDate.getDay() + dayOffset)

    const dayPosts = posts.filter((post) => {
      const postDate = new Date(post.scheduled_date)
      const expectedDay = index === 6 ? 0 : index + 1
      return postDate.getDay() === expectedDay
    })

    return {
      date: `${dayName}, ${mockDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      posts: dayPosts,
    }
  })
}

export async function createCalendarPostAction(payload: {
  caption: string
  platform: string
  scheduledDate: string
  imageUrl?: string | null
  imageFile?: File | null
}): Promise<{ success: boolean; error?: string; postId?: string }> {
  const user = await getAuthenticatedUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const planResult = await ensureContentPlanForUser(
    user.id,
    user.user_metadata?.full_name ?? user.user_metadata?.name
  )
  if (!planResult.ok) {
    return { success: false, error: planResult.error }
  }

  let imageUrl = payload.imageUrl ?? null
  if (payload.imageFile) {
    const uploaded = await uploadPostImage(user.id, payload.imageFile)
    if (uploaded) imageUrl = uploaded
  } else if (imageUrl?.startsWith('blob:')) {
    imageUrl = null
  }

  const insertResult = await insertScheduledPost(user.id, {
    contentPlanId: planResult.planId,
    platform: payload.platform,
    content: payload.caption,
    scheduledAt: payload.scheduledDate,
    imageUrl,
  })

  if (!insertResult.ok) {
    console.error('Error creating post:', insertResult.error)
    return { success: false, error: insertResult.error }
  }

  revalidatePath('/dashboard/calendar')
  revalidatePath('/dashboard/posts')
  return { success: true, postId: insertResult.postId }
}

export async function updateCalendarPostAction(payload: {
  postId: string
  caption: string
  platform: string
  scheduledDate: string
  imageFile?: File | null
}): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthenticatedUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const updates: {
    content: string
    platform: string
    scheduled_at: string
    image_url?: string | null
  } = {
    content: payload.caption.trim(),
    platform: payload.platform,
    scheduled_at: payload.scheduledDate,
  }

  if (!updates.content) {
    return { success: false, error: 'Post content cannot be empty' }
  }

  if (payload.imageFile) {
    const uploaded = await uploadPostImage(user.id, payload.imageFile)
    if (uploaded) updates.image_url = uploaded
  }

  const { error } = await updatePost(user.id, payload.postId, updates)

  if (error) {
    console.error('Error updating post:', error)
    return { success: false, error }
  }

  revalidatePath('/dashboard/calendar')
  revalidatePath('/dashboard/posts')
  return { success: true }
}

export async function deleteCalendarPostAction(
  postId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthenticatedUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { success, error } = await deletePost(user.id, postId)

  if (!success || error) {
    console.error('Error deleting post:', error)
    return { success: false, error: error ?? 'Failed to delete post' }
  }

  revalidatePath('/dashboard/calendar')
  revalidatePath('/dashboard/posts')
  return { success: true }
}
