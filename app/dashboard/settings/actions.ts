'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/services/auth.service'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getBusinessProfile, upsertBusinessProfile } from '@/app/api/business-profile/_actions'
import { DEFAULT_PREFERENCES } from '@/lib/settings-utils'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import type { SettingsData, WeekStartsOn } from '@/types/settings'
import {
  AVATAR_ALLOWED_TYPES,
  isWithinAvatarUploadLimit,
  MAX_AVATAR_UPLOAD_LABEL,
} from '@/lib/upload-limits'

const AVATAR_BUCKET = 'studio-templates'

async function uploadAvatarFile(userId: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filePath = `${userId}/avatar/avatar.${ext}`

  const { error } = await supabaseAdmin.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, { contentType: file.type, upsert: true })

  if (error) {
    console.error('[uploadAvatar]', error.message)
    return null
  }

  const { data } = supabaseAdmin.storage.from(AVATAR_BUCKET).getPublicUrl(filePath)
  return `${data.publicUrl}?v=${Date.now()}`
}

async function persistUserImage(imageUrl: string | null): Promise<{ ok: true } | { error: string }> {
  try {
    await auth.api.updateUser({
      body: { image: imageUrl },
      headers: await headers(),
    })
    return { ok: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update profile image'
    return { error: message }
  }
}

export async function updateProfileAction(formData: FormData) {
  const name = formData.get('name') as string

  if (!name || name.trim() === '') {
    return { error: 'Name cannot be empty' }
  }

  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    return { error: 'Not authenticated' }
  }
  if (!session) return { error: 'Not authenticated' }

  try {
    await auth.api.updateUser({
      body: { name },
      headers: await headers(),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Update failed'
    return { error: message }
  }

  revalidatePath('/dashboard/settings', 'page')
  return { success: true }
}

export async function getUserPreferencesAction(): Promise<SettingsData['preferences']> {
  const session = await getSession()
  if (!session) return DEFAULT_PREFERENCES

  const { data } = await supabaseAdmin
    .from('user_preferences')
    .select('timezone, week_starts_on')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!data) return DEFAULT_PREFERENCES

  return {
    timezone: data.timezone ?? DEFAULT_PREFERENCES.timezone,
    weekStartsOn: (data.week_starts_on as WeekStartsOn) ?? DEFAULT_PREFERENCES.weekStartsOn,
  }
}

export async function getSettingsData(): Promise<SettingsData | null> {
  const session = await getSession()
  if (!session) return null

  const user = session.user
  const [{ data: profile }, preferences] = await Promise.all([
    getBusinessProfile(),
    getUserPreferencesAction(),
  ])

  return {
    displayName: user.name ?? user.email?.split('@')[0] ?? 'User',
    email: user.email ?? '',
    avatarUrl: user.image ?? null,
    business: {
      businessName: profile?.business_name ?? '',
      industry: profile?.industry ?? '',
      location: profile?.location ?? '',
      website: profile?.website ?? '',
      primaryGoal: profile?.primary_goal ?? '',
      hasProfile: Boolean(profile?.business_name),
    },
    preferences,
  }
}

export async function uploadProfileAvatarAction(
  formData: FormData
): Promise<{ success: true; avatarUrl: string } | { error: string }> {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const file = formData.get('avatar')
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Choose an image to upload' }
  }

  if (!AVATAR_ALLOWED_TYPES.includes(file.type as (typeof AVATAR_ALLOWED_TYPES)[number])) {
    return { error: 'Use JPEG, PNG, WebP, or GIF' }
  }

  if (!isWithinAvatarUploadLimit(file.size)) {
    return { error: `Image must be under ${MAX_AVATAR_UPLOAD_LABEL}` }
  }

  const avatarUrl = await uploadAvatarFile(user.id, file)
  if (!avatarUrl) {
    return { error: 'Upload failed. Try again in a moment.' }
  }

  const saved = await persistUserImage(avatarUrl)
  if ('error' in saved) {
    return { error: saved.error }
  }

  revalidatePath('/dashboard/settings', 'page')
  revalidatePath('/dashboard', 'layout')
  return { success: true, avatarUrl }
}

export async function removeProfileAvatarAction(): Promise<
  { success: true } | { error: string }
> {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const saved = await persistUserImage(null)
  if ('error' in saved) {
    return { error: saved.error }
  }

  revalidatePath('/dashboard/settings', 'page')
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function updateCalendarPreferencesAction(formData: FormData) {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const timezone = formData.get('timezone') as string
  const weekStartsOn = formData.get('weekStartsOn') as WeekStartsOn

  const { error } = await supabaseAdmin.from('user_preferences').upsert(
    {
      user_id: user.id,
      timezone,
      week_starts_on: weekStartsOn,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/calendar')
  return {
    success: true,
    preferences: { timezone, weekStartsOn },
  }
}

export async function updateWorkspaceAction(formData: FormData) {
  const result = await upsertBusinessProfile({
    business_name: (formData.get('businessName') as string) || undefined,
    industry: (formData.get('industry') as string) || undefined,
    location: (formData.get('location') as string) || undefined,
    website: (formData.get('website') as string) || undefined,
    primary_goal: (formData.get('primaryGoal') as string) || undefined,
  })

  if (result.error) return { error: result.error }

  revalidatePath('/dashboard/settings')
  return { success: true }
}
