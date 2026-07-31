'use server'

import { revalidatePath } from 'next/cache'
import type { CanvasData } from '@/types/canvas'
import type { PlanId } from '@/types/billing'
import type { GenerateContext, GenerateSetupInput, GeneratedPostDraft } from '@/lib/generate-utils'
import type {
  GenerationRunStatus,
  PipelineStage,
  SocialPlatform,
  TemplateSource,
} from '@/lib/services/marketing-ai.service'

import { getBusinessProfileAction } from '@/app/api/business-profile/_actions'
import { getUserTemplatesResult } from '@/app/dashboard/studio/actions'
import { resolveDisplayName, PLANS } from '@/lib/billing-utils'
import { ensureContentPlanForUser } from '@/lib/ensure-content-plan'
import { insertScheduledPost } from '@/lib/insert-scheduled-post'
import { rateLimitOrThrow } from '@/lib/rate-limit'
import { normalizePlatform, toIsoScheduledDate } from '@/lib/generate-utils'
import { getAuthenticatedUser, isValidUuid } from '@/lib/supabase/server-auth'
import {
  assertCreditsAvailable,
  getCreditsBalance,
} from '@/lib/services/credits.service'
import {
  approveAndSchedulePost,
  updateExistingPostForSchedule,
} from '@/lib/services/post-lifecycle.service'
import {
  mapProfileGoalToGenerateGoal,
  primaryChannelFromProfile,
} from '@/lib/marketing-profile-prompt'
import {
  healthCheck,
  startContentGeneration,
} from '@/lib/services/marketing-ai.service'
import { openai } from '@/lib/openai'
import { PIPELINE_CREDIT_COSTS } from '@/types/pipeline'
import { supabaseAdmin } from '@/lib/supabase/admin'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PipelineGenerateSetupInput = GenerateSetupInput & {
  topic?: string
  templateSource?: string
  template_source?: string
  templateId?: string | null
  studioTemplateId?: string | null
  studio_template_id?: string | null
  startDate?: string
  start_date?: string
  endDate?: string
  end_date?: string
}

export interface GeneratePostsActionResult {
  success: boolean
  generationId?: string
  status?: GenerationRunStatus
  stage?: PipelineStage
  message?: string

  /** Temporary compatibility field for old callers. */
  posts?: GeneratedPostDraft[]

  error?: string
}

