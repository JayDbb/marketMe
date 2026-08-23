'use client'

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
  AlertTriangle,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useInbox } from '@/hooks/use-inbox'
import { InboxAvatar } from '@/components/dashboard/inbox/inbox-message-card'
import { InboxThread } from '@/components/dashboard/inbox/inbox-thread'
import type { InboxConversation, InboxMessage } from '@/types/social'
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

function ConversationCard({
  conversation,
  isSelected,
  onSelect,
}: {
  conversation: InboxConversation
  isSelected: boolean
  onSelect: () => void
}) {
  const latest = conversation.latestMessage
  const isUnread = (conversation.unreadCount || 0) > 0

  return (
    <motion.button
      type="button"
      layout
      onClick={onSelect}
      className={`w-full text-left rounded-xl p-3.5 border transition-all ${isSelected
        ? 'bg-blue-500/10 border-blue-500/40'
        : isUnread
          ? 'bg-white dark:bg-white/8 border-zinc-200 dark:border-white/15 hover:bg-zinc-50 dark:hover:bg-white/10'
          : 'bg-white/60 dark:bg-white/3 border-zinc-200/80 dark:border-white/8 hover:bg-white dark:hover:bg-white/6'
        }`}
    >
      <div className="flex items-start gap-3">
        <InboxAvatar
          name={conversation.participantName || conversation.participantHandle}
          src={conversation.participantAvatarUrl}
          size={36}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
              {conversation.participantName || conversation.participantHandle}
            </span>
            {conversation.updatedAt && (
              <span className="text-[10px] text-zinc-400 dark:text-white/35 shrink-0">
                {formatDistanceToNow(conversation.updatedAt)}
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-white/40 mb-1">
            @{conversation.participantHandle}
          </p>
          <p
            className={`text-xs leading-relaxed line-clamp-2 ${isUnread
              ? 'text-zinc-800 dark:text-white/85 font-medium'
              : 'text-zinc-500 dark:text-white/55'
              }`}
          >
            {latest?.preview || latest?.body || 'No messages yet'}
          </p>
        </div>
        {isUnread && (
          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
        )}
      </div>
    </motion.button>
  )
}

function MessageCard({
  message,
  isSelected,
  onSelect,
}: {
  message: InboxMessage
  isSelected: boolean
  onSelect: () => void
}) {
  const isUnread = message.status === 'unread'

  return (
    <motion.button
      type="button"
      layout
      onClick={onSelect}
      className={`w-full text-left rounded-xl p-3.5 border transition-all ${isSelected
        ? 'bg-blue-500/10 border-blue-500/40'
        : isUnread
          ? 'bg-white dark:bg-white/8 border-zinc-200 dark:border-white/15 hover:bg-zinc-50 dark:hover:bg-white/10'
          : 'bg-white/60 dark:bg-white/3 border-zinc-200/80 dark:border-white/8 hover:bg-white dark:hover:bg-white/6'
        }`}
    >
      <div className="flex items-start gap-3">
        <InboxAvatar message={message} size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
              {message.authorName}
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-white/35 shrink-0">
              {formatDistanceToNow(message.receivedAt)}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-white/40 mb-1">
            @{message.authorHandle}
          </p>
          <p
            className={`text-xs leading-relaxed line-clamp-2 ${isUnread
              ? 'text-zinc-800 dark:text-white/85 font-medium'
              : 'text-zinc-500 dark:text-white/55'
              }`}
          >
            {message.preview || message.body}
          </p>
        </div>
        {isUnread && (
          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
        )}
      </div>
    </motion.button>
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
    conversations,
    activeConversation,
    openConversation,
    threadLoading,
    mentions,
    comments,
    isLoading,
    searchQuery,
    setSearchQuery,
    hasInstagram,
    unreadCount,
    warning,
    error,
    refresh,
    archive,
    appendOutgoing,
  } = useInbox()

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
      </motion.div>

      {!hasInstagram && !isLoading && <InboxConnectBanner />}

      {(warning || error) && !isLoading && (
        <motion.div
          variants={itemVariants}
          className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs leading-relaxed"
        >
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-0.5">Instagram Sync Notice</p>
            <p>{warning || error}</p>
          </div>
        </motion.div>
      )}

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
          {/* DMs Column - Uses Conversations */}
          <div className="flex-1 min-w-[300px] max-w-[400px] flex flex-col rounded-2xl overflow-hidden bg-white/40 dark:bg-white/2 border border-zinc-200 dark:border-white/8">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-200 dark:border-white/8 bg-zinc-50/80 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-zinc-500 dark:text-white/50" />
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">DMs</h3>
              </div>
              <span className="min-w-[1.5rem] h-6 px-1.5 rounded-full bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-white/60 flex items-center justify-center text-[11px] font-bold">
                {conversations.length}
              </span>
            </div>
            <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto min-h-[320px] max-h-[calc(100vh-20rem)] custom-scrollbar">
              {conversations.length > 0 ? (
                conversations.map((conv) => (
                  <ConversationCard
                    key={conv.id}
                    conversation={conv}
                    isSelected={activeConversation?.id === conv.id}
                    onSelect={() => openConversation(conv)}
                  />
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <p className="text-sm font-medium text-zinc-700 dark:text-white/70 mb-1">
                    No DMs yet
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-white/35 max-w-[200px] leading-relaxed">
                    Direct messages from Instagram will show up here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Mentions Column */}
          <div className="flex-1 min-w-[300px] max-w-[400px] flex flex-col rounded-2xl overflow-hidden bg-white/40 dark:bg-white/2 border border-zinc-200 dark:border-white/8">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-200 dark:border-white/8 bg-zinc-50/80 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <AtSign className="w-4 h-4 text-zinc-500 dark:text-white/50" />
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">@ Mentions</h3>
              </div>
              <span className="min-w-[1.5rem] h-6 px-1.5 rounded-full bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-white/60 flex items-center justify-center text-[11px] font-bold">
                {mentions.length}
              </span>
            </div>
            <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto min-h-[320px] max-h-[calc(100vh-20rem)] custom-scrollbar">
              {mentions.length > 0 ? (
                mentions.map((msg) => (
                  <MessageCard
                    key={msg.id}
                    message={msg}
                    isSelected={false}
                    onSelect={() => { }}
                  />
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <p className="text-sm font-medium text-zinc-700 dark:text-white/70 mb-1">
                    No mentions
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-white/35 max-w-[200px] leading-relaxed">
                    When someone @mentions you, it appears here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Comments Column */}
          <div className="flex-1 min-w-[300px] max-w-[400px] flex flex-col rounded-2xl overflow-hidden bg-white/40 dark:bg-white/2 border border-zinc-200 dark:border-white/8">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-200 dark:border-white/8 bg-zinc-50/80 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <MessageSquareText className="w-4 h-4 text-zinc-500 dark:text-white/50" />
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">Comments</h3>
              </div>
              <span className="min-w-[1.5rem] h-6 px-1.5 rounded-full bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-white/60 flex items-center justify-center text-[11px] font-bold">
                {comments.length}
              </span>
            </div>
            <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto min-h-[320px] max-h-[calc(100vh-20rem)] custom-scrollbar">
              {comments.length > 0 ? (
                comments.map((msg) => (
                  <MessageCard
                    key={msg.id}
                    message={msg}
                    isSelected={false}
                    onSelect={() => { }}
                  />
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <p className="text-sm font-medium text-zinc-700 dark:text-white/70 mb-1">
                    No comments
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-white/35 max-w-[200px] leading-relaxed">
                    Comments on your posts sync to this column.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - New InboxThread Component */}
          <div className="hidden lg:flex flex-1 min-w-[320px] max-w-md flex-col rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/3 overflow-hidden">
            <InboxThread
              item={null}
              conversation={activeConversation}
              threadLoading={threadLoading}
              onArchive={archive}
              onReplyConversation={async (conv, body) => {
                await replyToMessage(conv.id, body, conv.connectionId)
                appendOutgoing(conv.id, body)
              }}
            />
          </div>
        </motion.div>
      ) : null}
    </motion.div>
  )
}

export function InboxSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-20 rounded-xl bg-zinc-100 dark:bg-white/5 animate-pulse" />
      ))}
    </div>
  )
}

//updated