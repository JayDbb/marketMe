import type {
  InboxConversation,
  InboxMessage,
  InboxMessageStatus,
  InboxMessageType,
} from '@/types/social'

export type InboxTypeFilter = 'all' | InboxMessageType
export type InboxStatusFilter = 'all' | 'unread'

export const INSTAGRAM_DM_REPLY_WINDOW_MS = 24 * 60 * 60 * 1000

export function parseInboxTypeFilter(
  value: string | null | undefined
): InboxTypeFilter {
  const v = (value ?? 'all').trim().toLowerCase()
  if (v === 'dm' || v === 'mention' || v === 'comment') return v
  return 'all'
}

export function parseInboxStatusFilter(
  value: string | null | undefined
): InboxStatusFilter {
  const v = (value ?? 'all').trim().toLowerCase()
  if (v === 'unread') return 'unread'
  return 'all'
}

export function isInstagramDmWindowClosed(lastInboundAt?: string | null): boolean {
  if (!lastInboundAt) return false
  const t = new Date(lastInboundAt).getTime()
  if (!Number.isFinite(t)) return false
  return Date.now() - t > INSTAGRAM_DM_REPLY_WINDOW_MS
}

export function latestInboundAt(conversation: InboxConversation): string | undefined {
  const incoming = [...conversation.messages].filter(
    (message) => message.direction !== 'outgoing' && Boolean(message.receivedAt)
  )

  if (incoming.length > 0) {
    const latestCustomerMsgTimestamp = Math.max(
      ...incoming.map((msg) => new Date(msg.receivedAt).getTime())
    )
    if (Number.isFinite(latestCustomerMsgTimestamp)) {
      return new Date(latestCustomerMsgTimestamp).toISOString()
    }
  }

  // Fallback to latestMessage ONLY if it is an incoming message
  if (conversation.latestMessage?.direction !== 'outgoing' && conversation.latestMessage?.receivedAt) {
    return conversation.latestMessage.receivedAt
  }

  return undefined
}

export function latestReplyTargetId(
  conversation: InboxConversation
): string | undefined {
  const incoming = [...conversation.messages]
    .reverse()
    .find(
      (message) => message.direction !== 'outgoing' && Boolean(message.id)
    )
  return incoming?.id || conversation.latestMessage?.id || undefined
}

export type InboxQueueItem = {
  key: string
  type: InboxMessageType
  name: string
  handle: string
  avatarUrl?: string | null
  preview: string
  receivedAt: string
  unread: boolean
  unreadCount: number
  status: InboxMessageStatus
  postUrl?: string | null
  conversation: InboxConversation | null
  message: InboxMessage | null
}

function preferStatus(
  local?: InboxMessageStatus,
  remote?: InboxMessageStatus
): InboxMessageStatus {
  if (local === 'archived' || remote === 'archived') return 'archived'
  if (local === 'read' || remote === 'read') return 'read'
  return remote ?? local ?? 'unread'
}

export function overlayLocalInboxStatus(
  remote: InboxMessage[],
  local: InboxMessage[]
): InboxMessage[] {
  if (local.length === 0) return remote
  const byKey = new Map<string, InboxMessageStatus>()
  for (const message of local) {
    byKey.set(message.id, message.status)
    if (message.externalId) byKey.set(message.externalId, message.status)
  }
  return remote.map((message) => ({
    ...message,
    status: preferStatus(
      byKey.get(message.id) ??
      (message.externalId ? byKey.get(message.externalId) : undefined),
      message.status
    ),
  }))
}

export function overlayConversationStatus(
  conversations: InboxConversation[],
  messages: InboxMessage[]
): InboxConversation[] {
  const archived = new Set(
    messages.filter((m) => m.status === 'archived').flatMap((m) => {
      const keys = [m.id]
      if (m.externalId) keys.push(m.externalId)
      return keys
    })
  )
  const read = new Set(
    messages.filter((m) => m.status === 'read').flatMap((m) => {
      const keys = [m.id]
      if (m.externalId) keys.push(m.externalId)
      return keys
    })
  )

  return conversations.map((conversation) => {
    const latestId = conversation.latestMessage?.id
    const latestArchived = latestId ? archived.has(latestId) : false
    const latestRead = latestId ? read.has(latestId) : false
    const latest = conversation.latestMessage
      ? {
        ...conversation.latestMessage,
        status: latestArchived
          ? 'archived'
          : latestRead
            ? 'read'
            : conversation.latestMessage.status,
      }
      : conversation.latestMessage
    return {
      ...conversation,
      latestMessage: latest,
      unreadCount: latestArchived || latestRead ? 0 : conversation.unreadCount,
    }
  })
}

export function queueItemId(item: InboxQueueItem): string {
  return item.conversation?.id ?? item.message?.id ?? item.key
}

export function archiveTargetId(item: InboxQueueItem): string | undefined {
  return item.message?.id || item.conversation?.latestMessage?.id || undefined
}

export function buildInboxQueue(
  conversations: InboxConversation[],
  messages: InboxMessage[],
  options?: { includeArchived?: boolean }
): InboxQueueItem[] {
  const items: InboxQueueItem[] = []
  const useThreads = conversations.length > 0
  const includeArchived = options?.includeArchived === true

  for (const conversation of conversations) {
    const status = conversation.latestMessage?.status ?? 'unread'
    if (status === 'archived' && !includeArchived) continue
    const preview =
      conversation.latestMessage?.preview ||
      conversation.latestMessage?.body ||
      'No messages yet'
    const receivedAt =
      conversation.latestMessage?.receivedAt ||
      conversation.updatedAt ||
      new Date(0).toISOString()
    items.push({
      key: `c:${conversation.id}`,
      type: 'dm',
      name: conversation.participantName,
      handle: conversation.participantHandle,
      avatarUrl: conversation.participantAvatarUrl,
      preview,
      receivedAt,
      unread: status !== 'archived' && (conversation.unreadCount > 0 || status === 'unread'),
      unreadCount: conversation.unreadCount,
      status,
      postUrl: conversation.latestMessage?.postUrl,
      conversation,
      message: null,
    })
  }

  for (const message of messages) {
    if (message.status === 'archived' && !includeArchived) continue
    if (useThreads && message.type === 'dm') continue
    items.push({
      key: `m:${message.id}`,
      type: message.type,
      name: message.authorName,
      handle: message.authorHandle,
      avatarUrl: message.authorAvatarUrl,
      preview: message.preview || message.body,
      receivedAt: message.receivedAt,
      unread: message.status === 'unread',
      unreadCount: message.status === 'unread' ? 1 : 0,
      status: message.status,
      postUrl: message.postUrl,
      conversation: null,
      message,
    })
  }

  return items.sort(
    (a, b) =>
      new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  )
}

export function filterInboxQueue(
  items: InboxQueueItem[],
  type: InboxTypeFilter,
  status: InboxStatusFilter
): InboxQueueItem[] {
  return items.filter((item) => {
    if (type !== 'all' && item.type !== type) return false
    if (status === 'unread' && !item.unread) return false
    return true
  })
}

export function inboxItemMatchesId(
  item: InboxQueueItem,
  id: string | null
): boolean {
  if (!id) return false
  if (item.conversation?.id === id) return true
  if (item.message?.id === id) return true
  if (item.message?.externalId === id) return true
  return false
}

export function findInboxItemById(
  conversations: InboxConversation[],
  messages: InboxMessage[],
  id: string | null
): InboxQueueItem | null {
  if (!id) return null
  return (
    buildInboxQueue(conversations, messages, { includeArchived: true }).find(
      (item) => inboxItemMatchesId(item, id)
    ) ?? null
  )
}
