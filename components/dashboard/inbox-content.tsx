'use client'

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
      await replyToMessage(message.id, reply)
      setReply('')
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
        <p className="text-[10px] text-zinc-400 dark:text-white/25 text-center">
          TODO(backend): wire to Instagram Graph API send endpoint
        </p>
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
  )
}
