import { getUserAndProfile } from '@/lib/user'
import { redirect } from 'next/navigation'
import { LeadsContent } from '@/components/dashboard/leads-content'
import { Suspense } from 'react'

export const unstable_instant = { prefetch: 'static' }

async function LeadsData() {
  const { user } = await getUserAndProfile()

  if (!user) {
    return redirect('/login')
  }

  return <LeadsContent />
}

export default function LeadsPage() {
  return (
    <div className="relative min-h-full font-sans">
      <Suspense fallback={<div className="flex h-[50vh] items-center justify-center text-white/40">Loading leads...</div>}>
        <LeadsData />
      </Suspense>
    </div>
  )
}
