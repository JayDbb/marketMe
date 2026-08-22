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

export interface InboxMessage {
  id: string
  connectionId: string
  platform: SocialPlatform
  type: InboxMessageType
  authorName: string
  authorHandle: string
  authorAvatarUrl?: string | null
  preview: string
  body: string
  status: InboxMessageStatus
  receivedAt: string
  postUrl?: string | null
}
