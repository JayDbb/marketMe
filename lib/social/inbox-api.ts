import type { InboxConversation, InboxMessage, SocialConnection } from '@/types/social'
import { getDemoInboxMessages } from '@/lib/social/demo-inbox'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://marketme-api-9oap.onrender.com'

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
  const profileId = options?.businessProfileId

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

  if (options?.useDemoData || !profileId) {
    return getDemoResponse()
  }

  try {
    const [messagesRes, conversationsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/inbox/messages?business_profile_id=${profileId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }),
      fetch(`${API_BASE_URL}/inbox/conversations?business_profile_id=${profileId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }),
    ])

    if (!messagesRes.ok || !conversationsRes.ok) {
      return getDemoResponse()
    }

    const messages: InboxMessage[] = await messagesRes.json()
    const conversations: InboxConversation[] = await conversationsRes.json()

    return {
      messages,
      conversations,
      account: null,
      syncStatus: { isSyncing: false },
      warning: null,
      error: null,
    }
  } catch {
    return getDemoResponse()
  }
}

export async function fetchInboxConversation(
  conversationId: string,
  businessProfileId?: string
): Promise<InboxConversation> {
  if (!businessProfileId) {
    throw new Error('businessProfileId is required to fetch conversation')
  }

  const res = await fetch(
    `${API_BASE_URL}/inbox/conversations/${conversationId}?business_profile_id=${businessProfileId}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    }
  )

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || errorData.error || 'Failed to fetch conversation')
  }

  return await res.json()
}

export async function markMessageRead(
  messageId: string,
  businessProfileId: string
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/inbox/messages/${messageId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ business_profile_id: businessProfileId }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || errorData.error || 'Failed to mark message as read')
  }
}

export async function archiveInboxItem(
  messageId: string,
  businessProfileId?: string
): Promise<void> {
  // Archive action stub
}

export async function replyToMessage(
  conversationId: string,
  body: string,
  businessProfileId?: string
): Promise<void> {
  if (!businessProfileId) {
    throw new Error('businessProfileId is required to send a reply')
  }

  const res = await fetch(`${API_BASE_URL}/inbox/conversations/${conversationId}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      business_profile_id: businessProfileId,
      body,
    }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || errorData.error || 'Failed to send reply')
  }
}