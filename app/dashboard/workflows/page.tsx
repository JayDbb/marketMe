import { redirect } from 'next/navigation'
import { WorkflowsContent } from '@/components/dashboard/workflows-content'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import { getWorkflowDashboardData } from '@/lib/services/workflow.service'

export default async function WorkflowsPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return redirect('/login')
  }

  const data = await getWorkflowDashboardData(user.id)

  return (
    <div className="relative min-h-full font-sans">
      <WorkflowsContent data={data} />
    </div>
  )
}
