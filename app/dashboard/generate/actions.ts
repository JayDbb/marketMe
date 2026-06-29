'use server'

import { CanvasData } from "@/types/canvas"
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { generateStrategy, generatePosts } from '@/lib/services/marketing-ai.service'

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
  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    return { success: false, error: 'Unauthorized' }
  }
  if (!session) return { success: false, error: 'Unauthorized' }
  const user = session.user

  try {
    // 1. Get or create a content plan for the user
    let planId;
    const { data: plans } = await supabaseAdmin.from('content_plans').select('id').eq('user_id', user.id).limit(1);
    
    if (plans && plans.length > 0) {
      planId = plans[0].id;
    } else {
      // Need a business profile to create a content plan
      const { data: profiles } = await supabaseAdmin.from('business_profiles').select('id').eq('user_id', user.id).limit(1);
      if (!profiles || profiles.length === 0) {
        return { success: false, error: 'Please create a business profile first (Connections tab).' };
      }
      
      const { data: newPlan, error: planError } = await supabaseAdmin.from('content_plans').insert({
        user_id: user.id,
        business_profile_id: profiles[0].id,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
        strategy_summary: 'Auto-generated weekly plan',
        status: 'active'
      }).select('id').single();
      
      if (planError) throw planError;
      planId = newPlan.id;
    }

    // 2. Insert the post into the database so it shows up in Planner
    const { error: postError } = await supabaseAdmin.from('posts').insert({
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
  } catch (error: unknown) {
    console.error("Scheduling Error:", error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: message };
  }
}

/**
 * Real Weekly AI Content Generation
 * Calls the FastAPI backend to generate strategy and posts.
 */
export async function generateWeeklyContentAction(input: {
  businessProfileId: string;
  businessName: string;
  industry: string;
  targetAudience: string;
  goal: string;
  platform: string;
  numPosts: number;
  tone?: string;
}) {
  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    return { error: 'Not authenticated' }
  }
  if (!session) return { error: 'Not authenticated' }

  try {
    // 1. Generate Strategy
    const strategyData = await generateStrategy({
      business_id: input.businessProfileId,
      business_name: input.businessName,
      industry: input.industry,
      target_audience: input.targetAudience,
      goals: input.goal,
      platforms: [input.platform.toLowerCase()],
    });

    if (!strategyData.strategy_id) {
      return { error: 'Failed to generate strategy ID from AI service' }
    }

    // 2. Generate Posts from strategy
    const postsData = await generatePosts({
      strategy_id: strategyData.strategy_id,
      platform: input.platform.toLowerCase(),
      num_posts: input.numPosts,
    });

    // 3. Map to GeneratedPost structure
    const mappedPosts = postsData.posts.map((post, index) => {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + index + 1);
      scheduledDate.setHours(10, 0, 0, 0);

      // Create a specific canvas template for each post
      const canvasTemplate: CanvasData = {
        version: "1.0",
        canvas: { width: 1080, height: 1080, backgroundColor: "#0f0f1b", aspectRatioName: "square" },
        layers: [
          {
            id: "bg-image", type: "image", x: 0, y: 0, width: 1080, height: 1080, zIndex: 0,
            src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1080&q=80"
          },
          {
            id: "overlay", type: "rect", x: 0, y: 0, width: 1080, height: 1080, fill: "rgba(0,0,0,0.5)", zIndex: 1
          },
          {
            id: "main-text", type: "text", x: 100, y: 400, width: 880, zIndex: 2,
            content: post.title.toUpperCase(), fontSize: 72, fontFamily: "Inter", fill: "#ffffff", align: "center"
          }
        ]
      };

      const hashtagsStr = Array.isArray(post.hashtags)
        ? post.hashtags.map((h: string) => h.startsWith('#') ? h : `#${h}`).join(' ')
        : '';

      return {
        id: `gen-${Math.random().toString(36).substr(2, 9)}`,
        title: post.title,
        caption: post.caption,
        hashtags: hashtagsStr,
        canvasData: canvasTemplate,
        scheduledDate: scheduledDate.toISOString().substring(0, 16),
        status: 'needs_review' as const
      };
    });

    return { success: true, posts: mappedPosts };
  } catch (error: unknown) {
    console.error("AI Generation Action Error:", error);
    const message = error instanceof Error ? error.message : 'Failed to generate weekly content';
    return { error: message };
  }
}

