import { redirect } from 'next/navigation'
import { GenerateContent } from '@/components/dashboard/generate-content'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import { getGenerateContextAction } from '@/app/dashboard/generate/actions'
import { getUserTemplatesResult } from '@/app/dashboard/studio/actions'

export default async function GeneratePage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return redirect('/login')
  }

  const [initialContext, { templates: initialTemplates }] = await Promise.all([
    getGenerateContextAction(),
    getUserTemplatesResult(),
  ])

  return (
    <div className="relative min-h-full font-sans">
      <GenerateContent
        initialContext={initialContext}
        initialTemplates={initialTemplates}
      />
    </div>
  )
}
