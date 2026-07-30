'use server'

import { revalidatePath } from 'next/cache'
import type { CanvasData } from '@/types/canvas'
import { getBusinessProfileAction } from '@/app/api/business-profile/_actions'
import { resolveDisplayName, PLANS } from '@/lib/billing-utils'
import { getUserTemplatesResult } from '@/app/dashboard/studio/actions'
import { ensureContentPlanForUser } from '@/lib/ensure-content-plan'
import { insertScheduledPost } from '@/lib/insert-scheduled-post'
import { rateLimitOrThrow } from '@/lib/rate-limit'
import { getAuthenticatedUser, isValidUuid } from '@/lib/supabase/server-auth'
import {
  assertCreditsAvailable,
  InsufficientCreditsError,
  spendCredits,
} from '@/lib/services/credits.service'
import { completeGeneration, startGeneration } from '@/lib/services/generation.service'
import { approveAndSchedulePost } from '@/lib/services/post-lifecycle.service'
import {
  buildMarketingSystemPrompt,
  mapProfileGoalToGenerateGoal,
  primaryChannelFromProfile,
} from '@/lib/marketing-profile-prompt'
import {
  buildFallbackPosts,
  buildPexelsSearchQuery,
  buildScheduleDates,
  normalizePlatform,
  scorePexelsAlt,
  toIsoScheduledDate,
  type GenerateContext,
  type GenerateSetupInput,
  type GeneratedPostDraft,
  type TemplateMatchContext,
} from '@/lib/generate-utils'
import { searchPexelsPhotos, pickPexelsImageUrl } from '@/lib/services/pexels.service'
import { openai } from '@/lib/openai'
import { getCreditsBalance } from '@/lib/services/credits.service'
import {
  profileToPipelineInput,
  runCreativePipeline,
} from '@/lib/services/creative-pipeline.service'
import {
  isMarketingAiConfigured,
  MarketingAIError,
} from '@/lib/services/marketing-ai.service'
import { PIPELINE_CREDIT_COSTS } from '@/types/pipeline'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { PlanId } from '@/types/billing'
import { getUserAiPreferences } from '@/lib/services/ai-preferences.service'
import {
  formatBrandMemoryPromptBlock,
  getBrandMemoryContext,
  recordReviseSignal,
  REVISE_EXAMPLES,
} from '@/lib/services/brand-memory.service'
import {
  captionModelLabel,
  resolveChatModel,
  type AiProviderPreference,
} from '@/lib/ai-models'

function resolveConfiguredProvider(): GenerateContext['aiProvider'] {
  if (isMarketingAiConfigured()) return 'marketme-api'
  if (process.env.OPENAI_API_KEY?.trim()) return 'openai'
  return 'none'
}

function shouldUseMarketMePipeline(pref: AiProviderPreference): boolean {
  if (pref === 'openai') return false
  if (pref === 'marketme-api') return isMarketingAiConfigured()
  return isMarketingAiConfigured()
}

function shouldUseOpenAiPath(pref: AiProviderPreference): boolean {
  if (!process.env.OPENAI_API_KEY?.trim()) return false
  if (pref === 'marketme-api') return false
  return true
}

