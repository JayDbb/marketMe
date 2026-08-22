'use client'

<<<<<<< HEAD
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Search,
  MessageCircle,
  AtSign,
  MessageSquareText,
  Link2,
  Loader2,
  RefreshCw,
  Send,
  ExternalLink,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useInbox } from '@/hooks/use-inbox'
import { InboxColumn } from '@/components/dashboard/inbox/inbox-message-card'
import type { InboxMessage } from '@/types/social'
import { formatDistanceToNow } from '@/lib/social/format-relative'
import { replyToMessage } from '@/lib/social/inbox-api'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
  },
}

function InboxDetailPanel({
  message,
  onClose,
}: {
  message: InboxMessage | null
  onClose: () => void
}) {
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  if (!message) {
    return (
      <div className="hidden lg:flex flex-1 min-w-[280px] max-w-md flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 dark:border-white/10 bg-white/30 dark:bg-white/2 p-8 text-center">
        <MessageCircle className="w-10 h-10 text-zinc-300 dark:text-white/15 mb-3" />
        <p className="text-sm text-zinc-500 dark:text-white/40">
          Select a conversation to view and reply
        </p>
      </div>
    )
  }

  const handleReply = async () => {
    if (!reply.trim()) return
    setSending(true)
    try {
      await replyToMessage(message.id, reply, message.connectionId)
      setReply('')
    } catch (error) {
      console.error('Failed to send reply:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="hidden lg:flex flex-1 min-w-[280px] max-w-md flex-col rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/3 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-200 dark:border-white/8 flex items-center justify-between">
        <div>
          <p className="font-semibold text-zinc-900 dark:text-white">{message.authorName}</p>
          <p className="text-xs text-zinc-500 dark:text-white/40">@{message.authorHandle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          Close
        </button>
      </div>

      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-white/30 mb-3">
          {message.type} · {formatDistanceToNow(message.receivedAt)} ago
        </p>
        <p className="text-sm text-zinc-800 dark:text-white/85 leading-relaxed whitespace-pre-wrap">
          {message.body}
        </p>
        {message.postUrl && (
          <a
            href={message.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-xs text-blue-500 hover:underline"
          >
            View on Instagram
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-white/8 space-y-2">
        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write a reply…"
          className="min-h-[80px] bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10 resize-none text-sm"
        />
        <Button
          onClick={handleReply}
          disabled={sending || !reply.trim()}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl border-0"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send reply
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function InboxConnectBanner() {
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl border border-blue-500/25 bg-blue-500/5 p-8 text-center mb-6"
    >
      <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-yellow-400 via-red-500 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
        <Link2 className="w-7 h-7 text-white" />
      </div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
        Connect Instagram to unlock your inbox
      </h2>
      <p className="text-sm text-zinc-500 dark:text-white/45 max-w-md mx-auto mb-6 leading-relaxed">
        DMs, @mentions, and post comments will appear here once your Instagram account
        is linked on the Connections page.
      </p>
      <Link
        href="/dashboard/connections"
        className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-8 h-11 border-0 transition-colors"
      >
        <Link2 className="w-4 h-4 mr-2" />
        Go to Connections
      </Link>
    </motion.div>
  )
}

export function InboxContent() {
  const {
    dms,
    mentions,
    comments,
    isLoading,
    searchQuery,
    setSearchQuery,
    hasInstagram,
    unreadCount,
    refresh,
    markRead,
  } = useInbox()

  const [selected, setSelected] = useState<InboxMessage | null>(null)

  const handleSelect = (message: InboxMessage) => {
    setSelected(message)
    if (message.status === 'unread') markRead(message.id)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8 lg:py-10 relative z-10 h-full flex flex-col"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 shrink-0"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-1">
            Social
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900 dark:text-white">
            Inbox
          </h1>
          <p className="text-zinc-500 dark:text-white/40 mt-2 text-base">
            {hasInstagram
              ? `${unreadCount} unread · Instagram connected`
              : 'Connect Instagram to start receiving messages'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-white/30" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations…"
              disabled={!hasInstagram}
              className="pl-10 h-10 bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/50 rounded-xl"
            />
=======
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Info,
  Link2,
  Mail,
  RefreshCw,
  Search,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useInbox } from '@/hooks/use-inbox'
import { InboxQueueRow } from '@/components/dashboard/inbox/inbox-message-card'
import { InboxThread } from '@/components/dashboard/inbox/inbox-thread'
import {
  buildInboxQueue,
  filterInboxQueue,
  findInboxItemById,
  latestInboundAt,
  latestReplyTargetId,
  parseInboxStatusFilter,
  parseInboxTypeFilter,
  queueItemId,
  type InboxQueueItem,
  type InboxStatusFilter,
  type InboxTypeFilter,
} from '@/lib/inbox-utils'
import { replyToConversation } from '@/lib/social/inbox-api'
import type { InboxConversation } from '@/types/social'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const TYPE_TABS: { id: InboxTypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'dm', label: 'DMs' },
  { id: 'mention', label: 'Mentions' },
  { id: 'comment', label: 'Comments' },
]

const STATUS_TABS: { id: InboxStatusFilter; label: string }[] = [
  { id: 'unread', label: 'Unread' },
  { id: 'all', label: 'All' },
]

function subscribeLg(onChange: () => void) {
  const mql = window.matchMedia('(min-width: 1024px)')
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function useIsDesktopInbox() {
  return useSyncExternalStore(
    subscribeLg,
    () => window.matchMedia('(min-width: 1024px)').matches,
    // Prefer mobile sheet until hydrate so phones don’t miss the thread pane.
    () => false
  )
}

export function InboxSkeleton() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-[28rem] flex-col overflow-hidden p-4 lg:p-6">
      <div className="mb-4 flex shrink-0 items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-72 rounded-xl" />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10">
        <div className="flex h-full min-h-0">
          <div className="w-full space-y-3 border-r border-zinc-200 p-4 lg:w-[22rem] dark:border-white/8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="hidden min-w-0 flex-1 flex-col p-5 lg:flex">
            <Skeleton className="mb-6 h-10 w-48" />
            <Skeleton className="mb-3 h-16 w-3/4 rounded-2xl" />
            <Skeleton className="ml-auto h-16 w-2/3 rounded-2xl" />
>>>>>>> origin/development
          </div>
          <button
            type="button"
            onClick={() => refresh()}
            disabled={isLoading || !hasInstagram}
            className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0"
            aria-label="Refresh inbox"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  )
}

<<<<<<< HEAD
      {!hasInstagram && !isLoading && <InboxConnectBanner />}

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-zinc-500 dark:text-white/40 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading inbox…
        </div>
      ) : hasInstagram ? (
        <motion.div
          variants={itemVariants}
          className="flex gap-4 overflow-x-auto pb-4 flex-1 min-h-0"
        >
          <InboxColumn
            title="DMs"
            icon={MessageCircle}
            messages={dms}
            emptyTitle="No DMs yet"
            emptyDescription="Direct messages from Instagram will show up here."
            selectedId={selected?.id}
            onSelect={handleSelect}
          />
          <InboxColumn
            title="@ Mentions"
            icon={AtSign}
            messages={mentions}
            emptyTitle="No mentions"
            emptyDescription="When someone @mentions you, it appears here."
            selectedId={selected?.id}
            onSelect={handleSelect}
          />
          <InboxColumn
            title="Comments"
            icon={MessageSquareText}
            messages={comments}
            emptyTitle="No comments"
            emptyDescription="Comments on your posts sync to this column."
            selectedId={selected?.id}
            onSelect={handleSelect}
          />
          <InboxDetailPanel message={selected} onClose={() => setSelected(null)} />
        </motion.div>
      ) : null}
    </motion.div>
=======
function InboxConnectBanner() {
  return (
    <div className="rounded-2xl border border-sky-500/40 bg-sky-950 p-8 text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-sky-500/15">
        <Link2 className="size-7 text-sky-600 dark:text-sky-400" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">
        Connect Instagram to unlock your inbox
      </h2>
      <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-zinc-500 dark:text-white/45">
        DMs, @mentions, and post comments appear here for the Instagram Business
        or Creator account you link on Connections.
      </p>
      <Link
        href="/dashboard/connections"
        className="inline-flex h-11 items-center justify-center rounded-xl border-0 bg-sky-600 px-8 font-bold text-white transition-colors hover:bg-sky-500"
      >
        <Link2 className="mr-2 size-4" />
        Go to Connections
      </Link>
    </div>
  )
}

export function InboxContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isDesktop = useIsDesktopInbox()
  const {
    messages,
    conversations,
    activeConversation,
    threadLoading,
    isLoading,
    searchQuery,
    setSearchQuery,
    hasInstagram,
    unreadCount,
    refresh,
    markRead,
    archive,
    openConversation,
    closeConversation,
    appendOutgoing,
    refreshConversation,
    account,
    error,
    warning,
    syncStatus,
  } = useInbox()

  const type = parseInboxTypeFilter(searchParams.get('type'))
  const status = parseInboxStatusFilter(searchParams.get('status'))
  const selectedId = searchParams.get('id')

  const setInboxQuery = useCallback(
    (next: {
      type?: InboxTypeFilter
      status?: InboxStatusFilter
      id?: string | null
    }) => {
      const params = new URLSearchParams(searchParams.toString())
      const nextType = next.type ?? type
      const nextStatus = next.status ?? status
      const nextId = next.id === undefined ? selectedId : next.id

      if (nextType === 'all') params.delete('type')
      else params.set('type', nextType)

      if (nextStatus === 'all') params.delete('status')
      else params.set('status', nextStatus)

      if (!nextId) params.delete('id')
      else params.set('id', nextId)

      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams, selectedId, status, type]
  )

  const queue = useMemo(
    () => buildInboxQueue(conversations, messages),
    [conversations, messages]
  )
  const visibleQueue = useMemo(
    () => filterInboxQueue(queue, type, status),
    [queue, status, type]
  )
  const selectedItem = useMemo(
    () => findInboxItemById(conversations, messages, selectedId),
    [conversations, messages, selectedId]
  )

  const typeCounts = useMemo(() => {
    return {
      all: queue.length,
      dm: queue.filter((item) => item.type === 'dm').length,
      mention: queue.filter((item) => item.type === 'mention').length,
      comment: queue.filter((item) => item.type === 'comment').length,
    } satisfies Record<InboxTypeFilter, number>
  }, [queue])

  useEffect(() => {
    if (!selectedId) {
      if (activeConversation) closeConversation()
      return
    }
    const item = findInboxItemById(conversations, messages, selectedId)
    if (item?.conversation && activeConversation?.id !== item.conversation.id) {
      void openConversation(item.conversation)
    }
  }, [
    activeConversation,
    closeConversation,
    conversations,
    messages,
    openConversation,
    selectedId,
  ])

  const handleSelect = (item: InboxQueueItem) => {
    if (!item) return
    const id = queueItemId(item)
    setInboxQuery({ id })
    if (item.conversation) {
      void openConversation(item.conversation)
    } else {
      closeConversation()
      const messageId = item.message?.id
      if (messageId && item.unread) void markRead(messageId)
    }
  }

  const handleArchive = async (messageId: string) => {
    try {
      await archive(messageId)
      setInboxQuery({ id: null })
      closeConversation()
      toast.success('Marked done')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not mark this done')
    }
  }

  const handleReplyConversation = async (
    conversation: InboxConversation,
    body: string
  ) => {
    await replyToConversation(
      conversation.id,
      body,
      latestReplyTargetId(conversation),
      {
        recipientId: conversation.participantId,
        lastInboundAt: latestInboundAt(conversation),
      }
    )
    appendOutgoing(conversation.id, body)
    void refreshConversation(conversation.id)
  }

  const accountLabel = account?.atHandle ?? account?.displayName ?? 'Instagram'
  const needsReconnect = syncStatus === 'needs_reconnect'
  const bannerTone = error || needsReconnect ? 'amber' : warning ? 'sky' : null
  const threadConversation = activeConversation ?? selectedItem?.conversation ?? null
  const sheetOpen = Boolean(selectedItem) && !isDesktop

  if (isLoading) {
    return <InboxSkeleton />
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-[28rem] w-full flex-col overflow-hidden p-4 lg:p-6">
      <div className="mb-4 flex shrink-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-bold tracking-widest text-sky-600 uppercase dark:text-sky-400">
            Social
          </p>
          <h1 className="text-2xl font-bold tracking-tighter text-zinc-900 lg:text-3xl dark:text-white">
            Inbox
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-white/40">
            {hasInstagram
              ? needsReconnect
                ? 'Instagram needs a reconnect to sync messages'
                : `${unreadCount} unread · ${accountLabel}`
              : 'Connect Instagram to start receiving messages'}
          </p>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-500 dark:text-white/30" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations…"
              disabled={!hasInstagram}
              className="h-10 rounded-xl border-zinc-200 bg-white pl-10 focus-visible:border-sky-400/50 focus-visible:ring-0 dark:border-white/10 dark:bg-[#161b22]"
            />
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={isLoading || !hasInstagram}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition-colors hover:text-zinc-900 dark:border-white/10 dark:hover:text-white"
            aria-label="Refresh inbox"
          >
            <RefreshCw className={cn('size-4', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {!hasInstagram ? <InboxConnectBanner /> : null}

      {hasInstagram && (error || warning) ? (
        <div
          role="status"
          className={cn(
            'mb-4 flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-start sm:justify-between',
            bannerTone === 'amber'
              ? 'border-amber-500/40 bg-amber-950'
              : 'border-sky-500/40 bg-sky-950'
          )}
        >
          <div className="flex min-w-0 gap-3">
            <Info
              className={cn(
                'mt-0.5 size-5 shrink-0',
                bannerTone === 'amber' ? 'text-amber-500' : 'text-sky-500'
              )}
            />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                {needsReconnect
                  ? 'Reconnect Instagram to sync inbox'
                  : error
                    ? 'Could not load Instagram inbox'
                    : 'Inbox sync'}
              </p>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-white/45">
                {error || warning}
              </p>
            </div>
          </div>
          {needsReconnect ? (
            <Link
              href="/dashboard/connections"
              className="inline-flex h-11 min-h-11 shrink-0 items-center justify-center rounded-lg bg-sky-600 px-4 text-xs font-semibold text-white hover:bg-sky-500"
            >
              <Link2 className="mr-1.5 size-3.5" />
              Reconnect
            </Link>
          ) : null}
        </div>
      ) : null}

      {hasInstagram ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#161b22]">
          <div className="flex shrink-0 flex-col gap-3 border-b border-zinc-200 px-3 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/8">
            <div
              role="tablist"
              aria-label="Inbox type"
              className="flex gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-white/10 dark:bg-[#0f1419]"
            >
              {TYPE_TABS.map((tab) => {
                const active = type === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setInboxQuery({ type: tab.id })}
                    className={cn(
                      'inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                      active
                        ? 'border border-zinc-200 bg-white text-zinc-900 dark:border-white/10 dark:bg-[#1c2330] dark:text-white'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    )}
                  >
                    {tab.label}
                    <span className="ml-1.5 text-xs tabular-nums opacity-60">
                      ({typeCounts[tab.id]})
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="flex gap-1">
              {STATUS_TABS.map((tab) => {
                const active = status === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setInboxQuery({ status: tab.id })}
                    className={cn(
                      'inline-flex min-h-11 items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                      active
                        ? 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300'
                        : 'border-zinc-200 text-zinc-500 hover:border-sky-500/30 dark:border-white/10 dark:text-white/50'
                    )}
                  >
                    {tab.label}
                    {tab.id === 'unread' ? (
                      <span className="ml-1 tabular-nums opacity-70">
                        {unreadCount}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex min-h-0 flex-1">
            <div className="custom-scrollbar flex min-h-0 w-full flex-col overflow-y-auto lg:w-[22rem] lg:shrink-0 lg:border-r lg:border-zinc-200 dark:lg:border-white/8">
              {visibleQueue.length > 0 ? (
                <ul className="divide-y divide-zinc-200 dark:divide-white/8">
                  {visibleQueue.map((item) => (
                    <li key={item.key}>
                      <InboxQueueRow
                        item={item}
                        isSelected={
                          selectedItem != null &&
                          queueItemId(item) === queueItemId(selectedItem)
                        }
                        onSelect={handleSelect}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                  <Mail className="mb-3 size-8 text-zinc-300 dark:text-white/20" />
                  <p className="text-sm font-medium text-zinc-700 dark:text-white/70">
                    {needsReconnect
                      ? 'Waiting on reconnect'
                      : status === 'unread'
                        ? 'No unread items'
                        : 'Nothing in this view'}
                  </p>
                  <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-zinc-500 dark:text-white/35">
                    {needsReconnect
                      ? 'After reconnecting, Instagram DMs, mentions, and comments appear here.'
                      : type === 'mention'
                        ? `When someone @mentions ${accountLabel}, it appears here.`
                        : type === 'comment'
                          ? `Comments on ${accountLabel} posts sync to this list.`
                          : `Messages to ${accountLabel} show up in this queue.`}
                  </p>
                </div>
              )}
            </div>

            <div className="hidden min-h-0 min-w-0 flex-1 lg:flex">
              <InboxThread
                key={selectedItem?.key ?? 'empty'}
                item={selectedItem}
                conversation={threadConversation}
                threadLoading={threadLoading}
                onArchive={handleArchive}
                onReplyConversation={handleReplyConversation}
              />
            </div>
          </div>
        </div>
      ) : null}

      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          if (!open) {
            setInboxQuery({ id: null })
            closeConversation()
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-[min(28rem,100vw)] gap-0 bg-[#161b22] p-0 sm:max-w-none"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>
              {selectedItem?.name || 'Conversation'}
            </SheetTitle>
          </SheetHeader>
          <InboxThread
            key={selectedItem?.key ?? 'sheet'}
            item={selectedItem}
            conversation={threadConversation}
            threadLoading={threadLoading}
            onArchive={handleArchive}
            onReplyConversation={handleReplyConversation}
          />
        </SheetContent>
      </Sheet>
    </div>
>>>>>>> origin/development
  )
}