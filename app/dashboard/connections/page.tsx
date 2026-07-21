import { redirect } from 'next/navigation'
import { ConnectionsContent } from '@/components/dashboard/connections-content'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'

export default async function ConnectionsPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="relative min-h-full font-sans">
      <ConnectionsContent />
    </div>
  )
}