export async function getGenerateContextAction(): Promise<GenerateContext | null> {
  const user = await getAuthenticatedUser()

  if (!user) return null

  const [{ data: profile }, { templates }, creditsBalance, subRes, aiPrefs] =
    await Promise.all([
      getBusinessProfileAction(),
      getUserTemplatesResult(),
      getCreditsBalance(user.id),
      supabaseAdmin
        .from('user_subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .maybeSingle(),
      getUserAiPreferences(user.id),
    ])

  const businessName = resolveDisplayName(user, profile)
  const plan = ((subRes.data?.plan as PlanId) ?? 'free') as PlanId
  const creditsLimit = PLANS[plan]?.limits.aiCredits ?? null
  const aiProvider = resolveConfiguredProvider()
  const hasLiveAi = aiProvider !== 'none'

  return {
    businessName,
    industry: profile?.industry?.trim() ?? '',
    services: profile?.services?.trim() ?? '',
    location: profile?.location?.trim() ?? '',
    defaultTone: profile?.tone?.trim() || 'Professional',
    defaultGoal: mapProfileGoalToGenerateGoal(profile?.primary_goal),
    defaultPlatform: primaryChannelFromProfile(profile?.channels),
    hasLiveAi,
    hasOpenAI: hasLiveAi,
    aiProvider,
    preferredAiProvider: aiPrefs.aiProvider,
    captionModel: aiPrefs.captionModel,
    captionModelLabel: captionModelLabel(aiPrefs.captionModel),
    templateCount: templates.length,
    templateUsageCounts: await getTemplateUsageCounts(user.id),
    creditsBalance,
    creditsLimit,
    creditCostPerGeneration:
      PIPELINE_CREDIT_COSTS.marketing_strategy_generation +
      PIPELINE_CREDIT_COSTS.content_schedule_generation +
      PIPELINE_CREDIT_COSTS.post_generation,
  }
}

async function getTemplateUsageCounts(
  userId: string
): Promise<Record<string, number>> {
  const { data } = await supabaseAdmin
    .from('posts')
    .select('template_id')
    .eq('user_id', userId)
    .in('status', ['approved', 'scheduled', 'published'])
    .not('template_id', 'is', null)
    .limit(200)

  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    const id = row.template_id as string | null
    if (!id) continue
    counts[id] = (counts[id] ?? 0) + 1
  }
  return counts
}

export async function generatePostsAction(
  input: GenerateSetupInput
): Promise<{ success: boolean; posts?: GeneratedPostDraft[]; error?: string }> {
  const user = await getAuthenticatedUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  try {
    rateLimitOrThrow(`generate:${user.id}`, 10, 60_000)
    if (isMarketingAiConfigured()) {
      const pipelineCost =
        PIPELINE_CREDIT_COSTS.marketing_strategy_generation +
        PIPELINE_CREDIT_COSTS.content_schedule_generation +
        PIPELINE_CREDIT_COSTS.post_generation
      const balance = await getCreditsBalance(user.id)
      if (balance < pipelineCost) {
        throw new InsufficientCreditsError(pipelineCost, balance)
      }
    } else {
      await assertCreditsAvailable(user.id, 'post_generation')
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Request blocked'
    return { success: false, error: message }
  }

  const numPosts = Math.max(1, Math.min(14, input.numPosts || 3))

  const setup: GenerateSetupInput = {
    ...input,
    numPosts,
    businessName: input.businessName.trim() || 'My Business',
    platform: input.platform.trim() || 'Instagram',
    goal: input.goal.trim() || 'Increase Brand Awareness',
    tone: input.tone.trim(),
  }

  const { data: profile } = await getBusinessProfileAction()
  const aiPrefs = await getUserAiPreferences(user.id)
  const chatModel = resolveChatModel(aiPrefs.captionModel)
  const brandMemory = await getBrandMemoryContext(user.id, profile?.id)
  const brandMemoryBlock = formatBrandMemoryPromptBlock(brandMemory)

  if (shouldUseMarketMePipeline(aiPrefs.aiProvider) && profile?.id) {
    try {
      const pipeline = await runCreativePipeline({
        business: profileToPipelineInput(profile, {
          businessName: setup.businessName,
          tone: setup.tone || profile.tone,
          primaryGoal: setup.goal,
        }),
        platform: setup.platform,
        goal: setup.goal,
        tone: setup.tone,
        numPosts,
        includeCreativeBriefs: false,
        brandMemoryInstructions: brandMemoryBlock || undefined,
      })

      const posts: GeneratedPostDraft[] = pipeline.posts.map((p) => ({
        id: p.id,
        title: p.title,
        caption: p.caption,
        hashtags: p.hashtags,
        scheduledDate: p.scheduledDate,
        status: 'needs_review' as const,
      }))

      if (posts.length > 0) {
        await recordPostGeneration(user.id, profile.id, setup, 'marketme-api')
        return { success: true, posts }
      }
    } catch (error) {
      console.error('MarketMe AI pipeline failed, trying OpenAI fallback:', error)
      if (
        aiPrefs.aiProvider === 'marketme-api' &&
        error instanceof MarketingAIError &&
        error.status === 401
      ) {
        return {
          success: false,
          error: 'MarketMe AI API rejected credentials (check MARKETME_AI_API_KEY).',
        }
      }
      if (aiPrefs.aiProvider === 'marketme-api' && !shouldUseOpenAiPath('auto')) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'MarketMe AI pipeline failed and OpenAI fallback is disabled.',
        }
      }
    }
  }

  if (shouldUseOpenAiPath(aiPrefs.aiProvider)) {
    try {
      const aiPosts = await generateWithOpenAI(
        setup,
        {
          industry: profile?.industry?.trim(),
          services: profile?.services?.trim(),
        },
        chatModel,
        brandMemoryBlock
      )
      if (aiPosts.length > 0) {
        await recordPostGeneration(user.id, profile?.id, setup, 'openai', chatModel)
        return { success: true, posts: aiPosts }
      }
    } catch (error) {
      console.error('OpenAI generation failed, using fallback:', error)
    }
  }

  const fallbackPosts = buildFallbackPosts(setup)
  try {
    await recordPostGeneration(user.id, profile?.id, setup, 'fallback')
    return { success: true, posts: fallbackPosts }
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return { success: false, error: err.message }
    }
    throw err
  }
}

