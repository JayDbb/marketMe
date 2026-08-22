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
import { persistCanvasImageLayers } from '@/lib/canvas-persist-images'
import { rateLimitOrThrow } from '@/lib/rate-limit'
import { normalizePlatform, toIsoScheduledDate } from '@/lib/generate-utils'
import { getAuthenticatedUser, isValidUuid } from '@/lib/supabase/server-auth'
import {
  getCreditsBalance,
  getCreditsBalanceDetails,
  spendGenerationCredits,
} from '@/lib/services/credits.service'
import {
  approveAndSchedulePost,
  updateExistingPostForSchedule,
  verifyPostOwnership,
} from '@/lib/services/post-lifecycle.service'
import {
  buildMarketingSystemPrompt,
  mapProfileGoalToGenerateGoal,
  primaryChannelFromProfile,
} from '@/lib/marketing-profile-prompt'
import { imagePromptSystemInstructions } from '@/lib/image-prompt'
import {
  healthCheck,
  startContentGeneration,
} from '@/lib/services/marketing-ai.service'
import {
  formatBrandMemoryPromptBlock,
  getBrandMemoryContext,
} from '@/lib/services/brand-memory.service'
import { buildGenerationContext } from '@/lib/services/generation-context.service'
import { getUserAiPreferences } from '@/lib/services/ai-preferences.service'
import { resolveImageModel } from '@/lib/ai-models'
import { openai } from '@/lib/openai'
import { calculateGenerationCreditCost } from '@/types/pipeline'
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
  imageUrl?: string | null
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

