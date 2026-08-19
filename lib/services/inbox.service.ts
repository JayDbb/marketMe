import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/admin'
import type {
  InboxMessage,
  InboxMessageStatus,
  InboxMessageType,
  SocialPlatform,
} from '@/types/social'

export type InboxMessageRow = {
  id: string
  business_profile_id: string
  user_id: string
  connection_id: string | null
  platform: SocialPlatform
  message_type: InboxMessageType
  external_id: string | null
  author_name: string | null
  author_handle: string | null
  author_avatar_url: string | null
  preview: string | null
  body: string
  status: InboxMessageStatus
  post_url: string | null
  received_at: string
  created_at: string
  updated_at: string
}

function rowToMessage(row: InboxMessageRow): InboxMessage {
  return {
    id: row.external_id || row.id,
    connectionId: row.connection_id || row.business_profile_id,
    platform: row.platform,
    type: row.message_type,
    authorName: row.author_name || 'Instagram user',
    authorHandle: (row.author_handle || 'user').replace(/^@/, ''),
    authorAvatarUrl: row.author_avatar_url,
    preview: row.preview || row.body.slice(0, 120),
    body: row.body,
    status: row.status,
    receivedAt: row.received_at,
    postUrl: row.post_url,
    externalId: row.external_id,
  }
}

function mergeStatus(
  local?: InboxMessageStatus,
  remote?: InboxMessageStatus
): InboxMessageStatus {
  if (local === 'archived' || remote === 'archived') return 'archived'
  if (local === 'read' || remote === 'read') return 'read'
  return remote ?? local ?? 'unread'
}

function sanitizeInboxId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_.:+=/-]/g, '').slice(0, 200)
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function listInboxMessages(input: {
  businessProfileId: string
  userId: string
  platform?: SocialPlatform
}): Promise<InboxMessage[]> {
  let query = supabaseAdmin
    .from('inbox_messages')
    .select('*')
    .eq('business_profile_id', input.businessProfileId)
    .eq('user_id', input.userId)
    .order('received_at', { ascending: false })
    .limit(100)

  if (input.platform) {
    query = query.eq('platform', input.platform)
  }

  const { data, error } = await query
  if (error) {
    console.error('[inbox] list failed:', error.message)
    return []
  }

  return (data as InboxMessageRow[] | null)?.map(rowToMessage) ?? []
}

export async function upsertInboxMessages(input: {
  businessProfileId: string
  userId: string
  connectionId?: string | null
  messages: InboxMessage[]
}): Promise<InboxMessage[]> {
  if (input.messages.length === 0) return []

  const incomingIds = input.messages
    .map((m) => (m.id.startsWith('demo-') ? null : m.id))
    .filter((id): id is string => Boolean(id))

  const priorStatus = new Map<string, InboxMessageStatus>()
  if (incomingIds.length > 0) {
    const { data: existing } = await supabaseAdmin
      .from('inbox_messages')
      .select('external_id, status')
      .eq('business_profile_id', input.businessProfileId)
      .eq('user_id', input.userId)
      .in('external_id', incomingIds)
    for (const row of existing ?? []) {
      if (row.external_id) {
        priorStatus.set(row.external_id, row.status as InboxMessageStatus)
      }
    }
  }

  const rows = input.messages.map((m) => {
    const externalId = m.id.startsWith('demo-') ? null : m.id
    const key = externalId || `${m.type}:${m.receivedAt}:${m.authorHandle}`
    return {
      business_profile_id: input.businessProfileId,
      user_id: input.userId,
      connection_id: input.connectionId || m.connectionId || null,
      platform: m.platform,
      message_type: m.type,
      external_id: key,
      author_name: m.authorName,
      author_handle: m.authorHandle.replace(/^@/, ''),
      author_avatar_url: m.authorAvatarUrl ?? null,
      preview: m.preview,
      body: m.body,
      status: mergeStatus(priorStatus.get(key), m.status),
      post_url: m.postUrl ?? null,
      received_at: m.receivedAt,
      updated_at: new Date().toISOString(),
    }
  })

  const { data, error } = await supabaseAdmin
    .from('inbox_messages')
    .upsert(rows, {
      onConflict: 'business_profile_id,platform,external_id',
    })
    .select('*')

  if (error) {
    console.error('[inbox] upsert failed:', error.message)
    return input.messages
  }

  return (data as InboxMessageRow[] | null)?.map(rowToMessage) ?? input.messages
}

async function updateInboxMessageStatusLocal(input: {
  businessProfileId: string
  userId: string
  messageId: string
  status: InboxMessageStatus
}): Promise<boolean> {
  const messageId = sanitizeInboxId(input.messageId)
  if (!messageId) return false

  const patch = {
    status: input.status,
    updated_at: new Date().toISOString(),
  }
  const scoped = () =>
    supabaseAdmin
      .from('inbox_messages')
      .update(patch)
      .eq('business_profile_id', input.businessProfileId)
      .eq('user_id', input.userId)

  if (UUID_RE.test(messageId)) {
    const { data, error } = await scoped().eq('id', messageId).select('id')
    if (error) {
      console.error('[inbox] status update failed:', error.message)
      return false
    }
    if ((data ?? []).length > 0) return true
  }

  const { data, error } = await scoped().eq('external_id', messageId).select('id')

  if (error) {
    console.error('[inbox] status update failed:', error.message)
    return false
  }

  if ((data ?? []).length > 0) return true

  const { error: insertError } = await supabaseAdmin.from('inbox_messages').insert({
    business_profile_id: input.businessProfileId,
    user_id: input.userId,
    platform: 'instagram',
    message_type: 'dm',
    external_id: messageId,
    author_name: 'Instagram user',
    author_handle: 'user',
    preview: '',
    body: '',
    status: input.status,
    received_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (insertError) {
    console.error('[inbox] status insert failed:', insertError.message)
    return false
  }
  return true
}

export async function markInboxMessageReadLocal(input: {
  businessProfileId: string
  userId: string
  messageId: string
}): Promise<boolean> {
  return updateInboxMessageStatusLocal({ ...input, status: 'read' })
}

export async function archiveInboxMessageLocal(input: {
  businessProfileId: string
  userId: string
  messageId: string
}): Promise<boolean> {
  return updateInboxMessageStatusLocal({ ...input, status: 'archived' })
}
