'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Check,
  ExternalLink,
  Loader2,
  MessageCircle,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { InboxAvatar } from '@/components/dashboard/inbox/inbox-message-card'
import {
  archiveTargetId,
  isInstagramDmWindowClosed,
  latestInboundAt,
  type InboxQueueItem,
} from '@/lib/inbox-utils'
import { formatDistanceToNow } from '@/lib/social/format-relative'
import { replyToMessage } from '@/lib/social/inbox-api'
import type { InboxConversation } from '@/types/social'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
      <div className="flex flex-1 items-center justify-center gap-2 text-zinc-500 dark:text-white/40">
        <Loader2 className="size-4 animate-spin" />
        Loading thread
      </div>
    )
  }

  if (thread.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-5 text-center text-sm text-zinc-500 dark:text-white/40">
        No messages in this conversation yet.
      </div>
    )
  }

  return (
    <div
      ref={scrollerRef}
      className="custom-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-5"
    >
      {thread.map((message) => {
        const outgoing = message.direction === 'outgoing'
        return (
          <div
            key={message.id}
            className={cn('flex', outgoing ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-3.5 py-2.5',
                outgoing
                  ? 'rounded-br-md bg-sky-600 text-white'
                  : 'rounded-bl-md bg-zinc-100 text-zinc-800 dark:bg-white/8 dark:text-white/85'
              )}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.body}
              </p>
              <p
                className={cn(
                  'mt-1 text-[10px]',
                  outgoing ? 'text-white/70' : 'text-zinc-400 dark:text-white/35'
                )}
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

export function InboxThread({
  item,
  conversation,
  threadLoading,
  onArchive,
  onReplyConversation,
}: {
  item: InboxQueueItem | null
  conversation: InboxConversation | null
  threadLoading: boolean
  onArchive: (messageId: string) => Promise<void>
  onReplyConversation: (
    conversation: InboxConversation,
    body: string
  ) => Promise<void>
}) {
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const activeConversation = conversation ?? item?.conversation ?? null
  const message = item?.message ?? null
  const title = activeConversation?.participantName || message?.authorName || ''
  const handle =
    activeConversation?.participantHandle || message?.authorHandle || 'user'
  const avatarUrl =
    activeConversation?.participantAvatarUrl || message?.authorAvatarUrl
  const postUrl = message?.postUrl || activeConversation?.latestMessage?.postUrl
  const inboundAt = activeConversation
    ? latestInboundAt(activeConversation)
    : message?.receivedAt
  const windowClosed =
    Boolean(activeConversation) && isInstagramDmWindowClosed(inboundAt)
  const canReply = Boolean(activeConversation || message) && !windowClosed
  const archiveId = item ? archiveTargetId(item) : undefined

  const handleReply = async () => {
    if (!reply.trim() || !canReply) return
    setSending(true)
    try {
      if (activeConversation) {
        await onReplyConversation(activeConversation, reply)
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

  if (!item && !activeConversation) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center p-8 text-center">
        <MessageCircle className="mb-3 size-10 text-zinc-300 dark:text-white/15" />
        <p className="text-sm text-zinc-500 dark:text-white/40">
          Select a conversation to view and reply
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4 dark:border-white/8">
        <div className="flex min-w-0 items-center gap-3">
          <InboxAvatar name={title || handle} src={avatarUrl} size={40} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-zinc-900 dark:text-white">
              {title || 'Conversation'}
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-white/40">
              @{handle}
              {item?.type === 'mention'
                ? ' · Mention'
                : item?.type === 'comment'
                  ? ' · Comment'
                  : ' · Direct message'}
            </p>
          </div>
        </div>
        {archiveId ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={archiving}
            onClick={async () => {
              setArchiving(true)
              try {
                await onArchive(archiveId)
              } finally {
                setArchiving(false)
              }
            }}
            className="h-11 min-h-11 shrink-0 rounded-lg border-zinc-200 dark:border-white/10"
          >
            {archiving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
            Done
          </Button>
        ) : null}
      </div>

      {activeConversation ? (
        <ThreadMessages
          conversation={activeConversation}
          loading={threadLoading}
        />
      ) : (
        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
          <p className="mb-3 text-[10px] tracking-wider text-zinc-400 uppercase dark:text-white/30">
            {message?.type} ·{' '}
            {message ? `${formatDistanceToNow(message.receivedAt)} ago` : ''}
          </p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-800 dark:text-white/85">
            {message?.body}
          </p>
          {postUrl ? (
            <a
              href={postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-sky-600 hover:underline dark:text-sky-400"
            >
              View post on Instagram
              <ExternalLink className="size-3" />
            </a>
          ) : null}
        </div>
      )}

      {postUrl && activeConversation ? (
        <div className="shrink-0 border-t border-zinc-200 px-5 py-2 dark:border-white/8">
          <a
            href={postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-sky-600 hover:underline dark:text-sky-400"
          >
            View post on Instagram
            <ExternalLink className="size-3" />
          </a>
        </div>
      ) : null}

      <div className="shrink-0 space-y-2 border-t border-zinc-200 p-4 dark:border-white/8">
        {windowClosed ? (
          <p className="rounded-lg bg-zinc-100 px-3 py-2 text-xs leading-relaxed text-zinc-600 dark:bg-white/6 dark:text-white/55">
            Instagram only allows replies within 7 days of the last customer
            message. Reply in the Instagram app, or wait for them to message
            again.
          </p>
        ) : null}
        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void handleReply()
            }
          }}
          placeholder={
            windowClosed ? 'Reply window closed' : 'Write a reply…'
          }
          disabled={!canReply || sending}
          className="min-h-[80px] resize-none border-zinc-200 bg-zinc-50 text-sm dark:border-white/10 dark:bg-white/5"
        />
        <Button
          onClick={() => void handleReply()}
          disabled={sending || !reply.trim() || !canReply}
          className="h-11 min-h-11 w-full rounded-xl border-0 bg-sky-600 text-white hover:bg-sky-500"
        >
          {sending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Send className="mr-2 size-4" />
              Send reply
            </>
          )}
        </Button>
        {!windowClosed ? (
          <p className="text-[11px] text-zinc-400 dark:text-white/35">
            Enter to send · Shift+Enter for a new line
          </p>
        ) : null}
      </div>
    </div>
  )
}
