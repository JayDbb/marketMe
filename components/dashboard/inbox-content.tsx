'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
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
  Info,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useInbox } from '@/hooks/use-inbox'
import {
  InboxColumn,
  InboxConversationColumn,
} from '@/components/dashboard/inbox/inbox-message-card'
import type { InboxConversation, InboxMessage } from '@/types/social'
import { formatDistanceToNow } from '@/lib/social/format-relative'
import { replyToConversation, replyToMessage } from '@/lib/social/inbox-api'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
  },
}

function ThreadMessages({
  conversation,
  loading,
}: {
  conversation: InboxConversation
  loading: boolean
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const thread =
    conversation.messages.length > 0
      ? conversation.messages
      : conversation.latestMessage
        ? [conversation.latestMessage]
        : []

  useEffect(() => {
    const node = scrollerRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [thread.length, conversation.id])

  if (loading && thread.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500 dark:text-white/40 gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading thread…
      </div>
    )
  }

  if (thread.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-5 text-center text-sm text-zinc-500 dark:text-white/40">
        No messages in this conversation yet.
      </div>
    )
  }

  return (
    <div ref={scrollerRef} className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-3">
      {thread.map((message) => {
        const outgoing = message.direction === 'outgoing'
        return (
          <div
            key={message.id}
            className={`flex ${outgoing ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                outgoing
                  ? 'bg-sky-600 text-white rounded-br-md'
                  : 'bg-zinc-100 dark:bg-white/8 text-zinc-800 dark:text-white/85 rounded-bl-md'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.body}</p>
              <p
                className={`mt-1 text-[10px] ${
                  outgoing ? 'text-white/70' : 'text-zinc-400 dark:text-white/35'
                }`}
              >
                {formatDistanceToNow(message.receivedAt)} ago
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function latestReplyTargetId(conversation: InboxConversation): string | undefined {
  const incoming = [...conversation.messages]
    .reverse()
    .find((message) => message.direction !== 'outgoing' && Boolean(message.id))
  return incoming?.id || conversation.latestMessage?.id || undefined
}

function latestInboundAt(conversation: InboxConversation): string | undefined {
  const incoming = [...conversation.messages]
    .reverse()
    .find((message) => message.direction !== 'outgoing' && Boolean(message.receivedAt))
  return incoming?.receivedAt || conversation.latestMessage?.receivedAt || conversation.updatedAt || undefined
}

function InboxDetailPanel({
  conversation,
  message,
  threadLoading,
  onClose,
  onReplyConversation,
}: {
  conversation: InboxConversation | null
  message: InboxMessage | null
  threadLoading: boolean
  onClose: () => void
  onReplyConversation: (conversation: InboxConversation, body: string) => Promise<void>
}) {
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  if (!conversation && !message) {
    return (
      <div className="hidden lg:flex flex-1 min-w-[280px] max-w-md flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 dark:border-white/10 bg-white/30 dark:bg-white/2 p-8 text-center">
        <MessageCircle className="w-10 h-10 text-zinc-300 dark:text-white/15 mb-3" />
        <p className="text-sm text-zinc-500 dark:text-white/40">
          Select a conversation to view and reply
        </p>
      </div>
    )
  }

  const title = conversation?.participantName || message?.authorName || 'Conversation'
  const handle = conversation?.participantHandle || message?.authorHandle || 'user'
  const postUrl = message?.postUrl

  const handleReply = async () => {
    if (!reply.trim()) return
    setSending(true)
    try {
      if (conversation) {
        await onReplyConversation(conversation, reply)
      } else if (message) {
        await replyToMessage(message.id, reply)
      }
      setReply('')
      toast.success('Reply sent')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="hidden lg:flex flex-1 min-w-[280px] max-w-md flex-col rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/3 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-200 dark:border-white/8 flex items-center justify-between">
        <div>
          <p className="font-semibold text-zinc-900 dark:text-white">{title}</p>
          <p className="text-xs text-zinc-500 dark:text-white/40">@{handle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          Close
        </button>
      </div>

      {conversation ? (
        <ThreadMessages conversation={conversation} loading={threadLoading} />
      ) : (
        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-white/30 mb-3">
            {message?.type} · {message ? `${formatDistanceToNow(message.receivedAt)} ago` : ''}
          </p>
          <p className="text-sm text-zinc-800 dark:text-white/85 leading-relaxed whitespace-pre-wrap">
            {message?.body}
          </p>
          {postUrl && (
            <a
              href={postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-xs text-sky-600 hover:underline dark:text-sky-400"
            >
              View on Instagram
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

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
          className="w-full bg-sky-600 hover:bg-sky-500 text-white rounded-xl border-0"
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
      className="rounded-2xl border border-sky-500/25 bg-sky-500/5 p-8 text-center mb-6"
    >
      <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-yellow-400 via-red-500 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
        <Link2 className="w-7 h-7 text-white" />
      </div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
        Connect Instagram to unlock your inbox
      </h2>
      <p className="text-sm text-zinc-500 dark:text-white/45 max-w-md mx-auto mb-6 leading-relaxed">
        DMs, @mentions, and post comments appear here for the Instagram Business or Creator
        account you link on Connections.
      </p>
      <Link
        href="/dashboard/connections"
        className="inline-flex items-center justify-center bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl px-8 h-11 border-0 transition-colors"
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
    openConversation,
    closeConversation,
    appendOutgoing,
    refreshConversation,
    account,
    error,
    warning,
    syncStatus,
  } = useInbox()

  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null)

  const handleSelectMessage = (message: InboxMessage) => {
    closeConversation()
    setSelectedMessage(message)
    if (message.status === 'unread') void markRead(message.id)
  }

  const handleSelectConversation = (conversation: InboxConversation) => {
    setSelectedMessage(null)
    void openConversation(conversation)
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
  const useThreads = conversations.length > 0

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
          <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400 mb-1">
            Social
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900 dark:text-white">
            Inbox
          </h1>
          <p className="text-zinc-500 dark:text-white/40 mt-2 text-base">
            {hasInstagram
              ? needsReconnect
                ? 'Instagram needs a reconnect to sync messages'
                : `${unreadCount} unread · ${accountLabel}`
              : 'Connect Instagram to start receiving messages'}
          </p>
          {hasInstagram && account?.atHandle && !needsReconnect ? (
            <p className="mt-1 text-xs text-zinc-400 dark:text-white/35">
              Showing conversations for{' '}
              {account.profileUrl ? (
                <a
                  href={account.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-sky-600 hover:underline dark:text-sky-400"
                >
                  {account.atHandle}
                </a>
              ) : (
                <span className="font-medium text-zinc-700 dark:text-white/70">
                  {account.atHandle}
                </span>
              )}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-white/30" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations…"
              disabled={!hasInstagram}
              className="pl-10 h-10 bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 focus-visible:ring-0 focus-visible:border-sky-400/50 rounded-xl"
            />
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={isLoading || !hasInstagram}
            className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0"
            aria-label="Refresh inbox"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>

      {!hasInstagram && !isLoading && <InboxConnectBanner />}

      {hasInstagram && (error || warning) ? (
        <motion.div
          variants={itemVariants}
          role="status"
          className={`mb-4 flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-start sm:justify-between ${
            bannerTone === 'amber'
              ? 'border-amber-500/25 bg-amber-500/8'
              : 'border-sky-500/25 bg-sky-500/8'
          }`}
        >
          <div className="flex gap-3 min-w-0">
            <Info
              className={`mt-0.5 size-5 shrink-0 ${
                bannerTone === 'amber' ? 'text-amber-500' : 'text-sky-500'
              }`}
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
        </motion.div>
      ) : null}

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-zinc-500 dark:text-white/40 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading {accountLabel} inbox…
        </div>
      ) : hasInstagram ? (
        <motion.div
          variants={itemVariants}
          className="flex gap-4 overflow-x-auto pb-4 flex-1 min-h-0"
        >
          {useThreads ? (
            <InboxConversationColumn
              title="DMs"
              icon={MessageCircle}
              conversations={conversations}
              emptyTitle={needsReconnect ? 'Waiting on reconnect' : 'No DMs yet'}
              emptyDescription={
                needsReconnect
                  ? 'After reconnecting, Instagram DMs will appear here.'
                  : `Direct messages to ${accountLabel} will show up here.`
              }
              selectedId={activeConversation?.id}
              onSelect={handleSelectConversation}
            />
          ) : (
            <InboxColumn
              title="DMs"
              icon={MessageCircle}
              messages={dms}
              emptyTitle={needsReconnect ? 'Waiting on reconnect' : 'No DMs yet'}
              emptyDescription={
                needsReconnect
                  ? 'After reconnecting, Instagram DMs will appear here.'
                  : `Direct messages to ${accountLabel} will show up here.`
              }
              selectedId={selectedMessage?.id}
              onSelect={handleSelectMessage}
            />
          )}
          <InboxColumn
            title="@ Mentions"
            icon={AtSign}
            messages={mentions}
            emptyTitle={needsReconnect ? 'Waiting on reconnect' : 'No mentions'}
            emptyDescription={
              needsReconnect
                ? 'Mentions sync after Instagram is reconnected.'
                : `When someone @mentions ${accountLabel}, it appears here.`
            }
            selectedId={selectedMessage?.id}
            onSelect={handleSelectMessage}
          />
          <InboxColumn
            title="Comments"
            icon={MessageSquareText}
            messages={comments}
            emptyTitle={needsReconnect ? 'Waiting on reconnect' : 'No comments'}
            emptyDescription={
              needsReconnect
                ? 'Post comments sync after Instagram is reconnected.'
                : `Comments on ${accountLabel} posts sync to this column.`
            }
            selectedId={selectedMessage?.id}
            onSelect={handleSelectMessage}
          />
          <InboxDetailPanel
            conversation={activeConversation}
            message={selectedMessage}
            threadLoading={threadLoading}
            onClose={() => {
              closeConversation()
              setSelectedMessage(null)
            }}
            onReplyConversation={handleReplyConversation}
          />
        </motion.div>
      ) : null}
    </motion.div>
  )
}
