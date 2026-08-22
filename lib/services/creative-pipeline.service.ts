import 'server-only'

import { toAiBusinessId } from '@/lib/ai-business-id'
import {
  buildCompactBrandBrief,
  buildMarketingSystemPrompt,
  type MarketingPromptProfile,
} from '@/lib/marketing-profile-prompt'
import { toLocalGeneratedSchedule } from '@/lib/post-schedule-utils'
import type { BusinessProfile } from '@/types/business-profile'
import { buildImagePromptDirectives } from '@/lib/image-prompt'
import {
  flattenHashtags,
  generateCreative,
  generatePost,
  generateSchedule,
  generateStrategy,
  hashtagsToCaptionString,
  type BusinessCreativeContext,
  type BusinessPostContext,
  type BusinessStrategyContext,
  type ContentObjective,
  type ContentType,
  type GeneratedContentSchedule,
  type GenerateCreativeBriefResponse,
  type GeneratePostResponse,
  type GenerateScheduleResponse,
  type GenerateStrategyResponse,
  type ScheduledContentItem,
  type SocialPlatform,
  type StrategyPostContext,
} from '@/lib/services/marketing-ai.service'

export interface PipelineBusinessInput {
  profileId: string
  businessName: string
  industry?: string | null
  industryDetail?: string | null
  location?: string | null
  website?: string | null
  services?: string | null
  usp?: string | null
  primaryGoal?: string | null
  tone?: string | null
  targetCustomers?: string | null
  competitors?: string | null
  channels?: string[] | null
  logoUrl?: string | null
  brandColors?: string[] | null
  brandFonts?: string[] | null
}

export interface PipelinePostDraft {
  id: string
  title: string
  caption: string
  hashtags: string
  scheduledDate: string
  imagePrompt: string
  callToAction: string | null
  backendPostId: number | null
  contentType: string
  status: 'needs_review'
}

export interface CreativePipelineResult {
  strategyId: number
  strategySummary: string
  strategy: GenerateStrategyResponse
  schedule: GenerateScheduleResponse
  posts: PipelinePostDraft[]
  creativeBriefs: GenerateCreativeBriefResponse[]
}

function splitList(value: string | null | undefined): string[] {
  if (!value?.trim()) return []
  return value
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30)
}

export function mapPlatform(platform: string | undefined | null): SocialPlatform {
  const key = (platform ?? 'instagram').trim().toLowerCase()
  if (key === 'twitter' || key === 'x' || key === 'x / twitter') return 'x'
  if (key === 'facebook') return 'facebook'
  if (key === 'linkedin') return 'linkedin'
  if (key === 'tiktok') return 'tiktok'
  return 'instagram'
}

export function mapGoalToObjective(goal: string | null | undefined): ContentObjective {
  const g = (goal ?? '').toLowerCase()
  if (g.includes('lead')) return 'leads'
  if (g.includes('sale') || g.includes('convert') || g.includes('revenue')) return 'sales'
  if (g.includes('engage') || g.includes('community')) return 'engagement'
  if (g.includes('educat') || g.includes('authority')) return 'education'
  if (g.includes('retain') || g.includes('loyalty')) return 'retention'
  if (g.includes('booking') || g.includes('consultation')) return 'leads'
  return 'awareness'
}

export function profileToPipelineInput(
  profile: BusinessProfile,
  overrides?: Partial<PipelineBusinessInput>
): PipelineBusinessInput {
  return {
    profileId: profile.id,
    businessName: overrides?.businessName ?? profile.business_name ?? 'My Business',
    industry: overrides?.industry ?? profile.industry,
    industryDetail: overrides?.industryDetail ?? profile.industry_detail,
    location: overrides?.location ?? profile.location,
    website: overrides?.website ?? profile.website,
    services: overrides?.services ?? profile.services,
    usp: overrides?.usp ?? profile.usp,
    primaryGoal: overrides?.primaryGoal ?? profile.primary_goal,
    tone: overrides?.tone ?? profile.tone,
    targetCustomers: overrides?.targetCustomers ?? profile.target_customers,
    competitors: overrides?.competitors ?? profile.competitors,
    channels: overrides?.channels ?? profile.channels,
    logoUrl: overrides?.logoUrl ?? profile.logo_url,
    brandColors: overrides?.brandColors ?? profile.brand_colors,
    brandFonts: overrides?.brandFonts ?? profile.brand_fonts,
  }
}

