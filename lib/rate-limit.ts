/**
 * Lightweight in-memory rate limiter for server actions and API routes.
 * Replace with Upstash Redis when deploying to multiple instances.
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

const CLEANUP_INTERVAL_MS = 60_000
let lastCleanup = Date.now()

function cleanupExpired() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  cleanupExpired()
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt }
}

export function rateLimitOrThrow(
  key: string,
  limit: number,
  windowMs: number
): void {
  const result = checkRateLimit(key, limit, windowMs)
  if (!result.allowed) {
    throw new Error('Rate limit exceeded. Please wait before trying again.')
  }
}
