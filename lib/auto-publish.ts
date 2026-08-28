/**
 * Whether scheduled Instagram publishing is allowed.
 *
 * Accepts either:
 * - ENABLE_AUTO_PUBLISH=true (Next / Trigger.dev)
 * - INSTAGRAM_PUBLISH_ENABLED=true (MarketMe AI / shared env naming)
 */
export function isAutoPublishEnabled(): boolean {
  const candidates = [
    process.env.ENABLE_AUTO_PUBLISH,
    process.env.INSTAGRAM_PUBLISH_ENABLED,
  ]

  return candidates.some((value) => value?.trim().toLowerCase() === 'true')
}
