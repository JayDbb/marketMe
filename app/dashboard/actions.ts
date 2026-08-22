'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function generateContentAction(businessProfileId: string) {
  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    return { error: 'Not authenticated' }
  }
  if (!session) return { error: 'Not authenticated' }
  const user = session.user

  // Create a dummy content plan
  const startDate = new Date().toISOString().split('T')[0]
  const endDate = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data: plan, error: planError } = await supabaseAdmin
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

  const { error: postsError } = await supabaseAdmin
    .from('posts')
    .insert(postsToInsert)

  if (postsError) {
    console.error("Posts Error", postsError)
    return { error: 'Failed to create posts' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
