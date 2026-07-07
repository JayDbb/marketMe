import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { SettingsContent } from '@/components/dashboard/settings-content'
import { getAccountContext } from '@/app/dashboard/account/actions'
import { getSettingsData } from '@/app/dashboard/settings/actions'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import { Loader2 } from 'lucide-react'

function SettingsLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 text-blue-400/50 animate-spin" />
    </div>
  )
}

export default async function SettingsPage() {
  const user = await getAuthenticatedUser()

  if (!user) redirect('/login')

  const [account, settings] = await Promise.all([getAccountContext(), getSettingsData()])

  if (!account || !settings) redirect('/login')

  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsContent account={account} settings={settings} />
    </Suspense>
  )
}
