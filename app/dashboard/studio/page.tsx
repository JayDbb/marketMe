import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { StudioContent } from '@/components/dashboard/studio-content'
import { getUserTemplatesResult } from '@/app/dashboard/studio/actions'
import { getBusinessProfileAction } from '@/app/api/business-profile/_actions'
import { getStudioBrandKit } from '@/lib/studio-brand-kit'
import { Loader2 } from 'lucide-react'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'

function StudioLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 text-blue-400/50 animate-spin" />
    </div>
  )
}

export default async function StudioPage() {
  const user = await getAuthenticatedUser()

  if (!user) redirect('/login')

  const [{ templates, error: templatesError }, profileResult] = await Promise.all([
    getUserTemplatesResult(),
    getBusinessProfileAction(),
  ])

  const brandKit = getStudioBrandKit(profileResult.data?.industry)

  return (
    <Suspense fallback={<StudioLoading />}>
      <StudioContent
        initialTemplates={templates}
        brandKit={brandKit}
        loadError={templatesError}
      />
    </Suspense>
  )
}
