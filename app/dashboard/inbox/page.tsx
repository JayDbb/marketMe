import { getSession } from '@/lib/services/auth.service'
import { redirect } from 'next/navigation'
import { InboxContent } from '@/components/dashboard/inbox-content'

export default async function InboxPage() {
  const session = await getSession()

  if (!session) {
    return redirect('/login')
  }

  return (
    <div className="relative min-h-full font-sans">
      <InboxContent />
    </div>
  )
}
