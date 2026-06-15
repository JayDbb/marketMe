export type ContentPlanStatus = 'draft' | 'approved' | 'active';
export type PostStatus = 'draft' | 'approved' | 'scheduled' | 'published' | 'failed';

export interface ContentPlan {
  id: string
  user_id: string
  business_profile_id: string
  start_date: string
  end_date: string
  target_audience: string | null
  strategy_summary: string | null
  status: ContentPlanStatus
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  content_plan_id: string
  user_id: string
  platform: string
  post_type: string | null
  content: string | null
  image_prompt: string | null
  image_url: string | null
  scheduled_at: string | null
  status: PostStatus
  created_at: string
  updated_at: string
}

/** Input type for a single generated post from the AI */
export interface PostInput {
  platform: string
  post_type?: string
  content?: string
  image_prompt?: string
  image_url?: string
  scheduled_at?: string
  status?: PostStatus
}

/** Input type for the full weekly generation from the AI */
export interface CreateContentPlanInput {
  business_profile_id: string
  start_date: string
  end_date: string
  target_audience?: string
  strategy_summary?: string
  posts: PostInput[]
}
