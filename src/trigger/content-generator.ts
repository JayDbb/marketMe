import { task } from "@trigger.dev/sdk/v3";
import { openai } from "@/lib/openai";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { GenerateWeeklyContentPayload, RegenerateCaptionPayload, GenerateImagePayload } from "@/types/ai";

/**
 * Task 1: Generate Weekly Content
 */
export const generateWeeklyContent = task({
  id: "generate-weekly-content",
  run: async (payload: GenerateWeeklyContentPayload, { ctx }) => {
    // 1. Fetch Business Profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('business_profiles')
      .select('*')
      .eq('id', payload.businessProfileId)
      .single();

    if (profileError || !profile) {
      throw new Error(`Business profile not found: ${profileError?.message}`);
    }

    // 2. Fetch context from AI Memory (pgvector RAG)
    // Using a dummy embedding for now, to represent the query
    const dummyQueryEmbedding = new Array(1536).fill(0.1); 
    
    // In a real app we would embed the target audience or recent goal to query past successful posts
    // const { data: memory } = await supabaseAdmin.rpc('match_marketing_knowledge', { ... })
    
    // 3. Generate Strategy & Posts using OpenAI
    const systemPrompt = `You are an expert marketing AI. You manage the social media strategy for ${profile.business_name}.
Industry: ${profile.industry}
Target Customers: ${profile.target_customers}
Services: ${profile.services}
Tone: ${profile.tone}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate a social media content plan for the week of ${payload.startDate}. Return JSON containing target_audience, strategy_summary, and an array of 3 'posts' (each with platform, post_type, content, and image_prompt).` }
      ],
      response_format: { type: "json_object" }
    });

    const aiOutputText = completion.choices[0].message.content || '{}';
    const aiOutput = JSON.parse(aiOutputText);

    // 4. Save Content Plan
    const { data: plan, error: planError } = await supabaseAdmin
      .from('content_plans')
      .insert({
        user_id: profile.user_id,
        business_profile_id: profile.id,
        start_date: payload.startDate,
        end_date: new Date(new Date(payload.startDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        target_audience: aiOutput.target_audience,
        strategy_summary: aiOutput.strategy_summary,
        status: 'draft'
      })
      .select()
      .single();

    if (planError) throw new Error(`Failed to save plan: ${planError.message}`);

    // 5. Save Posts
    const postsToInsert = aiOutput.posts.map((post: any) => ({
      content_plan_id: plan.id,
      user_id: profile.user_id,
      platform: post.platform,
      post_type: post.post_type,
      content: post.content,
      image_prompt: post.image_prompt,
      status: 'draft'
    }));

    const { error: postsError } = await supabaseAdmin
      .from('posts')
      .insert(postsToInsert);

    if (postsError) throw new Error(`Failed to save posts: ${postsError.message}`);

    return { success: true, contentPlanId: plan.id };
  },
});

/**
 * Task 2: Regenerate Caption (MAR-18)
 */
export const regenerateCaption = task({
  id: "regenerate-caption",
  run: async (payload: RegenerateCaptionPayload, { ctx }) => {
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
 */
export const generateImage = task({
  id: "generate-image",
  run: async (payload: GenerateImagePayload, { ctx }) => {
    // 1. Fetch Post
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', payload.postId)
      .single();

    if (postError || !post) throw new Error("Post not found");

    // MAR-20: Ensure we have an image prompt
    let prompt = post.image_prompt;
    if (!prompt) {
      const isOpenRouter = process.env.OPENAI_API_KEY?.startsWith('sk-or-');
      const modelName = isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini";

      const completion = await openai.chat.completions.create({
        model: modelName,
        messages: [
          { role: "system", content: "You write image prompts for AI image generators like DALL-E." },
          { role: "user", content: `Write a highly detailed image generation prompt for this post: "${post.content}". Style: ${payload.style || 'High quality, professional photograph'}.` }
        ],
      });
      prompt = completion.choices[0].message.content;
      
      // Save the generated prompt
      await supabaseAdmin.from('posts').update({ image_prompt: prompt }).eq('id', payload.postId);
    }

    // MAR-23: Call DALL-E 3
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt!,
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
