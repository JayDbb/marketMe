import type { SocialConnection, SocialPlatform } from '@/types/social'

const OAUTH_PENDING_KEY = 'marketme:instagram-oauth-pending'

export function markInstagramOAuthPending(): void {
  try {
    sessionStorage.setItem(
      OAUTH_PENDING_KEY,
      JSON.stringify({ startedAt: Date.now() })
    )
  } catch {
    // sessionStorage may be unavailable
  }
}

export function consumeInstagramOAuthPending(): boolean {
  try {
    const raw = sessionStorage.getItem(OAUTH_PENDING_KEY)
    sessionStorage.removeItem(OAUTH_PENDING_KEY)
    return Boolean(raw)
  } catch {
    return false
  }
}

export type OAuthReturnResult =
  | { kind: 'success'; platform: 'instagram'; message?: string; handle?: string }
  | { kind: 'error'; platform?: 'instagram'; message: string }
  | { kind: 'none' }

/** Normalize Instagram username from query/API payloads. */
export function normalizeInstagramHandle(
  value: string | null | undefined
): string | undefined {
  if (!value) return undefined
  const handle = value.trim().replace(/^@+/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/$/, '')
  if (!handle || /^instagram(_account)?$/i.test(handle)) return undefined
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(handle)) return undefined
  return handle
}

/**
 * Parse common query shapes used when the MarketMe AI API redirects back to the frontend
 * after Meta OAuth (FRONTEND_URL + path/query).
 *
 * Live AI callback currently uses:
 *   /dashboard/settings?instagram=connected|cancelled|not_found
 * Preferred (documented) shape:
 *   /dashboard/connections?oauth=instagram&status=success|error
 */
export function parseOAuthReturnParams(
  params: URLSearchParams
): OAuthReturnResult {
  const oauth = (params.get('oauth') || params.get('provider') || '').toLowerCase()
  const instagramParam = (params.get('instagram') || '').toLowerCase()
  const status = (
    params.get('status') ||
    instagramParam ||
    params.get('connected') ||
    ''
  ).toLowerCase()
  const error =
    params.get('error') ||
    params.get('error_description') ||
    params.get('message') ||
    ''
  const handle = normalizeInstagramHandle(
    params.get('username') ||
      params.get('handle') ||
      params.get('ig_username') ||
      params.get('instagram_username') ||
      params.get('account')
  )

  const errorStatuses = new Set([
    'error',
    'failed',
    'denied',
    'cancelled',
    'canceled',
    'not_found',
    'missing',
  ])

  if (instagramParam && errorStatuses.has(instagramParam)) {
    const messageByStatus: Record<string, string> = {
      cancelled: 'Instagram connection was cancelled.',
      canceled: 'Instagram connection was cancelled.',
      not_found:
        'No Instagram Business/Creator account was found for that Facebook login. Link IG to a Facebook Page, then reconnect.',
      missing:
        'No Instagram Business/Creator account was found for that Facebook login. Link IG to a Facebook Page, then reconnect.',
      denied: 'Instagram permission was denied.',
      failed: 'Instagram connection failed.',
      error: 'Instagram connection failed.',
    }
    return {
      kind: 'error',
      platform: 'instagram',
      message: messageByStatus[instagramParam] || error || 'Instagram connection failed',
    }
  }

  if (
    error &&
    (oauth === 'instagram' ||
      status === 'error' ||
      params.has('error') ||
      params.has('error_description') ||
      Boolean(instagramParam))
  ) {
    return {
      kind: 'error',
      platform: 'instagram',
      message: error || 'Instagram connection failed',
    }
  }

  const successStatuses = new Set([
    'success',
    'connected',
    'ok',
    'instagram',
    'true',
    '1',
  ])

  if (
    (oauth === 'instagram' && successStatuses.has(status || 'success')) ||
    status === 'instagram' ||
    params.get('connected')?.toLowerCase() === 'instagram' ||
    successStatuses.has(instagramParam)
  ) {
    return {
      kind: 'success',
      platform: 'instagram',
      message: params.get('message') || undefined,
      handle,
    }
  }

  return { kind: 'none' }
}

/** True when the URL looks like a Meta/Instagram OAuth return (any path). */
export function isInstagramOAuthReturn(params: URLSearchParams): boolean {
  if (params.has('instagram')) return true
  const oauth = (params.get('oauth') || params.get('provider') || '').toLowerCase()
  if (oauth === 'instagram') return true
  if (params.get('connected')?.toLowerCase() === 'instagram') return true
  return false
}

/**
 * Build the canonical Connections return URL from whatever path the AI API used.
 * Keeps username/handle and normalizes settings?instagram=* into oauth/status.
 */
export function buildConnectionsOAuthReturnUrl(
  origin: string,
  params: URLSearchParams
): string {
  const dest = new URL('/dashboard/connections', origin)
  const parsed = parseOAuthReturnParams(params)

  dest.searchParams.set('oauth', 'instagram')

  if (parsed.kind === 'success') {
    dest.searchParams.set('status', 'success')
    if (parsed.message) dest.searchParams.set('message', parsed.message)
    if (parsed.handle) dest.searchParams.set('username', parsed.handle)
  } else if (parsed.kind === 'error') {
    dest.searchParams.set('status', 'error')
    dest.searchParams.set('error', parsed.message)
  } else {
    // Unknown shape — still send user to Connections with original clues.
    const ig = params.get('instagram')
    if (ig) dest.searchParams.set('instagram', ig)
    const status = params.get('status')
    if (status) dest.searchParams.set('status', status)
  }

  return `${dest.pathname}${dest.search}`
}

/** Strip OAuth query keys so refresh doesn't re-toast. */
export function stripOAuthReturnParams(params: URLSearchParams): string {
  const next = new URLSearchParams(params.toString())
  ;[
    'oauth',
    'provider',
    'status',
    'instagram',
    'connected',
    'error',
    'error_description',
    'message',
    'code',
    'state',
    'username',
    'handle',
    'ig_username',
    'instagram_username',
    'account',
  ].forEach((key) => next.delete(key))
  const qs = next.toString()
  return qs ? `?${qs}` : ''
}

export function mapRawConnection(acc: {
  id?: string | number
  platform?: string
  handle?: string | null
  account_url?: string | null
  connected_status?: string | boolean
  instagram_user_id?: string | null
  facebook_page_id?: string | null
  created_at?: string
}): SocialConnection {
  const platform = (acc.platform || 'instagram') as SocialPlatform
  const handle =
    normalizeInstagramHandle(acc.handle) ||
    normalizeInstagramHandle(acc.account_url) ||
    'instagram_account'
  const connected =
    acc.connected_status === true ||
    acc.connected_status === 'connected' ||
    acc.connected_status == null ||
    acc.connected_status === ''
  const status = connected
    ? 'connected'
    : acc.connected_status === 'expired'
      ? 'expired'
      : 'disconnected'

  return {
    id: String(acc.id || acc.instagram_user_id || acc.facebook_page_id || platform),
    platform,
    handle,
    displayName: `@${handle}`,
    status,
    connectedAt: acc.created_at || new Date().toISOString(),
    externalAccountId: acc.instagram_user_id || acc.facebook_page_id || undefined,
  }
}