export function pipelineInputToMarketingProfile(
  input: PipelineBusinessInput
): MarketingPromptProfile {
  return {
    business_name: input.businessName,
    industry: input.industry ?? null,
    industry_detail: input.industryDetail ?? null,
    location: input.location ?? null,
    website: input.website ?? null,
    services: input.services ?? null,
    usp: input.usp ?? null,
    primary_goal: input.primaryGoal ?? null,
    target_customers: input.targetCustomers ?? null,
    tone: input.tone ?? null,
    competitors: input.competitors ?? null,
    channels: input.channels ?? [],
    logo_url: input.logoUrl ?? null,
    brand_colors: input.brandColors ?? null,
    brand_fonts: input.brandFonts ?? null,
  }
}

/** Full onboarding-aware instructions for strategy / posts / creative. */
export function buildPipelineProfileInstructions(input: PipelineBusinessInput): string {
  return buildMarketingSystemPrompt(pipelineInputToMarketingProfile(input))
}

export function buildBusinessStrategyContext(
  input: PipelineBusinessInput
): BusinessStrategyContext {
  const channels = (input.channels ?? [])
    .map((c) => mapPlatform(c))
    .filter((v, i, arr) => arr.indexOf(v) === i)

  const industry = input.industry?.trim() || 'General business'
  const detail = input.industryDetail?.trim()
  const businessType = detail ? `${industry} — ${detail}` : industry

  const descriptionParts = [
    input.services?.trim() || null,
    input.website?.trim() ? `Website: ${input.website.trim()}` : null,
  ].filter(Boolean)

  return {
    business_id: toAiBusinessId(input.profileId),
    business_name: input.businessName.trim() || 'My Business',
    business_type: businessType,
    location: input.location ?? null,
    description: descriptionParts.join('\n') || null,
    summary: input.usp ?? input.services ?? null,
    tone: input.tone?.trim() || 'friendly and professional',
    products_or_services: splitList(input.services),
    existing_audience: input.targetCustomers ?? null,
    current_marketing_channels: channels.length > 0 ? channels : ['instagram'],
    unique_selling_points: splitList(input.usp),
    prohibited_keywords: input.competitors
      ? splitList(input.competitors).slice(0, 10)
      : undefined,
  }
}

export function buildBusinessPostContext(
  strategyCtx: BusinessStrategyContext,
  targetAudience?: string | null
): BusinessPostContext {
  return {
    business_id: strategyCtx.business_id,
    business_name: strategyCtx.business_name,
    business_type: strategyCtx.business_type,
    location: strategyCtx.location,
    description: strategyCtx.description,
    summary: strategyCtx.summary,
    tone: strategyCtx.tone,
    target_audience: targetAudience ?? strategyCtx.existing_audience ?? null,
    products_or_services: strategyCtx.products_or_services,
    unique_selling_points: strategyCtx.unique_selling_points,
    preferred_keywords: strategyCtx.preferred_keywords,
    prohibited_keywords: strategyCtx.prohibited_keywords,
    prohibited_claims: strategyCtx.prohibited_claims,
  }
}

export function buildBusinessCreativeContext(
  postCtx: BusinessPostContext,
  input?: PipelineBusinessInput
): BusinessCreativeContext {
  const colors = (input?.brandColors ?? []).filter(Boolean)
  const fonts = (input?.brandFonts ?? []).filter(Boolean)
  const styles = [
    fonts.length > 0 ? `Use brand fonts: ${fonts.join(' / ')}` : null,
    input?.logoUrl
      ? 'Leave space for the real brand logo; never invent a wordmark'
      : 'Do not invent logos or brand names in the image',
    input?.tone ? `Visual mood matches brand voice: ${input.tone}` : null,
    buildImagePromptDirectives(input ?? null),
  ].filter(Boolean) as string[]

  return {
    ...postCtx,
    brand_colours: colors.length > 0 ? colors : undefined,
    preferred_visual_styles: styles.length > 0 ? styles : undefined,
    prohibited_visual_elements: [
      'tiny unreadable text',
      'watermarks',
      'fake logos',
      'misspelled words',
      'busy collage',
    ],
  }
}

function supportingPlatforms(
  channels: string[] | null | undefined,
  primary: SocialPlatform
): SocialPlatform[] {
  return (channels ?? [])
    .map((c) => mapPlatform(c))
    .filter((p, i, arr) => p !== primary && arr.indexOf(p) === i)
    .slice(0, 4)
}

