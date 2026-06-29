import { supabaseAdmin } from "@/lib/supabase/admin"
import type {
  ContentPlan,
  Post,
  CreateContentPlanInput,
  PostStatus,
} from "@/types/content-plan"

/**
 * Create a content plan with associated posts.
 */
export async function createContentPlan(
  userId: string,
  input: CreateContentPlanInput
): Promise<{ planId: string | null; error: string | null }> {
  // 1. Insert the content plan
  const { data: planData, error: planError } = await supabaseAdmin
    .from("content_plans")
    .insert({
      user_id: userId,
      business_profile_id: input.business_profile_id,
      start_date: input.start_date,
      end_date: input.end_date,
      target_audience: input.target_audience ?? null,
      strategy_summary: input.strategy_summary ?? null,
      status: "draft",
    })
    .select()
    .single()

  if (planError || !planData) {
    return { planId: null, error: planError?.message ?? "Failed to create content plan" }
  }

  // 2. Insert posts
  if (input.posts.length > 0) {
    const postsToInsert = input.posts.map((post) => ({
      content_plan_id: planData.id,
      user_id: userId,
      platform: post.platform,
      post_type: post.post_type ?? null,
      content: post.content ?? null,
      image_prompt: post.image_prompt ?? null,
      image_url: post.image_url ?? null,
      scheduled_at: post.scheduled_at ?? null,
      status: post.status ?? "draft",
    }))

    const { error: postsError } = await supabaseAdmin.from("posts").insert(postsToInsert)

    if (postsError) {
      return {
        planId: planData.id,
        error: `Content plan created, but failed to insert posts: ${postsError.message}`,
      }
    }
  }

  return { planId: planData.id, error: null }
}

/**
 * Get content plans for a user.
 */
export async function getContentPlans(
  userId: string
): Promise<{ data: ContentPlan[]; error: string | null }> {
  const { data, error } = await supabaseAdmin
    .from("content_plans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data as ContentPlan[], error: null }
}

/**
 * Update a post's status, enforcing user ownership.
 */
export async function updatePostStatus(
  userId: string,
  postId: string,
  status: PostStatus,
  scheduledAt?: string
): Promise<{ data: Post | null; error: string | null }> {
  const updateData: Record<string, unknown> = { status }
  if (scheduledAt) {
    updateData.scheduled_at = scheduledAt
  }

  const { data, error } = await supabaseAdmin
    .from("posts")
    .update(updateData)
    .eq("id", postId)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as Post, error: null }
}
