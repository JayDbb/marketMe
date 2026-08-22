import { supabaseAdmin } from '@/lib/supabase/admin'

type EnsureResult =
  | { ok: true; planId: string; profileCreated: boolean }
  | { ok: false; error: string }

/**
 * Returns an active content plan for the user, creating a default business
 * profile + weekly plan when none exist yet.
 */
export async function ensureContentPlanForUser(
  userId: string,
  businessName?: string | null
): Promise<EnsureResult> {
  const { data: existingPlans, error: plansError } = await supabaseAdmin
    .from('content_plans')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (plansError) {
    return { ok: false, error: plansError.message }
  }

  if (existingPlans && existingPlans.length > 0) {
    return { ok: true, planId: existingPlans[0].id, profileCreated: false }
  }

  let profileCreated = false
  let profileId: string | null = null

  const { data: existingProfile } = await supabaseAdmin
    .from('business_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (existingProfile?.id) {
    profileId = existingProfile.id
  } else {
    const displayName =
      businessName?.trim() || 'My Workspace'

    const { data: newProfile, error: profileError } = await supabaseAdmin
      .from('business_profiles')
      .insert({ user_id: userId, business_name: displayName })
      .select('id')
      .single()

    if (profileError || !newProfile) {
      return {
        ok: false,
        error: profileError?.message ?? 'Failed to create business profile',
      }
    }

    profileId = newProfile.id
    profileCreated = true
  }

  const start = new Date()
  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  const { data: plan, error: planError } = await supabaseAdmin
    .from('content_plans')
    .insert({
      user_id: userId,
      business_profile_id: profileId,
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
      strategy_summary: 'Auto-generated weekly plan',
      status: 'active',
    })
    .select('id')
    .single()

  if (planError || !plan) {
    return {
      ok: false,
      error: planError?.message ?? 'Failed to create content plan',
    }
  }

  return { ok: true, planId: plan.id, profileCreated }
}
