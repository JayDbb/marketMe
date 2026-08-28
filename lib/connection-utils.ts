import { hasRealInstagramHandle } from '@/lib/social/instagram-account'
import type { SocialConnection } from '@/types/social'

export type ConnectionsSource = 'marketme-ai' | 'mirror' | 'empty' | string

/** Honest Instagram health for the Connections list. Never treat a local row as verified. */
export type InstagramHealth =
  | 'not_connected'
  | 'connected'
  | 'saved_locally'
  | 'needs_reconnect'

export const META_BUSINESS_INTEGRATIONS_URL =
  'https://www.facebook.com/settings?tab=business_tools'

function isTransientPublishWarning(warning?: string | null): boolean {
  if (!warning?.trim()) return false
  return /publish service list failed|cannot verify tokens yet|temporar|timeout|timed?\s*out|502|503|504|unreachable|fetch failed/i.test(
    warning
  )
}

export function getInstagramHealth(input: {
  connection?: SocialConnection | null
  source?: string | null
  warning?: string | null
  error?: string | null
}): InstagramHealth {
  const connection = input.connection
  if (!connection || connection.status === 'disconnected') {
    return 'not_connected'
  }

  if (
    connection.status === 'expired' ||
    connection.status === 'error' ||
    !hasRealInstagramHandle(connection.handle)
  ) {
    return 'needs_reconnect'
  }

  // Mirror + real handle while AI is temporarily unreachable ≠ reconnect needed.
  // Overnight Render cold starts often produce this false alarm.
  if (
    hasRealInstagramHandle(connection.handle) &&
    connection.status === 'connected' &&
    (input.source === 'mirror' || isTransientPublishWarning(input.warning))
  ) {
    return 'connected'
  }

  if (input.source === 'mirror' || Boolean(input.warning?.trim())) {
    return 'saved_locally'
  }

  if (input.error && input.source !== 'marketme-ai') {
    return 'saved_locally'
  }

  return 'connected'
}

export function instagramHealthLabel(health: InstagramHealth): string {
  switch (health) {
    case 'connected':
      return 'Connected'
    case 'saved_locally':
      return 'Saved locally'
    case 'needs_reconnect':
      return 'Needs reconnect'
    default:
      return 'Not connected'
  }
}
