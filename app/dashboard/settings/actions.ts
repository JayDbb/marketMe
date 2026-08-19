'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/services/auth.service'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { upsertBusinessProfileAction } from '@/app/api/business-profile/_actions'
import { getBusinessProfile } from '@/lib/services/business.service'
import {
  DEFAULT_PREFERENCES,
  DEFAULT_AI_PREFERENCES,
  MIN_PASSWORD_LENGTH,
  isValidTimeZone,
  parseWeekStartsOn,
} from '@/lib/settings-utils'
import { getUserAiPreferences } from '@/lib/services/ai-preferences.service'
import {
  isAiProviderPreference,
  isAllowedCaptionModel,
  isAllowedImageModel,
  type AiProviderPreference,
} from '@/lib/ai-models'
import type { SettingsData, SignInMethod } from '@/types/settings'
import { getClientIp } from '@/lib/client-ip'
import { rateLimitMessage } from '@/lib/rate-limit'
import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import {
  AVATAR_ALLOWED_TYPES,
  isWithinAvatarUploadLimit,
  MAX_AVATAR_UPLOAD_LABEL,
} from '@/lib/upload-limits'

const AVATAR_BUCKET = 'studio-templates'

function resolveSignInMethods(
  accounts: Array<{ providerId?: string | null }>
): SettingsData['auth'] {
  const hasGoogle = accounts.some((a) => a.providerId === 'google')
  const hasPassword = accounts.some((a) => a.providerId === 'credential')
  const methods: SignInMethod[] = []
  if (hasGoogle) methods.push('google')
  if (hasPassword) methods.push('password')
  if (!hasGoogle && !hasPassword) methods.push('magic_link')
  return { methods, hasPassword }
}

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
    timezone: isValidTimeZone(data.timezone)
      ? data.timezone
      : DEFAULT_PREFERENCES.timezone,
    weekStartsOn: parseWeekStartsOn(data.week_starts_on),
  }
}

