import type { InboxConversation, InboxMessage, SocialConnection } from '@/types/social'
import { getDemoInboxMessages } from '@/lib/social/demo-inbox'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://marketme-api-9oap.onrender.com'

export interface FetchInboxOptions {
  connections?: SocialConnection[]
  useDemoData?: boolean
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
  const connected = options?.connections?.filter((c) => c.status === 'connected') || []

  const getDemoResponse = (): InboxResponse => {
    const instagram = connected.find((c) => c.platform === 'instagram')
    const connectionId = instagram?.id || 'demo-ig-id'
    const demoMsgs = getDemoInboxMessages(connectionId)
    return {
      messages: demoMsgs,
      conversations: [],
      account: null,
      syncStatus: { isSyncing: false },
      warning: null,
      error: null,
    }
  }

  if (options?.useDemoData) {
    return getDemoResponse()
  }

  try {
    const res = await fetch(`${API_BASE_URL}/inbox/messages`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })

    if (!res.ok) {
      return getDemoResponse()
    }

    const data = await res.json()
    if (Array.isArray(data)) {
      return {
        messages: data,
        conversations: [],
        account: null,
        syncStatus: null,
        warning: null,
        error: null,
      }
    }

    return data
  } catch {
    return getDemoResponse()
  }
}

export async function fetchInboxConversation(conversationId: string): Promise<InboxConversation> {
  const res = await fetch(`${API_BASE_URL}/inbox/conversations/${conversationId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || errorData.error || 'Failed to fetch conversation')
  }

  return await res.json()
}

export async function markMessageRead(messageId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/inbox/messages/${messageId}/read`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || errorData.error || 'Failed to mark message as read')
  }
}

export async function archiveInboxItem(messageId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/inbox/messages/${messageId}/archive`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || errorData.error || 'Failed to archive message')
  }
}

export async function replyToMessage(
  messageId: string,
  body: string,
  businessProfileId?: string
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/inbox/messages/${messageId}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      business_profile_id: businessProfileId,
      body: body,
    }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || errorData.error || 'Failed to send reply')
  }
}