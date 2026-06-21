import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WorkflowsContent } from '@/components/dashboard/workflows-content'

export default async function WorkflowsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="relative min-h-full font-sans">
      <WorkflowsContent />
    </div>
  )
}
