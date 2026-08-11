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
    id: row.id,
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
  }
}

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

  const rows = input.messages.map((m) => {
    const externalId = m.id.startsWith('demo-') ? null : m.id
    return {
      business_profile_id: input.businessProfileId,
      user_id: input.userId,
      connection_id: input.connectionId || m.connectionId || null,
      platform: m.platform,
      message_type: m.type,
      external_id: externalId || `${m.type}:${m.receivedAt}:${m.authorHandle}`,
      author_name: m.authorName,
      author_handle: m.authorHandle.replace(/^@/, ''),
      author_avatar_url: m.authorAvatarUrl ?? null,
      preview: m.preview,
      body: m.body,
      status: m.status,
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

export async function markInboxMessageReadLocal(input: {
  businessProfileId: string
  userId: string
  messageId: string
}): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('inbox_messages')
    .update({
      status: 'read',
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.messageId)
    .eq('business_profile_id', input.businessProfileId)
    .eq('user_id', input.userId)

  if (error) {
    console.error('[inbox] mark read failed:', error.message)
    return false
  }
  return true
}
