/**
 * Typed HTTP client for MarketMe-AI FastAPI backend.
 * Provides retry logic, timeout handling, and structured error responses.
 */

const API_URL = (
  process.env.NEXT_PUBLIC_MARKETME_AI_API_URL ||
  process.env.MARKETME_AI_API_URL ||
  "https://marketme-api-9oap.onrender.com"
).replace(/\/+$/, "")

const DEFAULT_TIMEOUT = 30_000
const MAX_RETRIES = 3
const RETRY_BASE_DELAY = 1000

/**
 * Safely convert numeric strings, UUIDs, or numbers to a positive
 * 32-bit integer.
 *
 * This helper remains for older AI endpoints that currently require
 * numeric business IDs. It must not be used for Instagram OAuth.
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
    const parsed = Number.parseInt(id, 10)

    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed
    }

    let hash = 0

    for (let index = 0; index < id.length; index++) {
      hash =
        (hash << 5) -
        hash +
        id.charCodeAt(index)

      hash |= 0
    }

    return Math.abs(hash) || 1
  }

  return 1
}

/**
 * Validate and normalize a business-profile UUID.
 */
function normalizeBusinessProfileId(
  businessProfileId: string
): string {
  const normalized = businessProfileId.trim()

  if (!normalized) {
    throw new Error(
      "A business profile ID is required."
    )
  }

  return normalized
}

// ---------------------------------------------------------------------------
// Request/Response Types
// ---------------------------------------------------------------------------

export interface StrategyRequest {
  business_id: string | number
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

export interface StrategyResponse {
  strategy_id: string | number | null
  strategy: Record<string, unknown>
  generated?: Record<string, unknown>
  raw_ai_output?: string
}

export interface PostGenerateRequest {
  strategy_id: string | number
  business_id?: string | number
  business_name?: string
  industry?: string
  business_type?: string
  target_audience?: string
  goal?: string
  topic?: string
  platform?: string
  num_posts?: number
  account_id?: string | number
  idea_id?: string | number
  schedule_id?: string | number
  ai_model?: string
  strategy_name?: string
}

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

export interface PostGenerateResponse {
  strategy_id: string | number
  posts: GeneratedPost[]
  post_id?: string | number | null
}

export interface CreativeGenerateRequest {
  post_id: string | number
  business_id?: string | number
  business_name?: string
  industry?: string
  caption?: string
  image_prompt?: string
  style_hint?: string
  ai_model?: string
}

export interface CreativeGenerateResponse {
  brief_id: string | number | null
  layout_description: string
  color_palette: string
  typography: string
  asset_requirements: string
  refined_prompt: string
  status: string
}

export interface PublishRequest {
  post_id: string
  business_id: string
  image_url: string
}

export interface PublishResponse {
  post_id: string
  instagram_post_id: string
  container_id: string
  status: string
}

export interface PostRecord {
  post_id?: string
  business_id?: string
  account_id?: string
  caption?: string
  hashtags?: string[]
  image_prompt?: string
  media_url?: string
  scheduled_date?: string
  status?: string
  ai_model?: string
  created_at?: string
}

/**
 * Row returned from public.social_account.
 */
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
}

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export class MarketingAIError extends Error {
  status: number
  endpoint: string

  constructor(
    message: string,
    status: number,
    endpoint: string
  ) {
    super(message)

    this.name = "MarketingAIError"
    this.status = status
    this.endpoint = endpoint
  }
}

// ---------------------------------------------------------------------------
// Internal fetch with retry
// ---------------------------------------------------------------------------

