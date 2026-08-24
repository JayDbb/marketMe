import type { InboxConversation, InboxMessage, SocialConnection } from '@/types/social'
import { getDemoInboxMessages } from '@/lib/social/demo-inbox'

export interface FetchInboxOptions {
  connections?: SocialConnection[]
  useDemoData?: boolean
  businessProfileId?: string
}

export interface InboxAccountSummary {
  connectionId: string
  handle: string | null
  displayName: string
  atHandle: string | null
  profileUrl: string | null
}

export interface InboxSyncStatus {
  lastSyncedAt?: string
  isSyncing?: boolean
  status?: string
}

export interface InboxResponse {
  messages: InboxMessage[]
  conversations: InboxConversation[]
  account?: InboxAccountSummary | null
  syncStatus?: InboxSyncStatus | null
  warning?: string | null
  error?: string | null
}

export async function fetchInboxMessages(
  options?: FetchInboxOptions
): Promise<InboxResponse> {
  if (options?.useDemoData) {
    const connected = options?.connections?.filter((c) => c.status === 'connected') || []
    const instagram = connected.find((c) => c.platform === 'instagram')
    const connectionId = instagram?.id || 'demo-ig-id'
    return {
      messages: getDemoInboxMessages(connectionId),
      conversations: [],
      account: null,
      syncStatus: { isSyncing: false },
      warning: null,
      error: null,
    }
  }

  try {
    const res = await fetch('/api/inbox/messages', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return {
        messages: data.messages || [],
        conversations: data.conversations || [],
        account: data.account || null,
        syncStatus: data.syncStatus ? { isSyncing: false } : null,
        warning: data.warning || null,
        error: data.error || 'Failed to load inbox messages',
      }
    }

    return {
      messages: Array.isArray(data.messages) ? data.messages : [],
      conversations: Array.isArray(data.conversations) ? data.conversations : [],
      account: data.account || null,
      syncStatus:
        typeof data.syncStatus === 'object' && data.syncStatus !== null
          ? data.syncStatus
          : { isSyncing: false },
      warning: data.warning || null,
      error: data.error || null,
    }
  } catch (e) {
    return {
      messages: [],
      conversations: [],
      account: null,
      syncStatus: { isSyncing: false },
      warning: null,
      error: e instanceof Error ? e.message : 'Failed to fetch inbox messages',
    }
  }
}

export async function fetchInboxConversation(
  conversationId: string,
  _businessProfileId?: string
): Promise<InboxConversation> {
  const res = await fetch(`/api/inbox/conversations?id=${encodeURIComponent(conversationId)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || errorData.error || 'Failed to fetch conversation')
  }

  const data = await res.json()
  return data.conversation || data
}

export async function markMessageRead(
  messageId: string,
  _businessProfileId?: string
): Promise<void> {
  const res = await fetch('/api/inbox/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ action: 'mark_read', messageId }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || errorData.error || 'Failed to mark message as read')
  }
}

export async function archiveInboxItem(
  messageId: string,
  _businessProfileId?: string
): Promise<void> {
  const res = await fetch('/api/inbox/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ action: 'archive', messageId }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || errorData.error || 'Failed to archive item')
  }
}

export async function replyToMessage(
  conversationId: string,
  body: string,
  _businessProfileId?: string,
  messageId?: string,
  recipientId?: string,
  lastInboundAt?: string
): Promise<void> {
  const res = await fetch('/api/inbox/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      conversationId,
      body,
      messageId,
      recipientId,
      lastInboundAt,
    }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || errorData.error || 'Failed to send reply')
  }
}