function strategyToPostContext(
  strategy: GenerateStrategyResponse
): StrategyPostContext {
  const generated = strategy.generated as Record<string, unknown>
  const data = strategy.strategy_data
  const pillars = Array.isArray(generated.content_pillars)
    ? generated.content_pillars
        .map((p) => {
          if (typeof p === 'string') return p
          if (p && typeof p === 'object' && 'name' in p) {
            return String((p as { name?: string }).name ?? '')
          }
          return ''
        })
        .filter(Boolean)
    : []

  const keyMessages = Array.isArray(generated.key_messages)
    ? generated.key_messages.map(String).filter(Boolean)
    : []

  const strategyId = strategy.strategy_id
  if (!strategyId) {
    throw new Error('MarketMe AI did not return a strategy_id')
  }

  return {
    strategy_id: strategyId,
    strategy_name: data.strategy_name || String(generated.strategy_name ?? 'Marketing Strategy'),
    strategy_type: data.strategy_type ?? String(generated.strategy_type ?? 'organic'),
    description: data.description ?? String(generated.executive_summary ?? ''),
    goal: data.goal || String(generated.primary_value_proposition ?? 'Grow brand awareness'),
    status: data.status ?? 'draft',
    content_pillars: pillars,
    key_messages: keyMessages,
  }
}

function collectScheduleItems(schedule: GeneratedContentSchedule): ScheduledContentItem[] {
  const items: ScheduledContentItem[] = []
  for (const week of schedule.weeks ?? []) {
    for (const item of week.content_items ?? []) {
      items.push(item)
    }
  }
  return items.sort((a, b) => a.sequence_number - b.sequence_number)
}

function postResponseToDraft(
  response: GeneratePostResponse,
  fallbackTitle: string,
  fallbackDate: string,
  index: number
): PipelinePostDraft {
  const hashtags = flattenHashtags(response.generated.hashtags)
  return {
    id: `ai-${response.post_id ?? Date.now()}-${index}`,
    title: fallbackTitle,
    caption: response.generated.caption?.trim() || '',
    hashtags: hashtagsToCaptionString(hashtags),
    scheduledDate: toLocalGeneratedSchedule(
      response.post_data.scheduled_date || fallbackDate,
      index
    ),
    imagePrompt: response.generated.image_prompt,
    callToAction: response.generated.call_to_action ?? null,
    backendPostId: response.post_id,
    contentType: response.generated.content_type,
    status: 'needs_review',
  }
}

function joinInstructions(...parts: Array<string | null | undefined>): string {
  return parts
    .map((p) => p?.trim())
    .filter(Boolean)
    .join('\n\n')
}

