export type ContentPlanStatus =
  | 'draft'
  | 'approved'
  | 'active'

export type PostStatus =
  | 'draft'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'failed'
  | 'rejected'

export interface ContentPlan {
  id: string
  user_id: string
  business_profile_id: string

  start_date: string
  end_date: string

  target_audience: string | null
  strategy_summary: string | null

  strategy_id?: string | null
  goal?: string | null
  platform?: string | null
  tone?: string | null
  template_source?: string | null
  schedule_data?: Record<string, unknown> | null

  status: ContentPlanStatus

  created_at: string
  updated_at: string
}

export interface Post {
  id: string

  user_id: string
  business_profile_id?: string | null

  content_plan_id: string
  generation_id?: string | null
  strategy_id?: string | null
  account_id?: string | null
  idea_id?: string | null

  platform: string
  post_type: string | null

  title?: string | null
  content: string | null
  caption?: string | null
  hashtags?: string[] | null
  call_to_action?: string | null

  image_prompt: string | null
  image_url: string | null

  scheduled_at: string | null
  status: PostStatus
  error_message?: string | null

  canvas_data?: Record<string, unknown> | null

  /**
   * UUID referencing studio_templates.id.
   */
  template_id?: string | null

  /**
   * BIGINT referencing canvas_template.template_id.
   */
  canvas_template_id?: number | null

  approved_at?: string | null
  approved_by?: string | null

  ai_model?: string | null

  created_at: string
  updated_at: string
}

/**
 * Input for one generated post.
 */
export interface PostInput {
  platform: string

  post_type?: string
  title?: string

  content?: string
  caption?: string
  hashtags?: string[]
  call_to_action?: string

  image_prompt?: string
  image_url?: string

  scheduled_at?: string
  status?: PostStatus

  canvas_data?: Record<string, unknown>
  template_id?: string | null
  canvas_template_id?: number | null

  ai_model?: string
}

/**
 * Input for creating a complete weekly content plan.
 */
export interface CreateContentPlanInput {
  business_profile_id: string

  start_date: string
  end_date: string

  target_audience?: string
  strategy_summary?: string

  strategy_id?: string
  goal?: string
  platform?: string
  tone?: string
  template_source?: string
  schedule_data?: Record<string, unknown>

  posts: PostInput[]
}