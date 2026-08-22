'use client'

import { useCallback, useEffect, useMemo, useState, startTransition } from 'react'
import type { InboxConversation, InboxMessage, InboxMessageType } from '@/types/social'
import {
  archiveInboxItem,
  fetchInboxConversation,
  fetchInboxMessages,
  markMessageRead,
  type InboxAccountSummary,
  type InboxSyncStatus,
} from '@/lib/social/inbox-api'
import { useSocialConnections } from '@/components/dashboard/social-connections-provider'
import { getInstagramAccountLabel } from '@/lib/social/instagram-account'

function matchesMessageId(message: InboxMessage, messageId: string) {
  return message.id === messageId || message.externalId === messageId
}

export function useInbox() {
  const {
    connections,
    hasInstagram,
    isLoading: connectionsLoading,
    getConnection,
  } = useSocialConnections()
  const [messages, setMessages] = useState<InboxMessage[]>([])
  const [conversations, setConversations] = useState<InboxConversation[]>([])
  const [activeConversation, setActiveConversation] = useState<InboxConversation | null>(null)
  const [threadLoading, setThreadLoading] = useState(false)
  const [account, setAccount] = useState<InboxAccountSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<InboxSyncStatus | null>(null)

  const instagram = getConnection('instagram')
  const fallbackAccount = useMemo(() => {
    if (!instagram) return null
    const label = getInstagramAccountLabel(instagram)
    return {
      connectionId: instagram.id,
      handle: label.handle,
      displayName: label.title,
      atHandle: label.atHandle,
      profileUrl: label.profileUrl,
    } satisfies InboxAccountSummary
  }, [instagram])

  const loadMessages = useCallback(async () => {
    if (connectionsLoading) return

    if (!hasInstagram) {
      setMessages([])
      setConversations([])
      setActiveConversation(null)
      setAccount(null)
      setError(null)
      setWarning(null)
      setSyncStatus(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    setWarning(null)
    try {
      const data = await fetchInboxMessages()
      setMessages(data.messages)
      setConversations(data.conversations)
      setAccount(data.account ?? fallbackAccount)
      setSyncStatus(data.syncStatus ?? null)
      if (data.warning) setWarning(data.warning)
      if (data.error && data.messages.length === 0 && data.conversations.length === 0) {
        setError(data.error)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load inbox')
      setAccount(fallbackAccount)
      setSyncStatus(null)
    } finally {
      setIsLoading(false)
    }
  }, [connectionsLoading, hasInstagram, fallbackAccount])

  useEffect(() => {
    startTransition(() => {
      void loadMessages()
    })
  }, [loadMessages, connections])

  const filteredMessages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return messages
    return messages.filter(
      (m) =>
        m.authorName.toLowerCase().includes(q) ||
        m.authorHandle.toLowerCase().includes(q) ||
        m.preview.toLowerCase().includes(q) ||
        m.body.toLowerCase().includes(q)
    )
  }, [messages, searchQuery])

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter((c) => {
      const preview = c.latestMessage?.preview || c.latestMessage?.body || ''
      return (
        c.participantName.toLowerCase().includes(q) ||
        c.participantHandle.toLowerCase().includes(q) ||
        preview.toLowerCase().includes(q)
      )
    })
  }, [conversations, searchQuery])

  const byType = useCallback(
    (type: InboxMessageType) =>
      filteredMessages.filter((m) => m.type === type),
    [filteredMessages]
  )

  const conversationUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [conversations]
  )

  const unreadCount = useMemo(() => {
    const mentionCommentUnread = messages.filter(
      (m) => m.status === 'unread' && m.type !== 'dm'
    ).length
    const dmUnread =
      conversationUnread > 0
        ? conversationUnread
        : messages.filter((m) => m.status === 'unread' && m.type === 'dm').length
    return dmUnread + mentionCommentUnread
  }, [messages, conversationUnread])

  const markRead = useCallback(async (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        matchesMessageId(m, messageId) ? { ...m, status: 'read' as const } : m
      )
    )
    setConversations((prev) =>
      prev.map((c) => {
        const latest = c.latestMessage
        if (!latest || !matchesMessageId(latest, messageId)) return c
        return {
          ...c,
          unreadCount: 0,
          latestMessage: { ...latest, status: 'read' as const },
        }
      })
    )
    try {
      await markMessageRead(messageId)
    } catch {
      // Keep optimistic UI; refresh will reconcile.
    }
  }, [])

  const archive = useCallback(async (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        matchesMessageId(m, messageId)
          ? { ...m, status: 'archived' as const }
          : m
      )
    )
    setConversations((prev) =>
      prev.map((c) => {
        const latest = c.latestMessage
        if (!latest || !matchesMessageId(latest, messageId)) return c
        return {
          ...c,
          unreadCount: 0,
          latestMessage: { ...latest, status: 'archived' as const },
        }
      })
    )
    setActiveConversation((prev) => {
      if (!prev) return prev
      const latest = prev.latestMessage
      if (!latest || !matchesMessageId(latest, messageId)) return prev
      return {
        ...prev,
        unreadCount: 0,
        latestMessage: { ...latest, status: 'archived' as const },
      }
    })
    try {
      await archiveInboxItem(messageId)
    } catch (error) {
      void loadMessages()
      throw error
    }
  }, [loadMessages])

  const openConversation = useCallback(async (conversation: InboxConversation) => {
    setActiveConversation(conversation)
    setConversations((prev) =>
      prev.map((c) => (c.id === conversation.id ? { ...c, unreadCount: 0 } : c))
    )
    const latestId = conversation.latestMessage?.id
    if (latestId && conversation.latestMessage?.status === 'unread') {
      void markRead(latestId)
    }

    setThreadLoading(true)
    try {
      const detail = await fetchInboxConversation(conversation.id)
      setActiveConversation(detail)
      setConversations((prev) =>
        prev.map((c) => (c.id === detail.id ? { ...c, ...detail, unreadCount: 0 } : c))
      )
    } catch {
      // Keep the list preview if the thread fetch fails.
    } finally {
      setThreadLoading(false)
    }
  }, [markRead])

  const appendOutgoing = useCallback((conversationId: string, body: string) => {
    const outgoing: InboxMessage = {
      id: `local:${Date.now()}`,
      connectionId: account?.connectionId || conversations[0]?.connectionId || '',
      conversationId,
      platform: 'instagram',
      type: 'dm',
      direction: 'outgoing',
      authorName: account?.displayName || 'You',
      authorHandle: (account?.handle || 'you').replace(/^@/, ''),
      preview: body.slice(0, 140),
      body,
      status: 'read',
      receivedAt: new Date().toISOString(),
    }
    setActiveConversation((prev) =>
      prev && prev.id === conversationId
        ? {
            ...prev,
            latestMessage: outgoing,
            messages: [...prev.messages, outgoing],
            updatedAt: outgoing.receivedAt,
          }
        : prev
    )
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, latestMessage: outgoing, updatedAt: outgoing.receivedAt }
          : c
      )
    )
  }, [account, conversations])

  const refreshConversation = useCallback(async (conversationId: string) => {
    try {
      const detail = await fetchInboxConversation(conversationId)
      setActiveConversation((prev) => (prev?.id === conversationId ? detail : prev))
      setConversations((prev) =>
        prev.map((c) => (c.id === detail.id ? { ...c, ...detail } : c))
      )
    } catch {
      // Optimistic message stays if refresh fails.
    }
  }, [])

  const closeConversation = useCallback(() => {
    setActiveConversation(null)
  }, [])

  return {
    messages: filteredMessages,
    conversations: filteredConversations,
    activeConversation,
    threadLoading,
    dms: byType('dm'),
    mentions: byType('mention'),
    comments: byType('comment'),
    isLoading: isLoading || connectionsLoading,
    searchQuery,
    setSearchQuery,
    error,
    warning,
    syncStatus,
    account: account ?? fallbackAccount,
    unreadCount,
    hasInstagram,
    refresh: loadMessages,
    markRead,
    archive,
    openConversation,
    closeConversation,
    appendOutgoing,
    refreshConversation,
  }
}
