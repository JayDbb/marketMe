import { redirect } from 'next/navigation'

import { getUserAndProfile } from '@/lib/user'
import { DashboardAiAssistant } from '@/components/dashboard/dashboard-ai-assistant'

export default async function DashboardAiPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>
}) {
  const [{ user, profile }, params] = await Promise.all([
    getUserAndProfile(),
    searchParams ?? Promise.resolve<{ q?: string }>({}),
  ])

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <DashboardAiAssistant
        variant="workspace"
        businessName={profile?.business_name || 'your business'}
        defaultGoal={profile?.primary_goal || 'Increase Brand Awareness'}
        defaultPlatform={profile?.channels?.[0] || 'Instagram'}
        initialPrompt={params.q}
      />
    </div>
  )
}
