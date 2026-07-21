import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/services/auth.service";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateStrategy, generatePosts } from "@/lib/services/marketing-ai.service";

export async function POST(request: NextRequest) {
  let session
  try {
    session = await requireAuth()
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    return NextResponse.json({ error: "Authentication error" }, { status: 401 })
  }

  try {
    const body = await request.json();
    const { businessProfileId, startDate } = body;

    if (!businessProfileId || !startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify ownership of the business profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('business_profiles')
      .select('*')
      .eq('id', businessProfileId)
      .eq('user_id', session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found or unauthorized" }, { status: 403 });
    }

    // 1. Generate Strategy
    const strategyData = await generateStrategy({
      business_id: profile.id,
      business_name: profile.business_name || 'My Business',
      industry: profile.industry || 'General',
      target_audience: profile.target_customers || 'Everyone',
      goals: profile.primary_goal || 'Growth',
      platforms: Array.isArray(profile.channels) && profile.channels.length > 0
        ? profile.channels.map((c: string) => c.toLowerCase())
        : ['instagram'],
    });

    if (!strategyData.strategy_id) {
      throw new Error('No strategy_id returned from AI service');
    }

    // 2. Generate Posts from strategy
    const postsData = await generatePosts({
      strategy_id: strategyData.strategy_id,
      platform: 'instagram',
      num_posts: 3
    });

    // 3. Save Content Plan to DB
    const start = new Date(startDate);
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later
    
    const { data: planData, error: planError } = await supabaseAdmin
      .from('content_plans')
      .insert({
        user_id: session.user.id,
        business_profile_id: businessProfileId,
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        target_audience: profile.target_customers || null,
        strategy_summary: strategyData.strategy?.overview || 'Weekly generated content strategy',
        status: 'draft',
      })
      .select()
      .single();

    if (planError || !planData) {
      throw new Error(`Failed to save content plan: ${planError?.message}`);
    }

    // 4. Save Posts to DB
    if (postsData.posts && postsData.posts.length > 0) {
      const postsToInsert = postsData.posts.map((post: {
        caption?: string
        hashtags?: string[]
        suggested_media_prompt?: string
      }, index: number) => {
        const scheduledDate = new Date(start);
        scheduledDate.setDate(scheduledDate.getDate() + (index % 7));

        const hashtagsStr = Array.isArray(post.hashtags)
          ? post.hashtags.map((h: string) => h.startsWith('#') ? h : `#${h}`).join(' ')
          : '';

        return {
          content_plan_id: planData.id,
          user_id: session.user.id,
          platform: 'instagram',
          post_type: 'image',
          content: post.caption + (hashtagsStr ? '\n\n' + hashtagsStr : ''),
          image_prompt: post.suggested_media_prompt || null,
          scheduled_at: scheduledDate.toISOString(),
          status: 'draft',
        };
      });

      const { error: postsError } = await supabaseAdmin.from('posts').insert(postsToInsert);
      if (postsError) {
        throw new Error(`Failed to save posts: ${postsError.message}`);
      }
    }

    return NextResponse.json({ success: true, contentPlanId: planData.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Generate API Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
