import { task, schedules } from "@trigger.dev/sdk/v3";
import { openai } from "@/lib/openai";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { GenerateWeeklyContentPayload, RegenerateCaptionPayload, GenerateImagePayload } from "@/types/ai";

const API_URL = process.env.MARKETME_AI_API_URL || 'http://localhost:8000';

/**
 * Task 1: Business Analysis
 * Extracts target audience, USP, and keywords from profile data.
 */
export const businessAnalysis = task({
  id: "business-analysis",
  run: async (payload: { businessProfileId: string }) => {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('business_profiles')
      .select('*')
      .eq('id', payload.businessProfileId)
      .single();

    if (profileError || !profile) {
      throw new Error(`Business profile not found: ${profileError?.message}`);
    }

    // Call OpenAI to perform simple analysis/summary of the business profile
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a senior business marketing analyst. Outline key marketing keywords, target audience summary, and tone guidelines for the provided business profile. Format as a clean markdown block." },
        { role: "user", content: `Business Name: ${profile.business_name || 'Generic'}\nIndustry: ${profile.industry || 'General'}\nUSP: ${profile.usp || 'None specified'}\nGoal: ${profile.primary_goal || 'Growth'}` }
      ],
    });

    const summary = completion.choices[0].message.content || "Analysis complete.";

    // Trigger notification
    await sendNotification.trigger({
      title: "Business Profile Analysis Complete",
      body: `Successfully analyzed business: ${profile.business_name}`
    });

    return { success: true, summary };
  }
});

/**
 * Task 2: Marketing Strategy
 * Calls FastAPI strategy endpoint.
 */
export const marketingStrategy = task({
  id: "marketing-strategy",
  run: async (payload: { businessProfileId: string }) => {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('business_profiles')
      .select('*')
      .eq('id', payload.businessProfileId)
      .single();

    if (profileError || !profile) {
      throw new Error(`Business profile not found: ${profileError?.message}`);
    }

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
    return { success: true, strategyId: strategyData.strategy_id, strategy: strategyData.strategy };
  }
});

/**
 * Task 3: Generate Weekly Content
 * Orchestrates weekly plan and posts generation.
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

    // 2. Call marketingStrategy subtask
    const strategyResult = await marketingStrategy.triggerAndWait({
      businessProfileId: payload.businessProfileId
    });

    if (!strategyResult.ok || !strategyResult.output.strategyId) {
      throw new Error("Failed to generate marketing strategy in subtask");
    }

    const strategyId = strategyResult.output.strategyId;
    const strategyData = strategyResult.output.strategy;

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
        strategy_summary: strategyData?.overview || 'Weekly generated content strategy',
        status: 'draft',
      })
      .select()
      .single();

    if (planError || !planData) {
      throw new Error(`Failed to save content plan: ${planError?.message}`);
    }

    // 5. Save Posts to Next.js posts table
    if (generatedPosts && generatedPosts.length > 0) {
      type GeneratedPlanPost = {
        caption: string
        hashtags?: string[]
        suggested_media_prompt?: string | null
      }

      const postsToInsert = (generatedPosts as GeneratedPlanPost[]).map((post, index: number) => {
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

    // 6. Trigger notification
    await sendNotification.trigger({
      title: "Weekly Content Generation Complete",
      body: `Successfully generated weekly posts plan: ${planData.id}`
    });

    return { success: true, contentPlanId: planData.id };
  },
});

/**
 * Task 4: Caption Generation (Regenerate Caption)
 * Rewrites post captions with OpenAI.
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
        { role: "system", content: "You are an expert social media copywriter. Rewrite the following social media post caption based on the user's feedback." },
        { role: "user", content: `Original Post: ${post.content}\n\nFeedback: ${payload.feedback || "Make it more engaging and professional."}\n\nProvide only the rewritten caption.` }
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
 * Task 5: Creative Brief
 * Calls FastAPI creative brief generation.
 */
export const generateCreativeBrief = task({
  id: "generate-creative-brief",
  run: async (payload: { postId: string; style?: string }) => {
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
    return {
      success: true,
      refinedPrompt: creativeData.refined_prompt || "Professional photograph matching content",
      colorPalette: creativeData.color_palette || "Sleek, modern styling",
      typography: creativeData.typography || "Inter",
      layoutDescription: creativeData.layout_description || "Balanced composition"
    };
  }
});

/**
 * Task 6: Image Upload
 * Downloads image buffer and uploads to Supabase Storage bucket.
 */