export async function getSettingsData(): Promise<SettingsData | null> {
  const session = await getSession()
  if (!session) return null

  const user = session.user
  const [
    { data: profile },
    { data: prefs },
    ai,
    { data: accounts, error: accountsError },
  ] = await Promise.all([
    getBusinessProfile(user.id),
    supabaseAdmin
      .from('user_preferences')
      .select('timezone, week_starts_on, ai_provider, caption_model, image_model')
      .eq('user_id', user.id)
      .maybeSingle(),
    getUserAiPreferences(user.id),
    supabaseAdmin
      .from('account')
      .select('providerId')
      .eq('userId', user.id),
  ])

  if (accountsError) {
    console.error('[settings] sign-in methods query failed', accountsError.message)
  }

  return {
    displayName: user.name ?? user.email?.split('@')[0] ?? 'User',
    email: user.email ?? '',
    avatarUrl: user.image ?? null,
    auth: resolveSignInMethods(accounts ?? []),
    business: {
      businessName: profile?.business_name ?? '',
      industry: profile?.industry ?? '',
      industryDetail: profile?.industry_detail ?? '',
      location: profile?.location ?? '',
      website: profile?.website ?? '',
      primaryGoal: profile?.primary_goal ?? '',
      competitors: profile?.competitors ?? '',
      logoUrl: profile?.logo_url ?? null,
      brandColors: Array.isArray(profile?.brand_colors)
        ? profile.brand_colors.slice(0, 5)
        : [],
      primaryFont:
        Array.isArray(profile?.brand_fonts) && profile.brand_fonts[0]
          ? profile.brand_fonts[0]
          : 'Geist',
      secondaryFont:
        Array.isArray(profile?.brand_fonts) && profile.brand_fonts[1]
          ? profile.brand_fonts[1]
          : 'Georgia',
      hasProfile: Boolean(profile?.business_name),
    },
    preferences: {
      timezone:
        prefs?.timezone && isValidTimeZone(prefs.timezone)
          ? prefs.timezone
          : DEFAULT_PREFERENCES.timezone,
      weekStartsOn: parseWeekStartsOn(prefs?.week_starts_on),
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

  const timezone = String(formData.get('timezone') || '').trim()
  const weekStartsOn = parseWeekStartsOn(formData.get('weekStartsOn'))
  if (!isValidTimeZone(timezone)) {
    return { error: 'Choose a valid timezone' }
  }
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
  revalidatePath('/dashboard')
  return {
    success: true,
    preferences: { timezone, weekStartsOn },
  }
}

export async function updateWorkspaceAction(formData: FormData) {
  const brandColorsRaw = String(formData.get('brandColors') || '')
  const brandColors = brandColorsRaw
    .split(',')
    .map((c) => c.trim())
    .filter((c) => /^#[0-9A-Fa-f]{6}$/.test(c))
    .slice(0, 5)

  const primaryFont = String(formData.get('primaryFont') || 'Geist').trim()
  const secondaryFont = String(formData.get('secondaryFont') || 'Georgia').trim()

  const result = await upsertBusinessProfileAction({
    business_name: (formData.get('businessName') as string) || undefined,
    industry: (formData.get('industry') as string) || undefined,
    industry_detail: (formData.get('industryDetail') as string) || null,
    location: (formData.get('location') as string) || undefined,
    website: (formData.get('website') as string) || undefined,
    primary_goal: (formData.get('primaryGoal') as string) || undefined,
    competitors: (formData.get('competitors') as string) || undefined,
    brand_colors: brandColors.length > 0 ? brandColors : null,
    brand_fonts: [primaryFont, secondaryFont].filter(Boolean),
  })

  if (result.error) return { error: result.error }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/generate')
  revalidatePath('/dashboard/studio')
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

export async function changePasswordAction(formData: FormData) {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const ip = await getClientIp()
  const limited = rateLimitMessage(`settings:password:${user.id}:${ip}`, 5, 15 * 60_000)
  if (limited) return { error: limited }

  const currentPassword = String(formData.get('currentPassword') || '')
  const newPassword = String(formData.get('newPassword') || '')
  const confirmPassword = String(formData.get('confirmPassword') || '')

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` }
  }
  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match' }
  }
  if (currentPassword === newPassword) {
    return { error: 'Choose a different password from the current one' }
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not change password'
    return { error: message }
  }

  return { success: true }
}

async function deleteRows(
  table: string,
  column: string,
  value: string
): Promise<string | null> {
  const { error } = await supabaseAdmin.from(table).delete().eq(column, value)
  if (error && !/schema cache|does not exist|could not find/i.test(error.message)) {
    return `${table}: ${error.message}`
  }
  return null
}

export async function deleteAccountAction(formData: FormData) {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const ip = await getClientIp()
  const limited = rateLimitMessage(`settings:delete:${user.id}:${ip}`, 3, 15 * 60_000)
  if (limited) return { error: limited }

  const confirmation = String(formData.get('confirmEmail') || '').trim().toLowerCase()
  const email = (user.email ?? '').trim().toLowerCase()
  if (!email || confirmation !== email) {
    return { error: 'Type your email address to confirm deletion' }
  }

  const { data: profiles } = await supabaseAdmin
    .from('business_profiles')
    .select('id')
    .eq('user_id', user.id)

  const profileIds = (profiles ?? []).map((p) => p.id as string)

  const failures: string[] = []
  for (const table of [
    'inbox_messages',
    'business_social_connections',
    'instagram_account_insights',
    'posts',
    'content_plans',
    'studio_templates',
    'generations',
    'credit_transactions',
    'moderation_flags',
    'user_preferences',
    'user_subscriptions',
  ]) {
    const err = await deleteRows(table, 'user_id', user.id)
    if (err) failures.push(err)
  }

  if (profileIds.length > 0) {
    const { error: profileError } = await supabaseAdmin
      .from('business_profiles')
      .delete()
      .in('id', profileIds)
    if (profileError) failures.push(`business_profiles: ${profileError.message}`)
  } else {
    const err = await deleteRows('business_profiles', 'user_id', user.id)
    if (err) failures.push(err)
  }

  try {
    await auth.api.deleteUser({
      body: {},
      headers: await headers(),
    })
  } catch {
    const { data: stillThere } = await supabaseAdmin
      .from('user')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (stillThere) {
      const { error: userError } = await supabaseAdmin.from('user').delete().eq('id', user.id)
      if (userError) {
        console.error('[settings] deleteAccount login still present', {
          userId: user.id,
          failures,
          error: userError.message,
        })
        return { error: 'Could not delete this login. Try again or contact support.' }
      }

      const { data: remains } = await supabaseAdmin
        .from('user')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()
      if (remains) {
        return { error: 'Could not delete this login. Try again or contact support.' }
      }
    }
  }

  if (failures.length > 0) {
    console.error('[settings] deleteAccount partial data cleanup', {
      userId: user.id,
      failures,
    })
  }

  redirect('/login?message=Your+account+has+been+deleted&type=success')
}
