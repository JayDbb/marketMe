'use client'

import { useCallback, useEffect, useMemo, useState, startTransition } from 'react'
import type { InboxMessage, InboxMessageType } from '@/types/social'
import { fetchInboxMessages, markMessageRead } from '@/lib/social/inbox-api'
import { useSocialConnections } from '@/components/dashboard/social-connections-provider'

export function useInbox() {
  const { connections, hasInstagram, isLoading: connectionsLoading } =
    useSocialConnections()
  const [messages, setMessages] = useState<InboxMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loadMessages = useCallback(async () => {
    if (connectionsLoading) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchInboxMessages({ connections })
      setMessages(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load inbox')
    } finally {
      setIsLoading(false)
    }
  }, [connections, connectionsLoading])

  useEffect(() => {
    startTransition(() => {
      void loadMessages()
    })
  }, [loadMessages])

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

  const byType = useCallback(
    (type: InboxMessageType) =>
      filteredMessages.filter((m) => m.type === type),
    [filteredMessages]
  )

  const unreadCount = useMemo(
    () => messages.filter((m) => m.status === 'unread').length,
    [messages]
  )

  const markRead = useCallback(async (messageId: string) => {
    await markMessageRead(messageId)
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, status: 'read' as const } : m
      )
    )
  }, [])

  return {
    messages: filteredMessages,
    dms: byType('dm'),
    mentions: byType('mention'),
    comments: byType('comment'),
    isLoading: isLoading || connectionsLoading,
    searchQuery,
    setSearchQuery,
    error,
    unreadCount,
    hasInstagram,
    refresh: loadMessages,
    markRead,
  }
}
