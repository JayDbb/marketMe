import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WorkflowsContent } from '@/components/dashboard/workflows-content'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'

export default async function WorkflowsPage() {
  const user = await getAuthenticatedUser(await createClient())

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="relative min-h-full font-sans">
      <WorkflowsContent />
    </div>
  )
}
