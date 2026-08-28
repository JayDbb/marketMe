import type {
  InboxConversation,
  InboxMessage,
  InboxMessageDirection,
  InboxMessageStatus,
  InboxMessageType,
  SocialPlatform,
} from '@/types/social'

/** Loose payload shapes returned by MarketMe AI / Meta proxies. */
export type RawInboxItem = {
  id?: string | number
  message_id?: string | number
  external_id?: string | number
  conversationId?: string
  conversation_id?: string
  connectionId?: string
  connection_id?: string
  account_id?: string | number
  platform?: string
  type?: string
  message_type?: string
  kind?: string
  direction?: string
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
  receivedAt?: string
  received_at?: string
  created_time?: string | number
  createdTime?: string | number
  created_at?: string
  timestamp?: string | number
  updated_time?: string | number
  updatedAt?: string
  postUrl?: string | null
  post_url?: string
  permalink?: string
  media_url?: string
}

export type RawInboxConversation = {
  id?: string | number
  conversation_id?: string | number
  connectionId?: string
  connection_id?: string
  platform?: string
  participantId?: string
  participant_id?: string
  participantName?: string
  participant_name?: string
  participantHandle?: string
  participant_handle?: string
  participantAvatarUrl?: string | null
  participant_avatar_url?: string | null
  latestMessage?: RawInboxItem | null
  latest_message?: RawInboxItem | null
  messages?: RawInboxItem[]
  unreadCount?: number
  unread_count?: number
  updatedAt?: string | null
  updated_at?: string | null
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

function normalizeDirection(raw: string | undefined): InboxMessageDirection {
  return raw?.toLowerCase() === 'outgoing' ? 'outgoing' : 'incoming'
}

function coerceTimestamp(value: unknown): string | null {
  if (value == null || value === '') return null
  if (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) {
    const n = Number(value)
    if (!Number.isFinite(n) || n <= 0) return null
    const ms = n < 1e12 ? n * 1000 : n
    const date = new Date(ms)
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
  }
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
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
    coerceTimestamp(item.receivedAt) ||
    coerceTimestamp(item.received_at) ||
    coerceTimestamp(item.created_time) ||
    coerceTimestamp(item.createdTime) ||
    coerceTimestamp(item.created_at) ||
    coerceTimestamp(item.timestamp) ||
    coerceTimestamp(item.updated_time) ||
    coerceTimestamp(item.updatedAt) ||
    ''

  const preview = (item.preview || body).slice(0, 140)
  const conversationId = String(
    item.conversationId ?? item.conversation_id ?? ''
  ).trim() || null

  return {
    id: id || `${fallback.connectionId}:${receivedAt}:${authorHandle}`,
    connectionId: String(
      item.connectionId || item.connection_id || item.account_id || fallback.connectionId
    ),
    conversationId,
    platform: (item.platform as SocialPlatform) || fallback.platform || 'instagram',
    type: normalizeType(item.type || item.message_type || item.kind),
    direction: normalizeDirection(item.direction),
    authorName,
    authorHandle,
    authorAvatarUrl: item.author_avatar_url || item.authorAvatarUrl || null,
    preview,
    body: body || preview,
    status: normalizeStatus(item),
    receivedAt,
    postUrl: item.postUrl || item.post_url || item.permalink || item.media_url || null,
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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

export function mapRawConversation(
  raw: RawInboxConversation,
  fallback: { connectionId: string; platform?: SocialPlatform }
): InboxConversation | null {
  const id = String(raw.id ?? raw.conversation_id ?? '').trim()
  const participantName = (
    raw.participantName ||
    raw.participant_name ||
    raw.participantHandle ||
    raw.participant_handle ||
    ''
  ).trim()
  const participantHandle = (
    raw.participantHandle ||
    raw.participant_handle ||
    participantName ||
    'user'
  )
    .replace(/^@/, '')
    .trim()

  if (!id && !participantHandle) return null

  const connectionId = String(
    raw.connectionId || raw.connection_id || fallback.connectionId
  )
  const mappedFallback = {
    connectionId,
    platform: (raw.platform as SocialPlatform) || fallback.platform || 'instagram',
  }
  const latestRaw = raw.latestMessage ?? raw.latest_message ?? null
  const latestMessage = latestRaw
    ? mapRawInboxItem(
        { ...latestRaw, conversationId: latestRaw.conversationId || id },
        mappedFallback
      )
    : null
  const messages = Array.isArray(raw.messages)
    ? raw.messages
        .map((item) =>
          mapRawInboxItem(
            { ...item, conversationId: item.conversationId || item.conversation_id || id },
            mappedFallback
          )
        )
        .filter((m): m is InboxMessage => Boolean(m))
        .sort(
          (a, b) =>
            new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
        )
    : []

  return {
    id: id || `${connectionId}:${participantHandle}`,
    connectionId,
    platform: mappedFallback.platform,
    participantId: String(raw.participantId || raw.participant_id || participantHandle),
    participantName: participantName || participantHandle || 'Instagram user',
    participantHandle,
    participantAvatarUrl: raw.participantAvatarUrl ?? raw.participant_avatar_url ?? null,
    latestMessage,
    messages,
    unreadCount: Number(raw.unreadCount ?? raw.unread_count ?? 0) || 0,
    updatedAt: raw.updatedAt || raw.updated_at || latestMessage?.receivedAt || null,
  }
}

export function mapRawConversationsPayload(
  payload: unknown,
  fallback: { connectionId: string; platform?: SocialPlatform }
): InboxConversation[] {
  const record = asRecord(payload)
  const list: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(record?.conversations)
      ? (record?.conversations as unknown[])
      : Array.isArray(record?.items)
        ? (record?.items as unknown[])
        : Array.isArray(record?.data)
          ? (record?.data as unknown[])
          : []

  return list
    .map((item) => mapRawConversation(item as RawInboxConversation, fallback))
    .filter((c): c is InboxConversation => Boolean(c))
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.latestMessage?.receivedAt || 0).getTime()
      const bTime = new Date(b.updatedAt || b.latestMessage?.receivedAt || 0).getTime()
      return bTime - aTime
    })
}

export function mapRawConversationPayload(
  payload: unknown,
  fallback: { connectionId: string; platform?: SocialPlatform }
): InboxConversation | null {
  const record = asRecord(payload)
  const raw = (record?.conversation ?? record?.data ?? payload) as RawInboxConversation
  return mapRawConversation(raw, fallback)
}
