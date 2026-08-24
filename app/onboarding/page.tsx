import { redirect } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { getBusinessProfileAction } from '@/app/api/business-profile/_actions'
import { isProfileReadyForAI } from '@/lib/marketing-profile-prompt'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import {
  buildConnectionsOAuthReturnUrl,
  isInstagramOAuthReturn,
} from '@/lib/social/oauth'

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const paramsBag = await searchParams
  const query = new URLSearchParams()
  if (paramsBag) {
    for (const [key, value] of Object.entries(paramsBag)) {
      if (typeof value === 'string') query.set(key, value)
      else if (Array.isArray(value) && value[0]) query.set(key, value[0])
    }
  }

  if (isInstagramOAuthReturn(query)) {
    redirect(buildConnectionsOAuthReturnUrl('https://example.com', query))
  }

  const user = await getAuthenticatedUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: profile } = await getBusinessProfileAction()

  const allowEdit = query.get('edit') === '1'
  if (isProfileReadyForAI(profile) && !allowEdit) {
    redirect('/dashboard/settings?tab=Workspace')
  }

  return (
    <MarketingPageShell showNavbar={false} showFooter={false} mainClassName="h-dvh max-h-dvh overflow-hidden sm:h-auto sm:max-h-none sm:overflow-visible">
      <OnboardingWizard initialProfile={profile} />
    </MarketingPageShell>
  )
}
