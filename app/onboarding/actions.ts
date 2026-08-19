'use server'

import { revalidatePath } from 'next/cache'
import { upsertBusinessProfileAction } from '@/app/api/business-profile/_actions'
import type { BusinessProfile, BusinessProfileInput } from '@/types/business-profile'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getBusinessProfile, upsertBusinessProfile } from '@/lib/services/business.service'
import {
  AVATAR_ALLOWED_TYPES,
  isWithinAvatarUploadLimit,
  MAX_AVATAR_UPLOAD_LABEL,
} from '@/lib/upload-limits'

const LOGO_BUCKET = 'studio-templates'

function revalidateOnboardingPaths() {
  revalidatePath('/dashboard')
  revalidatePath('/onboarding')
  revalidatePath('/dashboard/settings')
}

export async function completeOnboardingAction(
  input: BusinessProfileInput
): Promise<{ data: BusinessProfile | null; error: string | null }> {
  const result = await upsertBusinessProfileAction(input)
  if (result.data?.id) revalidateOnboardingPaths()
  return result
}

export async function uploadBusinessLogoAction(
  formData: FormData
): Promise<{ success: true; logoUrl: string } | { error: string }> {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const file = formData.get('logo')
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Choose a logo image to upload' }
  }

  if (!AVATAR_ALLOWED_TYPES.includes(file.type as (typeof AVATAR_ALLOWED_TYPES)[number])) {
    return { error: 'Use JPEG, PNG, WebP, or GIF' }
  }

  if (!isWithinAvatarUploadLimit(file.size)) {
    return { error: `Logo must be under ${MAX_AVATAR_UPLOAD_LABEL}` }
  }

  const { data: profile, error: profileError } = await getBusinessProfile(user.id)
  if (profileError || !profile) {
    return { error: profileError || 'Save your business profile before uploading a logo' }
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
  const filePath = `business-logos/${profile.id}/logo.${ext}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from(LOGO_BUCKET)
    .upload(filePath, file, { contentType: file.type, upsert: true })

  if (uploadError) {
    console.error('[uploadBusinessLogo]', uploadError.message)
    return { error: 'Logo upload failed. Try again in a moment.' }
  }

  const { data: urlData } = supabaseAdmin.storage.from(LOGO_BUCKET).getPublicUrl(filePath)
  const logoUrl = `${urlData.publicUrl}?v=${Date.now()}`

  const saved = await upsertBusinessProfile(user.id, { logo_url: logoUrl })
  if (saved.error) return { error: saved.error }

  return { success: true, logoUrl }
}
