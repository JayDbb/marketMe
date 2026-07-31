import 'server-only'

/**
 * Typed HTTP client for MarketMe-AI FastAPI backend (OpenAPI /api/v1/*).
 * Server-only — never import from Client Components.
 */

function getApiUrl(): string {
  const configured = process.env.MARKETME_AI_API_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'MARKETME_AI_API_URL must be set in production. Refusing to default to a shared backend.'
    )
  }

  return 'http://localhost:8000'
}

const DEFAULT_TIMEOUT = 30_000
const GENERATION_TIMEOUT = 180_000
const MAX_RETRIES = 2
const RETRY_BASE_DELAY = 1000

export function isMarketingAiConfigured(): boolean {
  return Boolean(process.env.MARKETME_AI_API_URL?.trim())
}

function backendAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {}
  const apiKey = process.env.MARKETME_AI_API_KEY?.trim()
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`
    headers['X-API-Key'] = apiKey
  }
  return headers
}

/**
 * Safely convert numeric strings, UUIDs, or numbers to a positive
 * 32-bit integer. For older AI generation endpoints that still require
 * numeric business_id. Do not use for Instagram OAuth / publish connections.
 */
export function toNumericId(
  id: string | number | undefined | null
): number {
  if (typeof id === 'number' && Number.isInteger(id) && id > 0) {
    return id
  }

  if (typeof id === 'string') {
    const parsed = Number.parseInt(id, 10)
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed
    }

    let hash = 0
    for (let index = 0; index < id.length; index++) {
      hash = (hash << 5) - hash + id.charCodeAt(index)
      hash |= 0
    }
    return Math.abs(hash) || 1
  }

  return 1
}

/** Validate and normalize a business-profile UUID for publish/OAuth APIs. */
function normalizeBusinessProfileId(businessProfileId: string): string {
  const normalized = businessProfileId.trim()
  if (!normalized) {
    throw new Error('A business profile ID is required.')
  }
  return normalized
}

// ---------------------------------------------------------------------------
// Shared enums / context types (mirrors FastAPI Pydantic schemas)
// ---------------------------------------------------------------------------

export type SocialPlatform = 'instagram' | 'facebook' | 'linkedin' | 'x' | 'tiktok'
export type ContentObjective =
  | 'awareness'
  | 'engagement'
  | 'education'
  | 'leads'
  | 'sales'
  | 'retention'
export type ContentType =
  | 'promotional'
  | 'educational'
  | 'engagement'
  | 'announcement'
  | 'testimonial'
  | 'behind_the_scenes'
  | 'product_showcase'
  | 'service_showcase'
  | 'event'
  | 'brand_story'

export interface BusinessStrategyContext {
  business_id: number
  business_name: string
  business_type: string
  location?: string | null
  description?: string | null
  summary?: string | null
  tone?: string
  products_or_services?: string[]
  existing_audience?: string | null
  current_marketing_channels?: SocialPlatform[]
  business_strengths?: string[]
  business_challenges?: string[]
  unique_selling_points?: string[]
  preferred_keywords?: string[]
  prohibited_keywords?: string[]
  prohibited_claims?: string[]
}

export type BusinessPostContext = Omit<
  BusinessStrategyContext,
  'current_marketing_channels' | 'business_strengths' | 'business_challenges' | 'existing_audience'
> & {
  target_audience?: string | null
}

export type BusinessCreativeContext = BusinessPostContext & {
  brand_colours?: string[]
  preferred_visual_styles?: string[]
  prohibited_visual_elements?: string[]
}

export interface StrategyGenerationOptions {
  primary_platform?: SocialPlatform
  supporting_platforms?: SocialPlatform[]
  timeframe?: 'weekly' | 'monthly' | 'quarterly' | 'annual'
  primary_objective?: ContentObjective
  secondary_objectives?: ContentObjective[]
  target_audience_hint?: string | null
  campaign_focus?: string | null
  posting_capacity_per_week?: number
  additional_instructions?: string | null
}

export interface ScheduleGenerationOptions {
  week_start_date: string
  number_of_weeks?: number
  posts_per_week?: number
  primary_platform?: SocialPlatform
  supporting_platforms?: SocialPlatform[]
  preferred_posting_days?: string[]
  include_weekends?: boolean
  include_event_content?: boolean
  include_promotional_content?: boolean
  additional_instructions?: string | null
}

export interface PostGenerationOptions {
  platform?: SocialPlatform
  objective?: ContentObjective
  topic: string
  language?: string
  desired_length?: 'short' | 'medium' | 'long'
  include_emojis?: boolean
  include_hashtags?: boolean
  maximum_hashtags?: number
  include_call_to_action?: boolean
  call_to_action_hint?: string | null
  campaign_name?: string | null
  additional_instructions?: string | null
}

export interface CreativeBriefGenerationOptions {
  style_hint?: string | null
  additional_instructions?: string | null
}

export interface AIRequestMetadata {
  request_id: string
  prompt_version: string
  business_id?: number | null
  strategy_id?: number | null
  content_idea_id?: number | null
}

export interface StrategyPostContext {
  strategy_id: number
  strategy_name: string
  strategy_type?: string | null
  description?: string | null
  goal: string
  status?: string | null
  content_pillars?: string[]
  key_messages?: string[]
}

export interface ContentSchedulePostContext {
  schedule_id?: number | null
  week_start_date?: string | null
  week_end_date?: string | null
  schedule_status?: string | null
}

export interface ContentIdeaPostContext {
  idea_id?: number | null
  title?: string | null
  description?: string | null
  content_type?: ContentType | null
}

export interface SocialAccountPostContext {
  account_id?: number | null
  platform?: SocialPlatform | null
  handle?: string | null
}

export interface PostCreativeContext {
  post_id: number
  business_id: number
  caption: string
  call_to_action?: string | null
  hashtags?: string[]
  image_prompt: string
  content_type: ContentType
  platform?: SocialPlatform
}

export interface ScheduledContentItem {
  sequence_number: number
  scheduled_date: string
  platform: SocialPlatform
  content_pillar: string
  objective: ContentObjective
  content_type: ContentType
  title: string
  description: string
  key_message: string
  target_audience: string
  call_to_action_intent?: string | null
  campaign_name?: string | null
  event_id?: number | null
  post_generation_instructions?: string[]
  visual_direction_hint?: string | null
}

export interface GeneratedContentWeek {
  week_number: number
  week_start_date: string
  week_end_date: string
  weekly_theme: string
  weekly_goal: string
  content_items: ScheduledContentItem[]
}

export interface GeneratedContentSchedule {
  schedule_name: string
  schedule_summary: string
  week_start_date: string
  week_end_date: string
  total_planned_posts: number
  weeks: GeneratedContentWeek[]
  scheduling_notes?: string[]
  assumptions?: string[]
  compliance_notes?: string[]
}

export interface GeneratedHashtag {
  tag?: string
  hashtag?: string
  [key: string]: unknown
}

export interface GeneratedPostContent {
  caption: string
  call_to_action?: string | null
  hashtags?: GeneratedHashtag[] | string[]
  content_type: ContentType
  post_goal: string
  target_audience_summary: string
  image_prompt: string
  compliance_notes?: string[]
}

export interface GeneratedCreativeBrief {
  creative_concept: string
  design_objective: string
  platform: SocialPlatform
  content_type: ContentType
  canvas_width: number
  canvas_height: number
  aspect_ratio: string
  visual_style: string
  image_generation: {
    prompt: string
    negative_prompt?: string | null
    subject_description: string
    environment_description: string
    lighting_direction: string
    camera_and_composition: string
    mood: string
    realism_level: string
    text_rendering_instruction: string
  }
  [key: string]: unknown
}

export interface MarketingStrategyCreateData {
  business_id: number
  strategy_name: string
  strategy_type: string
  description: string
  goal: string
  status?: string
  ai_model: string
  strategy_json?: Record<string, unknown>
}

export interface ContentScheduleCreateData {
  business_id: number
  strategy_id: number
  week_start_date: string
  week_end_date: string
  schedule_status?: string
  schedule_json?: Record<string, unknown>
}

export interface PostCreateData {
  business_id: number
  account_id?: number | null
  idea_id?: number | null
  schedule_id?: number | null
  caption: string
  hashtags?: string[]
  media_url?: string | null
  scheduled_date?: string | null
  image_prompt?: string | null
  status?: string
  ai_model: string
}

export interface GenerateStrategyResponse {
  strategy_id: number | null
  generated: Record<string, unknown>
  strategy_data: MarketingStrategyCreateData
  metadata: Record<string, unknown>
}

export interface GenerateScheduleResponse {
  success?: boolean
  message?: string
  schedule: GeneratedContentSchedule
  database_data: ContentScheduleCreateData
  content_ideas?: Record<string, unknown>[]
}

export interface GeneratePostResponse {
  post_id: number | null
  generated: GeneratedPostContent
  post_data: PostCreateData
  metadata: Record<string, unknown>
}

export interface GenerateCreativeBriefResponse {
  success?: boolean
  message?: string
  creative_brief: GeneratedCreativeBrief
  database_data: Record<string, unknown>
}

export interface PublishRequest {
  post_id: string | number
  /** UUID from public.business_profiles.id */
  business_id: string
  image_url: string
}

export interface PublishResponse {
  post_id: number | string
  instagram_post_id: string
  container_id: string
  status: string
}

export interface RawSocialConnection {
  account_id?: string | number
  id?: string | number
  business_profile_id?: string
  business_id?: number | string
  platform: string
  handle?: string
  account_url?: string
  connected_status: string | boolean
  instagram_user_id?: string
  facebook_page_id?: string
  created_at?: string
}

export class MarketingAIError extends Error {
  status: number
  endpoint: string
  constructor(message: string, status: number, endpoint: string) {
    super(message)
    this.name = 'MarketingAIError'
    this.status = status
    this.endpoint = endpoint
  }
}

async function fetchWithRetry<T>(
  path: string,
  options: RequestInit,
  opts?: { retries?: number; timeoutMs?: number }
): Promise<T> {
  const retries = opts?.retries ?? MAX_RETRIES
  const timeoutMs = opts?.timeoutMs ?? DEFAULT_TIMEOUT
  const url = `${getApiUrl()}${path}`
  let lastError: Error | null = null

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)

      const response = await fetch(url, {
        ...options,
        headers: {
          ...backendAuthHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new MarketingAIError(
          `MarketMe-AI error: ${response.status} ${errorText}`,
          response.status,
          path
        )
      }

      return (await response.json()) as T
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (error instanceof MarketingAIError && error.status >= 400 && error.status < 500) {
        throw error
      }

      if (attempt < retries - 1) {
        const delay = RETRY_BASE_DELAY * Math.pow(2, attempt) + Math.random() * 500
        console.warn(
          `[marketing-ai] Retry ${attempt + 1}/${retries} for ${path} after ${Math.round(delay)}ms`
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${path} after ${retries} retries`)
}

