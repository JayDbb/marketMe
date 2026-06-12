import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LeadsContent } from '@/components/dashboard/leads-content'

export default async function LeadsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="relative min-h-full font-sans">
      <LeadsContent />
    </div>
  )
}
