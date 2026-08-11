'use client'

import { useCallback, useEffect, useMemo, useState, startTransition } from 'react'
import type { InboxMessage, InboxMessageType } from '@/types/social'
import {
  fetchInboxMessages,
  markMessageRead,
  type InboxAccountSummary,
  type InboxSyncStatus,
} from '@/lib/social/inbox-api'
import { useSocialConnections } from '@/components/dashboard/social-connections-provider'
import { getInstagramAccountLabel } from '@/lib/social/instagram-account'

export function useInbox() {
  const {
    connections,
    hasInstagram,
    isLoading: connectionsLoading,
    getConnection,
  } = useSocialConnections()
  const [messages, setMessages] = useState<InboxMessage[]>([])
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
      setAccount(data.account ?? fallbackAccount)
      setSyncStatus(data.syncStatus ?? null)
      if (data.warning) setWarning(data.warning)
      if (data.error && data.messages.length === 0) setError(data.error)
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
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, status: 'read' as const } : m
      )
    )
    try {
      await markMessageRead(messageId)
    } catch {
      // Keep optimistic UI; refresh will reconcile.
    }
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
    warning,
    syncStatus,
    account: account ?? fallbackAccount,
    unreadCount,
    hasInstagram,
    refresh: loadMessages,
    markRead,
  }
}
