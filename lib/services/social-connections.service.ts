import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/admin'
<<<<<<< HEAD
=======
import { normalizeInstagramHandle } from '@/lib/social/oauth'
import { hasRealInstagramHandle } from '@/lib/social/instagram-account'
>>>>>>> origin/development
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
<<<<<<< HEAD
  const handle = (row.handle || 'instagram_account').replace(/^@/, '')
=======
  const handle =
    normalizeInstagramHandle(row.handle) ||
    normalizeInstagramHandle(row.display_name) ||
    'instagram_account'
>>>>>>> origin/development
  return {
    id: row.id,
    platform: row.platform,
    handle,
<<<<<<< HEAD
    displayName: row.display_name || (handle.startsWith('@') ? handle : `@${handle}`),
=======
    displayName: row.display_name?.startsWith('@')
      ? row.display_name
      : `@${handle}`,
>>>>>>> origin/development
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
<<<<<<< HEAD
  const handle = (input.handle || 'instagram_account').replace(/^@/, '')
=======
  const handle =
    normalizeInstagramHandle(input.handle) ||
    normalizeInstagramHandle(input.displayName) ||
    'instagram_account'
>>>>>>> origin/development
  const status = input.status ?? 'connected'
  const now = new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from('business_social_connections')
    .upsert(
      {
        business_profile_id: input.businessProfileId,
        user_id: input.userId,
        platform: input.platform,
        handle,
<<<<<<< HEAD
        display_name: input.displayName || `@${handle}`,
=======
        display_name: input.displayName?.startsWith('@')
          ? input.displayName
          : `@${handle}`,
>>>>>>> origin/development
        status,
        external_account_id: input.externalAccountId ?? null,
        source: input.source ?? 'oauth-return',
        connected_at: now,
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
<<<<<<< HEAD
=======
 * Keep a real Instagram username when one side only has a placeholder.
>>>>>>> origin/development
 */
export function mergeRemoteAndMirrored(
  remote: SocialConnection[],
  mirrored: SocialConnection[]
): SocialConnection[] {
  const byPlatform = new Map<string, SocialConnection>()

<<<<<<< HEAD
=======
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

>>>>>>> origin/development
  for (const c of mirrored) {
    if (c.status === 'connected') byPlatform.set(c.platform, c)
  }
  for (const c of remote) {
<<<<<<< HEAD
    if (c.status === 'connected') byPlatform.set(c.platform, c)
=======
    if (c.status !== 'connected') continue
    byPlatform.set(c.platform, prefer(c, byPlatform.get(c.platform)))
>>>>>>> origin/development
  }

  return Array.from(byPlatform.values())
}
