/**
 * Client inbox API — talks to authenticated Next.js routes,
 * which sync from the connected Instagram account via MarketMe AI.
 */

import type { InboxMessage } from '@/types/social'

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
    connected?: boolean
    account?: InboxAccountSummary | null
    source?: string
    syncStatus?: InboxSyncStatus
    warning?: string
    error?: string
  }

  const messages = Array.isArray(data.messages) ? data.messages : []

  if (!res.ok && messages.length === 0 && !data.connected) {
    return {
      messages: [],
      connected: false,
      account: null,
      error: data.error || 'Failed to load inbox',
      warning: data.warning,
      syncStatus: data.syncStatus,
    }
  }

  return {
    messages,
    connected: Boolean(data.connected),
    account: data.account ?? null,
    source: data.source,
    syncStatus: data.syncStatus,
    warning: data.warning,
    error: res.ok ? undefined : data.error,
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
