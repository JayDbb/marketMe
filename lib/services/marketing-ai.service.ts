/**
 * Typed HTTP client for the MarketMe AI FastAPI backend.
 *
 * Canonical application mappings:
 * - Business → business_profiles
 * - Content Schedule → content_plans
 * - Post → posts
 * - System templates → canvas_template
 * - User templates → studio_templates
 *
 * New generation flows should use the pipeline methods:
 * - startContentGeneration
 * - getContentGenerationStatus
 * - getPostsForGeneration
 * - reviseGeneratedPost
 *
 * The legacy direct generation methods remain temporarily so the existing
 * frontend continues compiling while the backend pipeline is migrated.
 */

const API_URL = (
  process.env.NEXT_PUBLIC_MARKETME_AI_API_URL ||
  process.env.MARKETME_AI_API_URL ||
  "https://marketme-api-9oap.onrender.com"
).replace(/\/+$/, "")

const DEFAULT_TIMEOUT = 60_000
const MAX_RETRIES = 3
const RETRY_BASE_DELAY = 1_000
const GENERATION_TIMEOUT = 180_000


// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "x"
  | "tiktok"

export type TemplateSource =
  | "ai"
  | "studio"

export type PipelineStage =
  | "business_profile_intake"
  | "marketing_strategy_generation"
  | "content_schedule_generation"
  | "post_generation"
  | "creative_brief_generation"
  | "image_generation"
  | "publishing"

export type GenerationRunStatus =
  | "queued"
  | "running"
  | "complete"
  | "completed"
  | "failed"

export type PostStatus =
  | "draft"
  | "approved"
  | "scheduled"
  | "published"
  | "failed"
  | "rejected"



export type ContentObjective =
  | "awareness"
  | "engagement"
  | "education"
  | "leads"
  | "sales"
  | "retention"

export type ContentType =
  | "promotional"
  | "educational"
  | "engagement"
  | "announcement"
  | "testimonial"
  | "behind_the_scenes"
  | "product_showcase"
  | "service_showcase"
  | "event"
  | "brand_story"

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
  | "current_marketing_channels"
  | "business_strengths"
  | "business_challenges"
  | "existing_audience"
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
  timeframe?: "weekly" | "monthly" | "quarterly" | "annual"
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
  desired_length?: "short" | "medium" | "long"
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


// ---------------------------------------------------------------------------
// New pipeline request and response types
// ---------------------------------------------------------------------------

export interface StartContentGenerationRequest {
  /**
   * UUID from public.business_profiles.id.
   */
  business_profile_id: string

  goal: string
  platform: SocialPlatform
  number_of_posts: number

  tone?: string
  topic?: string
  start_date?: string
  end_date?: string

  template_source: TemplateSource

  /**
   * UUID from studio_templates.id.
   * Required when template_source is "studio".
   */
  studio_template_id?: string
}

export interface StartContentGenerationResponse {
  generation_id: string
  status: GenerationRunStatus
  stage?: PipelineStage
  message?: string
}

export interface GenerationStatusResponse {
  generation_id: string
  business_profile_id?: string | null
  content_plan_id?: string | null

  stage: PipelineStage
  status: GenerationRunStatus
  progress: number

  message?: string | null
  status_message?: string | null

  post_ids: string[]

  error?: string | null
  error_message?: string | null

  created_at?: string
  completed_at?: string | null
}

export interface PipelineCreativeBrief {
  brief_id?: string
  post_id?: string
  layout_description?: string | null
  color_palette?: unknown
  typography?: unknown
  visual_hierarchy?: unknown
  asset_requirements?: unknown
  ai_model?: string | null
  generated_at?: string | null
}

export interface PipelineGeneratedAsset {
  asset_id?: string
  post_id?: string
  asset_type?: string | null
  file_url?: string | null
  prompt?: string | null
  ai_model?: string | null
  template_id?: number | null
  studio_template_id?: string | null
  metadata?: Record<string, unknown> | null
  status?: string | null
  created_at?: string | null
}

export interface GeneratedPipelinePost {
  id: string

  business_profile_id: string
  content_plan_id?: string | null
  generation_id?: string | null
  strategy_id?: string | null
  account_id?: string | null
  idea_id?: string | null