async function recordPostGeneration(
  userId: string,
  businessProfileId: string | undefined,
  setup: GenerateSetupInput,
  source: 'marketme-api' | 'openai' | 'fallback',
  modelUsed?: string
): Promise<void> {
  const generation = await startGeneration({
    userId,
    stage: 'post_generation',
    businessProfileId,
    modelUsed:
      source === 'marketme-api'
        ? 'marketme-ai-pipeline'
        : source === 'openai'
          ? modelUsed || 'openai'
          : 'template-fallback',
    inputRef: {
      businessName: setup.businessName,
      platform: setup.platform,
      goal: setup.goal,
      numPosts: setup.numPosts,
    },
  })

  try {
    if (source === 'marketme-api') {
      await spendCredits(userId, 'marketing_strategy_generation', {
        businessProfileId,
        generationId: generation.id,
        metadata: { source, stage: 'strategy' },
      })
      await spendCredits(userId, 'content_schedule_generation', {
        businessProfileId,
        generationId: generation.id,
        metadata: { source, stage: 'schedule' },
      })
    }
    await spendCredits(userId, 'post_generation', {
      businessProfileId,
      generationId: generation.id,
      metadata: { source, numPosts: setup.numPosts },
    })
    await completeGeneration(generation.id, 'completed', {
      source,
      postCount: setup.numPosts,
    })
  } catch (err) {
    await completeGeneration(
      generation.id,
      'failed',
      undefined,
      err instanceof Error ? err.message : 'Credit deduction failed'
    )
    throw err
  }
}

async function generateWithOpenAI(
  input: GenerateSetupInput,
  profileContext?: { industry?: string; services?: string },
  model = resolveChatModel(null),
  brandMemoryBlock = ''
): Promise<GeneratedPostDraft[]> {
  const dates = buildScheduleDates(input.numPosts)

  const systemPrompt = profileContext?.services || profileContext?.industry
    ? buildMarketingSystemPrompt({
        business_name: input.businessName,
        industry: profileContext.industry ?? null,
        location: null,
        website: null,
        services: profileContext.services ?? null,
        usp: null,
        primary_goal: input.goal,
        target_customers: null,
        tone: input.tone,
        competitors: null,
        channels: [input.platform],
      })
    : `You are a social media strategist. Write ${input.numPosts} ${input.platform} posts for "${input.businessName}".
Goal: ${input.goal}
Tone: ${input.tone || 'Professional and approachable'}`

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: `${systemPrompt}${brandMemoryBlock}
Return JSON: { "posts": [{ "title": string, "caption": string, "hashtags": string }] }
Captions should be ready to publish (no placeholder brackets). Hashtags as a single space-separated string starting with #.`,
      },
      {
        role: 'user',
        content: `Generate exactly ${input.numPosts} unique posts.`,
      },
    ],
    response_format: { type: 'json_object' },
  })

  const raw = completion.choices[0]?.message?.content ?? '{}'
  const parsed = JSON.parse(raw) as {
    posts?: { title?: string; caption?: string; hashtags?: string }[]
  }

  const items = parsed.posts ?? []

  return items.slice(0, input.numPosts).map((post, i) => ({
    id: `gen-${Date.now()}-${i}`,
    title: post.title?.trim() || `Post ${i + 1}`,
    caption: post.caption?.trim() || '',
    hashtags: post.hashtags?.trim() || `#${normalizePlatform(input.platform)}`,
    scheduledDate: dates[i] ?? dates[dates.length - 1],
    status: 'needs_review' as const,
  }))
}

