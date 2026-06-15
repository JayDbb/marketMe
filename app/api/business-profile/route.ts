import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { BusinessProfile, BusinessProfileInput } from '@/types/business-profile'

/**
 * GET /api/business-profile
 * Returns the authenticated user's business profile.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  let user = null
  let authError = null

  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const { data, error } = await supabase.auth.getUser(token)
    user = data?.user
    authError = error
  } else {
    const { data, error } = await supabase.auth.getUser()
    user = data?.user
    authError = error
  }

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code === 'PGRST116') {
    return NextResponse.json(
      { error: 'No business profile found' },
      { status: 404 }
    )
  }

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: data as BusinessProfile })
}

/**
 * PUT /api/business-profile
 * Creates or updates the authenticated user's business profile.
 */
export async function PUT(request: NextRequest) {
  const supabase = await createClient()

  let user = null
  let authError = null

  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const { data, error } = await supabase.auth.getUser(token)
    user = data?.user
    authError = error
  } else {
    const { data, error } = await supabase.auth.getUser()
    user = data?.user
    authError = error
  }

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  let body: BusinessProfileInput
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('business_profiles')
    .upsert(
      {
        user_id: user.id,
        business_name: body.business_name ?? null,
        industry: body.industry ?? null,
        location: body.location ?? null,
        website: body.website ?? null,
        services: body.services ?? null,
        usp: body.usp ?? null,
        primary_goal: body.primary_goal ?? null,
        social_handle: body.social_handle ?? null,
        tone: body.tone ?? null,
        target_customers: body.target_customers ?? null,
        competitors: body.competitors ?? null,
        channels: body.channels ?? [],
      },
      {
        onConflict: 'user_id',
      }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: data as BusinessProfile })
}
