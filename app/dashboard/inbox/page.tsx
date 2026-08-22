import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import {
  InboxContent,
  InboxSkeleton,
} from '@/components/dashboard/inbox-content'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'

export default async function InboxPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="relative h-full min-h-0 overflow-hidden font-sans">
      <Suspense fallback={<InboxSkeleton />}>
        <InboxContent />
      </Suspense>
    </div>
  )
}