export const imageUpload = task({
  id: "image-upload",
  run: async (payload: { postId: string; imageUrl: string }) => {
    const fetchResponse = await fetch(payload.imageUrl);
    const arrayBuffer = await fetchResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = `Posts/post-${payload.postId}-${Date.now()}.png`;
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'generated-content';

    const { error: uploadError } = await supabaseAdmin
      .storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}. Make sure the bucket '${bucketName}' exists and is public!`);
    }

    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from(bucketName)
      .getPublicUrl(fileName);

    const permanentUrl = publicUrlData.publicUrl;

    // Save permanent URL
    await supabaseAdmin
      .from('posts')
      .update({ image_url: permanentUrl, status: 'draft' })
      .eq('id', payload.postId);

    return { success: true, permanentUrl };
  }
});

/**
 * Task 7: Image Generation
 * Uses creative brief and DALL-E 3, uploading results via task chaining.
 */
export const generateImage = task({
  id: "generate-image",
  run: async (payload: GenerateImagePayload) => {
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', payload.postId)
      .single();

    if (postError || !post) throw new Error("Post not found");

    let prompt = post.image_prompt;
    if (!prompt) {
      // 1. Call creativeBrief subtask
      const briefResult = await generateCreativeBrief.triggerAndWait({
        postId: payload.postId,
        style: payload.style
      });

      if (!briefResult.ok || !briefResult.output.refinedPrompt) {
        throw new Error("Failed to get creative brief refined prompt");
      }

      prompt = briefResult.output.refinedPrompt;
      await supabaseAdmin.from('posts').update({ image_prompt: prompt }).eq('id', payload.postId);
    }

    // 2. Call DALL-E 3
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = imageResponse.data?.[0]?.url;
    if (!imageUrl) throw new Error("No image generated from DALL-E 3");

    // 3. Call imageUpload subtask
    const uploadResult = await imageUpload.triggerAndWait({
      postId: payload.postId,
      imageUrl
    });

    if (!uploadResult.ok || !uploadResult.output.permanentUrl) {
      throw new Error("Failed to upload image via subtask");
    }

    return { success: true, imageUrl: uploadResult.output.permanentUrl };
  },
});

/**
 * Task 8: Instagram Publishing
 * Publishes final content to Instagram.
 */
export const instagramPublishing = task({
  id: "instagram-publishing",
  run: async (payload: { postId: string; businessId: string; imageUrl: string }) => {
    const publishRes = await fetch(`${API_URL}/api/v1/publish/instagram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        post_id: payload.postId,
        business_id: payload.businessId,
        image_url: payload.imageUrl
      })
    });

    if (!publishRes.ok) {
      const errorText = await publishRes.text();
      throw new Error(`Instagram publishing failed: ${publishRes.status} ${errorText}`);
    }

    const data = await publishRes.json();
    
    // Update local post status to published
    await supabaseAdmin
      .from('posts')
      .update({ status: 'published' })
      .eq('id', payload.postId);

    await sendNotification.trigger({
      title: "Instagram Publish Success",
      body: `Post ${payload.postId} was successfully published to Instagram!`
    });

    return { success: true, instagramPostId: data.instagram_post_id };
  }
});

/**
 * Task 9: Notifications
 * Console/notification logger.
 */
export const sendNotification = task({
  id: "send-notification",
  run: async (payload: { title: string; body: string }) => {
    console.log(`[TRIGGER NOTIFICATION] ${payload.title}: ${payload.body}`);
    return { success: true };
  }
});

/**
 * Task 10: Scheduled Publishing (Cron)
 * Scans for scheduled posts that are due and triggers publishing.
 */
export const scheduledPublishing = schedules.task({
  id: "scheduled-publishing",
  cron: "*/15 * * * *", // Run every 15 minutes
  run: async () => {
    const now = new Date().toISOString();
    
    // Fetch scheduled posts due to be published
    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select('*, content_plans(business_profile_id)')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now);

    if (error) {
      throw new Error(`Failed to query scheduled posts: ${error.message}`);
    }

    if (!posts || posts.length === 0) {
      console.log("No scheduled posts due at this time.");
      return { success: true, count: 0 };
    }

    console.log(`Found ${posts.length} posts due for scheduling.`);

    let count = 0;
    for (const post of posts) {
      try {
        const businessId = post.content_plans?.business_profile_id;
        if (!businessId) {
          throw new Error(`Post ${post.id} content plan does not specify business_profile_id.`);
        }
        if (!post.image_url) {
          throw new Error(`Post ${post.id} is missing an image_url.`);
        }

        // Trigger publishing
        await instagramPublishing.trigger({
          postId: post.id,
          businessId,
          imageUrl: post.image_url
        });

        count++;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error(`Scheduled publishing failed for post ${post.id}:`, message);
        // Mark failed
        await supabaseAdmin
          .from('posts')
          .update({ status: 'failed' })
          .eq('id', post.id);
      }
    }

    return { success: true, count };
  }
});
