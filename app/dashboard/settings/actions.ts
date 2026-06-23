'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(formData: FormData) {
  const name = formData.get('name') as string

  if (!name || name.trim() === '') {
    return { error: 'Name cannot be empty' }
  }

  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    return { error: 'Not authenticated' }
  }
  if (!session) return { error: 'Not authenticated' }

  // Update the user's name via Better Auth
  try {
    await auth.api.updateUser({
      body: { name },
      headers: await headers(),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Update failed'
    return { error: message }
  }

  revalidatePath('/dashboard/settings', 'page')
  return { success: true }
}
