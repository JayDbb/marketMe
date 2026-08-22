export type PipelineStage =
  | 'business_profile_intake'
  | 'marketing_strategy_generation'
  | 'content_schedule_generation'
  | 'post_generation'
  | 'creative_brief_generation'
  | 'image_generation'
  | 'publishing'

export type GenerationStatus = 'pending' | 'completed' | 'failed' | 'skipped'

export type ModerationFlagType = 'caption' | 'image' | 'claim' | 'policy' | 'other'

export type ModerationSeverity = 'info' | 'warning' | 'block'

export interface CreditTransaction {
  id: string
  user_id: string
  business_profile_id: string | null
  stage: PipelineStage
  credits_spent: number
  generation_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface GenerationRecord {
  id: string
  user_id: string
  business_profile_id: string | null
  content_plan_id: string | null
  post_id: string | null
  stage: PipelineStage
  model_used: string | null
  status: GenerationStatus
  input_ref: Record<string, unknown>
  output_ref: Record<string, unknown>
  error_message: string | null
  created_at: string
  completed_at: string | null
}

export interface ModerationFlag {
  id: string
  post_id: string
  user_id: string
  flag_type: ModerationFlagType
  severity: ModerationSeverity
  message: string
  reviewed: boolean
  reviewed_at: string | null
  created_at: string
}

/** Credit cost per pipeline stage. Image generation costs ~10x caption generation. */
export const PIPELINE_CREDIT_COSTS: Record<PipelineStage, number> = {
  business_profile_intake: 0,
  marketing_strategy_generation: 10,
  content_schedule_generation: 8,
  post_generation: 2,
  creative_brief_generation: 3,
  image_generation: 20,
  publishing: 5,
}

export const PLAN_CREDIT_ALLOWANCES: Record<string, number> = {
  free: 50,
  pro: 500,
  team: 2000,
}
