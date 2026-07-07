import { redirect } from 'next/navigation'
import { InboxContent } from '@/components/dashboard/inbox-content'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'

export default async function InboxPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="relative min-h-full font-sans">
      <InboxContent />
    </div>
  )
}
