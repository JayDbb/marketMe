import { task, schedules } from '@trigger.dev/sdk/v3'
import { openai } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { toAiBusinessId } from '@/lib/ai-business-id'
import {
  profileToPipelineInput,
  runCreativePipeline,
  buildBusinessCreativeContext,
  buildBusinessPostContext,
  buildBusinessStrategyContext,
} from '@/lib/services/creative-pipeline.service'
import {
  generateCreative,
  generateStrategy,
  publishToInstagram,
} from '@/lib/services/marketing-ai.service'
import { getUserAiPreferences } from '@/lib/services/ai-preferences.service'
import {
  formatBrandMemoryPromptBlock,
  getBrandMemoryContext,
  recordReviseSignal,
  REVISE_EXAMPLES,
} from '@/lib/services/brand-memory.service'
import { buildGenerationContext } from '@/lib/services/generation-context.service'
import { resolveChatModel, resolveImageModel } from '@/lib/ai-models'
import { generateImageBuffer } from '@/lib/image-generation'
import { imagePromptSystemInstructions } from '@/lib/image-prompt'
import type {
  GenerateWeeklyContentPayload,
  RegenerateCaptionPayload,
  GenerateImagePayload,
} from '@/types/ai'
import type { BusinessProfile } from '@/types/business-profile'

/**
 * Task 1: Business Analysis
 * Extracts target audience, USP, and keywords from profile data.
 */
export const businessAnalysis = task({
  id: 'business-analysis',
  run: async (payload: { businessProfileId: string }) => {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('business_profiles')
      .select('*')
      .eq('id', payload.businessProfileId)
      .single()

    if (profileError || !profile) {
      throw new Error(`Business profile not found: ${profileError?.message}`)
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a senior business marketing analyst. Outline key marketing keywords, target audience summary, and tone guidelines for the provided business profile. Format as a clean markdown block.',
        },
        {
          role: 'user',
          content: `Business Name: ${profile.business_name || 'Generic'}\nIndustry: ${profile.industry || 'General'}\nUSP: ${profile.usp || 'None specified'}\nGoal: ${profile.primary_goal || 'Growth'}`,
        },
      ],
    })

    const summary = completion.choices[0].message.content || 'Analysis complete.'

    await sendNotification.trigger({
      title: 'Business Profile Analysis Complete',
      body: `Successfully analyzed business: ${profile.business_name}`,
    })

    return { success: true, summary }
  },
})

/**
 * Task 2: Marketing Strategy
 * Calls MarketMe AI strategy endpoint via shared client.
 */
export const marketingStrategy = task({
  id: 'marketing-strategy',
  run: async (payload: { businessProfileId: string }) => {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('business_profiles')
      .select('*')
      .eq('id', payload.businessProfileId)
      .single()

    if (profileError || !profile) {
      throw new Error(`Business profile not found: ${profileError?.message}`)
    }

    const business = profileToPipelineInput(profile as BusinessProfile)
    const strategyCtx = buildBusinessStrategyContext(business)
    const strategyData = await generateStrategy({
      business: strategyCtx,
      options: {
        primary_platform: 'instagram',
        timeframe: 'weekly',
        primary_objective: 'awareness',
        target_audience_hint: business.targetCustomers ?? null,
        campaign_focus: business.primaryGoal ?? null,
        posting_capacity_per_week: 5,
      },
    })

    return {
      success: true,
      strategyId: strategyData.strategy_id,
      strategy: strategyData.generated,
    }
  },
})

/**
 * Task 3: Generate Weekly Content
 * Full creative pipeline: strategy → schedule → posts.
 */
