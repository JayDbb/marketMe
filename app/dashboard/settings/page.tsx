import { getSession } from '@/lib/services/auth.service'
import { redirect } from 'next/navigation'
import { SettingsContent } from '@/components/dashboard/settings-content'

export default async function SettingsPage() {
  const session = await getSession()

  if (!session?.user) {
    return redirect('/login')
  }

  return (
    <div className="relative min-h-full font-sans">
      <SettingsContent 
        initialEmail={session.user.email || ''} 
        initialName={session.user.name || ''} 
      />
    </div>
  )
}
