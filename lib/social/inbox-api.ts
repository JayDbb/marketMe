/**
 * Inbox API — Frontend Client Wrapper
 * -----------------------------------
 * Communicates with the FastAPI backend inbox endpoints.
 */

import type { InboxMessage, SocialConnection } from '@/types/social'
import { getDemoInboxMessages } from '@/lib/social/demo-inbox'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://marketme-api-9oap.onrender.com'

export interface FetchInboxOptions {
  connections: SocialConnection[]
  /** When true, returns demo data for connected platforms */
  useDemoData?: boolean
}

/**
 * Fetch messages for connected accounts from the FastAPI backend.
 */
export async function fetchInboxMessages(
  options: FetchInboxOptions
): Promise<InboxMessage[]> {
  const connected = options.connections.filter((c) => c.status === 'connected')
  if (connected.length === 0) return []

  // Demo data fallback for local UI testing
  if (options.useDemoData !== false) {
    const instagram = connected.find((c) => c.platform === 'instagram')
    if (instagram) return getDemoInboxMessages(instagram.id)
  }

  const res = await fetch(`${API_BASE_URL}/inbox/messages`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || errorData.error || 'Failed to fetch inbox messages')
  }

  return await res.json()
}

/**
 * Mark a message as read in the FastAPI backend.
 */
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

/**
 * Send a reply to a message via the FastAPI backend.
 * 
 * @param messageId - The target message/conversation ID to reply to.
 * @param body - The text body of the reply message.
 * @param businessProfileId - The ID of the connected business profile.
 */
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

//updated