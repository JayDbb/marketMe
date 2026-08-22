import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { SettingsContent } from '@/components/dashboard/settings-content'
import { getSettingsData } from '@/app/dashboard/settings/actions'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import {
  buildConnectionsOAuthReturnUrl,
  isInstagramOAuthReturn,
} from '@/lib/social/oauth'
import SettingsLoading from './loading'

export default async function SettingsPage({
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
    redirect(buildConnectionsOAuthReturnUrl('http://local.invalid', query))
  }

  const user = await getAuthenticatedUser()
  if (!user) redirect('/login')

  const settings = await getSettingsData()
  if (!settings) redirect('/login')

  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsContent settings={settings} />
    </Suspense>
  )
}