  user_id: string
  platform: string
  post_type?: string | null

  title?: string | null
  content?: string | null
  caption?: string | null
  hashtags?: string[] | null
  call_to_action?: string | null

  image_prompt?: string | null
  image_url?: string | null

  scheduled_at?: string | null
  status: PostStatus

  canvas_data?: Record<string, unknown> | null
  template_id?: string | null
  canvas_template_id?: number | null

  approved_at?: string | null
  approved_by?: string | null
  ai_model?: string | null

  created_at?: string
  updated_at?: string

  creative_brief?: PipelineCreativeBrief | null
  generated_assets?: PipelineGeneratedAsset[]
}

export interface ReviseGeneratedPostRequest {
  instruction: string
  caption?: string
  tone?: string
}

export interface ReviseGeneratedPostResponse {
  post_id: string
  caption: string
  hashtags?: string[]
  call_to_action?: string | null
  updated_at?: string
}


// ---------------------------------------------------------------------------
// Temporary legacy request and response types
// ---------------------------------------------------------------------------

/**
 * @deprecated Use StartContentGenerationRequest for the main generation flow.
 */
export interface StrategyRequest {
  business_profile_id?: string
  business_id?: string | number

  business_name?: string
  industry?: string
  business_type?: string
  target_audience?: string
  goals?: string
  budget_range?: string
  platforms?: string[]

  strategy_name?: string
  strategy_type?: string
  status?: string
  ai_model?: string

  location?: string
  description?: string
  summary?: string
  tone?: string

  products_or_services?: string[]
}

/**
 * @deprecated Used by the older direct strategy endpoint.
 */
export interface StrategyResponse {
  strategy_id: string | number | null
  strategy: Record<string, unknown>
  generated?: Record<string, unknown>
  raw_ai_output?: string
}

/**
 * @deprecated Use StartContentGenerationRequest for the main generation flow.
 */
export interface PostGenerateRequest {
  strategy_id: string | number

  business_profile_id?: string
  business_id?: string | number

  business_name?: string
  industry?: string
  business_type?: string
  target_audience?: string

  goal?: string
  topic?: string
  platform?: string
  num_posts?: number
  tone?: string

  account_id?: string | number
  idea_id?: string | number
  schedule_id?: string | number

  ai_model?: string
  strategy_name?: string
}

/**
 * @deprecated Used by the older direct posts endpoint.
 */
export interface GeneratedPost {
  title?: string
  caption: string
  hashtags: string[]
  suggested_media_prompt: string
  suggested_day?: string
  call_to_action?: string
  content_type?: string
  post_goal?: string
}

/**
 * @deprecated Used by the older direct posts endpoint.
 */
export interface PostGenerateResponse {
  strategy_id: string | number
  posts: GeneratedPost[]
  post_id?: string | number | null
}

/**
 * @deprecated Use the pipeline creative-brief stage.
 */
export interface CreativeGenerateRequest {
  post_id: string | number

  business_profile_id?: string
  business_id?: string | number

  business_name?: string
  industry?: string
  caption?: string
  image_prompt?: string
  style_hint?: string
  ai_model?: string
}

/**
 * @deprecated Use PipelineCreativeBrief.
 */
export interface CreativeGenerateResponse {
  brief_id: string | number | null
  layout_description: string
  color_palette: string
  typography: string
  asset_requirements: string
  refined_prompt: string
  status: string
}


// ---------------------------------------------------------------------------
// Publishing and social connection types
// ---------------------------------------------------------------------------

export interface PublishRequest {
  post_id: string
  business_profile_id?: string

  /**
   * Temporary compatibility field.
   * New code should send business_profile_id.
   */
  business_id?: string

  image_url: string
}

export interface PublishResponse {
  post_id: string
  instagram_post_id: string
  container_id: string
  status: string
}

export interface RawSocialConnection {
  account_id?: string | number
  id?: string | number

  business_profile_id: string

  platform: string
  handle?: string
  account_url?: string
  connected_status: string | boolean

  instagram_user_id?: string
  facebook_page_id?: string

  created_at?: string
  updated_at?: string
}

