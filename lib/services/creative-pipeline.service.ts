import 'server-only'

import { toAiBusinessId } from '@/lib/ai-business-id'
import { toDatetimeLocalValue } from '@/lib/calendar-utils'
import type { BusinessProfile } from '@/types/business-profile'
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
  location?: string | null
  services?: string | null
  usp?: string | null
  primaryGoal?: string | null
  tone?: string | null
  targetCustomers?: string | null
  channels?: string[] | null
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
    location: overrides?.location ?? profile.location,
    services: overrides?.services ?? profile.services,
    usp: overrides?.usp ?? profile.usp,
    primaryGoal: overrides?.primaryGoal ?? profile.primary_goal,
    tone: overrides?.tone ?? profile.tone,
    targetCustomers: overrides?.targetCustomers ?? profile.target_customers,
    channels: overrides?.channels ?? profile.channels,
  }
}

export function buildBusinessStrategyContext(
  input: PipelineBusinessInput
): BusinessStrategyContext {
  const channels = (input.channels ?? [])
    .map((c) => mapPlatform(c))
    .filter((v, i, arr) => arr.indexOf(v) === i)

  return {
    business_id: toAiBusinessId(input.profileId),
    business_name: input.businessName.trim() || 'My Business',
    business_type: input.industry?.trim() || 'General business',
    location: input.location ?? null,
    description: input.services ?? null,
    summary: input.usp ?? input.services ?? null,
    tone: input.tone?.trim() || 'friendly and professional',
    products_or_services: splitList(input.services),
    existing_audience: input.targetCustomers ?? null,
    current_marketing_channels: channels.length > 0 ? channels : ['instagram'],
    unique_selling_points: splitList(input.usp),
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
  postCtx: BusinessPostContext
): BusinessCreativeContext {
  return { ...postCtx }
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

function toLocalScheduleDate(isoOrDate: string): string {
  const d = new Date(isoOrDate)
  if (Number.isNaN(d.getTime())) {
    const fallback = new Date()
    fallback.setDate(fallback.getDate() + 1)
    fallback.setHours(10, 0, 0, 0)
    return toDatetimeLocalValue(fallback)
  }
  if (d.getTime() <= Date.now()) {
    d.setDate(d.getDate() + 1)
  }
  return toDatetimeLocalValue(d)
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
    scheduledDate: response.post_data.scheduled_date
      ? toLocalScheduleDate(response.post_data.scheduled_date)
      : toLocalScheduleDate(fallbackDate),
    imagePrompt: response.generated.image_prompt,
    callToAction: response.generated.call_to_action ?? null,
    backendPostId: response.post_id,
    contentType: response.generated.content_type,
    status: 'needs_review',
  }
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

  const businessInput: PipelineBusinessInput = {
    ...options.business,
    tone,
  }

  const strategyBusiness = buildBusinessStrategyContext(businessInput)
  const postBusiness = buildBusinessPostContext(
    strategyBusiness,
    options.business.targetCustomers
  )

  const weekStart =
    options.weekStartDate ??
    (() => {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      // Next Monday-ish: tomorrow as safe default for API date
      d.setDate(d.getDate() + 1)
      return d.toISOString().slice(0, 10)
    })()

  const strategy = await generateStrategy({
    business: strategyBusiness,
    options: {
      primary_platform: platform,
      supporting_platforms: [],
      timeframe: 'weekly',
      primary_objective: objective,
      target_audience_hint: options.business.targetCustomers ?? null,
      campaign_focus: options.goal ?? options.business.primaryGoal ?? null,
      posting_capacity_per_week: numPosts,
      additional_instructions: `Brand tone: ${tone}. Generate a practical weekly content strategy optimized for Instagram traction (hooks, clarity, niche relevance). Prefer the brand brain posting windows and pillars when present.${memory}`,
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
      include_weekends: true,
      include_promotional_content: true,
      additional_instructions: `Plan exactly ${numPosts} posts for the week. Schedule within preferred posting windows from the brand brain when provided; use local business-friendly times.${memory}`,
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

  for (let i = 0; i < itemsToGenerate.length; i++) {
    const item = itemsToGenerate[i]
    const topic = [item.title, item.key_message, item.description]
      .filter(Boolean)
      .join(' — ')
      .slice(0, 1000)

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
        call_to_action_hint: item.call_to_action_intent ?? null,
        additional_instructions: [
          `Tone: ${tone}`,
          'Optimize caption + hashtags for Instagram traction while staying on-brand.',
          'Use brand-brain hashtag seeds and CTA patterns when provided; avoid generic spam tags.',
          ...(item.post_generation_instructions ?? []),
          item.visual_direction_hint
            ? `Visual direction hint: ${item.visual_direction_hint}`
            : '',
          memory,
        ]
          .filter(Boolean)
          .join('\n'),
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
          business: buildBusinessCreativeContext(postBusiness),
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
            style_hint: item.visual_direction_hint ?? 'High quality, professional brand visual',
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