export function newAiRequestMetadata(
  partial?: Partial<AIRequestMetadata>
): AIRequestMetadata {
  return {
    request_id: crypto.randomUUID(),
    prompt_version: partial?.prompt_version ?? 'v1',
    business_id: partial?.business_id ?? null,
    strategy_id: partial?.strategy_id ?? null,
    content_idea_id: partial?.content_idea_id ?? null,
  }
}

export async function healthCheck(): Promise<{ status: string }> {
  return fetchWithRetry('/api/v1/health', { method: 'GET' }, { retries: 1, timeoutMs: 15_000 })
}

export async function generateStrategy(input: {
  business: BusinessStrategyContext
  options?: StrategyGenerationOptions
}): Promise<GenerateStrategyResponse> {
  return fetchWithRetry(
    '/api/v1/strategy/generate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business: input.business,
        options: input.options ?? {},
      }),
    },
    { timeoutMs: GENERATION_TIMEOUT }
  )
}

export async function generateSchedule(input: {
  business: BusinessStrategyContext
  strategy_id: number
  strategy: Record<string, unknown>
  options: ScheduleGenerationOptions
  events?: unknown[]
  metadata?: AIRequestMetadata
}): Promise<GenerateScheduleResponse> {
  return fetchWithRetry(
    '/api/v1/schedules/generate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metadata:
          input.metadata ??
          newAiRequestMetadata({
            business_id: input.business.business_id,
            strategy_id: input.strategy_id,
            prompt_version: 'schedule-v1',
          }),
        business: input.business,
        strategy_id: input.strategy_id,
        strategy: input.strategy,
        events: input.events ?? [],
        options: input.options,
      }),
    },
    { timeoutMs: GENERATION_TIMEOUT }
  )
}

