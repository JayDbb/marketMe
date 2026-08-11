import { supabaseAdmin } from "@/lib/supabase/admin"
import type {
  BusinessProfile,
  BusinessProfileInput,
} from "@/types/business-profile"

type BusinessProfileResult = {
  data: BusinessProfile | null
  error: string | null
}

type DeleteBusinessProfileResult = {
  success: boolean
  error: string | null
}

/**
 * Get the business profile belonging to a user.
 *
 * The returned profile includes its UUID in `data.id`.
 * That UUID should be used as `business_profile_id`
 * when connecting Instagram.
 */
export async function getBusinessProfile(
  userId: string
): Promise<BusinessProfileResult> {
  const normalizedUserId = userId.trim()

  if (!normalizedUserId) {
    return {
      data: null,
      error: "A user ID is required.",
    }
  }

  const { data, error } = await supabaseAdmin
    .from("business_profiles")
    .select("*")
    .eq("user_id", normalizedUserId)
    .maybeSingle()

  if (error) {
    return {
      data: null,
      error: error.message,
    }
  }

  return {
    data: data as BusinessProfile | null,
    error: null,
  }
}

/**
 * Get a business profile directly by its UUID.
 */
export async function getBusinessProfileById(
  businessProfileId: string
): Promise<BusinessProfileResult> {
  const normalizedProfileId = businessProfileId.trim()

  if (!normalizedProfileId) {
    return {
      data: null,
      error: "A business profile ID is required.",
    }
  }

  const { data, error } = await supabaseAdmin
    .from("business_profiles")
    .select("*")
    .eq("id", normalizedProfileId)
    .maybeSingle()

  if (error) {
    return {
      data: null,
      error: error.message,
    }
  }

  return {
    data: data as BusinessProfile | null,
    error: null,
  }
}

/**
 * Get only the UUID of the business profile belonging to a user.
 */
export async function getBusinessProfileId(
  userId: string
): Promise<{
  data: string | null
  error: string | null
}> {
  const result = await getBusinessProfile(userId)

  if (result.error) {
    return {
      data: null,
      error: result.error,
    }
  }

  if (!result.data?.id) {
    return {
      data: null,
      error: "No business profile was found for this user.",
    }
  }

  return {
    data: String(result.data.id),
    error: null,
  }
}

/**
 * Create or update the business profile belonging to a user.
 *
 * `user_id` must have a unique constraint in Supabase for the
 * `onConflict: "user_id"` upsert to work correctly.
 */
export async function upsertBusinessProfile(
  userId: string,
  input: BusinessProfileInput
): Promise<BusinessProfileResult> {
  const normalizedUserId = userId.trim()

  if (!normalizedUserId) {
    return {
      data: null,
      error: "A user ID is required.",
    }
  }

  // Only include fields present on `input`. Omitting them (vs sending null)
  // keeps partial updates — e.g. logo-only — from wiping onboarding data.
  const payload: Record<string, unknown> = {
    user_id: normalizedUserId,
    updated_at: new Date().toISOString(),
  }

  const setText = (
    key: keyof BusinessProfileInput,
    value: string | null | undefined
  ) => {
    if (value === undefined) return
    payload[key] = typeof value === "string" ? value.trim() || null : null
  }

  setText("business_name", input.business_name)
  setText("industry", input.industry)
  setText("industry_detail", input.industry_detail)
  setText("location", input.location)
  setText("website", input.website)
  setText("services", input.services)
  setText("usp", input.usp)
  setText("primary_goal", input.primary_goal)
  setText("social_handle", input.social_handle)
  setText("tone", input.tone)
  setText("target_customers", input.target_customers)
  setText("competitors", input.competitors)

  if (input.channels !== undefined) {
    payload.channels = Array.isArray(input.channels) ? input.channels : []
  }
  if (input.logo_url !== undefined) {
    payload.logo_url = input.logo_url?.trim() || null
  }
  if (input.brand_colors !== undefined) {
    payload.brand_colors = Array.isArray(input.brand_colors)
      ? input.brand_colors.slice(0, 5)
      : null
  }
  if (input.brand_fonts !== undefined) {
    payload.brand_fonts = Array.isArray(input.brand_fonts)
      ? input.brand_fonts.slice(0, 3)
      : null
  }

  const { data, error } = await supabaseAdmin
    .from("business_profiles")
    .upsert(payload, {
      onConflict: "user_id",
    })
    .select("*")
    .single()

  if (error) {
    return {
      data: null,
      error: error.message,
    }
  }

  if (!data) {
    return {
      data: null,
      error: "The business profile was not returned after saving.",
    }
  }

  return {
    data: data as BusinessProfile,
    error: null,
  }
}

/**
 * Delete the business profile belonging to a user.
 */
export async function deleteBusinessProfile(
  userId: string
): Promise<DeleteBusinessProfileResult> {
  const normalizedUserId = userId.trim()

  if (!normalizedUserId) {
    return {
      success: false,
      error: "A user ID is required.",
    }
  }

  const { error } = await supabaseAdmin
    .from("business_profiles")
    .delete()
    .eq("user_id", normalizedUserId)

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: true,
    error: null,
  }
}