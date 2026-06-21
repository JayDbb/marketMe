import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InboxContent } from '@/components/dashboard/inbox-content'

export default async function InboxPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="relative min-h-full font-sans">
      <InboxContent />
    </div>
  )
}
