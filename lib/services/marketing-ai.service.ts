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

function getLegacyBusinessReference(
  input: {
    business_profile_id?: string
    business_id?: string | number
  }
): string | number {
  const reference =
    input.business_profile_id ??
    input.business_id

  if (
    reference === undefined ||
    reference === null ||
    String(reference).trim() === ""
  ) {
    throw new Error(
      "A business profile ID is required."
    )
  }

  return reference
}

async function fetchWithRetry<T>(
  path: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<T> {
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`

  const url = `${API_URL}${normalizedPath}`

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
    }, DEFAULT_TIMEOUT)

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
// Legacy direct AI methods
// ---------------------------------------------------------------------------

/**
 * @deprecated The dashboard generation flow should use
 * startContentGeneration instead.
 */
export async function generateStrategy(
  input: StrategyRequest
): Promise<StrategyResponse> {
  const businessReference =
    getLegacyBusinessReference(
      input
    )

  const numericBusinessId =
    toNumericId(
      businessReference
    )

  const payload = {
    business: {
      business_id:
        numericBusinessId,

      business_name:
        input.business_name ||
        "My Business",

      business_type:
        input.industry ||
        input.business_type ||
        "General",

      tone:
        input.tone ||
        "friendly and professional",

      products_or_services:
        input.products_or_services ||
        [],

      ...(input.location
        ? {
          location:
            input.location,
        }
        : {}),

      ...(input.description
        ? {
          description:
            input.description,
        }
        : {}),

      ...(input.summary
        ? {
          summary:
            input.summary,
        }
        : {}),

      ...(input.target_audience
        ? {
          target_audience:
            input.target_audience,
        }
        : {}),
    },

    options: {
      primary_platform:
        normalizePlatform(
          input.platforms?.[0]
        ),

      supporting_platforms:
        input.platforms
          ?.slice(1)
          .map(
            normalizePlatform
          ) || [],

      timeframe: "monthly",
      primary_objective:
        "awareness",

      target_audience_hint:
        input.target_audience ||
        undefined,

      posting_capacity_per_week:
        5,
    },
  }

  const rawResponse =
    await fetchWithRetry<
      Record<string, unknown>
    >(
      "/api/v1/strategy/generate",
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

  const strategyId =
    rawResponse.strategy_id as
    | number
    | string
    | null
    | undefined

  const generated =
    (
      rawResponse.generated as
      | Record<
        string,
        unknown
      >
      | undefined
    ) || {}

  return {
    strategy_id:
      strategyId ?? null,

    strategy:
      generated,

    generated,

    raw_ai_output:
      JSON.stringify(
        generated
      ),
  }
}


/**
 * @deprecated The dashboard generation flow should use
 * startContentGeneration instead.
 */
export async function generatePosts(
  input: PostGenerateRequest
): Promise<PostGenerateResponse> {
  const businessReference =
    getLegacyBusinessReference(
      input
    )

  const numericBusinessId =
    toNumericId(
      businessReference
    )

  const numericStrategyId =
    toNumericId(
      input.strategy_id
    )

  const payload = {
    business: {
      business_id:
        numericBusinessId,

      business_name:
        input.business_name ||
        "My Business",

      business_type:
        input.industry ||
        input.business_type ||
        "General",

      tone:
        input.tone ||
        "friendly and professional",

      target_audience:
        input.target_audience ||
        "Everyone",
    },

    strategy: {
      strategy_id:
        numericStrategyId,

      strategy_name:
        input.strategy_name ||
        "Marketing Strategy",

      goal:
        input.goal ||
        "Brand growth and engagement",
    },

    options: {
      platform:
        normalizePlatform(
          input.platform
        ),

      objective:
        "engagement",

      topic:
        input.topic ||
        "Weekly social media content",

      desired_length:
        "medium",
    },
  }

  const rawResponse =
    await fetchWithRetry<
      Record<string, unknown>
    >(
      "/api/v1/posts/generate",
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

  const generated =
    (
      rawResponse.generated as
      | Record<
        string,
        unknown
      >
      | undefined
    ) || {}

  const caption =
    (
      generated.caption as
      | string
      | undefined
    ) || ""

  const rawHashtags =
    (
      generated.hashtags as
      | Array<
        | {
          value?: string
        }
        | string
      >
      | undefined
    ) || []

  const hashtags =
    rawHashtags
      .map((hashtag) =>
        typeof hashtag ===
          "string"
          ? hashtag
          : hashtag.value || ""
      )
      .filter(Boolean)

  const imagePrompt =
    (
      generated.image_prompt as
      | string
      | undefined
    ) || ""

  const title =
    (
      generated.title as
      | string
      | undefined
    ) ||
    (
      generated.post_goal as
      | string
      | undefined
    ) ||
    "Generated Post"

  const post: GeneratedPost = {
    title,
    caption,
    hashtags,

    suggested_media_prompt:
      imagePrompt,

    call_to_action:
      generated.call_to_action as
      | string
      | undefined,

    content_type:
      generated.content_type as
      | string
      | undefined,

    post_goal:
      generated.post_goal as
      | string
      | undefined,
  }

  return {
    strategy_id:
      input.strategy_id,

    post_id:
      (
        rawResponse.post_id as
        | number
        | string
        | null
        | undefined
      ) ?? null,

    posts: [post],
  }
}


/**
 * Temporary legacy list endpoint.
 *
 * The new Review Content screen should use getPostsForGeneration.
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


/**
 * @deprecated Creative briefs should be generated by the pipeline.
 */
export async function generateCreative(
  input: CreativeGenerateRequest
): Promise<CreativeGenerateResponse> {
  const businessReference =
    getLegacyBusinessReference(
      input
    )

  const numericBusinessId =
    toNumericId(
      businessReference
    )

  const numericPostId =
    toNumericId(
      input.post_id
    )

  const payload = {
    metadata: {
      request_id:
        createRequestId(),

      prompt_version:
        "v1",

      business_id:
        numericBusinessId,
    },

    business: {
      business_id:
        numericBusinessId,

      business_name:
        input.business_name ||
        "My Business",

      business_type:
        input.industry ||
        "General",
    },

    post: {
      post_id:
        numericPostId,

      business_id:
        numericBusinessId,

      caption:
        input.caption ||
        "Social media post",

      image_prompt:
        input.image_prompt ||
        input.style_hint ||
        "High quality photograph matching the social media post.",

      content_type:
        "promotional",
    },

    options: {
      platform:
        "instagram",

      preferred_style:
        "modern",
    },
  }

  const rawResponse =
    await fetchWithRetry<
      Record<string, unknown>
    >(
      "/api/v1/creative/generate",
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

  const brief =
    (
      rawResponse.creative_brief as
      | Record<
        string,
        unknown
      >
      | undefined
    ) || {}

  const briefId =
    rawResponse.brief_id as
    | number
    | string
    | null
    | undefined

  return {
    brief_id:
      briefId ?? null,

    layout_description:
      (
        brief.layout_description as
        | string
        | undefined
      ) ||
      (
        brief.creative_concept as
        | string
        | undefined
      ) ||
      "Balanced composition",

    color_palette:
      typeof brief.color_palette ===
        "string"
        ? brief.color_palette
        : JSON.stringify(
          brief.color_palette ??
          []
        ),

    typography:
      typeof brief.typography ===
        "string"
        ? brief.typography
        : JSON.stringify(
          brief.typography ??
          {}
        ),

    asset_requirements:
      typeof brief.asset_requirements ===
        "string"
        ? brief.asset_requirements
        : JSON.stringify(
          brief.asset_requirements ??
          {}
        ),

    refined_prompt:
      (
        brief.refined_prompt as
        | string
        | undefined
      ) ||
      (
        brief.creative_concept as
        | string
        | undefined
      ) ||
      "Refined visual prompt",

    status:
      rawResponse.success
        ? "success"
        : "completed",
  }
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

  return (
    `${API_URL}/api/v1/auth/meta/login?` +
    params.toString()
  )
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
  input: PublishRequest
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
    }
  )
}