/**
 * Supports both canonical database names and temporary frontend aliases.
 */
export interface PostRecord {
  id?: string
  post_id?: string

  business_profile_id?: string
  business_id?: string

  content_plan_id?: string
  generation_id?: string

  account_id?: string
  platform?: string
  post_type?: string

  title?: string
  content?: string
  caption?: string
  hashtags?: string[]
  call_to_action?: string

  image_prompt?: string

  image_url?: string
  media_url?: string

  scheduled_at?: string
  scheduled_date?: string

  status?: string
  ai_model?: string

  created_at?: string
  updated_at?: string
}


// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

export class MarketingAIError extends Error {
  status: number
  endpoint: string
  responseBody?: string

  constructor(
    message: string,
    status: number,
    endpoint: string,
    responseBody?: string
  ) {
    super(message)

    this.name = "MarketingAIError"
    this.status = status
    this.endpoint = endpoint
    this.responseBody = responseBody
  }
}


// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function normalizeRequiredId(
  value: string | number | undefined | null,
  label: string
): string {
  const normalized = String(value ?? "").trim()

  if (!normalized) {
    throw new Error(`${label} is required.`)
  }

  return normalized
}

function normalizePlatform(
  value?: string
): SocialPlatform {
  const normalized = value
    ?.trim()
    .toLowerCase()

  switch (normalized) {
    case "facebook":
      return "facebook"

    case "linkedin":
      return "linkedin"

    case "x":
    case "twitter":
    case "twitter / x":
      return "x"

    case "tiktok":
      return "tiktok"

    case "instagram":
    default:
      return "instagram"
  }
}

function createRequestId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID()
  }

  return "00000000-0000-0000-0000-000000000001"
}

/**
 * Temporary compatibility helper for backend endpoints that still require
 * positive integer IDs.
 *
 * New pipeline code must never use this function.
 *
 * @deprecated Remove after the FastAPI legacy schemas are migrated to UUIDs.
 */
export function toNumericId(
  id: string | number | undefined | null
): number {
  if (
    typeof id === "number" &&
    Number.isInteger(id) &&
    id > 0
  ) {
    return id
  }

  if (typeof id === "string") {
    const trimmed = id.trim()
    const parsed = Number.parseInt(trimmed, 10)

    if (
      Number.isInteger(parsed) &&
      parsed > 0 &&
      String(parsed) === trimmed
    ) {
      return parsed
    }

    let hash = 0

    for (
      let index = 0;
      index < trimmed.length;
      index += 1
    ) {
      hash =
        (hash << 5) -
        hash +
        trimmed.charCodeAt(index)

      hash |= 0
    }

    return Math.abs(hash) || 1
  }

  return 1
}

type FetchRetryOptions = {
  retries?: number
  timeoutMs?: number
}

