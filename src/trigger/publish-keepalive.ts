import { schedules } from '@trigger.dev/sdk/v3'

/**
 * Keep the MarketMe AI (Render) instance warm so morning scheduled publishes
 * don't die on cold starts, and log connection list health.
 */
export const publishServiceKeepalive = schedules.task({
  id: 'publish-service-keepalive',
  // Every 10 minutes — frequent enough to reduce Render spin-down impact.
  cron: '*/10 * * * *',
  run: async () => {
    const base = (
      process.env.MARKETME_AI_API_URL ||
      process.env.NEXT_PUBLIC_MARKETME_AI_API_URL ||
      ''
    ).replace(/\/+$/, '')

    if (!base) {
      console.warn('[publish-service-keepalive] MARKETME_AI_API_URL is not set')
      return { ok: false, reason: 'missing_url' as const }
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 45_000)
    try {
      const res = await fetch(`${base}/api/v1/health`, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      })
      const body = await res.text().catch(() => '')
      console.log(
        `[publish-service-keepalive] health status=${res.status} body=${body.slice(0, 200)}`
      )
      return {
        ok: res.ok,
        status: res.status,
        bodyPreview: body.slice(0, 200),
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[publish-service-keepalive] failed:', message)
      return { ok: false, reason: 'fetch_failed' as const, error: message }
    } finally {
      clearTimeout(timeout)
    }
  },
})
