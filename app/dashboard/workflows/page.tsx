import { getUserAndProfile } from '@/lib/user'
import { redirect } from 'next/navigation'
import { WorkflowsContent } from '@/components/dashboard/workflows-content'

export default async function WorkflowsPage() {
  const { user } = await getUserAndProfile()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="relative min-h-full font-sans">
      <WorkflowsContent />
    </div>
  )
}
