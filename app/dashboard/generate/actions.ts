'use server'

import { revalidatePath } from 'next/cache'
import type { CanvasData } from '@/types/canvas'
import { getBusinessProfile } from '@/app/api/business-profile/_actions'
import { resolveDisplayName } from '@/lib/billing-utils'
import { getUserTemplatesResult } from '@/app/dashboard/studio/actions'
import { ensureContentPlanForUser } from '@/lib/ensure-content-plan'
import { insertScheduledPost } from '@/lib/insert-scheduled-post'
import { getAuthenticatedUser, isValidUuid } from '@/lib/supabase/server-auth'
import {
  buildMarketingSystemPrompt,
  mapProfileGoalToGenerateGoal,
  primaryChannelFromProfile,
} from '@/lib/marketing-profile-prompt'
import {
  buildFallbackPosts,
  buildScheduleDates,
  normalizePlatform,
  toIsoScheduledDate,
  type GenerateContext,
  type GenerateSetupInput,
  type GeneratedPostDraft,
} from '@/lib/generate-utils'
import { openai } from '@/lib/openai'

export async function getGenerateContextAction(): Promise<GenerateContext | null> {
  const user = await getAuthenticatedUser()

  if (!user) return null

  const [{ data: profile }, { templates }] = await Promise.all([
    getBusinessProfile(),
    getUserTemplatesResult(),
  ])

  const businessName = resolveDisplayName(user, profile)

  return {
    businessName,
    industry: profile?.industry?.trim() ?? '',
    services: profile?.services?.trim() ?? '',
    defaultTone: profile?.tone?.trim() || 'Professional',
    defaultGoal: mapProfileGoalToGenerateGoal(profile?.primary_goal),
    defaultPlatform: primaryChannelFromProfile(profile?.channels),
    hasOpenAI: Boolean(process.env.OPENAI_API_KEY?.trim()),
    templateCount: templates.length,
  }
}

export async function generatePostsAction(
  input: GenerateSetupInput
): Promise<{ success: boolean; posts?: GeneratedPostDraft[]; error?: string }> {
  const numPosts = Math.max(1, Math.min(14, input.numPosts || 3))

  const setup: GenerateSetupInput = {
    ...input,
    numPosts,
    businessName: input.businessName.trim() || 'My Business',
    platform: input.platform.trim() || 'Instagram',
    goal: input.goal.trim() || 'Increase Brand Awareness',
    tone: input.tone.trim(),
  }

  if (process.env.OPENAI_API_KEY?.trim()) {
    try {
      const { data: profile } = await getBusinessProfile()
      const aiPosts = await generateWithOpenAI(setup, {
        industry: profile?.industry?.trim(),
        services: profile?.services?.trim(),
      })
      if (aiPosts.length > 0) {
        return { success: true, posts: aiPosts }
      }
    } catch (error) {
      console.error('OpenAI generation failed, using fallback:', error)
    }
  }

  return { success: true, posts: buildFallbackPosts(setup) }
}

async function generateWithOpenAI(
  input: GenerateSetupInput,
  profileContext?: { industry?: string; services?: string }
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
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `${systemPrompt}
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
  if (process.env.OPENAI_API_KEY?.trim()) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Revise the following ${platform} post caption based on the user's instruction. Return only the revised caption text, no quotes or markdown.`,
          },
          {
            role: 'user',
            content: `Caption:\n${currentCaption}\n\nInstruction: ${prompt}`,
          },
        ],
      })
      const revised = completion.choices[0]?.message?.content?.trim()
      if (revised) return revised
    } catch (error) {
      console.error('OpenAI revise failed:', error)
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 800))
  return `${currentCaption}\n\n(Revised: ${prompt})`
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
      })

      if (!insertResult.ok) {
        errors.push(insertResult.error)
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