export const generateWeeklyContent = task({
  id: 'generate-weekly-content',
  run: async (payload: GenerateWeeklyContentPayload) => {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('business_profiles')
      .select('*')
      .eq('id', payload.businessProfileId)
      .eq('user_id', payload.userId)
      .single()

    if (profileError || !profile) {
      throw new Error(`Business profile not found: ${profileError?.message}`)
    }

    const typed = profile as BusinessProfile
    const generationContext = await buildGenerationContext({
      userId: payload.userId,
      profile: typed,
      syncInsights: true,
    })

    const pipeline = await runCreativePipeline({
      business: profileToPipelineInput(typed),
      platform:
        Array.isArray(typed.channels) && typed.channels[0]
          ? typed.channels[0]
          : 'instagram',
      goal: typed.primary_goal ?? undefined,
      tone: typed.tone ?? undefined,
      numPosts: 5,
      weekStartDate: payload.startDate.slice(0, 10),
      includeCreativeBriefs: true,
      brandMemoryInstructions: generationContext.fullInstructions || undefined,
    })

    const startDate = new Date(payload.startDate)
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)

    const { data: planData, error: planError } = await supabaseAdmin
      .from('content_plans')
      .insert({
        user_id: payload.userId,
        business_profile_id: payload.businessProfileId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        target_audience: typed.target_customers || null,
        strategy_summary: pipeline.strategySummary,
        status: 'draft',
      })
      .select()
      .single()

    if (planError || !planData) {
      throw new Error(`Failed to save content plan: ${planError?.message}`)
    }

    if (pipeline.posts.length > 0) {
      const postsToInsert = pipeline.posts.map((post) => {
        const scheduled = new Date(post.scheduledDate)
        return {
          content_plan_id: planData.id,
          user_id: payload.userId,
          platform: 'instagram',
          post_type: 'image',
          content: [post.caption, post.hashtags].filter(Boolean).join('\n\n'),
          image_prompt: post.imagePrompt || null,
          scheduled_at: Number.isNaN(scheduled.getTime())
            ? startDate.toISOString()
            : scheduled.toISOString(),
          status: 'draft',
        }
      })

      const { error: postsError } = await supabaseAdmin.from('posts').insert(postsToInsert)
      if (postsError) {
        throw new Error(`Failed to save posts: ${postsError.message}`)
      }
    }

    await sendNotification.trigger({
      title: 'Weekly Content Generation Complete',
      body: `Successfully generated weekly posts plan: ${planData.id}`,
    })

    return {
      success: true,
      contentPlanId: planData.id,
      strategyId: pipeline.strategyId,
    }
  },
})

/**
 * Task 4: Caption Generation (Regenerate Caption)
 */
export const regenerateCaption = task({
  id: 'regenerate-caption',
  run: async (payload: RegenerateCaptionPayload) => {
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('*, content_plans(business_profile_id)')
      .eq('id', payload.postId)
      .single()

    if (postError || !post) throw new Error('Post not found')

    const businessProfileId =
      (post.content_plans as { business_profile_id?: string } | null)
        ?.business_profile_id ?? null

    const brandMemory = await getBrandMemoryContext(
      post.user_id as string,
      businessProfileId
    )
    const brandMemoryBlock = formatBrandMemoryPromptBlock(brandMemory, {
      maxExamples: REVISE_EXAMPLES,
    })

    const feedback =
      payload.feedback?.trim() || 'Make it more engaging and professional.'

    const prefs = await getUserAiPreferences(post.user_id as string)
    const model = resolveChatModel(prefs.captionModel)

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are an expert social media copywriter. Rewrite the following social media post caption based on the user's feedback. Provide only the rewritten caption.${brandMemoryBlock}`,
        },
        {
          role: 'user',
          content: `Original Post: ${post.content}\n\nFeedback: ${feedback}\n\nProvide only the rewritten caption.`,
        },
      ],
    })

    const newCaption = completion.choices[0].message.content?.trim() || post.content

    await supabaseAdmin
      .from('posts')
      .update({ content: newCaption, status: 'draft' })
      .eq('id', payload.postId)

    if (payload.feedback?.trim()) {
      try {
        await recordReviseSignal({
          userId: post.user_id as string,
          businessProfileId,
          instruction: payload.feedback,
          originalCaption: post.content ?? '',
          revisedCaption: newCaption ?? '',
        })
      } catch (err) {
        console.error('Brand memory revise signal failed:', err)
      }
    }

    return { success: true, newCaption }
  },
})

/**
 * Task 5: Creative Brief
 * Uses MarketMe AI creative endpoint. Requires backend post_id when available;
 * falls back to refining the local image_prompt via OpenAI if missing.
 */
