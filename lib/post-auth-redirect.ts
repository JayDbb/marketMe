import { getBusinessProfile } from '@/app/api/business-profile/_actions'
import { isProfileReadyForAI } from '@/lib/marketing-profile-prompt'

/** Where to send a user after sign-in based on onboarding completion. */
export async function getPostAuthRedirectPath(): Promise<'/dashboard' | '/onboarding'> {
  const { data: profile } = await getBusinessProfile()
  return isProfileReadyForAI(profile) ? '/dashboard' : '/onboarding'
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  const { data: profile } = await getBusinessProfile()
  return isProfileReadyForAI(profile)
}
