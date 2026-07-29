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
  | { kind: 'success'; platform: 'instagram'; message?: string }
  | { kind: 'error'; platform?: 'instagram'; message: string }
  | { kind: 'none' }

/**
 * Parse common query shapes used when the MarketMe AI API redirects back to the frontend
 * after Meta OAuth (FRONTEND_URL + path/query).
 */
export function parseOAuthReturnParams(
  params: URLSearchParams
): OAuthReturnResult {
  const oauth = (params.get('oauth') || params.get('provider') || '').toLowerCase()
  const status = (
    params.get('status') ||
    params.get('instagram') ||
    params.get('connected') ||
    ''
  ).toLowerCase()
  const error =
    params.get('error') ||
    params.get('error_description') ||
    params.get('message') ||
    ''

  if (
    error &&
    (oauth === 'instagram' ||
      status === 'error' ||
      params.has('error') ||
      params.has('error_description'))
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
    params.get('instagram')?.toLowerCase() === 'connected' ||
    params.get('instagram')?.toLowerCase() === 'success'
  ) {
    return {
      kind: 'success',
      platform: 'instagram',
      message: params.get('message') || undefined,
    }
  }

  return { kind: 'none' }
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
  ].forEach((key) => next.delete(key))
  const qs = next.toString()
  return qs ? `?${qs}` : ''
}

export function mapRawConnection(acc: {
  id?: string | number
  platform?: string
  handle?: string | null
  account_url?: string | null
  connected_status?: string
  instagram_user_id?: string | null
  facebook_page_id?: string | null
  created_at?: string
}): SocialConnection {
  const platform = (acc.platform || 'instagram') as SocialPlatform
  const handle = (acc.handle || 'instagram_account').replace(/^@/, '')
  const status =
    acc.connected_status === 'connected' || !acc.connected_status
      ? 'connected'
      : acc.connected_status === 'expired'
        ? 'expired'
        : 'disconnected'

  return {
    id: String(acc.id || acc.instagram_user_id || acc.facebook_page_id || platform),
    platform,
    handle,
    displayName: handle.startsWith('@') ? handle : `@${handle}`,
    status,
    connectedAt: acc.created_at || new Date().toISOString(),
    externalAccountId: acc.instagram_user_id || acc.facebook_page_id || undefined,
  }
}
