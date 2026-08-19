/**
 * Client inbox API — talks to authenticated Next.js routes,
 * which sync from the connected Instagram account via MarketMe AI.
 */

import type { InboxConversation, InboxMessage } from '@/types/social'

export type InboxAccountSummary = {
  connectionId: string
  handle: string | null
  displayName: string
  atHandle: string | null
  profileUrl: string | null
}

export type InboxSyncStatus =
  | 'ok'
  | 'empty'
  | 'needs_reconnect'
  | 'inbox_unavailable'
  | 'unreachable'

export type FetchInboxResult = {
  messages: InboxMessage[]
  conversations: InboxConversation[]
  connected: boolean
  account: InboxAccountSummary | null
  source?: string
  syncStatus?: InboxSyncStatus
  warning?: string
  error?: string
}

export async function fetchInboxMessages(): Promise<FetchInboxResult> {
  const res = await fetch('/api/inbox/messages', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  const data = (await res.json().catch(() => ({}))) as {
    messages?: InboxMessage[]
    conversations?: InboxConversation[]
    connected?: boolean
    account?: InboxAccountSummary | null
    source?: string
    syncStatus?: InboxSyncStatus
    warning?: string
    error?: string
  }

  const messages = Array.isArray(data.messages) ? data.messages : []
  const conversations = Array.isArray(data.conversations) ? data.conversations : []

  if (!res.ok && messages.length === 0 && conversations.length === 0 && !data.connected) {
    return {
      messages: [],
      conversations: [],
      connected: false,
      account: null,
      error: data.error || 'Failed to load inbox',
      warning: data.warning,
      syncStatus: data.syncStatus,
    }
  }

  return {
    messages,
    conversations,
    connected: Boolean(data.connected),
    account: data.account ?? null,
    source: data.source,
    syncStatus: data.syncStatus,
    warning: data.warning,
    error: res.ok ? undefined : data.error,
  }
}

export async function fetchInboxConversation(
  conversationId: string
): Promise<InboxConversation> {
  const res = await fetch(
    `/api/inbox/conversations?id=${encodeURIComponent(conversationId)}`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    }
  )
  const data = (await res.json().catch(() => ({}))) as {
    conversation?: InboxConversation
    error?: string
  }
  if (!res.ok || !data.conversation) {
    throw new Error(data.error || 'Failed to load conversation')
  }
  return data.conversation
}

export async function archiveInboxItem(messageId: string): Promise<void> {
  const res = await fetch('/api/inbox/messages', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'archive', messageId }),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error || 'Failed to mark inbox item done')
  }
}

export async function markMessageRead(messageId: string): Promise<void> {
  const res = await fetch('/api/inbox/messages', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'mark_read', messageId }),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error || 'Failed to mark message read')
  }
}

export async function replyToMessage(
  messageId: string,
  body: string
): Promise<void> {
  const res = await fetch('/api/inbox/messages', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reply', messageId, body }),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error || 'Failed to send reply')
  }
}

export async function replyToConversation(
  conversationId: string,
  body: string,
  messageId?: string | null,
  options?: { recipientId?: string | null; lastInboundAt?: string | null }
): Promise<void> {
  const res = await fetch('/api/inbox/conversations', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversationId,
      messageId,
      body,
      recipientId: options?.recipientId,
      lastInboundAt: options?.lastInboundAt,
    }),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error || 'Failed to send reply')
  }
}
