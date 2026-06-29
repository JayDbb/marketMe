import { getUserAndProfile } from '@/lib/user'
import { redirect } from 'next/navigation'
import { submitFeedback } from '@/app/dashboard/actions'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { supabaseAdmin } from '@/lib/supabase/admin'

export default async function DashboardPage() {
  const { user, profile } = await getUserAndProfile()

  if (!user) {
    return redirect('/login')
  }

  // Fetch counts using supabaseAdmin
  const { count: plansCount } = await supabaseAdmin
    .from('content_plans')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: postsCount } = await supabaseAdmin
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <div className="relative min-h-full font-sans">
      {/* Ambient Backgrounds */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />
      <div className="fixed top-0 right-0 -mt-20 -mr-20 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -mb-20 -ml-20 w-[600px] h-[600px] bg-indigo-700/8 blur-[150px] rounded-full pointer-events-none" />

      <DashboardContent 
        submitFeedbackAction={submitFeedback} 
        profile={profile} 
        plansCount={plansCount || 0}
        postsCount={postsCount || 0}
      />
    </div>
  )
}
