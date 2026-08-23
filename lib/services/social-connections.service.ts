import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { normalizeInstagramHandle } from '@/lib/social/oauth'
import { hasRealInstagramHandle } from '@/lib/social/instagram-account'
import type { SocialConnection, SocialPlatform } from '@/types/social'

export type MirroredSocialConnectionRow = {
  id: string
  business_profile_id: string
  user_id: string
  platform: SocialPlatform
  handle: string | null
  display_name: string | null
  status: SocialConnection['status']
  external_account_id: string | null
  source: string
  connected_at: string
  updated_at: string
}

function rowToConnection(row: MirroredSocialConnectionRow): SocialConnection {
  const handle =
    normalizeInstagramHandle(row.handle) ||
    normalizeInstagramHandle(row.display_name) ||
    'instagram_account'
  return {
    id: row.id,
    platform: row.platform,
    handle,
    displayName: row.display_name?.startsWith('@')
      ? row.display_name
      : `@${handle}`,
    status: row.status,
    connectedAt: row.connected_at,
    externalAccountId: row.external_account_id || undefined,
    lastSyncedAt: row.updated_at,
  }
}

export async function listMirroredConnections(
  businessProfileId: string,
  userId: string
): Promise<SocialConnection[]> {
  const { data, error } = await supabaseAdmin
    .from('business_social_connections')
    .select('*')
    .eq('business_profile_id', businessProfileId)
    .eq('user_id', userId)
    .eq('status', 'connected')

  if (error) {
    // Table may not exist until migration 027 is applied.
    console.error('[social-mirror] list failed:', error.message)
    return []
  }

  return (data as MirroredSocialConnectionRow[] | null)?.map(rowToConnection) ?? []
}

export async function upsertMirroredConnection(input: {
  businessProfileId: string
  userId: string
  platform: SocialPlatform
  handle?: string | null
  displayName?: string | null
  status?: SocialConnection['status']
  externalAccountId?: string | null
  source?: 'marketme-ai' | 'oauth-return' | 'manual'
}): Promise<SocialConnection | null> {
  const handle =
    normalizeInstagramHandle(input.handle) ||
    normalizeInstagramHandle(input.displayName) ||
    'instagram_account'
  const status = input.status ?? 'connected'
  const now = new Date().toISOString()

  // Preserve original connected_at across dashboard refreshes / remote syncs.
  // Only stamp a new connected_at on first connect or after an explicit reconnect.
  const { data: existing } = await supabaseAdmin
    .from('business_social_connections')
    .select('connected_at, status')
    .eq('business_profile_id', input.businessProfileId)
    .eq('platform', input.platform)
    .maybeSingle()

  const preserveConnectedAt =
    status === 'connected' &&
    existing?.status === 'connected' &&
    Boolean(existing.connected_at)

  const connectedAt = preserveConnectedAt
    ? (existing!.connected_at as string)
    : now

  const { data, error } = await supabaseAdmin
    .from('business_social_connections')
    .upsert(
      {
        business_profile_id: input.businessProfileId,
        user_id: input.userId,
        platform: input.platform,
        handle,
        display_name: input.displayName?.startsWith('@')
          ? input.displayName
          : `@${handle}`,
        status,
        external_account_id: input.externalAccountId ?? null,
        source: input.source ?? 'oauth-return',
        connected_at: connectedAt,
        updated_at: now,
      },
      { onConflict: 'business_profile_id,platform' }
    )
    .select('*')
    .single()

  if (error) {
    console.error('[social-mirror] upsert failed:', error.message)
    return null
  }

  return rowToConnection(data as MirroredSocialConnectionRow)
}

/** Sync AI API connection rows into the local mirror (best-effort). */
export async function syncMirroredFromRemote(input: {
  businessProfileId: string
  userId: string
  connections: SocialConnection[]
}): Promise<void> {
  const connected = input.connections.filter((c) => c.status === 'connected')
  await Promise.all(
    connected.map((c) =>
      upsertMirroredConnection({
        businessProfileId: input.businessProfileId,
        userId: input.userId,
        platform: c.platform,
        handle: c.handle,
        displayName: c.displayName,
        status: 'connected',
        externalAccountId: c.externalAccountId,
        source: 'marketme-ai',
      })
    )
  )
}

export async function markMirroredDisconnected(input: {
  businessProfileId: string
  userId: string
  platform?: SocialPlatform
  connectionId?: string
}): Promise<void> {
  let query = supabaseAdmin
    .from('business_social_connections')
    .update({
      status: 'disconnected',
      updated_at: new Date().toISOString(),
    })
    .eq('business_profile_id', input.businessProfileId)
    .eq('user_id', input.userId)

  if (input.connectionId) {
    query = query.eq('id', input.connectionId)
  } else if (input.platform) {
    query = query.eq('platform', input.platform)
  } else {
    return
  }

  const { error } = await query
  if (error) {
    console.error('[social-mirror] disconnect failed:', error.message)
  }
}

/**
 * Prefer remote AI connections; fill gaps from the local mirror so OAuth success
 * still shows in MarketMe when publish list fails.
 * Keep a real Instagram username when one side only has a placeholder.
 */
export function mergeRemoteAndMirrored(
  remote: SocialConnection[],
  mirrored: SocialConnection[]
): SocialConnection[] {
  const byPlatform = new Map<string, SocialConnection>()

  const prefer = (next: SocialConnection, prev?: SocialConnection): SocialConnection => {
    if (!prev) return next
    const nextReal = hasRealInstagramHandle(next.handle)
    const prevReal = hasRealInstagramHandle(prev.handle)
    if (nextReal && !prevReal) return next
    if (!nextReal && prevReal) {
      return {
        ...next,
        handle: prev.handle,
        displayName: prev.displayName,
        externalAccountId: next.externalAccountId || prev.externalAccountId,
      }
    }
    return {
      ...next,
      handle: nextReal ? next.handle : prev.handle,
      displayName: nextReal ? next.displayName : prev.displayName,
      externalAccountId: next.externalAccountId || prev.externalAccountId,
      connectedAt: next.connectedAt || prev.connectedAt,
    }
  }

  for (const c of mirrored) {
    if (c.status === 'connected') byPlatform.set(c.platform, c)
  }
  for (const c of remote) {
    if (c.status !== 'connected') continue
    byPlatform.set(c.platform, prefer(c, byPlatform.get(c.platform)))
  }

  return Array.from(byPlatform.values())
}