async function fetchWithRetry<T>(
  path: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<T> {
  const url = `${API_URL}${path}`
  let lastError: Error | null = null

  for (
    let attempt = 0;
    attempt < retries;
    attempt++
  ) {
    const controller = new AbortController()

    const timeout = setTimeout(
      () => controller.abort(),
      DEFAULT_TIMEOUT
    )

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorText = await response
          .text()
          .catch(() => "Unknown error")

        throw new MarketingAIError(
          `MarketMe-AI error: ${response.status} ${errorText}`,
          response.status,
          path
        )
      }

      return (await response.json()) as T
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error(String(error))

      // Do not retry 4xx client errors.
      if (
        error instanceof MarketingAIError &&
        error.status >= 400 &&
        error.status < 500
      ) {
        throw error
      }

      if (attempt < retries - 1) {
        const delay =
          RETRY_BASE_DELAY *
          Math.pow(2, attempt) +
          Math.random() * 500

        console.warn(
          `[marketing-ai] Retry ${attempt + 1}/${retries} ` +
          `for ${path} after ${Math.round(delay)}ms`
        )

        await new Promise<void>((resolve) => {
          setTimeout(resolve, delay)
        })
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  throw (
    lastError ??
    new Error(
      `Failed to fetch ${path} after ${retries} retries`
    )
  )
}

// ---------------------------------------------------------------------------
// API Methods
// ---------------------------------------------------------------------------

/**
 * Health check — verify the MarketMe-AI backend is reachable.
 */
export async function healthCheck(): Promise<{
  status: string
}> {
  return fetchWithRetry(
    "/api/v1/health",
    {
      method: "GET",
    },
    1
  )
}

/**
 * Generate a marketing strategy using AI.
 */
export async function generateStrategy(
  input: StrategyRequest
): Promise<StrategyResponse> {
  const numericBusinessId = toNumericId(
    input.business_id
  )

  const payload = {
    business: {
      business_id: numericBusinessId,
      business_name:
        input.business_name || "My Business",
      business_type:
        input.industry ||
        input.business_type ||
        "General",
      tone:
        input.tone ||
        "friendly and professional",
      products_or_services:
        input.products_or_services || [],
      ...(input.location
        ? { location: input.location }
        : {}),
      ...(input.description
        ? { description: input.description }
        : {}),
      ...(input.summary
        ? { summary: input.summary }
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
        (input.platforms?.[0]?.toLowerCase() as
          | "instagram"
          | "facebook"
          | "linkedin"
          | "x"
          | "tiktok") || "instagram",
      supporting_platforms:
        input.platforms
          ?.slice(1)
          .map((platform) =>
            platform.toLowerCase()
          ) || [],
      timeframe: "monthly",
      primary_objective: "awareness",
      target_audience_hint:
        input.target_audience || undefined,
      posting_capacity_per_week: 5,
    },
  }

  const rawResponse = await fetchWithRetry<
    Record<string, unknown>
  >("/api/v1/strategy/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const strategyId =
    (rawResponse.strategy_id as
      | number
      | string
      | null) ?? null

  const generated =
    (rawResponse.generated as Record<
      string,
      unknown
    >) || {}

  return {
    strategy_id: strategyId,
    strategy: generated,
    generated,
    raw_ai_output: JSON.stringify(generated),
  }
}

/**
 * Generate social media posts from a strategy.
 */
export async function generatePosts(
  input: PostGenerateRequest
): Promise<PostGenerateResponse> {
  const numericBusinessId = toNumericId(
    input.business_id || 1
  )

  const numericStrategyId = toNumericId(
    input.strategy_id
  )

  const payload = {
    business: {
      business_id: numericBusinessId,
      business_name:
        input.business_name || "My Business",
      business_type:
        input.industry ||
        input.business_type ||
        "General",
      tone: "friendly and professional",
      target_audience:
        input.target_audience || "Everyone",
    },
    strategy: {
      strategy_id: numericStrategyId,
      strategy_name:
        input.strategy_name ||
        "Marketing Strategy",
      goal:
        input.goal ||
        "Brand growth and engagement",
    },
    options: {
      platform:
        (input.platform?.toLowerCase() as
          | "instagram"
          | "facebook"
          | "linkedin"
          | "x"
          | "tiktok") || "instagram",
      objective: "engagement",
      topic:
        input.topic ||
        "Weekly social media content",
      desired_length: "medium",
    },
  }

  const rawResponse = await fetchWithRetry<
    Record<string, unknown>
  >("/api/v1/posts/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const generated =
    (rawResponse.generated as Record<
      string,
      unknown
    >) || {}

  const caption =
    (generated.caption as string) || ""

  const rawHashtags =
    (generated.hashtags as Array<
      { value?: string } | string
    >) || []

  const hashtags = rawHashtags.map(
    (hashtag) =>
      typeof hashtag === "string"
        ? hashtag
        : hashtag.value || ""
  )

  const imagePrompt =
    (generated.image_prompt as string) || ""

  const title =
    (generated.post_goal as string) ||
    "Generated Post"

  const post: GeneratedPost = {
    title,
    caption,
    hashtags,
    suggested_media_prompt: imagePrompt,
    call_to_action:
      (generated.call_to_action as string) ||
      undefined,
    content_type:
      (generated.content_type as string) ||
      undefined,
    post_goal:
      (generated.post_goal as string) ||
      undefined,
  }

  return {
    strategy_id: input.strategy_id,
    post_id:
      (rawResponse.post_id as
        | number
        | string
        | null) ?? null,
    posts: [post],
  }
}

/**
 * List posts for a business.
 */
export async function listPosts(
  businessId: string,
  status?: string,
  limit?: number
): Promise<PostRecord[]> {
  const params = new URLSearchParams({
    business_id: businessId,
  })

  if (status) {
    params.set("status", status)
  }

  if (limit) {
    params.set("limit", String(limit))
  }

  return fetchWithRetry<PostRecord[]>(
    `/api/v1/posts?${params.toString()}`,
    {
      method: "GET",
    }
  )
}

/**
 * Generate a creative brief and refined image prompt for a post.
 */
export async function generateCreative(
  input: CreativeGenerateRequest
): Promise<CreativeGenerateResponse> {
  const numericBusinessId = toNumericId(
    input.business_id || 1
  )

  const numericPostId = toNumericId(
    input.post_id
  )

  const payload = {
    metadata: {
      request_id:
        typeof crypto !== "undefined" &&
          crypto.randomUUID
          ? crypto.randomUUID()
          : "00000000-0000-0000-0000-000000000001",
      prompt_version: "v1",
      business_id: numericBusinessId,
    },
    business: {
      business_id: numericBusinessId,
      business_name:
        input.business_name || "My Business",
      business_type:
        input.industry || "General",
    },
    post: {
      post_id: numericPostId,
      business_id: numericBusinessId,
      caption:
        input.caption || "Social media post",
      image_prompt:
        input.image_prompt ||
        input.style_hint ||
        "High quality photograph matching post content for social media",
      content_type: "promotional",
    },
    options: {
      platform: "instagram",
      preferred_style: "modern",
    },
  }

  const rawResponse = await fetchWithRetry<
    Record<string, unknown>
  >("/api/v1/creative/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const brief =
    (rawResponse.creative_brief as Record<
      string,
      unknown
    >) || {}

  const briefId =
    (rawResponse.brief_id as
      | number
      | string
      | null) ?? null

  return {
    brief_id: briefId,
    layout_description:
      (brief.creative_concept as string) ||
      "Balanced composition",
    color_palette:
      "Sleek, modern color styling",
    typography: "Clean sans-serif",
    asset_requirements:
      "High resolution visual",
    refined_prompt:
      (brief.creative_concept as string) ||
      "Refined visual prompt",
    status: (
      rawResponse.success
        ? "success"
        : "completed"
    ) as string,
  }
}

/**
 * Return the backend Meta OAuth entry URL.
 *
 * This route redirects the browser to Facebook. It must be opened using
 * window.location rather than requested with fetch().
 */
export async function getPublishAuthUrl(
  businessProfileId: string
): Promise<string> {
  const normalizedProfileId =
    normalizeBusinessProfileId(
      businessProfileId
    )

  const params = new URLSearchParams({
    business_profile_id:
      normalizedProfileId,
  })

  return (
    `${API_URL}/api/v1/auth/meta/login?` +
    params.toString()
  )
}

/**
 * Fetch connected social accounts for a business profile.
 */
export async function getSocialConnections(
  businessProfileId: string
): Promise<RawSocialConnection[]> {
  const normalizedProfileId =
    normalizeBusinessProfileId(
      businessProfileId
    )

  const params = new URLSearchParams({
    business_profile_id:
      normalizedProfileId,
  })

  return fetchWithRetry<
    RawSocialConnection[]
  >(
    `/api/v1/publish/connections?${params.toString()}`,
    {
      method: "GET",
    }
  )
}

/**
 * Publish a post to Instagram.
 */
export async function publishToInstagram(
  input: PublishRequest
): Promise<PublishResponse> {
  return fetchWithRetry<PublishResponse>(
    "/api/v1/publish/instagram",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  )
}