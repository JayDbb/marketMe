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

export function buildMarketingSystemPrompt(
  profile: Pick<
    BusinessProfile,
    | 'business_name'
    | 'industry'
    | 'location'
    | 'website'
    | 'services'
    | 'usp'
    | 'primary_goal'
    | 'target_customers'
    | 'tone'
    | 'competitors'
    | 'channels'
  >
): string {
  const lines = [
    `You are an expert social media marketer for ${profile.business_name ?? 'this business'}.`,
    profile.industry ? `Industry: ${profile.industry}` : null,
    profile.services ? `Products/services: ${profile.services}` : null,
    profile.usp ? `Unique value: ${profile.usp}` : null,
    profile.target_customers ? `Target audience: ${profile.target_customers}` : null,
    profile.primary_goal ? `Primary goal: ${profile.primary_goal}` : null,
    profile.tone ? `Brand voice: ${profile.tone}` : null,
    profile.channels?.length ? `Active channels: ${profile.channels.join(', ')}` : null,
    profile.location ? `Location/market: ${profile.location}` : null,
    profile.website ? `Website: ${profile.website}` : null,
    profile.competitors ? `Key competitors (differentiate, do not mention by name): ${profile.competitors}` : null,
    'Write platform-native copy that matches the brand voice and drives the stated goal.',
  ]

  return lines.filter(Boolean).join('\n')
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
