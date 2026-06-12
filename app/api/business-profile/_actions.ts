'use server'

import { createClient } from '@/lib/supabase/server'
import type { BusinessProfile, BusinessProfileInput } from '@/types/business-profile'

/**
 * Get the business profile for the currently authenticated user.
 * Returns null if no profile exists yet.
 */
export async function getBusinessProfile(): Promise<{
  data: BusinessProfile | null
  error: string | null
}> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = "no rows returned" — that's fine, just means no profile yet
    return { data: null, error: error.message }
  }

  return { data: data as BusinessProfile | null, error: null }
}

/**
 * Create or update the business profile for the currently authenticated user.
 * Uses upsert so it works for both initial onboarding and later edits.
 */
export async function upsertBusinessProfile(
  input: BusinessProfileInput
): Promise<{
  data: BusinessProfile | null
  error: string | null
}> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('business_profiles')
    .upsert(
      {
        user_id: user.id,
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
      {
        onConflict: 'user_id',
      }
    )
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as BusinessProfile, error: null }
}

/**
 * Delete the business profile for the currently authenticated user.
 */
export async function deleteBusinessProfile(): Promise<{
  success: boolean
  error: string | null
}> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('business_profiles')
    .delete()
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}
