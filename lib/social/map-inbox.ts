import type {
  InboxMessage,
  InboxMessageStatus,
  InboxMessageType,
  SocialPlatform,
} from '@/types/social'

/** Loose payload shapes returned by MarketMe AI / Meta proxies. */
export type RawInboxItem = {
  id?: string | number
  message_id?: string | number
  external_id?: string | number
  connection_id?: string
  account_id?: string | number
  platform?: string
  type?: string
  message_type?: string
  kind?: string
  author_name?: string
  authorName?: string
  from_name?: string
  username?: string
  author_handle?: string
  authorHandle?: string
  author_username?: string
  from_username?: string
  author_avatar_url?: string
  authorAvatarUrl?: string
  preview?: string
  body?: string
  text?: string
  message?: string
  caption?: string
  status?: string
  is_read?: boolean
  unread?: boolean
  received_at?: string
  created_at?: string
  timestamp?: string
  post_url?: string
  permalink?: string
  media_url?: string
}

function normalizeType(raw: string | undefined): InboxMessageType {
  const value = (raw || 'dm').toLowerCase()
  if (value.includes('mention') || value === '@') return 'mention'
  if (value.includes('comment')) return 'comment'
  if (value.includes('dm') || value.includes('message') || value.includes('conversation')) {
    return 'dm'
  }
  return 'dm'
}

function normalizeStatus(item: RawInboxItem): InboxMessageStatus {
  if (item.status === 'archived') return 'archived'
  if (item.status === 'read' || item.is_read === true || item.unread === false) return 'read'
  if (item.status === 'unread' || item.unread === true || item.is_read === false) return 'unread'
  return 'unread'
}

export function mapRawInboxItem(
  item: RawInboxItem,
  fallback: { connectionId: string; platform?: SocialPlatform }
): InboxMessage | null {
  const body = (
    item.body ||
    item.text ||
    item.message ||
    item.caption ||
    item.preview ||
    ''
  ).trim()

  const id = String(
    item.id ?? item.message_id ?? item.external_id ?? ''
  ).trim()

  if (!id && !body) return null

  const authorHandle = (
    item.author_handle ||
    item.authorHandle ||
    item.author_username ||
    item.from_username ||
    item.username ||
    'user'
  )
    .replace(/^@/, '')
    .trim()

  const authorName = (
    item.author_name ||
    item.authorName ||
    item.from_name ||
    authorHandle ||
    'Instagram user'
  ).trim()

  const receivedAt =
    item.received_at ||
    item.created_at ||
    item.timestamp ||
    new Date().toISOString()

  const preview = (item.preview || body).slice(0, 140)

  return {
    id: id || `${fallback.connectionId}:${receivedAt}:${authorHandle}`,
    connectionId: String(item.connection_id || item.account_id || fallback.connectionId),
    platform: (item.platform as SocialPlatform) || fallback.platform || 'instagram',
    type: normalizeType(item.type || item.message_type || item.kind),
    authorName,
    authorHandle,
    authorAvatarUrl: item.author_avatar_url || item.authorAvatarUrl || null,
    preview,
    body: body || preview,
    status: normalizeStatus(item),
    receivedAt,
    postUrl: item.post_url || item.permalink || item.media_url || null,
  }
}

export function mapRawInboxPayload(
  payload: unknown,
  fallback: { connectionId: string; platform?: SocialPlatform }
): InboxMessage[] {
  const list: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { messages?: unknown[] })?.messages)
      ? ((payload as { messages: unknown[] }).messages)
      : Array.isArray((payload as { items?: unknown[] })?.items)
        ? ((payload as { items: unknown[] }).items)
        : Array.isArray((payload as { data?: unknown[] })?.data)
          ? ((payload as { data: unknown[] }).data)
          : Array.isArray((payload as { conversations?: unknown[] })?.conversations)
            ? ((payload as { conversations: unknown[] }).conversations)
            : []

  return list
    .map((item) => mapRawInboxItem(item as RawInboxItem, fallback))
    .filter((m): m is InboxMessage => Boolean(m))
}
