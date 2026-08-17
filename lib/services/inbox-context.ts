import 'server-only'

import { requireAuth } from '@/lib/services/auth.service'
import { getBusinessProfile } from '@/lib/services/business.service'
import {
  getSocialConnections,
  type RawSocialConnection,
} from '@/lib/services/marketing-ai.service'
import {
  listMirroredConnections,
  mergeRemoteAndMirrored,
} from '@/lib/services/social-connections.service'
import { getInstagramAccountLabel } from '@/lib/social/instagram-account'
import { mapRawConnection, normalizeInstagramHandle } from '@/lib/social/oauth'
import { rateLimitOrThrow } from '@/lib/rate-limit'
import type { SocialConnection } from '@/types/social'

export type InboxSyncStatus =
  | 'ok'
  | 'empty'
  | 'needs_reconnect'
  | 'inbox_unavailable'
  | 'unreachable'

export type InboxRouteContext = {
  session: Awaited<ReturnType<typeof requireAuth>>
  profile: NonNullable<Awaited<ReturnType<typeof getBusinessProfile>>['data']>
  instagram: SocialConnection | undefined
  remoteInstagram: SocialConnection | undefined
  remoteError: string | null
  mirroredOnly: boolean
}

function mapConnections(raw: RawSocialConnection[]) {
  return raw.map((acc) =>
    mapRawConnection({
      id: acc.account_id ?? acc.id,
      platform: acc.platform,
      handle: acc.handle,
      account_url: acc.account_url,
      connected_status: acc.connected_status,
      instagram_user_id: acc.instagram_user_id,
      facebook_page_id: acc.facebook_page_id,
      created_at: acc.created_at,
    })
  )
}

export async function resolveInboxContext(): Promise<InboxRouteContext> {
  const session = await requireAuth()
  rateLimitOrThrow(`inbox:${session.user.id}`, 40, 60_000)

  const { data: profile, error: profileError } = await getBusinessProfile(
    session.user.id
  )
  if (profileError) {
    throw Object.assign(new Error(profileError), { status: 500 })
  }
  if (!profile) {
    throw Object.assign(
      new Error('Complete your business profile before opening the inbox.'),
      { status: 404 }
    )
  }

  const mirrored = await listMirroredConnections(profile.id, session.user.id)
  let remote: SocialConnection[] = []
  let remoteError: string | null = null
  try {
    const raw = await getSocialConnections(profile.id)
    remote = mapConnections(Array.isArray(raw) ? raw : [])
  } catch (error) {
    remoteError =
      error instanceof Error ? error.message : 'Failed to reach publish service'
  }

  const connections = mergeRemoteAndMirrored(remote, mirrored)
  const instagram = connections.find(
    (c) => c.platform === 'instagram' && c.status === 'connected'
  )
  const remoteInstagram = remote.find(
    (c) => c.platform === 'instagram' && c.status === 'connected'
  )

  return {
    session,
    profile,
    instagram,
    remoteInstagram,
    remoteError,
    mirroredOnly: Boolean(instagram && !remoteInstagram && !remoteError),
  }
}

export function inboxAccountPayload(instagram: SocialConnection) {
  const account = getInstagramAccountLabel(instagram)
  return {
    connectionId: instagram.id,
    handle: normalizeInstagramHandle(instagram.handle) || null,
    displayName: account.title,
    atHandle: account.atHandle,
    profileUrl: account.profileUrl,
  }
}

export function inboxUnavailableMessage(
  error: unknown
): { missingEndpoint: boolean; message: string } {
  const message =
    error instanceof Error ? error.message : 'Failed to sync Instagram inbox'
  const status =
    typeof (error as { status?: number })?.status === 'number'
      ? (error as { status: number }).status
      : 0
  return {
    missingEndpoint: status === 404 || /not found/i.test(message),
    message,
  }
}

/** Strip gateway wrappers so the UI can show Instagram's actual reason. */
export function publicInboxError(
  error: unknown,
  fallback = 'Failed to send reply'
): string {
  const responseBody =
    typeof (error as { responseBody?: string })?.responseBody === 'string'
      ? (error as { responseBody: string }).responseBody
      : ''
  const raw = responseBody || (error instanceof Error ? error.message : '')
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as {
        detail?: unknown
        error?: unknown
        message?: unknown
      }
      const detail = parsed.detail ?? parsed.error ?? parsed.message
      if (typeof detail === 'string' && detail.trim()) return detail.trim()
      if (detail && typeof detail === 'object' && 'message' in detail) {
        const nested = (detail as { message?: unknown }).message
        if (typeof nested === 'string' && nested.trim()) return nested.trim()
      }
    } catch {
      // Fall through to the stripped gateway message.
    }
  }

  const stripped = raw.replace(/^MarketMe[- ]?AI error\s*\d+:\s*/i, '').trim()
  return stripped || fallback
}
