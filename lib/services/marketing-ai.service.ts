/**
 * Typed HTTP client for MarketMe-AI FastAPI backend.
 * Provides retry logic, timeout handling, and structured error responses.
 */

const API_URL = process.env.MARKETME_AI_API_URL || "https://marketme-api-9oap.onrender.com"
const DEFAULT_TIMEOUT = 30_000
const MAX_RETRIES = 3
const RETRY_BASE_DELAY = 1000

// ---------------------------------------------------------------------------
// Request/Response Types (mirroring FastAPI Pydantic schemas)
// ---------------------------------------------------------------------------

export interface StrategyRequest {
  business_id: string
  business_name: string
  industry: string
  target_audience: string
  goals: string
  budget_range?: string
  platforms?: string[]
  strategy_name?: string
  strategy_type?: string
  status?: string
  ai_model?: string
}

export interface StrategyResponse {
  strategy_id: string | null
  strategy: Record<string, unknown>
  raw_ai_output: string
}

export interface PostGenerateRequest {
  strategy_id: string
  platform?: string
  num_posts?: number
  account_id?: string
  idea_id?: string
  schedule_id?: string
  ai_model?: string
}

export interface GeneratedPost {
  title: string
  caption: string
  hashtags: string[]
  suggested_media_prompt: string
  suggested_day?: string
}

export interface PostGenerateResponse {
  strategy_id: string
  posts: GeneratedPost[]
}

export interface CreativeGenerateRequest {
  post_id: string
  ai_model?: string
  style_hint?: string
}

export interface CreativeGenerateResponse {
  brief_id: string | null
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

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export class MarketingAIError extends Error {
  status: number
  endpoint: string
  constructor(message: string, status: number, endpoint: string) {
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

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        throw new MarketingAIError(
          `MarketMe-AI error: ${response.status} ${errorText}`,
          response.status,
          path
        )
      }

      return (await response.json()) as T
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on 4xx client errors
      if (error instanceof MarketingAIError && error.status >= 400 && error.status < 500) {
        throw error
      }

      // Wait before retrying (exponential backoff with jitter)
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

// ---------------------------------------------------------------------------
// API Methods
// ---------------------------------------------------------------------------

/**
 * Health check — verify the MarketMe-AI backend is reachable.
 */
export async function healthCheck(): Promise<{ status: string }> {
  return fetchWithRetry("/api/v1/health", { method: "GET" }, 1)
}

/**
 * Generate a marketing strategy using AI.
 */
export async function generateStrategy(input: StrategyRequest): Promise<StrategyResponse> {
  return fetchWithRetry("/api/v1/strategy/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
}

/**
 * Generate social media posts from a strategy.
 */
export async function generatePosts(input: PostGenerateRequest): Promise<PostGenerateResponse> {
  return fetchWithRetry("/api/v1/posts/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
}

/**
 * List posts for a business.
 */
export async function listPosts(
  businessId: string,
  status?: string,
  limit?: number
): Promise<PostRecord[]> {
  const params = new URLSearchParams({ business_id: businessId })
  if (status) params.set("status", status)
  if (limit) params.set("limit", String(limit))
  return fetchWithRetry(`/api/v1/posts?${params.toString()}`, { method: "GET" })
}

/**
 * Generate a creative brief and refined image prompt for a post.
 */
export async function generateCreative(
  input: CreativeGenerateRequest
): Promise<CreativeGenerateResponse> {
  return fetchWithRetry("/api/v1/creative/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
}

/**
 * Get the Meta OAuth authorization URL for Instagram publishing.
 */
export async function getPublishAuthUrl(businessId: string): Promise<string> {
  const params = new URLSearchParams({ business_id: businessId })
  const data = await fetchWithRetry<{ auth_url: string }>(
    `/api/v1/publish/auth-url?${params.toString()}`,
    { method: "GET" }
  )
  return data.auth_url
}

export interface RawSocialConnection {
  id?: string | number
  business_id: number | string
  platform: string
  handle?: string
  account_url?: string
  connected_status: string
  instagram_user_id?: string
  facebook_page_id?: string
  created_at?: string
}

/**
 * Fetch connected social accounts for a business from backend API.
 */
export async function getSocialConnections(businessId: string | number): Promise<RawSocialConnection[]> {
  const params = new URLSearchParams({ business_id: String(businessId) })
  return fetchWithRetry<RawSocialConnection[]>(
    `/api/v1/publish/connections?${params.toString()}`,
    { method: "GET" }
  )
}

/**
 * Publish a post to Instagram.
 */
export async function publishToInstagram(input: PublishRequest): Promise<PublishResponse> {
  return fetchWithRetry("/api/v1/publish/instagram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
}
