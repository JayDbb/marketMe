'use server'

import { CanvasData } from "@/types/canvas"
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * AI Revision API Contract
 * 
 * Takes a current caption and a user instruction prompt, and uses an LLM
 * to return a revised string.
 */
export async function reviseCaptionAction(currentCaption: string, prompt: string, platform: string): Promise<string> {
  // Simulated delay for frontend testing
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  return `✨ [AI REVISED FOR ${platform.toUpperCase()}] ✨\n\n${currentCaption}\n\n(Tone adjusted based on: "${prompt}")`;
}

/**
 * Scheduling API Contract
 * 
 * Takes the final approved post data (including the JSON Canvas) and 
 * saves it to the database with a 'scheduled' status.
 */
export async function schedulePostAction(payload: {
  postId: string;
  caption: string;
  hashtags: string;
  canvasData: CanvasData;
  scheduledDate: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    // 1. Get or create a content plan for the user
    let planId;
    const { data: plans } = await supabase.from('content_plans').select('id').eq('user_id', user.id).limit(1);
    
    if (plans && plans.length > 0) {
      planId = plans[0].id;
    } else {
      // Need a business profile to create a content plan
      const { data: profiles } = await supabase.from('business_profiles').select('id').eq('user_id', user.id).limit(1);
      if (!profiles || profiles.length === 0) {
        return { success: false, error: 'Please create a business profile first (Connections tab).' };
      }
      
      const { data: newPlan, error: planError } = await supabase.from('content_plans').insert({
        user_id: user.id,
        business_profile_id: profiles[0].id,
        start_date: new Date().toISOString(),
        end_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
        strategy_summary: 'Auto-generated weekly plan',
        status: 'active'
      }).select('id').single();
      
      if (planError) throw planError;
      planId = newPlan.id;
    }

    // 2. Insert the post into the database so it shows up in Planner
    const { error: postError } = await supabase.from('posts').insert({
      user_id: user.id,
      content_plan_id: planId,
      platform: 'Instagram',
      content: `${payload.caption}\n\n${payload.hashtags}`,
      scheduled_at: payload.scheduledDate,
      status: 'scheduled'
      // We are omitting image_url/canvas saving for now, as the DB doesn't have a canvas_data column in `posts` table yet.
    });

    if (postError) throw postError;
    
    revalidatePath('/dashboard/calendar');
    revalidatePath('/dashboard/posts');
    return { success: true };
  } catch (error: any) {
    console.error("Scheduling Error:", error);
    return { success: false, error: error.message };
  }
}
