import { redirect } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { getBusinessProfileAction } from '@/app/api/business-profile/_actions'
import { isProfileReadyForAI } from '@/lib/marketing-profile-prompt'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'

export default async function OnboardingPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: profile } = await getBusinessProfileAction()

  if (isProfileReadyForAI(profile)) {
    redirect('/dashboard')
  }

  return (
    <MarketingPageShell showNavbar={false} showFooter={false} mainClassName="min-h-dvh">
      <OnboardingWizard initialProfile={profile} />
    </MarketingPageShell>
  )
}
