/**
 * Client-safe social connection helpers.
 * Talks only to authenticated Next.js API routes — never to the AI/publish backend directly.
 */

import type { SocialConnection, SocialPlatform } from '@/types/social'
import { markInstagramOAuthPending } from '@/lib/social/oauth'

/** Make MarketMe AI / publish backend failures readable in the UI. */
export function humanizeConnectionsError(raw: string): string {
  const text = raw.trim()
  if (/SecretStr/i.test(text)) {
    return (
      'Meta authorized your account, but the publish API cannot save or load Instagram tokens ' +
      '(backend SecretStr bug). The MarketMe AI service needs to call .get_secret_value() on secrets ' +
      'before database or HTTP use. After that deploy, reconnect Instagram.'
    )
  }
  if (/Database error/i.test(text)) {
    return `Publish service database error: ${text.replace(/^MarketMe-AI error:\s*/i, '')}`
  }
  if (/MARKETME_AI_API_URL/i.test(text) || /Failed to fetch/i.test(text)) {
    return 'Cannot reach the MarketMe AI publish service. Check MARKETME_AI_API_URL and that Render is up.'
  }
  return text.replace(/^MarketMe-AI error:\s*\d+\s*/i, '') || 'Failed to load connections'
}

export type FetchConnectionsResult =
  | { ok: true; connections: SocialConnection[]; warning?: string; source?: string }
  | { ok: false; error: string; connections?: SocialConnection[] }

/**
 * Fetch connected social accounts for the signed-in user's business.
 * businessProfileId is accepted for API compatibility with the dashboard layout;
 * the Next.js route scopes by session (and validates the profile).
 */
export async function fetchConnections(
  _businessProfileId?: string
): Promise<FetchConnectionsResult> {
  void _businessProfileId
  try {
    const res = await fetch('/api/social/connections', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    })

    const data = (await res.json().catch(() => ({}))) as {
      connections?: SocialConnection[]
      error?: string
      warning?: string
      source?: string
    }

    if (res.status === 404) {
      return { ok: true, connections: [] }
    }

    const connections = Array.isArray(data.connections) ? data.connections : []

    // 502 with mirrored rows still counts as usable for the Connections UI
    if (!res.ok && connections.length === 0) {
      return {
        ok: false,
        error: humanizeConnectionsError(data.error || 'Failed to load connections'),
        connections: [],
      }
    }

    return {
      ok: true,
      connections,
      warning: data.warning,
      source: data.source,
    }
  } catch (e) {
    return {
      ok: false,
      error: humanizeConnectionsError(
        e instanceof Error ? e.message : 'Failed to load connections'
      ),
      connections: [],
    }
  }
}

/** Persist OAuth success in MarketMe so Connections shows Instagram immediately. */
export async function confirmInstagramOAuth(handle?: string): Promise<FetchConnectionsResult> {
  try {
    const res = await fetch('/api/social/connections', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'confirm',
        platform: 'instagram',
        handle: handle || 'instagram_account',
      }),
    })
    const data = (await res.json().catch(() => ({}))) as {
      connections?: SocialConnection[]
      connection?: SocialConnection
      error?: string
    }
    if (!res.ok) {
      return {
        ok: false,
        error: data.error || 'Failed to save Instagram connection',
        connections: [],
      }
    }
    const connections =
      Array.isArray(data.connections) && data.connections.length > 0
        ? data.connections
        : data.connection
          ? [data.connection]
          : []
    return { ok: true, connections, source: 'mirror' }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Failed to save Instagram connection',
      connections: [],
    }
  }
}

/**
 * Start Instagram Meta OAuth. Redirects the browser to Facebook/Meta.
 * Does not return a connection row — the AI API callback persists the account,
 * then redirects back to /dashboard/connections.
 */
export async function initiatePlatformConnect(
  platform: SocialPlatform,
  _businessProfileId?: string
): Promise<{ redirected: true }> {
  void _businessProfileId
  if (platform !== 'instagram') {
    throw new Error('Only Instagram is available right now')
  }

  const res = await fetch('/api/social/connect', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform }),
  })

  const data = (await res.json().catch(() => ({}))) as {
    authUrl?: string
    error?: string
  }

  if (!res.ok) {
    throw new Error(data.error || 'Failed to start Instagram connection')
  }

  if (!data.authUrl) {
    throw new Error('Missing OAuth URL from server')
  }

  markInstagramOAuthPending()
  window.location.assign(data.authUrl)
  return { redirected: true }
}

/**
 * Mark disconnected in MarketMe mirror. Tokens may remain on the publish service
 * until Meta revoke / AI API disconnect exists.
 */
export async function disconnectConnection(
  connectionId: string,
  _businessProfileId?: string
): Promise<void> {
  void _businessProfileId
  const res = await fetch('/api/social/connections', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'disconnect',
      platform: 'instagram',
      connectionId,
    }),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error || 'Failed to disconnect')
  }
}
