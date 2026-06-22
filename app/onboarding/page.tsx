import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'

// Must be force-dynamic: this page reads headers() for the live auth session
export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return redirect('/login')
  }

  return (
    <div className="min-h-dvh bg-zinc-950 font-sans flex text-zinc-50">
      <OnboardingWizard />
    </div>
  )
}