export type SchedulePostPayload = {
  /** Canonical posts.id UUID returned by the pipeline. */
  postId?: string
  caption: string
  hashtags: string
  canvasData: CanvasData
  scheduledDate: string
  templateId?: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizePipelinePlatform(platform: string): SocialPlatform {
  const normalized = platform.trim().toLowerCase()

  switch (normalized) {
    case 'facebook':
      return 'facebook'
    case 'linkedin':
      return 'linkedin'
    case 'x':
    case 'twitter':
    case 'twitter / x':
      return 'x'
    case 'tiktok':
      return 'tiktok'
    case 'instagram':
    default:
      return 'instagram'
  }
}

function normalizeTemplateSource(source?: string): TemplateSource {
  const normalized = source?.trim().toLowerCase()

  if (
    normalized === 'studio' ||
    normalized === 'user' ||
    normalized === 'manual' ||
    normalized === 'choose' ||
    normalized === "i'll choose" ||
    normalized === 'ill choose'
  ) {
    return 'studio'
  }

  return 'ai'
}

function resolveTemplateSelection(input: PipelineGenerateSetupInput): {
  templateSource: TemplateSource
  studioTemplateId?: string
} {
  const templateSource = normalizeTemplateSource(
    input.templateSource ?? input.template_source
  )

  const selectedTemplateId =
    input.studioTemplateId ??
    input.studio_template_id ??
    input.templateId ??
    undefined

  if (templateSource === 'studio') {
    if (!selectedTemplateId || !isValidUuid(selectedTemplateId)) {
      throw new Error('Select a valid Studio template before generating content.')
    }

    return {
      templateSource,
      studioTemplateId: selectedTemplateId,
    }
  }

  return { templateSource }
}

function combinePostContent(caption: string, hashtags: string): string {
  return [caption.trim(), hashtags.trim()].filter(Boolean).join('\n\n')
}

function revalidatePostViews(): void {
  revalidatePath('/dashboard/calendar')
  revalidatePath('/dashboard/posts')
  revalidatePath('/dashboard/generate')
}

// ---------------------------------------------------------------------------
// Generation context
// ---------------------------------------------------------------------------

export async function getGenerateContextAction(): Promise<GenerateContext | null> {
  const user = await getAuthenticatedUser()

  if (!user) return null

  const [
    { data: profile },
    { templates },
    creditsBalance,
    subscriptionResult,
    pipelineAvailable,
  ] = await Promise.all([
    getBusinessProfileAction(),
    getUserTemplatesResult(),
    getCreditsBalance(user.id),
    supabaseAdmin
      .from('user_subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .maybeSingle(),
    healthCheck()
      .then(() => true)
      .catch((error) => {
        console.warn('MarketMe pipeline health check failed:', error)
        return false
      }),
  ])

  const businessName = resolveDisplayName(user, profile)
  const plan = ((subscriptionResult.data?.plan as PlanId) ?? 'free') as PlanId
  const creditsLimit = PLANS[plan]?.limits.aiCredits ?? null

  return {
    businessName,
    industry: profile?.industry?.trim() ?? '',
    services: profile?.services?.trim() ?? '',
    defaultTone: profile?.tone?.trim() || 'Professional',
    defaultGoal: mapProfileGoalToGenerateGoal(profile?.primary_goal),
    defaultPlatform: primaryChannelFromProfile(profile?.channels),
    hasOpenAI: pipelineAvailable,
    templateCount: templates.length,
    creditsBalance,
    creditsLimit,
    creditCostPerGeneration: PIPELINE_CREDIT_COSTS.post_generation,
  }
}

// ---------------------------------------------------------------------------
// Start complete AI pipeline
// ---------------------------------------------------------------------------

export async function generatePostsAction(
  input: GenerateSetupInput
): Promise<GeneratePostsActionResult> {
  const user = await getAuthenticatedUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    rateLimitOrThrow(`generate:${user.id}`, 10, 60_000)
    await assertCreditsAvailable(user.id, 'post_generation')
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Request blocked',
    }
  }

  const { data: businessProfile } = await getBusinessProfileAction()

  if (!businessProfile?.id || !isValidUuid(businessProfile.id)) {
    return {
      success: false,
      error: 'Complete your business profile before generating content.',
    }
  }

  const pipelineInput = input as PipelineGenerateSetupInput
  const numPosts = Math.max(1, Math.min(14, input.numPosts || 3))

  let templateSelection: ReturnType<typeof resolveTemplateSelection>

  try {
    templateSelection = resolveTemplateSelection(pipelineInput)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid template selection.',
    }
  }

  const goal =
    input.goal.trim() ||
    businessProfile.primary_goal?.trim() ||
    'Increase Brand Awareness'

  const tone =
    input.tone.trim() ||
    businessProfile.tone?.trim() ||
    'Professional'

  const platform = normalizePipelinePlatform(
    input.platform.trim() || businessProfile.channels?.[0] || 'Instagram'
  )

  try {
    const result = await startContentGeneration({
      business_profile_id: businessProfile.id,
      goal,
      platform,
      number_of_posts: numPosts,
      tone,
      template_source: templateSelection.templateSource,
      ...(templateSelection.studioTemplateId
        ? { studio_template_id: templateSelection.studioTemplateId }
        : {}),
      ...(pipelineInput.topic?.trim()
        ? { topic: pipelineInput.topic.trim() }
        : {}),
      ...(pipelineInput.startDate || pipelineInput.start_date
        ? { start_date: pipelineInput.startDate ?? pipelineInput.start_date }
        : {}),
      ...(pipelineInput.endDate || pipelineInput.end_date
        ? { end_date: pipelineInput.endDate ?? pipelineInput.end_date }
        : {}),
    })

    return {
      success: true,
      generationId: result.generation_id,
      status: result.status,
      stage: result.stage,
      message: result.message ?? 'Content generation started.',
    }
  } catch (error) {
    console.error('Failed to start MarketMe content pipeline:', error)

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to start content generation.',
    }
  }
}

// ---------------------------------------------------------------------------
// Caption revision
// ---------------------------------------------------------------------------

export async function reviseCaptionAction(
  currentCaption: string,
  prompt: string,
  platform: string
): Promise<string> {
  const normalizedCaption = currentCaption.trim()
  const normalizedPrompt = prompt.trim()

  if (!normalizedPrompt) {
    throw new Error('Enter an instruction for the caption revision.')
  }

  if (process.env.OPENAI_API_KEY?.trim()) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              `Revise the following ${platform} post caption based on the user's ` +
              'instruction. Return only the revised caption text, without quotes or Markdown.',
          },
          {
            role: 'user',
            content:
              `Caption:\n${normalizedCaption}\n\nInstruction: ${normalizedPrompt}`,
          },
        ],
      })

      const revised = completion.choices[0]?.message?.content?.trim()

      if (revised) return revised
    } catch (error) {
      console.error('OpenAI caption revision failed:', error)
    }
  }

  await new Promise<void>((resolve) => {
    setTimeout(resolve, 800)
  })

  return `${normalizedCaption}\n\n(Revision requested: ${normalizedPrompt})`
}

// ---------------------------------------------------------------------------
// Single post scheduling
// ---------------------------------------------------------------------------

