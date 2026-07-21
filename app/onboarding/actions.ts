'use server'

import { upsertBusinessProfile } from '@/app/api/business-profile/_actions'
import type { BusinessProfile, BusinessProfileInput } from '@/types/business-profile'

export async function completeOnboardingAction(
  input: BusinessProfileInput
): Promise<{ data: BusinessProfile | null; error: string | null }> {
  return upsertBusinessProfile(input)
}
