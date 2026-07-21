/**
 * Inbox API — FRONTEND STUB
 * -------------------------
 * TODO(backend): replace with GET /api/inbox/messages?platform=instagram
 * Normalize Instagram webhook payloads (DMs, comments, mentions) into InboxMessage.
 */

import type { InboxMessage, SocialConnection } from '@/types/social'
import { getDemoInboxMessages } from '@/lib/social/demo-inbox'

export interface FetchInboxOptions {
  connections: SocialConnection[]
  /** When true, returns demo data for connected platforms (default in stub) */
  useDemoData?: boolean
}

/**
 * TODO(backend): fetch real messages for all connected accounts.
 * Filter by connectionId / platform on the server.
 */
export async function fetchInboxMessages(
  options: FetchInboxOptions
): Promise<InboxMessage[]> {
  await delay(500)

  const connected = options.connections.filter((c) => c.status === 'connected')
  if (connected.length === 0) return []

  // --- TEAMMATE: replace demo block with API response ---
  if (options.useDemoData !== false) {
    const instagram = connected.find((c) => c.platform === 'instagram')
    if (instagram) return getDemoInboxMessages(instagram.id)
  }

  return []
}

/** TODO(backend): PATCH /api/inbox/messages/:id */
export async function markMessageRead(messageId: string): Promise<void> {
  await delay(150)
  void messageId
}

/** TODO(backend): POST /api/inbox/messages/:id/reply */
export async function replyToMessage(
  messageId: string,
  body: string
): Promise<void> {
  await delay(300)
  void messageId
  void body
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