export async function schedulePostAction(payload: {
  postId?: string
  caption: string
  hashtags: string
  canvasData: CanvasData
  scheduledDate: string
  platform: string
  templateId?: string | null
}): Promise<{ success: boolean; error?: string; postId?: string }> {
  const user = await getAuthenticatedUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const scheduledAt = toIsoScheduledDate(payload.scheduledDate)
    const platform = normalizePlatform(payload.platform)
    const content = combinePostContent(payload.caption, payload.hashtags)

    if (!content) {
      return { success: false, error: 'Post content cannot be empty' }
    }

    const templateId =
      payload.templateId && isValidUuid(payload.templateId)
        ? payload.templateId
        : null

    if (payload.postId && isValidUuid(payload.postId)) {
      const updateResult = await updateExistingPostForSchedule(
        user.id,
        payload.postId,
        {
          platform,
          content,
          scheduledAt,
          canvasData: payload.canvasData,
          templateId,
        }
      )

      if (updateResult.error || !updateResult.data) {
        return {
          success: false,
          error: updateResult.error ?? 'Failed to schedule post',
        }
      }

      revalidatePostViews()
      return { success: true, postId: payload.postId }
    }

    const planResult = await ensureContentPlanForUser(
      user.id,
      user.user_metadata?.full_name ?? user.user_metadata?.name
    )

    if (!planResult.ok) {
      return { success: false, error: planResult.error }
    }

    const insertResult = await insertScheduledPost(user.id, {
      contentPlanId: planResult.planId,
      platform,
      content,
      scheduledAt,
      canvasData: payload.canvasData,
      templateId,
      status: 'draft',
    })

    if (!insertResult.ok) {
      return { success: false, error: insertResult.error }
    }

    const scheduleResult = await approveAndSchedulePost(
      user.id,
      insertResult.postId,
      scheduledAt
    )

    if (scheduleResult.error || !scheduleResult.data) {
      return {
        success: false,
        error: scheduleResult.error ?? 'Failed to schedule post',
      }
    }

    revalidatePostViews()
    return { success: true, postId: insertResult.postId }
  } catch (error) {
    console.error('Scheduling error:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to schedule post',
    }
  }
}

// ---------------------------------------------------------------------------
// Batch scheduling
// ---------------------------------------------------------------------------

export async function schedulePostsBatchAction(payload: {
  platform: string
  posts: SchedulePostPayload[]
}): Promise<{
  success: boolean
  scheduledCount: number
  error?: string
  postIds?: string[]
}> {
  const user = await getAuthenticatedUser()

  if (!user) {
    return { success: false, scheduledCount: 0, error: 'Unauthorized' }
  }

  if (payload.posts.length === 0) {
    return { success: false, scheduledCount: 0, error: 'No posts to schedule' }
  }

  try {
    const platform = normalizePlatform(payload.platform)
    const postIds: string[] = []
    const errors: string[] = []
    let fallbackPlanId: string | null = null

    for (const post of payload.posts) {
      const content = combinePostContent(post.caption, post.hashtags)

      if (!content) {
        errors.push('One post had empty content and was skipped')
        continue
      }

      let scheduledAt: string

      try {
        scheduledAt = toIsoScheduledDate(post.scheduledDate)
      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'Invalid scheduled date')
        continue
      }

      const templateId =
        post.templateId && isValidUuid(post.templateId)
          ? post.templateId
          : null

      if (post.postId && isValidUuid(post.postId)) {
        const updateResult = await updateExistingPostForSchedule(
          user.id,
          post.postId,
          {
            platform,
            content,
            scheduledAt,
            canvasData: post.canvasData,
            templateId,
          }
        )

        if (updateResult.error || !updateResult.data) {
          errors.push(updateResult.error ?? 'Failed to update and schedule post')
          continue
        }

        postIds.push(post.postId)
        continue
      }

      if (!fallbackPlanId) {
        const planResult = await ensureContentPlanForUser(
          user.id,
          user.user_metadata?.full_name ?? user.user_metadata?.name
        )

        if (!planResult.ok) {
          errors.push(planResult.error)
          continue
        }

        fallbackPlanId = planResult.planId
      }

      const insertResult = await insertScheduledPost(user.id, {
        contentPlanId: fallbackPlanId,
        platform,
        content,
        scheduledAt,
        canvasData: post.canvasData,
        templateId,
        status: 'draft',
      })

      if (!insertResult.ok) {
        errors.push(insertResult.error)
        continue
      }

      const scheduleResult = await approveAndSchedulePost(
        user.id,
        insertResult.postId,
        scheduledAt
      )

      if (scheduleResult.error || !scheduleResult.data) {
        errors.push(scheduleResult.error ?? 'Failed to approve and queue post')
        continue
      }

      postIds.push(insertResult.postId)
    }

    if (postIds.length === 0) {
      return {
        success: false,
        scheduledCount: 0,
        error: errors[0] ?? 'Failed to schedule posts',
      }
    }

    revalidatePostViews()

    return {
      success: true,
      scheduledCount: postIds.length,
      postIds,
      error:
        errors.length > 0
          ? `${postIds.length} scheduled; ${errors.length} failed: ${errors[0]}`
          : undefined,
    }
  } catch (error) {
    console.error('Batch scheduling error:', error)

    return {
      success: false,
      scheduledCount: 0,
      error: error instanceof Error ? error.message : 'Failed to schedule posts',
    }
  }
}