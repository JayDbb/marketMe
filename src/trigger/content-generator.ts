import { task } from "@trigger.dev/sdk/v3";
import { openai } from "@/lib/openai";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { GenerateWeeklyContentPayload, RegenerateCaptionPayload, GenerateImagePayload } from "@/types/ai";

const API_URL = process.env.MARKETME_AI_API_URL || 'http://localhost:8000';

/**
 * Task 1: Generate Weekly Content
 * Delegates AI logic and persistence to MarketMe-AI Python backend.
 */
export const generateWeeklyContent = task({
  id: "generate-weekly-content",
  run: async (payload: GenerateWeeklyContentPayload) => {
    // 1. Fetch Business Profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('business_profiles')
      .select('*')
      .eq('id', payload.businessProfileId)
      .eq('user_id', payload.userId)
      .single();

    if (profileError || !profile) {
      throw new Error(`Business profile not found: ${profileError?.message}`);
    }

    // 2. Call MarketMe-AI Strategy Generation
    const strategyRes = await fetch(`${API_URL}/api/v1/strategy/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_id: profile.id,
        business_name: profile.business_name || 'My Business',
        industry: profile.industry || 'General',
        target_audience: profile.target_customers || 'Everyone',
        goals: profile.primary_goal || 'Growth',
        platforms: Array.isArray(profile.channels) && profile.channels.length > 0
          ? profile.channels
          : ['instagram'],
      })
    });

    if (!strategyRes.ok) {
      const errorText = await strategyRes.text();
      throw new Error(`Failed to generate strategy: ${strategyRes.status} ${errorText}`);
    }

    const strategyData = await strategyRes.json();
    const strategyId = strategyData.strategy_id;

    if (!strategyId) {
      throw new Error('No strategy_id returned from MarketMe-AI');
    }

    // 3. Call MarketMe-AI Posts Generation
    const postsRes = await fetch(`${API_URL}/api/v1/posts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strategy_id: strategyId,
        platform: 'instagram',
        num_posts: 3
      })
    });

    if (!postsRes.ok) {
      const errorText = await postsRes.text();
      throw new Error(`Failed to generate posts: ${postsRes.status} ${errorText}`);
    }

    const postsData = await postsRes.json();
    const generatedPosts = postsData.posts;

    // 4. Save Content Plan to Next.js content_plans table
    const startDate = new Date(payload.startDate);
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later
    
    const { data: planData, error: planError } = await supabaseAdmin
      .from('content_plans')
      .insert({
        user_id: payload.userId,
        business_profile_id: payload.businessProfileId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        target_audience: profile.target_customers || null,
        strategy_summary: strategyData.strategy?.overview || 'Weekly generated content strategy',
        status: 'draft',
      })
      .select()
      .single();

    if (planError || !planData) {
      throw new Error(`Failed to save content plan: ${planError?.message}`);
    }

    // 5. Save Posts to Next.js posts table
    if (generatedPosts && generatedPosts.length > 0) {
      const postsToInsert = generatedPosts.map((post: any, index: number) => {
        const scheduledDate = new Date(startDate);
        scheduledDate.setDate(scheduledDate.getDate() + (index % 7));

        const hashtagsStr = Array.isArray(post.hashtags)
          ? post.hashtags.map((h: string) => h.startsWith('#') ? h : `#${h}`).join(' ')
          : '';

        return {
          content_plan_id: planData.id,
          user_id: payload.userId,
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

    return { success: true, contentPlanId: planData.id };
  },
});

/**
 * Task 2: Regenerate Caption (MAR-18)
 * (Left as-is until a dedicated Python endpoint is added)
 */
export const regenerateCaption = task({
  id: "regenerate-caption",
  run: async (payload: RegenerateCaptionPayload) => {
    // 1. Fetch Post
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('*, content_plans(*)')
      .eq('id', payload.postId)
      .single();

    if (postError || !post) throw new Error("Post not found");

    // 2. Call OpenAI to regenerate
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert copywriter. Rewrite the following social media post caption." },
        { role: "user", content: `Original Post: ${post.content}\n\nFeedback from user: ${payload.feedback || "Make it more engaging and professional."}\n\nProvide only the rewritten caption.` }
      ],
    });

    const newCaption = completion.choices[0].message.content;

    // 3. Update Post
    await supabaseAdmin
      .from('posts')
      .update({ content: newCaption, status: 'draft' })
      .eq('id', payload.postId);

    return { success: true, newCaption };
  },
});

/**
 * Task 3: Generate Image (MAR-20 & MAR-23)
 * Uses MarketMe-AI for the prompt, then DALL-E 3 for the image.
 */
export const generateImage = task({
  id: "generate-image",
  run: async (payload: GenerateImagePayload) => {
    // 1. Fetch Post
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', payload.postId)
      .single();

    if (postError || !post) throw new Error("Post not found");

    // 2. Call MarketMe-AI for creative brief and refined prompt
    let prompt = post.image_prompt;
    if (!prompt) {
      const creativeRes = await fetch(`${API_URL}/api/v1/creative/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: payload.postId,
          style_hint: payload.style || 'High quality, professional photograph'
        })
      });

      if (!creativeRes.ok) {
        const errorText = await creativeRes.text();
        throw new Error(`Failed to generate creative brief: ${creativeRes.status} ${errorText}`);
      }

      const creativeData = await creativeRes.json();
      prompt = creativeData.refined_prompt;
      
      if (!prompt) throw new Error("No refined prompt returned from MarketMe-AI");

      // Save the generated prompt to the post
      await supabaseAdmin.from('posts').update({ image_prompt: prompt }).eq('id', payload.postId);
    }

    // 3. Call DALL-E 3
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = imageResponse.data?.[0]?.url;

    if (!imageUrl) throw new Error("No image generated");

    // Download the image buffer from the DALL-E URL
    const fetchResponse = await fetch(imageUrl);
    const arrayBuffer = await fetchResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = `Posts/post-${payload.postId}-${Date.now()}.png`;
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'generated-content';

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}. Make sure the bucket '${bucketName}' exists and is public!`);

    // Get the permanent public URL
    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from(bucketName)
      .getPublicUrl(fileName);

    const permanentUrl = publicUrlData.publicUrl;

    // Save the permanent URL to the database
    await supabaseAdmin
      .from('posts')
      .update({ image_url: permanentUrl, status: 'draft' })
      .eq('id', payload.postId);

    return { success: true, imageUrl: permanentUrl };
  },
});
