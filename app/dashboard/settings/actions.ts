'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string

  if (!name || name.trim() === '') {
    return { error: 'Name cannot be empty' }
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase.auth.updateUser({
    data: { full_name: name }
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/settings', 'page')
  return { success: true }
}
