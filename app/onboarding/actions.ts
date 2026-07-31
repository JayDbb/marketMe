'use server'

import { upsertBusinessProfileAction } from '@/app/api/business-profile/_actions'
import { parseCompetitorLines } from '@/lib/niche-presets'
import type { BusinessProfile, BusinessProfileInput } from '@/types/business-profile'

export async function completeOnboardingAction(
  input: BusinessProfileInput
): Promise<{ data: BusinessProfile | null; error: string | null }> {
  const result = await upsertBusinessProfileAction(input)
  if (result.error || !result.data) return result

  const profile = result.data
  const competitorText = input.competitors?.trim() || ''

  try {
    const { replaceCompetitors, scheduleCompetitorAnalysis } = await import(
      '@/lib/services/competitor-intelligence.service'
    )
    const { scheduleBrandIntelligenceRefresh } = await import(
      '@/lib/services/brand-intelligence.service'
    )

    const entries = parseCompetitorLines(competitorText).map((e) => ({
      label: e.label,
      instagramHandle: e.instagramHandle,
      websiteUrl: e.websiteUrl,
      source: 'onboarding' as const,
    }))

    await replaceCompetitors({
      businessProfileId: profile.id,
      userId: profile.user_id,
      entries,
      source: 'onboarding',
    })

    scheduleCompetitorAnalysis({
      businessProfileId: profile.id,
      userId: profile.user_id,
    })
    scheduleBrandIntelligenceRefresh({
      businessProfileId: profile.id,
      userId: profile.user_id,
    })
  } catch (error) {
    console.error('[onboarding] competitor/brand refresh failed', {
      message: error instanceof Error ? error.message : 'unknown',
    })
  }

  return result
}