export async function reviseCaptionAction(
  currentCaption: string,
  prompt: string,
  platform: string
): Promise<string> {
  const user = await getAuthenticatedUser()
  const brandMemory = user
    ? await getBrandMemoryContext(user.id)
    : null
  const brandMemoryBlock = brandMemory
    ? formatBrandMemoryPromptBlock(brandMemory, { maxExamples: REVISE_EXAMPLES })
    : ''

  if (process.env.OPENAI_API_KEY?.trim()) {
    try {
      const prefs = user ? await getUserAiPreferences(user.id) : null
      const model = resolveChatModel(prefs?.captionModel)
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `Revise the following ${platform} post caption based on the user's instruction. Return only the revised caption text, no quotes or markdown.${brandMemoryBlock}`,
          },
          {
            role: 'user',
            content: `Caption:\n${currentCaption}\n\nInstruction: ${prompt}`,
          },
        ],
      })
      const revised = completion.choices[0]?.message?.content?.trim()
      if (revised) {
        if (user) {
          try {
            await recordReviseSignal({
              userId: user.id,
              businessProfileId: brandMemory?.businessProfileId,
              instruction: prompt,
              originalCaption: currentCaption,
              revisedCaption: revised,
            })
          } catch (memoryErr) {
            console.error('Brand memory revise signal failed:', memoryErr)
          }
        }
        return revised
      }
    } catch (error) {
      console.error('OpenAI revise failed:', error)
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 800))
  return `${currentCaption}\n\n(Revised: ${prompt})`
}

/**
 * Free visual matching: ranks Pexels results against the post/profile corpus,
 * returns per-post images plus the best overall Pexels candidate for AI Selects Best.
 */
