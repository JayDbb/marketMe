import { supabaseAdmin } from '@/lib/supabase/admin'
import type { GenerationStatus, PipelineStage } from '@/types/pipeline'

export async function startGeneration(params: {
  userId: string
  stage: PipelineStage
  businessProfileId?: string
  contentPlanId?: string
  postId?: string
  modelUsed?: string
  inputRef?: Record<string, unknown>
}): Promise<{ id: string }> {
  const { data, error } = await supabaseAdmin
    .from('generations')
    .insert({
      user_id: params.userId,
      business_profile_id: params.businessProfileId ?? null,
      content_plan_id: params.contentPlanId ?? null,
      post_id: params.postId ?? null,
      stage: params.stage,
      model_used: params.modelUsed ?? null,
      status: 'pending',
      input_ref: params.inputRef ?? {},
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(`Failed to start generation record: ${error?.message ?? 'unknown'}`)
  }

  return { id: data.id as string }
}

export async function completeGeneration(
  generationId: string,
  status: GenerationStatus,
  outputRef?: Record<string, unknown>,
  errorMessage?: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('generations')
    .update({
      status,
      output_ref: outputRef ?? {},
      error_message: errorMessage ?? null,
      completed_at: new Date().toISOString(),
    })
    .eq('id', generationId)

  if (error) {
    throw new Error(`Failed to complete generation record: ${error.message}`)
  }
}