async function resolveScheduleMedia(
  userId: string,
  canvasData: CanvasData | undefined,
  imageUrl?: string | null
): Promise<{ canvasData?: CanvasData; imageUrl: string | null }> {
  if (!canvasData) {
    return { canvasData: undefined, imageUrl: imageUrl ?? null }
  }

  const persisted = await persistCanvasImageLayers(userId, canvasData)
  return {
    canvasData: persisted.canvasData,
    imageUrl: imageUrl ?? persisted.previewUrl ?? null,
  }
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
    creditDetails,
    subscriptionResult,
    pipelineAvailable,
  ] = await Promise.all([
    getBusinessProfileAction(),
    getUserTemplatesResult(),
    getCreditsBalanceDetails(user.id),
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

  const learning =
    profile?.id
      ? await buildGenerationContext({
          userId: user.id,
          profile,
          syncInsights: false,
        })
      : null

  const businessName = resolveDisplayName(user, profile)
  const plan = ((subscriptionResult.data?.plan as PlanId) ?? 'free') as PlanId
  const creditsLimit = PLANS[plan]?.limits.aiCredits ?? null

  return {
    businessName,
    industry: profile?.industry?.trim() ?? '',
    services: profile?.services?.trim() ?? '',
    location: profile?.location?.trim() ?? '',
    defaultTone: profile?.tone?.trim() || 'Professional',
    defaultGoal: mapProfileGoalToGenerateGoal(profile?.primary_goal),
    defaultPlatform: primaryChannelFromProfile(profile?.channels),
    usesOnboardingBrandKit: Boolean(
      profile &&
        (profile.services?.trim() ||
          profile.tone?.trim() ||
          (Array.isArray(profile.brand_colors) && profile.brand_colors.length > 0) ||
          profile.logo_url)
    ),
    learningLayers: {
      brandMemory: learning?.hasBrandMemory ?? false,
      insights: learning?.hasInsights ?? false,
      insightsStatus: learning?.insightsStatus ?? 'none',
    },

    hasLiveAi: pipelineAvailable,
    hasOpenAI: pipelineAvailable,
    aiProvider: pipelineAvailable ? 'marketme-api' : 'none',
    preferredAiProvider: 'auto',

    captionModel: 'openai/gpt-4o-mini',
    captionModelLabel: 'GPT-4o mini',

    templateCount: templates.length,
    templateUsageCounts: {},

    creditsBalance: creditDetails.credits_balance,
    creditsLimit,
    creditsResetAt: creditDetails.credits_reset_at,

    creditCostPerGeneration: calculateGenerationCreditCost(1),
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
  const requiredCredits = calculateGenerationCreditCost(numPosts)

  try {
    const balance = await getCreditsBalance(user.id)
    if (balance < requiredCredits) {
      return {
        success: false,
        error: `Insufficient credits: need ${requiredCredits}, have ${balance}`,
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to verify credits',
    }
  }

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
    const generationContext = await buildGenerationContext({
      userId: user.id,
      profile: businessProfile,
      userTopic: input.topic?.trim() || pipelineInput.topic,
      syncInsights: true,
    })

    const result = await startContentGeneration({
      business_profile_id: businessProfile.id,
      goal,
      platform,
      number_of_posts: numPosts,
      tone,
      template_source: templateSelection.templateSource,
      topic: generationContext.topic,
      ...(templateSelection.studioTemplateId
        ? { studio_template_id: templateSelection.studioTemplateId }
        : {}),
      ...(pipelineInput.startDate || pipelineInput.start_date
        ? { start_date: pipelineInput.startDate ?? pipelineInput.start_date }
        : {}),
      ...(pipelineInput.endDate || pipelineInput.end_date
        ? { end_date: pipelineInput.endDate ?? pipelineInput.end_date }
        : {}),
    })

    try {
      await spendGenerationCredits(user.id, numPosts, {
        businessProfileId: businessProfile.id,
        generationId: result.generation_id,
        metadata: {
          flow: 'dashboard-generate',
          templateSource: templateSelection.templateSource,
          platform,
        },
      })
    } catch (creditError) {
      console.error('Generation started but credit ledger update failed:', creditError)
    }

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

  const user = await getAuthenticatedUser()
  const { data: profile } = user
    ? await getBusinessProfileAction()
    : { data: null }
  const brandMemory =
    user && profile?.id
      ? await getBrandMemoryContext(user.id, profile.id)
      : null
  const brandMemoryBlock = brandMemory
    ? formatBrandMemoryPromptBlock(brandMemory, { maxExamples: 3 })
    : ''
  const profilePrompt = profile
    ? buildMarketingSystemPrompt(profile)
    : ''

  if (process.env.OPENAI_API_KEY?.trim()) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: [
              profilePrompt ||
                `You are an expert social media marketer revising a ${platform} caption.`,
              `Revise the following ${platform} post caption based on the user's instruction.`,
              'Return only the revised caption text, without quotes or Markdown.',
              brandMemoryBlock,
            ]
              .filter(Boolean)
              .join('\n\n'),
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

export type RevisePostImageResult =
  | {
      success: true
      imagePrompt: string
      imageUrl: string
    }
  | { success: false; error: string }

/**
 * Revise a post's image prompt from Generate review chat, then generate a new
 * image with OpenAI and upload it to storage.
 */
export async function revisePostImageAction(input: {
  postId: string
  instruction: string
  currentPrompt?: string | null
  caption?: string | null
  title?: string | null
}): Promise<RevisePostImageResult> {
  const user = await getAuthenticatedUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const postId = input.postId?.trim()
  const instruction = input.instruction.trim()
  if (!postId || !isValidUuid(postId)) {
    return { success: false, error: 'Save or finish generating this post before revising its image.' }
  }
  if (!instruction) {
    return { success: false, error: 'Describe how you want the image changed.' }
  }

  try {
    rateLimitOrThrow(`revise-image:${user.id}`, 8, 60_000)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Too many image revisions. Try again shortly.',
    }
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return {
      success: false,
      error: 'Image revision needs OPENAI_API_KEY configured on the server.',
    }
  }

  try {
    await verifyPostOwnership(user.id, postId)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Post not found',
    }
  }

  const { data: postRow } = await supabaseAdmin
    .from('posts')
    .select('id, image_prompt, caption, content, title')
    .eq('id', postId)
    .maybeSingle()

  const { data: profile } = await getBusinessProfileAction()
  const brandMemory = profile?.id
    ? await getBrandMemoryContext(user.id, profile.id)
    : null
  const brandMemoryBlock = brandMemory
    ? formatBrandMemoryPromptBlock(brandMemory, { maxExamples: 2 })
    : ''
  const profilePrompt = profile ? buildMarketingSystemPrompt(profile) : ''

  const seedPrompt =
    input.currentPrompt?.trim() ||
    (typeof postRow?.image_prompt === 'string' ? postRow.image_prompt.trim() : '') ||
    [
      input.title || postRow?.title || 'Social post visual',
      input.caption || postRow?.caption || postRow?.content || '',
      profile?.brand_colors?.length
        ? `Brand colours: ${profile.brand_colors.join(', ')}`
        : '',
    ]
      .filter(Boolean)
      .join('. ')

  let imagePrompt = seedPrompt
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: [
            profilePrompt ||
              'You write image-generation prompts for on-brand social media graphics.',
            imagePromptSystemInstructions({
              businessName: profile?.business_name,
              industry: profile?.industry,
              industryDetail: profile?.industry_detail,
              tone: profile?.tone,
              services: profile?.services,
              brandColors: profile?.brand_colors,
              brandFonts: profile?.brand_fonts,
              logoUrl: profile?.logo_url,
            }),
            'Revise the image prompt from the user instruction.',
            brandMemoryBlock,
          ]
            .filter(Boolean)
            .join('\n\n'),
        },
        {
          role: 'user',
          content: `Current image prompt:\n${seedPrompt || 'Professional brand social graphic'}\n\nRevision request:\n${instruction}`,
        },
      ],
    })
    const revised = completion.choices[0]?.message?.content?.trim()
    if (revised) imagePrompt = revised
  } catch (error) {
    console.error('Image prompt revision failed:', error)
    return {
      success: false,
      error: 'Could not revise the image prompt. Try again.',
    }
  }

  await supabaseAdmin
    .from('posts')
    .update({ image_prompt: imagePrompt })
    .eq('id', postId)

  try {
    const prefs = await getUserAiPreferences(user.id)
    const imageModel = resolveImageModel(prefs.imageModel)
    const imageResponse = await openai.images.generate({
      model: imageModel as 'dall-e-3',
      prompt: imagePrompt.slice(0, 4000),
      n: 1,
      size: '1024x1024',
    })
    const tempUrl = imageResponse.data?.[0]?.url
    if (!tempUrl) {
      return { success: false, error: 'Image model returned no URL.' }
    }

    const fetchResponse = await fetch(tempUrl)
    if (!fetchResponse.ok) {
      return { success: false, error: 'Failed to download generated image.' }
    }
    const buffer = Buffer.from(await fetchResponse.arrayBuffer())
    const fileName = `Posts/post-${postId}-${Date.now()}.png`
    const bucketName =
      process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'generated-content'

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      return {
        success: false,
        error: `Upload failed: ${uploadError.message}`,
      }
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileName)
    const imageUrl = publicUrlData.publicUrl

    await supabaseAdmin
      .from('posts')
      .update({ image_url: imageUrl, image_prompt: imagePrompt })
      .eq('id', postId)

    revalidatePath('/dashboard/generate')
    revalidatePath('/dashboard/posts')

    return { success: true, imagePrompt, imageUrl }
  } catch (error) {
    console.error('Image generation after revise failed:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Image generation failed. Check OpenAI access and try again.',
    }
  }
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
  imageUrl?: string | null
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

    const media = await resolveScheduleMedia(
      user.id,
      payload.canvasData,
      payload.imageUrl
    )

    if (payload.postId && isValidUuid(payload.postId)) {
      const updateResult = await updateExistingPostForSchedule(
        user.id,
        payload.postId,
        {
          platform,
          content,
          scheduledAt,
          canvasData: media.canvasData,
          templateId,
          imageUrl: media.imageUrl,
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
      canvasData: media.canvasData,
      templateId,
      imageUrl: media.imageUrl,
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

      const media = await resolveScheduleMedia(
        user.id,
        post.canvasData,
        post.imageUrl
      )

      if (post.postId && isValidUuid(post.postId)) {
        const updateResult = await updateExistingPostForSchedule(
          user.id,
          post.postId,
          {
            platform,
            content,
            scheduledAt,
            canvasData: media.canvasData,
            templateId,
            imageUrl: media.imageUrl,
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
        canvasData: media.canvasData,
        templateId,
        imageUrl: media.imageUrl,
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