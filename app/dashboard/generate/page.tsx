import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GenerateContent } from '@/components/dashboard/generate-content'

export default async function GeneratePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="relative min-h-full font-sans">
      <GenerateContent />
    </div>
  )
}