export async function resolveFreeVisualsAction(input: {
  posts: { id: string; title: string; caption: string }[]
  goal: string
  platform: string
  industry?: string
  services?: string
  location?: string
  businessName?: string
  /** When true, fetch a wider Pexels shortlist and score it for Studio-vs-Pexels ranking */
  rankCandidates?: boolean
}): Promise<{
  images: Record<string, string>
  bestPexels: {
    url: string
    thumb: string
    alt: string | null
    score: number
    query: string
  } | null
  error?: string
}> {
  const user = await getAuthenticatedUser()
  if (!user) return { images: {}, bestPexels: null, error: 'Unauthorized' }

  try {
    rateLimitOrThrow(`pexels-visuals:${user.id}`, 30, 60_000)
  } catch (err) {
    return {
      images: {},
      bestPexels: null,
      error: err instanceof Error ? err.message : 'Rate limit exceeded',
    }
  }

  const orientation =
    normalizePlatform(input.platform) === 'instagram' ? 'square' : 'portrait'

  const first = input.posts[0]
  const matchCtx: TemplateMatchContext = {
    goal: input.goal,
    industry: input.industry,
    services: input.services,
    title: first?.title,
    caption: first?.caption,
  }

  const primaryQuery = buildPexelsSearchQuery({
    industry: input.industry,
    services: input.services,
    location: input.location,
    goal: input.goal,
    title: first?.title,
    caption: first?.caption,
    businessName: input.businessName,
  })

  let bestPexels: {
    url: string
    thumb: string
    alt: string | null
    score: number
    query: string
  } | null = null

  if (input.rankCandidates !== false) {
    const { photos, error } = await searchPexelsPhotos({
      query: primaryQuery,
      perPage: 12,
      orientation: orientation as 'square' | 'portrait',
    })
    if (error === 'PEXELS_NOT_CONFIGURED') {
      return { images: {}, bestPexels: null, error }
    }

    let topScore = -1
    photos.forEach((photo, rank) => {
      const score = scorePexelsAlt(photo.alt_description, matchCtx) + Math.max(0, 6 - rank)
      if (score > topScore) {
        topScore = score
        bestPexels = {
          url: photo.urls.regular,
          thumb: photo.urls.thumb || photo.urls.preview,
          alt: photo.alt_description,
          score,
          query: primaryQuery,
        }
      }
    })
  }

  const images: Record<string, string> = {}
  const usedQueries = new Map<string, number>()

  await Promise.all(
    input.posts.map(async (post, index) => {
      const query = buildPexelsSearchQuery({
        industry: input.industry,
        services: input.services,
        location: input.location,
        goal: input.goal,
        title: post.title,
        caption: post.caption,
        businessName: input.businessName,
      })
      const offset = usedQueries.get(query) ?? 0
      usedQueries.set(query, offset + 1)
      const url = await pickPexelsImageUrl(
        query,
        orientation as 'square' | 'portrait',
        offset + (index % 3)
      )
      if (url) images[post.id] = url
    })
  )

  // Prefer the ranked winner for the first post when available
  if (bestPexels && input.posts[0] && !images[input.posts[0].id]) {
    images[input.posts[0].id] = bestPexels.url
  } else if (bestPexels && input.posts[0]) {
    images[input.posts[0].id] = bestPexels.url
  }

  return { images, bestPexels }
}

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

  if (!user) return { success: false, error: 'Unauthorized' }

  try {
    const scheduledAt = toIsoScheduledDate(payload.scheduledDate)
    const platform = normalizePlatform(payload.platform)
    const content = [payload.caption.trim(), payload.hashtags.trim()]
      .filter(Boolean)
      .join('\n\n')

    if (!content) {
      return { success: false, error: 'Post content cannot be empty' }
    }

    const planResult = await ensureContentPlanForUser(
      user.id,
      user.user_metadata?.full_name ?? user.user_metadata?.name
    )
    if (!planResult.ok) {
      return { success: false, error: planResult.error }
    }

    const templateId =
      payload.templateId && isValidUuid(payload.templateId)
        ? payload.templateId
        : null

    const insertResult = await insertScheduledPost(user.id, {
      contentPlanId: planResult.planId,
      platform,
      content,
      scheduledAt,
      canvasData: payload.canvasData,
      templateId,
    })

    if (!insertResult.ok) {
      return { success: false, error: insertResult.error }
    }

    revalidatePath('/dashboard/calendar')
    revalidatePath('/dashboard/posts')
    revalidatePath('/dashboard/generate')
    return { success: true, postId: insertResult.postId }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to schedule post'
    console.error('Scheduling Error:', error)
    return { success: false, error: message }
  }
}

export type SchedulePostPayload = {
  caption: string
  hashtags: string
  canvasData: CanvasData
  scheduledDate: string
  templateId?: string | null
}

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

  if (!user) return { success: false, scheduledCount: 0, error: 'Unauthorized' }

  if (payload.posts.length === 0) {
    return { success: false, scheduledCount: 0, error: 'No posts to schedule' }
  }

  try {
    const platform = normalizePlatform(payload.platform)

    const planResult = await ensureContentPlanForUser(
      user.id,
      user.user_metadata?.full_name ?? user.user_metadata?.name
    )
    if (!planResult.ok) {
      return { success: false, scheduledCount: 0, error: planResult.error }
    }

    const postIds: string[] = []
    const errors: string[] = []

    for (const post of payload.posts) {
      const content = [post.caption.trim(), post.hashtags.trim()].filter(Boolean).join('\n\n')
      if (!content) {
        errors.push('One post had empty content and was skipped')
        continue
      }

      let scheduledAt: string
      try {
        scheduledAt = toIsoScheduledDate(post.scheduledDate)
      } catch (err) {
        errors.push(err instanceof Error ? err.message : 'Invalid scheduled date')
        continue
      }

      const templateId =
        post.templateId && isValidUuid(post.templateId) ? post.templateId : null

      const insertResult = await insertScheduledPost(user.id, {
        contentPlanId: planResult.planId,
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

    revalidatePath('/dashboard/calendar')
    revalidatePath('/dashboard/posts')
    revalidatePath('/dashboard/generate')

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
    const message = error instanceof Error ? error.message : 'Failed to schedule posts'
    console.error('Batch scheduling error:', error)
    return { success: false, scheduledCount: 0, error: message }
  }
}