export const generateCreativeBrief = task({
  id: 'generate-creative-brief',
  run: async (payload: {
    postId: string
    style?: string
    backendPostId?: number
    businessProfileId?: string
  }) => {
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('*, content_plans(business_profile_id)')
      .eq('id', payload.postId)
      .single()

    if (postError || !post) throw new Error('Post not found')

    const businessProfileId =
      payload.businessProfileId ||
      post.content_plans?.business_profile_id ||
      null

    if (payload.backendPostId && businessProfileId) {
      const { data: profile } = await supabaseAdmin
        .from('business_profiles')
        .select('*')
        .eq('id', businessProfileId)
        .single()

      if (profile) {
        const business = profileToPipelineInput(profile as BusinessProfile)
        const strategyCtx = buildBusinessStrategyContext(business)
        const postCtx = buildBusinessPostContext(strategyCtx, business.targetCustomers)
        const caption = String(post.content ?? '').split('\n\n')[0] || 'Brand post'
        const imagePrompt =
          post.image_prompt ||
          'Professional brand photography, clean composition, high quality'

        const creativeData = await generateCreative({
          business: buildBusinessCreativeContext(postCtx, business),
          post: {
            post_id: payload.backendPostId,
            business_id: toAiBusinessId(business.profileId),
            caption: caption.slice(0, 2200),
            hashtags: [],
            image_prompt: imagePrompt.slice(0, 4000),
            content_type: 'brand_story',
            platform: 'instagram',
          },
          options: {
            style_hint:
              payload.style || imagePromptSystemInstructions(business),
            additional_instructions: imagePromptSystemInstructions(business),
          },
        })

        const refinedPrompt =
          creativeData.creative_brief?.image_generation?.prompt ||
          imagePrompt

        await supabaseAdmin
          .from('posts')
          .update({ image_prompt: refinedPrompt })
          .eq('id', payload.postId)

        return {
          success: true,
          refinedPrompt,
          colorPalette: JSON.stringify(
            creativeData.creative_brief?.colour_palette ?? {}
          ),
          typography: JSON.stringify(creativeData.creative_brief?.typography ?? {}),
          layoutDescription: creativeData.creative_brief?.creative_concept || '',
        }
      }
    }

    // Fallback: use existing prompt or a simple refinement
    const refinedPrompt =
      post.image_prompt ||
      `Professional photograph matching this caption: ${String(post.content ?? '').slice(0, 200)}`

    return {
      success: true,
      refinedPrompt,
      colorPalette: 'Brand-aligned palette',
      typography: 'Clean sans-serif',
      layoutDescription: 'Balanced composition',
    }
  },
})

/**
 * Task 6: Image Upload
 */
export const imageUpload = task({
  id: 'image-upload',
  run: async (payload: { postId: string; imageUrl: string }) => {
    const fetchResponse = await fetch(payload.imageUrl)
    const arrayBuffer = await fetchResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const fileName = `Posts/post-${payload.postId}-${Date.now()}.png`
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'generated-content'

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      throw new Error(
        `Storage upload failed: ${uploadError.message}. Make sure the bucket '${bucketName}' exists and is public!`
      )
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileName)

    const permanentUrl = publicUrlData.publicUrl

    await supabaseAdmin
      .from('posts')
      .update({ image_url: permanentUrl, status: 'draft' })
      .eq('id', payload.postId)

    return { success: true, permanentUrl }
  },
})

/**
 * Task 7: Image Generation
 * Creative brief (MarketMe AI) → DALL·E / OpenRouter image → upload.
 */
export const generateImage = task({
  id: 'generate-image',
  run: async (payload: GenerateImagePayload) => {
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('*, content_plans(business_profile_id)')
      .eq('id', payload.postId)
      .single()

    if (postError || !post) throw new Error('Post not found')

    let prompt = post.image_prompt as string | null
    const businessProfileId =
      post.content_plans?.business_profile_id || null
    let brandForPrompt: Parameters<typeof imagePromptSystemInstructions>[0] = null
    if (businessProfileId) {
      const { data: profile } = await supabaseAdmin
        .from('business_profiles')
        .select('*')
        .eq('id', businessProfileId)
        .maybeSingle()
      if (profile) {
        const business = profileToPipelineInput(profile as BusinessProfile)
        brandForPrompt = {
          businessName: business.businessName,
          industry: business.industry,
          industryDetail: business.industryDetail,
          tone: business.tone,
          services: business.services,
          brandColors: business.brandColors,
          brandFonts: business.brandFonts,
          logoUrl: business.logoUrl,
        }
      }
    }

    if (payload.revisionInstruction?.trim()) {
      const instruction = payload.revisionInstruction.trim()
      const base =
        (typeof prompt === 'string' && prompt.trim()) ||
        (typeof post.content === 'string' && post.content.trim()) ||
        (typeof post.caption === 'string' && post.caption.trim()) ||
        'Professional social media marketing image'
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              imagePromptSystemInstructions(brandForPrompt) +
              (payload.style ? ` Preferred style: ${payload.style}.` : ''),
          },
          {
            role: 'user',
            content: `Current prompt:\n${base}\n\nRevision request:\n${instruction}`,
          },
        ],
      })
      const revised = completion.choices[0]?.message?.content?.trim()
      if (revised) {
        prompt = revised
        await supabaseAdmin
          .from('posts')
          .update({ image_prompt: prompt })
          .eq('id', payload.postId)
      }
    }

    if (!prompt) {
      const briefResult = await generateCreativeBrief.triggerAndWait({
        postId: payload.postId,
        style: payload.style,
        businessProfileId: post.content_plans?.business_profile_id,
      })

      if (!briefResult.ok || !briefResult.output.refinedPrompt) {
        throw new Error('Failed to get creative brief refined prompt')
      }

      prompt = briefResult.output.refinedPrompt
      await supabaseAdmin.from('posts').update({ image_prompt: prompt }).eq('id', payload.postId)
    }

    if (!prompt?.trim()) {
      throw new Error('No image prompt available for generation')
    }

    const imageModel = post.user_id
      ? resolveImageModel((await getUserAiPreferences(post.user_id)).imageModel)
      : resolveImageModel(null)

    const { buffer, contentType } = await generateImageBuffer(
      prompt.trim(),
      imageModel
    )

    const extension = contentType.includes('jpeg') ? 'jpg' : 'png'
    const fileName = `Posts/post-${payload.postId}-${Date.now()}.${extension}`
    const bucketName =
      process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'generated-content'

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType,
        upsert: true,
      })

    if (uploadError) {
      throw new Error(
        `Storage upload failed: ${uploadError.message}. Make sure the bucket '${bucketName}' exists and is public!`
      )
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileName)

    const permanentUrl = publicUrlData.publicUrl

    await supabaseAdmin
      .from('posts')
      .update({ image_url: permanentUrl, status: 'draft' })
      .eq('id', payload.postId)

    return { success: true, imageUrl: permanentUrl }
  },
})

