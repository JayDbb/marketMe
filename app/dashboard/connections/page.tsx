import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ConnectionsContent } from '@/components/dashboard/connections-content'

export default async function ConnectionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="relative min-h-full font-sans">
      <ConnectionsContent />
    </div>
  )
}
