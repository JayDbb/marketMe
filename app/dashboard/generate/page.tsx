import { getUserAndProfile } from '@/lib/user'
import { redirect } from 'next/navigation'
import { GenerateContent } from '@/components/dashboard/generate-content'

export default async function GeneratePage() {
  const { user } = await getUserAndProfile()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="relative min-h-full font-sans">
      <GenerateContent />
    </div>
  )
}
