/**
 * MarketMe AI API expects integer business_id values (its own DB), while this
 * app stores UUID business_profiles.id. Map stably so the same profile always
 * hits the same backend row.
 */
export function toAiBusinessId(profileId: string): number {
  const override = process.env.MARKETME_AI_BUSINESS_ID?.trim()
  if (override) {
    const parsed = Number.parseInt(override, 10)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }

  let hash = 2166136261
  for (let i = 0; i < profileId.length; i++) {
    hash ^= profileId.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  const unsigned = hash >>> 0
  return unsigned === 0 ? 1 : unsigned
}