/**
 * Task 8: Instagram Publishing
 */
export const instagramPublishing = task({
  id: 'instagram-publishing',
  run: async (payload: {
    postId: string
    businessId: string
    imageUrl: string
    backendPostId?: number | string
  }) => {
    // MarketMe posts use UUID `id`. Only use backendPostId when the AI API
    // still expects a legacy integer/string key for an older posts table.
    const publishPostId =
      payload.backendPostId != null
        ? String(payload.backendPostId)
        : payload.postId

    try {
      const data = await publishToInstagram({
        post_id: publishPostId,
        // Publish API expects business_profiles.id UUID.
        business_id: payload.businessId,
        image_url: payload.imageUrl,
      })

      await supabaseAdmin.from('posts').update({ status: 'published', error_message: null }).eq('id', payload.postId)

      await sendNotification.trigger({
        title: 'Instagram Publish Success',
        body: `Post ${payload.postId} was successfully published to Instagram!`,
      })

      return { success: true, instagramPostId: data.instagram_post_id }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Publishing failed'
      await supabaseAdmin
        .from('posts')
        .update({
          status: 'failed',
          error_message: message.slice(0, 500),
        })
        .eq('id', payload.postId)
      return { success: false, error: message }
    }
  },
})

/**
 * Task 9: Notifications
 */
export const sendNotification = task({
  id: 'send-notification',
  run: async (payload: { title: string; body: string }) => {
    console.log(`[TRIGGER NOTIFICATION] ${payload.title}: ${payload.body}`)
    return { success: true }
  },
})

/**
 * Task 10: Scheduled Publishing (Cron)
 * Publishes due posts without requiring the user to be online.
 * Tokens live on MarketMe AI; this job only needs ENABLE_AUTO_PUBLISH.
 */
export const scheduledPublishing = schedules.task({
  id: 'scheduled-publishing',
  cron: '*/15 * * * *',
  run: async () => {
    const { publishDueScheduledPosts } = await import(
      '@/lib/services/scheduled-publishing.service'
    )
    const result = await publishDueScheduledPosts()

    if (result.skipped) {
      console.log(
        '[scheduled-publishing] Skipped — set ENABLE_AUTO_PUBLISH=true or INSTAGRAM_PUBLISH_ENABLED=true.'
      )
      return { success: true, count: 0, skipped: true }
    }

    if (result.count === 0 && result.failed === 0 && result.deferred === 0) {
      console.log('No scheduled posts due at this time.')
    } else {
      console.log(
        `[scheduled-publishing] published=${result.count} failed=${result.failed} deferred=${result.deferred}`
      )
    }

    return {
      success: result.success,
      count: result.count,
      failed: result.failed,
      deferred: result.deferred,
      postIds: result.postIds,
      errors: result.errors,
    }
  },
})
