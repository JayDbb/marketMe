import { getUserAndProfile } from '@/lib/user'
import { redirect } from 'next/navigation'
import { ConnectionsContent } from '@/components/dashboard/connections-content'

export default async function ConnectionsPage() {
  const { user } = await getUserAndProfile()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="relative min-h-full font-sans">
      <ConnectionsContent />
    </div>
  )
}
