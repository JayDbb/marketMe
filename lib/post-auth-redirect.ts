import { getBusinessProfileAction } from '@/app/api/business-profile/_actions'
<<<<<<< HEAD
import { isProfileReadyForAI } from '@/lib/marketing-profile-prompt'

/** Where to send a user after sign-in based on onboarding completion. */
export async function getPostAuthRedirectPath(): Promise<'/dashboard' | '/onboarding'> {
  const { data: profile } = await getBusinessProfileAction()
  return isProfileReadyForAI(profile) ? '/dashboard' : '/onboarding'
=======

/** After sign-in: dashboard if a profile row exists (including skip stubs). */
export async function getPostAuthRedirectPath(): Promise<'/dashboard' | '/onboarding'> {
  const { data: profile } = await getBusinessProfileAction()
  return profile?.id ? '/dashboard' : '/onboarding'
>>>>>>> origin/development
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  const { data: profile } = await getBusinessProfileAction()
<<<<<<< HEAD
  return isProfileReadyForAI(profile)
=======
  return Boolean(profile?.id)
>>>>>>> origin/development
}
