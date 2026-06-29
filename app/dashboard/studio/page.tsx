import { getUserAndProfile } from '@/lib/user'
import { redirect } from 'next/navigation'
import { StudioContent } from '@/components/dashboard/studio-content'
import { getUserTemplatesAction } from '@/app/dashboard/studio/actions'

export default async function StudioPage() {
  const { user } = await getUserAndProfile()

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