export async function generatePost(input: {
  business: BusinessPostContext
  strategy: StrategyPostContext
  options: PostGenerationOptions
  account?: SocialAccountPostContext | null
  idea?: ContentIdeaPostContext | null
  schedule?: ContentSchedulePostContext | null
}): Promise<GeneratePostResponse> {
  return fetchWithRetry(
    '/api/v1/posts/generate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business: input.business,
        strategy: input.strategy,
        account: input.account ?? null,
        idea: input.idea ?? null,
        schedule: input.schedule ?? null,
        options: input.options,
      }),
    },
    { timeoutMs: GENERATION_TIMEOUT }
  )
}

/** @deprecated Prefer generatePost — kept name for older call sites. */
export async function generatePosts(input: {
  business: BusinessPostContext
  strategy: StrategyPostContext
  options: PostGenerationOptions
  account?: SocialAccountPostContext | null
  idea?: ContentIdeaPostContext | null
  schedule?: ContentSchedulePostContext | null
}): Promise<GeneratePostResponse> {
  return generatePost(input)
}

export async function generateCreative(input: {
  business: BusinessCreativeContext
  post: PostCreativeContext
  options?: CreativeBriefGenerationOptions
  metadata?: AIRequestMetadata
}): Promise<GenerateCreativeBriefResponse> {
  return fetchWithRetry(
    '/api/v1/creative/generate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metadata:
          input.metadata ??
          newAiRequestMetadata({
            business_id: input.business.business_id,
            prompt_version: 'creative-v1',
          }),
        business: input.business,
        post: input.post,
        options: input.options ?? {},
      }),
    },
    { timeoutMs: GENERATION_TIMEOUT }
  )
}

