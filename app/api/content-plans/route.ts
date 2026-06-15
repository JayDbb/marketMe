import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CreateContentPlanInput, ContentPlan, Post } from '@/types/content-plan'

/**
 * POST /api/content-plans
 * Creates a new content plan and all its associated posts.
 * Used primarily by the backend AI (Trigger.dev) to save generated weekly plans.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  let user = null
  let authError = null

  // Allow Bearer token auth for external AI worker, fallback to session cookie
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

  let body: CreateContentPlanInput
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  // Validate required fields
  if (!body.business_profile_id || !body.start_date || !body.end_date || !Array.isArray(body.posts)) {
    return NextResponse.json(
      { error: 'Missing required fields: business_profile_id, start_date, end_date, posts' },
      { status: 400 }
    )
  }

  // 1. Insert the Content Plan
  const { data: planData, error: planError } = await supabase
    .from('content_plans')
    .insert({
      user_id: user.id,
      business_profile_id: body.business_profile_id,
      start_date: body.start_date,
      end_date: body.end_date,
      target_audience: body.target_audience ?? null,
      strategy_summary: body.strategy_summary ?? null,
      status: 'draft', // New plans from AI start as draft
    })
    .select()
    .single()

  if (planError || !planData) {
    return NextResponse.json(
      { error: 'Failed to create content plan', details: planError?.message },
      { status: 500 }
    )
  }

  // 2. Insert all the Posts linked to this plan
  if (body.posts.length > 0) {
    const postsToInsert = body.posts.map((post) => ({
      content_plan_id: planData.id,
      user_id: user.id,
      platform: post.platform,
      post_type: post.post_type ?? null,
      content: post.content ?? null,
      image_prompt: post.image_prompt ?? null,
      image_url: post.image_url ?? null,
      scheduled_at: post.scheduled_at ?? null,
      status: post.status ?? 'draft', // Default to draft if not specified
    }))

    const { error: postsError } = await supabase
      .from('posts')
      .insert(postsToInsert)

    if (postsError) {
      // Note: In a robust setup, you might want to rollback the plan insertion,
      // but Supabase JS doesn't support transactions via REST. We log the error.
      return NextResponse.json(
        { error: 'Content plan created, but failed to insert posts', details: postsError.message },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({
    message: 'Successfully saved generated weekly posts',
    planId: planData.id
  }, { status: 201 })
}
