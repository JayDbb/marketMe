'use server'

import { revalidatePath } from 'next/cache'
import {
  approveCalendarPostAction,
  createCalendarPostAction,
  deleteCalendarPostAction,
  scheduleCalendarPostAction,
  updateCalendarPostAction,
} from '@/app/dashboard/calendar/actions'

export async function createPostAction(payload: {
  caption: string
  platform: string
  scheduledDate: string
  imageUrl?: string | null
  imageFile?: File | null
}) {
  const result = await createCalendarPostAction(payload)
  if (result.success) {
    revalidatePath('/dashboard/posts')
    revalidatePath('/dashboard/calendar')
  }
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
  if (result.success) {
    revalidatePath('/dashboard/posts')
    revalidatePath('/dashboard/calendar')
  }
  return result
}

export async function deletePostAction(postId: string) {
  const result = await deleteCalendarPostAction(postId)
  if (result.success) {
    revalidatePath('/dashboard/posts')
    revalidatePath('/dashboard/calendar')
  }
  return result
}

export async function approvePostAction(postId: string) {
  const result = await approveCalendarPostAction(postId)
  if (result.success) {
    revalidatePath('/dashboard/posts')
    revalidatePath('/dashboard/calendar')
  }
  return result
}

export async function schedulePostAction(postId: string) {
  const result = await scheduleCalendarPostAction(postId)
  if (result.success) {
    revalidatePath('/dashboard/posts')
    revalidatePath('/dashboard/calendar')
  }
  return result
}
