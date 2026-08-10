'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/services/auth.service'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { upsertBusinessProfileAction } from '@/app/api/business-profile/_actions'
import { getBusinessProfile } from '@/lib/services/business.service'
import { DEFAULT_PREFERENCES, DEFAULT_AI_PREFERENCES } from '@/lib/settings-utils'
import { getUserAiPreferences } from '@/lib/services/ai-preferences.service'
import {
  isAiProviderPreference,
  isAllowedCaptionModel,
  isAllowedImageModel,
  type AiProviderPreference,
} from '@/lib/ai-models'
import type { SettingsData, WeekStartsOn } from '@/types/settings'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
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
  const [{ data: profile }, { data: prefs }, ai] = await Promise.all([
    getBusinessProfile(user.id),
    supabaseAdmin
      .from('user_preferences')
      .select('timezone, week_starts_on, ai_provider, caption_model, image_model')
      .eq('user_id', user.id)
      .maybeSingle(),
    getUserAiPreferences(user.id),
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
    preferences: {
      timezone: prefs?.timezone ?? DEFAULT_PREFERENCES.timezone,
      weekStartsOn:
        (prefs?.week_starts_on as WeekStartsOn) ?? DEFAULT_PREFERENCES.weekStartsOn,
    },
    ai: prefs
      ? {
          aiProvider:
            prefs.ai_provider && isAiProviderPreference(prefs.ai_provider)
              ? prefs.ai_provider
              : DEFAULT_AI_PREFERENCES.aiProvider,
          captionModel:
            prefs.caption_model && isAllowedCaptionModel(prefs.caption_model)
              ? prefs.caption_model
              : DEFAULT_AI_PREFERENCES.captionModel,
          imageModel:
            prefs.image_model && isAllowedImageModel(prefs.image_model)
              ? prefs.image_model
              : DEFAULT_AI_PREFERENCES.imageModel,
        }
      : ai,
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
  const ai = await getUserAiPreferences(user.id)

  const { error } = await supabaseAdmin.from('user_preferences').upsert(
    {
      user_id: user.id,
      timezone,
      week_starts_on: weekStartsOn,
      ai_provider: ai.aiProvider,
      caption_model: ai.captionModel,
      image_model: ai.imageModel,
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
  const result = await upsertBusinessProfileAction({
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

export async function updateAiPreferencesAction(formData: FormData): Promise<
  | { success: true; ai: SettingsData['ai'] }
  | { error: string }
> {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const providerRaw = String(formData.get('aiProvider') || '')
  const captionRaw = String(formData.get('captionModel') || '')
  const imageRaw = String(formData.get('imageModel') || '')

  if (!isAiProviderPreference(providerRaw)) {
    return { error: 'Invalid AI provider' }
  }
  if (!isAllowedCaptionModel(captionRaw)) {
    return { error: 'Invalid caption model' }
  }
  if (!isAllowedImageModel(imageRaw)) {
    return { error: 'Invalid image model' }
  }

  const aiProvider = providerRaw as AiProviderPreference

  // Preserve calendar prefs when upserting
  const existing = await getUserPreferencesAction()

  const { error } = await supabaseAdmin.from('user_preferences').upsert(
    {
      user_id: user.id,
      timezone: existing.timezone,
      week_starts_on: existing.weekStartsOn,
      ai_provider: aiProvider,
      caption_model: captionRaw,
      image_model: imageRaw,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    // Columns may not exist until migration 025 is applied
    if (/ai_provider|caption_model|image_model/i.test(error.message)) {
      return {
        error:
          'AI preference columns are missing in the database. Run migration 025_user_ai_preferences.sql.',
      }
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/generate')
  return {
    success: true,
    ai: {
      aiProvider,
      captionModel: captionRaw,
      imageModel: imageRaw,
    },
  }
}
