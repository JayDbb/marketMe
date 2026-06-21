'use server'

import { linearClient } from '@/lib/linear/client'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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

export async function generateContentAction(businessProfileId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Create a dummy content plan
  const startDate = new Date().toISOString()
  const endDate = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: plan, error: planError } = await supabase
    .from('content_plans')
    .insert({
      user_id: user.id,
      business_profile_id: businessProfileId,
      start_date: startDate,
      end_date: endDate,
      target_audience: "Your Audience",
      strategy_summary: "Simulated AI Marketing Strategy",
      status: 'draft',
    })
    .select()
    .single()

  if (planError || !plan) {
    console.error("Plan Error", planError)
    return { error: 'Failed to create plan' }
  }

  // Insert 3 dummy posts
  const postsToInsert = [
    {
      content_plan_id: plan.id,
      user_id: user.id,
      platform: 'Instagram',
      post_type: 'feed',
      content: 'Just launched our new product line! Stay tuned. ✨',
      image_prompt: 'High quality professional photograph of a new product launch.',
      status: 'draft'
    },
    {
      content_plan_id: plan.id,
      user_id: user.id,
      platform: 'Twitter',
      post_type: 'tweet',
      content: 'We are changing the game with AI-driven marketing.',
      image_prompt: null,
      status: 'draft'
    },
    {
      content_plan_id: plan.id,
      user_id: user.id,
      platform: 'LinkedIn',
      post_type: 'article',
      content: 'How small businesses are scaling faster in 2026. Read our latest insights.',
      image_prompt: null,
      status: 'draft'
    }
  ]

  const { error: postsError } = await supabase
    .from('posts')
    .insert(postsToInsert)

  if (postsError) {
    console.error("Posts Error", postsError)
    return { error: 'Failed to create posts' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
