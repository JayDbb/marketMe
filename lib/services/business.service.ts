import { supabaseAdmin } from "@/lib/supabase/admin"
import type { BusinessProfile, BusinessProfileInput } from "@/types/business-profile"

/**
 * Get the business profile for a user.
 * Uses supabaseAdmin (service role) since we're no longer relying on Supabase Auth RLS.
 */
export async function getBusinessProfile(
  userId: string
): Promise<{ data: BusinessProfile | null; error: string | null }> {
  const { data, error } = await supabaseAdmin
    .from("business_profiles")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error && error.code !== "PGRST116") {
    return { data: null, error: error.message }
  }

  return { data: data as BusinessProfile | null, error: null }
}

/**
 * Create or update a business profile for a user.
 */
export async function upsertBusinessProfile(
  userId: string,
  input: BusinessProfileInput
): Promise<{ data: BusinessProfile | null; error: string | null }> {
  const { data, error } = await supabaseAdmin
    .from("business_profiles")
    .upsert(
      {
        user_id: userId,
        business_name: input.business_name ?? null,
        industry: input.industry ?? null,
        location: input.location ?? null,
        website: input.website ?? null,
        services: input.services ?? null,
        usp: input.usp ?? null,
        primary_goal: input.primary_goal ?? null,
        social_handle: input.social_handle ?? null,
        tone: input.tone ?? null,
        target_customers: input.target_customers ?? null,
        competitors: input.competitors ?? null,
        channels: input.channels ?? [],
      },
      { onConflict: "user_id" }
    )
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as BusinessProfile, error: null }
}

/**
 * Delete a business profile for a user.
 */
export async function deleteBusinessProfile(
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabaseAdmin
    .from("business_profiles")
    .delete()
    .eq("user_id", userId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}
