'use client'

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
    () => true
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
          </div>
        </div>
      </div>
    </div>
  )
}

function InboxConnectBanner() {
  return (
    <div className="rounded-2xl border border-sky-500/25 bg-sky-500/5 p-8 text-center">
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
              className="h-10 rounded-xl border-zinc-200 bg-white pl-10 focus-visible:border-sky-400/50 focus-visible:ring-0 dark:border-white/10 dark:bg-white/5"
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
              ? 'border-amber-500/25 bg-amber-500/8'
              : 'border-sky-500/25 bg-sky-500/8'
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
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-sky-600 px-4 text-xs font-semibold text-white hover:bg-sky-500"
            >
              <Link2 className="mr-1.5 size-3.5" />
              Reconnect
            </Link>
          ) : null}
        </div>
      ) : null}

      {hasInstagram ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white/40 dark:border-white/10 dark:bg-white/2">
          <div className="flex shrink-0 flex-col gap-3 border-b border-zinc-200 px-3 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/8">
            <div
              role="tablist"
              aria-label="Inbox type"
              className="flex gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-1 dark:border-white/10 dark:bg-white/5"
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
                      'whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                      active
                        ? 'border border-zinc-200 bg-white text-zinc-900 dark:border-white/5 dark:bg-white/10 dark:text-white'
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
                      'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
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
  )
}
