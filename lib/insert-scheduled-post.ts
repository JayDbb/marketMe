import { supabaseAdmin } from '@/lib/supabase/admin'
import { isValidUuid } from '@/lib/supabase/server-auth'

export type InsertScheduledPostParams = {
  contentPlanId: string
  platform: string
  content: string
  scheduledAt: string
  imageUrl?: string | null
  canvasData?: unknown
  templateId?: string | null
}

export type InsertScheduledPostResult =
  | { ok: true; postId: string }
  | { ok: false; error: string }

export async function insertScheduledPost(
  userId: string,
  params: InsertScheduledPostParams
): Promise<InsertScheduledPostResult> {
  const { data: plan, error: planError } = await supabaseAdmin
    .from('content_plans')
    .select('id')
    .eq('id', params.contentPlanId)
    .eq('user_id', userId)
    .maybeSingle()

  if (planError) {
    return { ok: false, error: planError.message }
  }

  if (!plan) {
    return { ok: false, error: 'Invalid content plan for this user' }
  }

  const { data, error } = await supabaseAdmin
    .from('posts')
    .insert({
      user_id: userId,
      content_plan_id: params.contentPlanId,
      platform: params.platform,
      content: params.content,
      scheduled_at: params.scheduledAt,
      status: 'scheduled',
      image_url: params.imageUrl ?? null,
      canvas_data: params.canvasData ?? null,
      template_id:
        params.templateId && isValidUuid(params.templateId)
          ? params.templateId
          : null,
    })
    .select('id')
    .single()

  if (error) {
    return { ok: false, error: error.message }
  }

  if (!data?.id) {
    return { ok: false, error: 'Failed to save scheduled post' }
  }

  return { ok: true, postId: data.id }
}
