'use server'

import { linearClient } from '@/lib/linear/client'
import { revalidatePath } from 'next/cache'

export async function submitFeedback(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const teamId = process.env.LINEAR_TEAM_ID

  if (!title || !description || !teamId) {
    console.error('Missing required fields or configuration.')
    return
  }

  try {
    const response = await linearClient.createIssue({
      teamId: teamId,
      title: `Feedback: ${title}`,
      description: description,
    })

    if (response.success) {
      revalidatePath('/dashboard')
    } else {
      console.error('Failed to create issue in Linear.')
    }
  } catch (error) {
    console.error('Error creating Linear issue:', error)
  }
}
