import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudioContent } from '@/components/dashboard/studio-content'
import { getUserTemplatesAction } from '@/app/dashboard/studio/actions'

export default async function StudioPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const templates = await getUserTemplatesAction()

  return (
    <div className="relative min-h-full font-sans">
      <StudioContent initialTemplates={templates} />
    </div>
  )
}