export async function runCreativePipeline(options: {
  business: PipelineBusinessInput
  platform?: string
  goal?: string
  tone?: string
  numPosts?: number
  weekStartDate?: string
  includeCreativeBriefs?: boolean
  /** Pre-formatted brand memory block for additional_instructions */
  brandMemoryInstructions?: string
}): Promise<CreativePipelineResult> {
  const numPosts = Math.max(1, Math.min(14, options.numPosts ?? 3))
  const platform = mapPlatform(options.platform)
  const objective = mapGoalToObjective(options.goal ?? options.business.primaryGoal)
  const tone = options.tone?.trim() || options.business.tone || 'friendly and professional'
  const memory = options.brandMemoryInstructions?.trim() ?? ''
  const supporting = supportingPlatforms(options.business.channels, platform)

  const businessInput: PipelineBusinessInput = {
    ...options.business,
    tone,
  }

  const profileInstructions = buildPipelineProfileInstructions(businessInput)
  const compactBrief = buildCompactBrandBrief(
    pipelineInputToMarketingProfile(businessInput)
  )

  const strategyBusiness = buildBusinessStrategyContext(businessInput)
  const postBusiness = buildBusinessPostContext(
    strategyBusiness,
    options.business.targetCustomers
  )
  const creativeBusiness = buildBusinessCreativeContext(postBusiness, businessInput)

  const weekStart =
    options.weekStartDate ??
    (() => {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() + 1)
      return d.toISOString().slice(0, 10)
    })()

  const strategy = await generateStrategy({
    business: strategyBusiness,
    options: {
      primary_platform: platform,
      supporting_platforms: supporting,
      timeframe: 'weekly',
      primary_objective: objective,
      target_audience_hint: options.business.targetCustomers ?? null,
      campaign_focus: options.goal ?? options.business.primaryGoal ?? null,
      posting_capacity_per_week: numPosts,
      additional_instructions: joinInstructions(
        profileInstructions,
        `Brand tone override for this run: ${tone}.`,
        'Generate a practical weekly content strategy.',
        options.business.competitors
          ? 'Differentiate from listed competitors without naming them in copy.'
          : null,
        memory
      ),
    },
  })

  const strategyId = strategy.strategy_id
  if (!strategyId) {
    throw new Error('MarketMe AI strategy generation returned no strategy_id')
  }

  const schedule = await generateSchedule({
    business: strategyBusiness,
    strategy_id: strategyId,
    strategy: strategy.generated,
    options: {
      week_start_date: weekStart,
      number_of_weeks: 1,
      posts_per_week: numPosts,
      primary_platform: platform,
      supporting_platforms: supporting,
      include_weekends: true,
      include_promotional_content: true,
      additional_instructions: joinInstructions(
        `Plan exactly ${numPosts} posts for the week.`,
        compactBrief,
        memory
      ),
    },
  })

  const scheduleItems = collectScheduleItems(schedule.schedule).slice(0, numPosts)
  const strategyPostCtx = strategyToPostContext(strategy)

  const posts: PipelinePostDraft[] = []
  const creativeBriefs: GenerateCreativeBriefResponse[] = []

  const itemsToGenerate: ScheduledContentItem[] =
    scheduleItems.length > 0
      ? scheduleItems
      : Array.from({ length: numPosts }, (_, i) => ({
          sequence_number: i + 1,
          scheduled_date: weekStart,
          platform,
          content_pillar: 'Brand',
          objective,
          content_type: 'brand_story' as ContentType,
          title: `Post ${i + 1}`,
          description: options.goal || 'Grow the brand this week',
          key_message: options.business.usp || options.business.businessName,
          target_audience: options.business.targetCustomers || 'Ideal customers',
        }))

  const visualStyleHint = buildImagePromptDirectives({
    businessName: businessInput.businessName,
    industry: businessInput.industry,
    industryDetail: businessInput.industryDetail,
    tone: businessInput.tone,
    services: businessInput.services,
    brandColors: businessInput.brandColors,
    brandFonts: businessInput.brandFonts,
    logoUrl: businessInput.logoUrl,
  })

  for (let i = 0; i < itemsToGenerate.length; i++) {
    const item = itemsToGenerate[i]
    const topic = [item.title, item.key_message, item.description]
      .filter(Boolean)
      .join(' — ')
      .slice(0, 1000)

    const ctaHint =
      item.call_to_action_intent ??
      (businessInput.website
        ? `Point readers to ${businessInput.website} when a CTA fits`
        : null)

    const postResponse = await generatePost({
      business: postBusiness,
      strategy: strategyPostCtx,
      schedule: {
        week_start_date: schedule.database_data.week_start_date
          ? `${schedule.database_data.week_start_date}T00:00:00Z`
          : null,
        week_end_date: schedule.database_data.week_end_date
          ? `${schedule.database_data.week_end_date}T23:59:59Z`
          : null,
        schedule_status: schedule.database_data.schedule_status ?? 'draft',
      },
      idea: {
        title: item.title,
        description: item.description,
        content_type: item.content_type,
      },
      options: {
        platform: item.platform || platform,
        objective: item.objective || objective,
        topic: topic.length >= 2 ? topic : `Weekly content for ${businessInput.businessName}`,
        include_emojis: true,
        include_hashtags: true,
        include_call_to_action: true,
        call_to_action_hint: ctaHint,
        additional_instructions: joinInstructions(
          profileInstructions,
          `Tone: ${tone}`,
          ...(item.post_generation_instructions ?? []),
          item.visual_direction_hint
            ? `Visual direction hint: ${item.visual_direction_hint}`
            : null,
          visualStyleHint || null,
          memory
        ),
      },
    })

    const draft = postResponseToDraft(
      postResponse,
      item.title || `Post ${i + 1}`,
      item.scheduled_date,
      i
    )
    posts.push(draft)

    if (options.includeCreativeBriefs && postResponse.post_id) {
      try {
        const brief = await generateCreative({
          business: creativeBusiness,
          post: {
            post_id: postResponse.post_id,
            business_id: postBusiness.business_id,
            caption: postResponse.generated.caption,
            call_to_action: postResponse.generated.call_to_action ?? null,
            hashtags: flattenHashtags(postResponse.generated.hashtags),
            image_prompt: postResponse.generated.image_prompt,
            content_type: postResponse.generated.content_type,
            platform: item.platform || platform,
          },
          options: {
            style_hint:
              item.visual_direction_hint ||
              visualStyleHint ||
              'High quality, professional brand visual',
            additional_instructions: joinInstructions(
              compactBrief,
              visualStyleHint || null,
              memory
            ),
          },
        })
        creativeBriefs.push(brief)
        if (brief.creative_brief?.image_generation?.prompt) {
          draft.imagePrompt = brief.creative_brief.image_generation.prompt
        }
      } catch (err) {
        console.warn('[creative-pipeline] Creative brief skipped:', err)
      }
    }
  }

  const strategySummary =
    strategy.strategy_data.description ||
    String(strategy.generated.executive_summary ?? 'Weekly generated content strategy')

  return {
    strategyId,
    strategySummary,
    strategy,
    schedule,
    posts,
    creativeBriefs,
  }
}
