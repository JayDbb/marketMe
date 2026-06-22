import { getUserAndProfile } from '@/lib/user'
import { redirect } from 'next/navigation'
import { submitFeedback } from '@/app/dashboard/actions'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { Suspense } from 'react'



async function DashboardData() {
  const { user, profile } = await getUserAndProfile()

  if (!user) {
    return redirect('/login')
  }

  return <DashboardContent submitFeedbackAction={submitFeedback} profile={profile} />
}

export default function DashboardPage() {
  return (
    <div className="relative min-h-full font-sans">
      {/* Ambient Backgrounds */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />
      <div className="fixed top-0 right-0 -mt-20 -mr-20 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -mb-20 -ml-20 w-[600px] h-[600px] bg-indigo-700/8 blur-[150px] rounded-full pointer-events-none" />

      {/* Render the interactive shell */}
      <Suspense fallback={<div className="flex h-[50vh] items-center justify-center text-white/40">Loading workspace...</div>}>
        <DashboardData />
      </Suspense>
    </div>
  )
}