async function fetchWithRetry<T>(
  path: string,
  options: RequestInit = {},
  retryOptions: number | FetchRetryOptions = MAX_RETRIES
): Promise<T> {
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`

  const url = `${API_URL}${normalizedPath}`

  const retries =
    typeof retryOptions === "number"
      ? retryOptions
      : retryOptions.retries ?? MAX_RETRIES

  const timeoutMs =
    typeof retryOptions === "number"
      ? DEFAULT_TIMEOUT
      : retryOptions.timeoutMs ?? DEFAULT_TIMEOUT

  let lastError: Error | null = null

  for (
    let attempt = 0;
    attempt < retries;
    attempt += 1
  ) {
    const controller =
      new AbortController()

    const timeout = setTimeout(() => {
      controller.abort()
    }, timeoutMs)

    try {
      const response = await fetch(url, {
        ...options,
        cache:
          options.cache ??
          "no-store",
        signal: controller.signal,
      })

      if (!response.ok) {
        const responseBody =
          await response
            .text()
            .catch(() => "")

        throw new MarketingAIError(
          responseBody
            ? `MarketMe AI error ${response.status}: ${responseBody}`
            : `MarketMe AI request failed with status ${response.status}.`,
          response.status,
          normalizedPath,
          responseBody
        )
      }

      if (response.status === 204) {
        return undefined as T
      }

      return await response.json() as T
    } catch (caughtError) {
      const error =
        caughtError instanceof Error
          ? caughtError
          : new Error(
            String(caughtError)
          )

      lastError = error

      if (
        error instanceof MarketingAIError &&
        error.status >= 400 &&
        error.status < 500
      ) {
        throw error
      }

      if (
        attempt <
        retries - 1
      ) {
        const delay =
          RETRY_BASE_DELAY *
          Math.pow(2, attempt) +
          Math.random() * 500

        console.warn(
          `[marketing-ai] Retry ${attempt + 1}/${retries} ` +
          `for ${normalizedPath} after ${Math.round(delay)}ms`
        )

        await new Promise<void>(
          (resolve) => {
            setTimeout(resolve, delay)
          }
        )
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  throw (
    lastError ??
    new Error(
      `Failed to fetch ${normalizedPath} after ${retries} attempts.`
    )
  )
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export async function healthCheck():
  Promise<{ status: string }> {
  return fetchWithRetry(
    "/api/v1/health",
    {
      method: "GET",
    },
    1
  )
}


export function newAiRequestMetadata(
  partial?: Partial<AIRequestMetadata>
): AIRequestMetadata {
  return {
    request_id: createRequestId(),
    prompt_version: partial?.prompt_version ?? "v1",
    business_id: partial?.business_id ?? null,
    strategy_id: partial?.strategy_id ?? null,
    content_idea_id: partial?.content_idea_id ?? null,
  }
}


// ---------------------------------------------------------------------------
// Canonical pipeline methods
// ---------------------------------------------------------------------------

/**
 * Start one complete MarketMe generation run.
 *
 * Expected backend flow:
 * business_profiles
 * → marketing_strategy
 * → content_plans
 * → posts
 * → creative_brief
 * → generated_asset
 */
export async function startContentGeneration(
  input: StartContentGenerationRequest
): Promise<StartContentGenerationResponse> {
  const businessProfileId =
    normalizeRequiredId(
      input.business_profile_id,
      "Business profile ID"
    )

  const goal = input.goal.trim()

  if (!goal) {
    throw new Error(
      "A generation goal is required."
    )
  }

  if (
    !Number.isInteger(
      input.number_of_posts
    ) ||
    input.number_of_posts < 1 ||
    input.number_of_posts > 30
  ) {
    throw new Error(
      "Number of posts must be between 1 and 30."
    )
  }

  if (
    input.template_source === "studio" &&
    !input.studio_template_id?.trim()
  ) {
    throw new Error(
      "A Studio template must be selected."
    )
  }

  const payload = {
    business_profile_id:
      businessProfileId,

    goal,
    platform:
      normalizePlatform(
        input.platform
      ),

    number_of_posts:
      input.number_of_posts,

    template_source:
      input.template_source,

    ...(input.tone?.trim()
      ? {
        tone:
          input.tone.trim(),
      }
      : {}),

    ...(input.topic?.trim()
      ? {
        topic:
          input.topic.trim(),
      }
      : {}),

    ...(input.start_date
      ? {
        start_date:
          input.start_date,
      }
      : {}),

    ...(input.end_date
      ? {
        end_date:
          input.end_date,
      }
      : {}),

    ...(input.studio_template_id?.trim()
      ? {
        studio_template_id:
          input.studio_template_id.trim(),
      }
      : {}),
  }

  const response =
    await fetchWithRetry<{
      id?: string
      generation_id?: string
      status?: GenerationRunStatus
      stage?: PipelineStage
      message?: string
      status_message?: string
    }>(
      "/api/v1/pipeline/generations",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          payload
        ),
      }
    )

  const generationId =
    response.generation_id ??
    response.id

  if (!generationId) {
    throw new Error(
      "The pipeline did not return a generation ID."
    )
  }

  return {
    generation_id:
      generationId,

    status:
      response.status ??
      "queued",

    stage:
      response.stage,

    message:
      response.message ??
      response.status_message,
  }
}


/**
 * Read the current status of one generation run.
 */
export async function getContentGenerationStatus(
  generationId: string
): Promise<GenerationStatusResponse> {
  const normalizedGenerationId =
    normalizeRequiredId(
      generationId,
      "Generation ID"
    )

  const response =
    await fetchWithRetry<{
      id?: string
      generation_id?: string
      business_profile_id?: string | null
      content_plan_id?: string | null

      stage?: PipelineStage
      status?: GenerationRunStatus
      progress?: number

      message?: string | null
      status_message?: string | null

      post_ids?: string[]
      output_ref?: {
        post_ids?: string[]
      } | null

      error?: string | null
      error_message?: string | null

      created_at?: string
      completed_at?: string | null
    }>(
      `/api/v1/pipeline/generations/${encodeURIComponent(
        normalizedGenerationId
      )}`,
      {
        method: "GET",
      }
    )

  return {
    generation_id:
      response.generation_id ??
      response.id ??
      normalizedGenerationId,

    business_profile_id:
      response.business_profile_id,

    content_plan_id:
      response.content_plan_id,

    stage:
      response.stage ??
      "business_profile_intake",

    status:
      response.status ??
      "queued",

    progress:
      Math.max(
        0,
        Math.min(
          100,
          response.progress ?? 0
        )
      ),

    message:
      response.message,

    status_message:
      response.status_message,

    post_ids:
      response.post_ids ??
      response.output_ref?.post_ids ??
      [],

    error:
      response.error,

    error_message:
      response.error_message,

    created_at:
      response.created_at,

    completed_at:
      response.completed_at,
  }
}


/**
 * Fetch all canonical posts created by one generation run.
 */
export async function getPostsForGeneration(
  generationId: string
): Promise<GeneratedPipelinePost[]> {
  const normalizedGenerationId =
    normalizeRequiredId(
      generationId,
      "Generation ID"
    )

  const response =
    await fetchWithRetry<
      | GeneratedPipelinePost[]
      | {
        posts:
        GeneratedPipelinePost[]
      }
    >(
      `/api/v1/pipeline/generations/${encodeURIComponent(
        normalizedGenerationId
      )}/posts`,
      {
        method: "GET",
      }
    )

  return Array.isArray(response)
    ? response
    : response.posts
}


/**
 * Ask Claude to revise one generated caption and persist the result.
 */
export async function reviseGeneratedPost(
  postId: string,
  input: ReviseGeneratedPostRequest
): Promise<ReviseGeneratedPostResponse> {
  const normalizedPostId =
    normalizeRequiredId(
      postId,
      "Post ID"
    )

  const instruction =
    input.instruction.trim()

  if (!instruction) {
    throw new Error(
      "A revision instruction is required."
    )
  }

  return fetchWithRetry(
    `/api/v1/pipeline/posts/${encodeURIComponent(
      normalizedPostId
    )}/revise`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        instruction,

        ...(input.caption?.trim()
          ? {
            caption:
              input.caption.trim(),
          }
          : {}),

        ...(input.tone?.trim()
          ? {
            tone:
              input.tone.trim(),
          }
          : {}),
      }),
    }
  )
}


// ---------------------------------------------------------------------------
// Direct AI compatibility methods
// ---------------------------------------------------------------------------

export async function generateStrategy(input: {
  business: BusinessStrategyContext
  options?: StrategyGenerationOptions
}): Promise<GenerateStrategyResponse> {
  return fetchWithRetry(
    "/api/v1/strategy/generate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        business: input.business,
        options: input.options ?? {},
      }),
    },
    {
      timeoutMs: GENERATION_TIMEOUT,
    }
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
    "/api/v1/schedules/generate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metadata:
          input.metadata ??
          newAiRequestMetadata({
            business_id: input.business.business_id,
            strategy_id: input.strategy_id,
            prompt_version: "schedule-v1",
          }),
        business: input.business,
        strategy_id: input.strategy_id,
        strategy: input.strategy,
        events: input.events ?? [],
        options: input.options,
      }),
    },
    {
      timeoutMs: GENERATION_TIMEOUT,
    }
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
    "/api/v1/posts/generate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        business: input.business,
        strategy: input.strategy,
        account: input.account ?? null,
        idea: input.idea ?? null,
        schedule: input.schedule ?? null,
        options: input.options,
      }),
    },
    {
      timeoutMs: GENERATION_TIMEOUT,
    }
  )
}

/**
 * Compatibility alias for older callers.
 */
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
    "/api/v1/creative/generate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metadata:
          input.metadata ??
          newAiRequestMetadata({
            business_id: input.business.business_id,
            prompt_version: "creative-v1",
          }),
        business: input.business,
        post: input.post,
        options: input.options ?? {},
      }),
    },
    {
      timeoutMs: GENERATION_TIMEOUT,
    }
  )
}

/**
 * Temporary list endpoint.
 *
 * The Review Content screen should use getPostsForGeneration for pipeline runs.
 */
export async function listPosts(
  businessProfileId: string,
  status?: string,
  limit?: number
): Promise<PostRecord[]> {
  const normalizedProfileId =
    normalizeRequiredId(
      businessProfileId,
      "Business profile ID"
    )

  const params =
    new URLSearchParams({
      business_profile_id:
        normalizedProfileId,
    })

  if (status) {
    params.set(
      "status",
      status
    )
  }

  if (limit) {
    params.set(
      "limit",
      String(limit)
    )
  }

  return fetchWithRetry(
    `/api/v1/posts?${params.toString()}`,
    {
      method: "GET",
    }
  )
}


// ---------------------------------------------------------------------------
// Meta OAuth and social connections
// ---------------------------------------------------------------------------

/**
 * Return the backend Meta OAuth login URL.
 *
 * This URL must be navigated to in the browser. It should not be fetched
 * through fetchWithRetry because the endpoint redirects to Facebook.
 */
export async function getPublishAuthUrl(
  businessProfileId: string
): Promise<string> {
  const normalizedProfileId =
    normalizeRequiredId(
      businessProfileId,
      "Business profile ID"
    )

  const params =
    new URLSearchParams({
      business_profile_id:
        normalizedProfileId,
    })

  // Hint preferred return path when the AI API supports it (ignored if not).
  params.set("return_path", "/dashboard/connections")
  params.set("redirect_path", "/dashboard/connections")
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    ""
  ).replace(/\/+$/, "")
  if (appUrl) {
    params.set("frontend_url", appUrl)
  }

  return (
    `${API_URL}/api/v1/auth/meta/login?` +
    params.toString()
  )
}

export async function getInstagramOAuthUrl(
  businessProfileId: string
): Promise<string> {
  return getPublishAuthUrl(businessProfileId)
}


/**
 * Fetch connected accounts belonging to one business profile.
 */
export async function getSocialConnections(
  businessProfileId: string
): Promise<RawSocialConnection[]> {
  const normalizedProfileId =
    normalizeRequiredId(
      businessProfileId,
      "Business profile ID"
    )

  const params =
    new URLSearchParams({
      business_profile_id:
        normalizedProfileId,
    })

  return fetchWithRetry(
    `/api/v1/publish/connections?${params.toString()}`,
    {
      method: "GET",
    }
  )
}


/**
 * Publish one approved post to Instagram.
 */
export async function publishToInstagram(
  input: PublishRequest,
  retryOptions?: FetchRetryOptions
): Promise<PublishResponse> {
  const businessProfileId =
    normalizeRequiredId(
      input.business_profile_id ??
      input.business_id,
      "Business profile ID"
    )

  const postId =
    normalizeRequiredId(
      input.post_id,
      "Post ID"
    )

  const imageUrl =
    input.image_url.trim()

  if (!imageUrl) {
    throw new Error(
      "An image URL is required."
    )
  }

  return fetchWithRetry(
    "/api/v1/publish/instagram",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        post_id:
          postId,

        business_profile_id:
          businessProfileId,

        image_url:
          imageUrl,
      }),
    },
    retryOptions ?? { retries: MAX_RETRIES, timeoutMs: DEFAULT_TIMEOUT }
  )
}

/**
 * Fetch Instagram inbox items (DMs / mentions / comments) for a business profile.
 * Tries publish inbox first, then generic inbox path (MarketMe AI may expose either).
 */
export async function getInboxMessages(
  businessProfileId: string,
  options?: { platform?: string }
): Promise<unknown> {
  const normalizedProfileId = normalizeRequiredId(
    businessProfileId,
    "Business profile ID"
  )
  const params = new URLSearchParams({
    business_profile_id: normalizedProfileId,
  })
  if (options?.platform) {
    params.set("platform", options.platform)
  }

  const paths = [
    `/api/v1/inbox/messages?${params.toString()}`,
    `/api/v1/publish/inbox?${params.toString()}`,
  ]

  try {
    return await Promise.any(
      paths.map((path) =>
        fetchWithRetry(path, { method: "GET" }, { retries: 1, timeoutMs: 10_000 })
      )
    )
  } catch (error) {
    const aggregate = error as AggregateError
    const first =
      Array.isArray(aggregate?.errors) && aggregate.errors[0] instanceof Error
        ? aggregate.errors[0]
        : error instanceof Error
          ? error
          : new Error(String(error))

    if (first instanceof MarketingAIError) throw first

    throw new MarketingAIError(
      first.message || "Inbox endpoint is not available on MarketMe AI yet.",
      502,
      paths[0]
    )
  }
}

async function postInboxReplyJson(
  path: string,
  payload: Record<string, unknown>
): Promise<unknown> {
  try {
    return await fetchWithRetry(
      path,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      { retries: 1, timeoutMs: 25_000 }
    )
  } catch (error) {
    if (
      error instanceof MarketingAIError &&
      error.status === 422 &&
      "recipient_id" in payload
    ) {
      const { recipient_id: _recipientId, ...base } = payload
      return await fetchWithRetry(
        path,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(base),
        },
        { retries: 1, timeoutMs: 25_000 }
      )
    }
    throw error
  }
}

export async function replyToInboxMessageAi(input: {
  businessProfileId: string
  messageId: string
  body: string
  recipientId?: string
}): Promise<unknown> {
  const businessProfileId = normalizeRequiredId(
    input.businessProfileId,
    "Business profile ID"
  )
  const messageId = normalizeRequiredId(input.messageId, "Message ID")
  const body = input.body.trim()
  if (!body) throw new Error("Reply body is required.")

  const recipientId = input.recipientId?.trim()
  const inboxPayload = {
    business_profile_id: businessProfileId,
    body,
    ...(recipientId ? { recipient_id: recipientId } : {}),
  }

  const paths = [
    {
      path: `/api/v1/inbox/messages/${encodeURIComponent(messageId)}/reply`,
      body: inboxPayload,
    },
    {
      path: `/api/v1/publish/inbox/${encodeURIComponent(messageId)}/reply`,
      body: { ...inboxPayload, message_id: messageId },
    },
  ]

  let lastError: Error | null = null
  for (const candidate of paths) {
    try {
      return await postInboxReplyJson(candidate.path, candidate.body)
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error(String(error))
      if (error instanceof MarketingAIError && error.status === 404) {
        continue
      }
      throw error
    }
  }

  throw (
    lastError ??
    new MarketingAIError("Inbox reply endpoint is not available.", 404, paths[0].path)
  )
}

export async function markInboxMessageReadAi(input: {
  businessProfileId: string
  messageId: string
}): Promise<unknown> {
  const businessProfileId = normalizeRequiredId(
    input.businessProfileId,
    "Business profile ID"
  )
  const messageId = normalizeRequiredId(input.messageId, "Message ID")

  const paths = [
    `/api/v1/inbox/messages/${encodeURIComponent(messageId)}`,
    `/api/v1/publish/inbox/${encodeURIComponent(messageId)}`,
  ]

  let lastError: Error | null = null
  for (const path of paths) {
    try {
      return await fetchWithRetry(path, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          path.startsWith("/api/v1/inbox/")
            ? { business_profile_id: businessProfileId }
            : { business_profile_id: businessProfileId, status: "read" }
        ),
      }, { retries: 1, timeoutMs: 15_000 })
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error(String(error))
      if (error instanceof MarketingAIError && error.status === 404) {
        continue
      }
      throw error
    }
  }

  throw (
    lastError ??
    new MarketingAIError("Inbox mark-read endpoint is not available.", 404, paths[0])
  )
}

/**
 * List Instagram inbox conversations/threads for a business profile.
 * GET /api/v1/inbox/conversations
 */
export async function getInboxConversations(
  businessProfileId: string,
  options?: { platform?: string }
): Promise<unknown> {
  const normalizedProfileId = normalizeRequiredId(
    businessProfileId,
    "Business profile ID"
  )
  const params = new URLSearchParams({
    business_profile_id: normalizedProfileId,
  })
  if (options?.platform) {
    params.set("platform", options.platform)
  }

  return fetchWithRetry(
    `/api/v1/inbox/conversations?${params.toString()}`,
    { method: "GET" },
    { retries: 1, timeoutMs: 10_000 }
  )
}

/**
 * Fetch one conversation thread, including messages.
 * GET /api/v1/inbox/conversations/{conversation_id}
 */
export async function getInboxConversation(
  businessProfileId: string,
  conversationId: string
): Promise<unknown> {
  const normalizedProfileId = normalizeRequiredId(
    businessProfileId,
    "Business profile ID"
  )
  const id = normalizeRequiredId(conversationId, "Conversation ID")
  const params = new URLSearchParams({
    business_profile_id: normalizedProfileId,
  })

  return fetchWithRetry(
    `/api/v1/inbox/conversations/${encodeURIComponent(id)}?${params.toString()}`,
    { method: "GET" },
    { retries: 1, timeoutMs: 15_000 }
  )
}

export async function replyToInboxConversationAi(input: {
  businessProfileId: string
  conversationId: string
  body: string
  recipientId?: string
}): Promise<unknown> {
  const businessProfileId = normalizeRequiredId(
    input.businessProfileId,
    "Business profile ID"
  )
  const conversationId = normalizeRequiredId(
    input.conversationId,
    "Conversation ID"
  )
  const body = input.body.trim()
  if (!body) throw new Error("Reply body is required.")
  const recipientId = input.recipientId?.trim()

  return postInboxReplyJson(
    `/api/v1/inbox/conversations/${encodeURIComponent(conversationId)}/reply`,
    {
      business_profile_id: businessProfileId,
      body,
      ...(recipientId ? { recipient_id: recipientId } : {}),
    }
  )
}

/**
 * Fetch Instagram Graph insights for a connected business profile.
 * Implemented on MarketMe AI as GET /api/v1/publish/insights (teammate / Render).
 * Frontend treats 404 as "not enabled yet".
 */
export async function getPublishInsights(
  businessProfileId: string,
  options?: { platform?: string; periodDays?: number }
): Promise<unknown> {
  const normalizedProfileId = normalizeRequiredId(
    businessProfileId,
    "Business profile ID"
  )
  const params = new URLSearchParams({
    business_profile_id: normalizedProfileId,
  })
  if (options?.platform) {
    params.set("platform", options.platform)
  }
  if (options?.periodDays && Number.isFinite(options.periodDays)) {
    params.set("period_days", String(Math.round(options.periodDays)))
  }

  const paths = [
    `/api/v1/publish/insights?${params.toString()}`,
    `/api/v1/insights?${params.toString()}`,
  ]

  let lastError: Error | null = null
  for (const path of paths) {
    try {
      return await fetchWithRetry(
        path,
        { method: "GET" },
        { retries: 1, timeoutMs: 20_000 }
      )
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error(String(error))
      if (error instanceof MarketingAIError && error.status === 404) {
        continue
      }
      throw error
    }
  }

  throw (
    lastError ??
    new MarketingAIError(
      "Publish insights endpoint is not available on MarketMe AI yet.",
      404,
      paths[0]
    )
  )
}

export function flattenHashtags(
  hashtags: GeneratedPostContent["hashtags"] | undefined
): string[] {
  if (!hashtags?.length) {
    return []
  }

  return hashtags
    .map((hashtag) => {
      if (typeof hashtag === "string") {
        return hashtag
          .replace(/^#/, "")
          .trim()
      }

      const tag =
        hashtag.tag ??
        hashtag.hashtag ??
        ""

      return String(tag)
        .replace(/^#/, "")
        .trim()
    })
    .filter(Boolean)
}

export function hashtagsToCaptionString(
  hashtags: string[]
): string {
  return hashtags
    .map((hashtag) =>
      hashtag.startsWith("#")
        ? hashtag
        : `#${hashtag}`
    )
    .join(" ")
}
