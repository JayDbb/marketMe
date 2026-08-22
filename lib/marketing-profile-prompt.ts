import type { BusinessProfile, BusinessProfileInput } from '@/types/business-profile'

/** Fields that meaningfully improve AI-generated marketing content. */
export const AI_PROFILE_ESSENTIALS: (keyof BusinessProfile)[] = [
  'business_name',
  'industry',
  'services',
  'primary_goal',
  'target_customers',
  'tone',
  'channels',
]

export function isProfileReadyForAI(
  profile: BusinessProfile | BusinessProfileInput | null | undefined
): boolean {
  if (!profile) return false
  const name = profile.business_name?.trim()
  const industry = profile.industry?.trim()
  const services = profile.services?.trim()
  const goal = profile.primary_goal?.trim()
  const audience = profile.target_customers?.trim()
  const tone = profile.tone?.trim()
  const channels = profile.channels?.length ?? 0
  return Boolean(name && industry && services && goal && audience && tone && channels > 0)
}

export type MarketingPromptProfile = Pick<
  BusinessProfile,
  | 'business_name'
  | 'industry'
  | 'industry_detail'
  | 'location'
  | 'website'
  | 'services'
  | 'usp'
  | 'primary_goal'
  | 'target_customers'
  | 'tone'
  | 'competitors'
  | 'logo_url'
  | 'brand_colors'
  | 'brand_fonts'
> & {
  channels?: string[] | null
}

export function buildMarketingSystemPrompt(profile: MarketingPromptProfile): string {
  const lines = [
    `You are an expert social media marketer for ${profile.business_name ?? 'this business'}.`,
    profile.industry ? `Industry: ${profile.industry}` : null,
    profile.industry_detail ? `Industry detail: ${profile.industry_detail}` : null,
    profile.services ? `Products/services: ${profile.services}` : null,
    profile.usp ? `Unique value: ${profile.usp}` : null,
    profile.target_customers ? `Target audience: ${profile.target_customers}` : null,
    profile.primary_goal ? `Primary goal: ${profile.primary_goal}` : null,
    profile.tone ? `Brand voice: ${profile.tone}` : null,
    profile.channels?.length ? `Active channels: ${profile.channels.join(', ')}` : null,
    profile.location ? `Location/market: ${profile.location}` : null,
    profile.website ? `Website: ${profile.website}` : null,
    profile.competitors
      ? `Key competitors (differentiate, do not mention by name): ${profile.competitors}`
      : null,
    profile.logo_url ? `Brand logo URL: ${profile.logo_url}` : null,
    Array.isArray(profile.brand_colors) && profile.brand_colors.length > 0
      ? `Brand colours: ${profile.brand_colors.join(', ')}`
      : null,
    Array.isArray(profile.brand_fonts) && profile.brand_fonts.length > 0
      ? `Brand fonts: ${profile.brand_fonts.join(', ')}`
      : null,
    'Write platform-native copy that matches the brand voice and drives the stated goal.',
  ]

  return lines.filter(Boolean).join('\n')
}

/**
 * Compact onboarding brief for pipeline `additional_instructions` /
 * AI API `topic` (max 1000). Prefer this when the full system prompt is too long.
 */
export function buildCompactBrandBrief(
  profile: MarketingPromptProfile,
  maxLength = 900
): string {
  const parts = [
    profile.business_name ? `Brand: ${profile.business_name}` : null,
    profile.industry
      ? `Industry: ${profile.industry}${
          profile.industry_detail ? ` (${profile.industry_detail})` : ''
        }`
      : null,
    profile.services ? `Offers: ${profile.services}` : null,
    profile.usp ? `USP: ${profile.usp}` : null,
    profile.target_customers ? `Audience: ${profile.target_customers}` : null,
    profile.primary_goal ? `Goal: ${profile.primary_goal}` : null,
    profile.tone ? `Voice: ${profile.tone}` : null,
    profile.channels?.length ? `Channels: ${profile.channels.join(', ')}` : null,
    profile.website ? `Website: ${profile.website}` : null,
    profile.competitors
      ? `Differentiate vs (do not name): ${profile.competitors}`
      : null,
    Array.isArray(profile.brand_colors) && profile.brand_colors.length > 0
      ? `Colours: ${profile.brand_colors.join(', ')}`
      : null,
    Array.isArray(profile.brand_fonts) && profile.brand_fonts.length > 0
      ? `Fonts: ${profile.brand_fonts.join(', ')}`
      : null,
    profile.logo_url ? `Logo: ${profile.logo_url}` : null,
  ].filter(Boolean) as string[]

  const joined = parts.join(' · ')
  if (joined.length <= maxLength) return joined
  return `${joined.slice(0, maxLength - 1).trimEnd()}…`
}

/**
 * Merge an optional user topic with the onboarding brand brief for the AI
 * pipeline start endpoint (topic maxLength 1000, additionalProperties false).
 */
export function buildGenerationTopicFromProfile(
  profile: MarketingPromptProfile,
  options?: { userTopic?: string | null; brandMemory?: string | null }
): string {
  const brief = buildCompactBrandBrief(profile, 650)
  const memory = options?.brandMemory?.trim()
  const topic = options?.userTopic?.trim()

  const chunks = [
    `Onboarding brand brief — ${brief}`,
    memory ? memory.slice(0, 200) : null,
    topic ? `Focus: ${topic}` : null,
  ].filter(Boolean) as string[]

  const combined = chunks.join('\n')
  return combined.length <= 1000 ? combined : `${combined.slice(0, 999).trimEnd()}…`
}

/** Map onboarding goal labels to generate-flow goal strings. */
export function mapProfileGoalToGenerateGoal(primaryGoal: string | null | undefined): string {
  switch (primaryGoal?.trim()) {
    case 'Lead Generation':
      return 'Lead Generation'
    case 'Brand Awareness':
      return 'Increase Brand Awareness'
    case 'Direct Sales':
      return 'Lead Generation'
    case 'Bookings / Consultations':
      return 'Lead Generation'
    default:
      return 'Increase Brand Awareness'
  }
}

export function primaryChannelFromProfile(channels: string[] | null | undefined): string {
  if (!channels?.length) return 'Instagram'
  const first = channels[0]
  if (first === 'Twitter / X') return 'Twitter'
  if (first === 'Email Newsletter') return 'LinkedIn'
  return first
}
