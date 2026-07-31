import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/services/auth.service'
import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  profileToPipelineInput,
  runCreativePipeline,
} from '@/lib/services/creative-pipeline.service'
import { buildBrandBrainPromptBlock } from '@/lib/services/brand-intelligence.service'
import { isMarketingAiConfigured, MarketingAIError } from '@/lib/services/marketing-ai.service'
import { isRateLimitError, rateLimitOrThrow } from '@/lib/rate-limit'
import type { BusinessProfile } from '@/types/business-profile'

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

  try {
    rateLimitOrThrow(`content-plans:generate:${session.user.id}`, 5, 60_000)
  } catch (e) {
    if (isRateLimitError(e)) {
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    throw e
  }

  if (!isMarketingAiConfigured()) {
    return NextResponse.json(
      { error: 'MARKETME_AI_API_URL is not configured' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const { businessProfileId, startDate, numPosts = 3, platform } = body

    if (!businessProfileId || !startDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('business_profiles')
      .select('*')
      .eq('id', businessProfileId)
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found or unauthorized' }, { status: 403 })
    }

    const typedProfile = profile as BusinessProfile
    const brandBrainBlock = await buildBrandBrainPromptBlock(
      session.user.id,
      typedProfile.id
    )

    const pipeline = await runCreativePipeline({
      business: profileToPipelineInput(typedProfile),
      platform:
        platform ||
        (Array.isArray(typedProfile.channels) && typedProfile.channels[0]) ||
        'instagram',
      goal: typedProfile.primary_goal ?? undefined,
      tone: typedProfile.tone ?? undefined,
      numPosts: Math.max(1, Math.min(14, Number(numPosts) || 3)),
      weekStartDate: String(startDate).slice(0, 10),
      includeCreativeBriefs: false,
      brandMemoryInstructions: brandBrainBlock || undefined,
    })

    const start = new Date(startDate)
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)

    const { data: planData, error: planError } = await supabaseAdmin
      .from('content_plans')
      .insert({
        user_id: session.user.id,
        business_profile_id: businessProfileId,
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        target_audience: typedProfile.target_customers || null,
        strategy_summary: pipeline.strategySummary,
        status: 'draft',
      })
      .select()
      .single()

    if (planError || !planData) {
      throw new Error(`Failed to save content plan: ${planError?.message}`)
    }

    if (pipeline.posts.length > 0) {
      const postsToInsert = pipeline.posts.map((post) => {
        const scheduled = new Date(post.scheduledDate)
        const scheduledAt = Number.isNaN(scheduled.getTime())
          ? new Date(start).toISOString()
          : scheduled.toISOString()

        return {
          content_plan_id: planData.id,
          user_id: session.user.id,
          platform: mapPlatformForDb(platform, typedProfile.channels),
          post_type: 'image',
          content: [post.caption, post.hashtags].filter(Boolean).join('\n\n'),
          image_prompt: post.imagePrompt || null,
          scheduled_at: scheduledAt,
          status: 'draft',
        }
      })

      const { error: postsError } = await supabaseAdmin.from('posts').insert(postsToInsert)
      if (postsError) {
        throw new Error(`Failed to save posts: ${postsError.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      contentPlanId: planData.id,
      strategyId: pipeline.strategyId,
      postCount: pipeline.posts.length,
    })
  } catch (error: unknown) {
    const message =
      error instanceof MarketingAIError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Unknown error'
    console.error('Generate API Error:', message)
    const status = error instanceof MarketingAIError ? 502 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

function mapPlatformForDb(platform: unknown, channels: string[] | null | undefined): string {
  if (typeof platform === 'string' && platform.trim()) {
    return platform.trim().toLowerCase() === 'x' ? 'twitter' : platform.trim().toLowerCase()
  }
  if (Array.isArray(channels) && channels[0]) {
    const c = channels[0].toLowerCase()
    return c === 'x' ? 'twitter' : c
  }
  return 'instagram'
}
