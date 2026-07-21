import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { requireAuth, AuthError } from '@/lib/services/auth.service'
import { createContentPlan } from '@/lib/services/content.service'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { CreateContentPlanInput } from '@/types/content-plan'

/**
 * POST /api/content-plans
 * Creates a new content plan and all its associated posts.
 * Used primarily by the backend AI (Trigger.dev) to save generated weekly plans.
 */
export async function POST(request: NextRequest) {
  let session
  try {
    session = await requireAuth()
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    return NextResponse.json({ error: 'Authentication error' }, { status: 401 })
  }

  let body: CreateContentPlanInput
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate required fields
  if (!body.business_profile_id || !body.start_date || !body.end_date || !Array.isArray(body.posts)) {
    return NextResponse.json(
      { error: 'Missing required fields: business_profile_id, start_date, end_date, posts' },
      { status: 400 }
    )
  }

  // Verify ownership of the business profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('business_profiles')
    .select('id')
    .eq('id', body.business_profile_id)
    .eq('user_id', session.user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json(
      { error: 'Business profile not found or unauthorized' },
      { status: 403 }
    )
  }

  const { planId, error } = await createContentPlan(session.user.id, body)

  if (error && !planId) {
    return NextResponse.json(
      { error: 'Failed to create content plan', details: error },
      { status: 500 }
    )
  }

  if (error && planId) {
    // Content plan was created but posts failed — partial success
    return NextResponse.json(
      { message: 'Content plan created with partial post failures', planId, warning: error },
      { status: 201 }
    )
  }

  return NextResponse.json(
    { message: 'Successfully saved generated weekly posts', planId },
    { status: 201 }
  )
}
