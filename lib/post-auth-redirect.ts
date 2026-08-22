import { getBusinessProfileAction } from '@/app/api/business-profile/_actions'

/** After sign-in: dashboard if a profile row exists (including skip stubs). */
export async function getPostAuthRedirectPath(): Promise<'/dashboard' | '/onboarding'> {
  const { data: profile } = await getBusinessProfileAction()
  return profile?.id ? '/dashboard' : '/onboarding'
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  const { data: profile } = await getBusinessProfileAction()
  return Boolean(profile?.id)
}