/**
 * JSON auth-url helper (legacy). Prefer getMetaOAuthStartUrl / getInstagramOAuthUrl
 * which pass business_profile_id (UUID).
 */
export async function getPublishAuthUrl(businessProfileId: string): Promise<string> {
  const normalizedProfileId = normalizeBusinessProfileId(businessProfileId)
  const params = new URLSearchParams({
    business_profile_id: normalizedProfileId,
  })
  const data = await fetchWithRetry<{ auth_url: string }>(
    `/api/v1/publish/auth-url?${params.toString()}`,
    { method: 'GET' }
  )
  return data.auth_url
}

/**
 * Preferred Instagram OAuth entry: MarketMe AI `/auth/meta/login` issues a signed
 * `state` and 307s to Facebook. Redirect the browser here (do not server-fetch it).
 * Must use business_profiles.id UUID — not a hashed numeric id.
 */
export function getMetaOAuthStartUrl(businessProfileId: string): string {
  const normalizedProfileId = normalizeBusinessProfileId(businessProfileId)
  const params = new URLSearchParams({
    business_profile_id: normalizedProfileId,
  })
  return `${getApiUrl()}/api/v1/auth/meta/login?${params.toString()}`
}

/**
 * Resolve an Instagram OAuth URL. Prefer Meta login (signed state); fall back to
 * publish/auth-url JSON if meta login is unavailable.
 */
export async function getInstagramOAuthUrl(businessProfileId: string): Promise<string> {
  const metaUrl = getMetaOAuthStartUrl(businessProfileId)
  try {
    // Probe that the backend is up; do not follow the 307 to Facebook from the server.
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)
    const res = await fetch(metaUrl, {
      method: 'GET',
      redirect: 'manual',
      headers: backendAuthHeaders(),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    // 307/302 to Facebook, or 200 with a body — either means the start URL is usable.
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location')
      if (location?.includes('facebook.com') || location?.includes('instagram.com')) {
        return location
      }
      // Backend bounced to its own login handler — send the browser to metaUrl.
      return metaUrl
    }
    if (res.ok) {
      return metaUrl
    }
  } catch (err) {
    console.warn('[marketing-ai] Meta login probe failed, falling back to auth-url:', err)
  }

  return getPublishAuthUrl(businessProfileId)
}

/**
 * Fetch connected social accounts for a business profile UUID.
 */
export async function getSocialConnections(
  businessProfileId: string
): Promise<RawSocialConnection[]> {
  const normalizedProfileId = normalizeBusinessProfileId(businessProfileId)
  const params = new URLSearchParams({
    business_profile_id: normalizedProfileId,
  })
  return fetchWithRetry<RawSocialConnection[]>(
    `/api/v1/publish/connections?${params.toString()}`,
    { method: 'GET' }
  )
}

export async function publishToInstagram(input: PublishRequest): Promise<PublishResponse> {
  return fetchWithRetry('/api/v1/publish/instagram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function flattenHashtags(
  hashtags: GeneratedPostContent['hashtags'] | undefined
): string[] {
  if (!hashtags?.length) return []
  return hashtags
    .map((h) => {
      if (typeof h === 'string') return h.replace(/^#/, '').trim()
      const tag = (h.tag ?? h.hashtag ?? '') as string
      return String(tag).replace(/^#/, '').trim()
    })
    .filter(Boolean)
}

export function hashtagsToCaptionString(hashtags: string[]): string {
  return hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')
}
