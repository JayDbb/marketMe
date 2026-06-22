import { getUserAndProfile } from '@/lib/user'
import { redirect } from 'next/navigation'
import { SettingsContent } from '@/components/dashboard/settings-content'
import { Suspense } from 'react'

export const unstable_instant = { prefetch: 'static' }

async function SettingsData() {
  const { user, profile } = await getUserAndProfile()

  if (!user) {
    return redirect('/login')
  }

  return <SettingsContent profile={profile} />
}

export default function SettingsPage() {
  return (
    <div className="relative min-h-full font-sans">
      <Suspense fallback={<div className="flex h-[50vh] items-center justify-center text-white/40">Loading settings...</div>}>
        <SettingsData />
      </Suspense>
    </div>
  )
}
