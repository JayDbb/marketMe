import 'server-only'

import {
  buildGenerationTopicFromProfile,
  buildMarketingSystemPrompt,
  type MarketingPromptProfile,
} from '@/lib/marketing-profile-prompt'
import {
  formatBrandMemoryPromptBlock,
  getBrandMemoryContext,
} from '@/lib/services/brand-memory.service'
import {
  formatInsightsPromptBlock,
  getCachedInstagramInsights,
  syncInstagramInsights,
  type InstagramAccountInsights,
} from '@/lib/services/instagram-insights.service'

export type GenerationContextLayers = {
  profileBrief: string
  brandMemory: string
  insights: string
  /** Combined block for pipeline additional_instructions */
  fullInstructions: string
  /** Compact string for AI API `topic` (max ~1000) */
  topic: string
  hasBrandMemory: boolean
  hasInsights: boolean
  insightsStatus: InstagramAccountInsights['status'] | 'none'
  insightsWarning?: string
}

function joinBlocks(...parts: Array<string | null | undefined>): string {
  return parts
    .map((p) => p?.trim())
    .filter(Boolean)
    .join('\n\n')
}

/**
 * Build onboarding + brand memory + Instagram insights context for Generate.
 * Insights sync is best-effort (404 from Render → unavailable, still generates).
 */
export async function buildGenerationContext(input: {
  userId: string
  profile: MarketingPromptProfile & { id: string }
  userTopic?: string | null
  /** When true, attempt live sync from MarketMe AI publish insights API */
  syncInsights?: boolean
}): Promise<GenerationContextLayers> {
  const profileId = input.profile.id

  const brandMemory = await getBrandMemoryContext(input.userId, profileId)
  const brandMemoryBlock = formatBrandMemoryPromptBlock(brandMemory)

  let insights: InstagramAccountInsights | null = null
  let insightsWarning: string | undefined
  let insightsSource: 'marketme-ai' | 'cache' | 'unavailable' | 'error' | 'skipped' =
    'skipped'

  if (input.syncInsights !== false) {
    const synced = await syncInstagramInsights({
      businessProfileId: profileId,
      userId: input.userId,
    })
    insights = synced.insights
    insightsWarning = synced.warning
    insightsSource = synced.source
  } else {
    insights = await getCachedInstagramInsights(profileId, input.userId)
    insightsSource = insights ? 'cache' : 'skipped'
  }

  const insightsBlock = formatInsightsPromptBlock(insights)
  const profileBrief = buildMarketingSystemPrompt(input.profile)

  const topic = buildGenerationTopicFromProfile(input.profile, {
    userTopic: input.userTopic,
    brandMemory: joinBlocks(
      brandMemoryBlock ? brandMemoryBlock.slice(0, 180) : null,
      insights?.status === 'ready' && insights.learningNotes[0]
        ? `Insight: ${insights.learningNotes[0].slice(0, 120)}`
        : null
    ),
  })

  const fullInstructions = joinBlocks(
    profileBrief,
    brandMemoryBlock || null,
    insightsBlock || null,
    insightsSource === 'unavailable'
      ? 'Instagram insights API not available yet — optimize from brand profile and memory only.'
      : null
  )

  return {
    profileBrief,
    brandMemory: brandMemoryBlock,
    insights: insightsBlock,
    fullInstructions,
    topic: topic.slice(0, 1000),
    hasBrandMemory: Boolean(brandMemoryBlock.trim()),
    hasInsights: insights?.status === 'ready',
    insightsStatus: insights?.status ?? 'none',
    insightsWarning,
  }
}
