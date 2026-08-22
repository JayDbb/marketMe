export type SocialPlatform = 'instagram' | 'facebook' | 'linkedin' | 'twitter'

export type SocialConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'expired'

export interface SocialConnection {
  id: string
  platform: SocialPlatform
  handle: string
  displayName: string
  avatarUrl?: string | null
  status: SocialConnectionStatus
  connectedAt?: string
  externalAccountId?: string
  tokenExpiresAt?: string | null
  lastSyncedAt?: string | null
}

export type InboxMessageType = 'dm' | 'mention' | 'comment'

export type InboxMessageStatus = 'unread' | 'read' | 'archived'

<<<<<<< HEAD
export interface InboxMessage {
  id: string
  connectionId: string
  platform: SocialPlatform
  type: InboxMessageType
=======
export type InboxMessageDirection = 'incoming' | 'outgoing'

export interface InboxMessage {
  id: string
  connectionId: string
  conversationId?: string | null
  platform: SocialPlatform
  type: InboxMessageType
  direction?: InboxMessageDirection
>>>>>>> origin/development
  authorName: string
  authorHandle: string
  authorAvatarUrl?: string | null
  preview: string
  body: string
  status: InboxMessageStatus
  receivedAt: string
  postUrl?: string | null
<<<<<<< HEAD
=======
  externalId?: string | null
}

export interface InboxConversation {
  id: string
  connectionId: string
  platform: SocialPlatform
  participantId: string
  participantName: string
  participantHandle: string
  participantAvatarUrl?: string | null
  latestMessage: InboxMessage | null
  messages: InboxMessage[]
  unreadCount: number
  updatedAt: string | null
>>>>>>> origin/development
}
