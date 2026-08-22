'use client'

<<<<<<< HEAD
import { motion } from 'framer-motion'
import type { ComponentType } from 'react'
import { formatDistanceToNow } from '@/lib/social/format-relative'
import type { InboxMessage } from '@/types/social'

export function InboxMessageCard({
  message,
  onSelect,
  isSelected,
}: {
  message: InboxMessage
  onSelect?: (message: InboxMessage) => void
  isSelected?: boolean
}) {
  const isUnread = message.status === 'unread'

  return (
    <motion.button
      type="button"
      layout
      onClick={() => onSelect?.(message)}
      className={`w-full text-left rounded-xl p-3.5 border transition-all ${isSelected
        ? 'bg-blue-500/10 border-blue-500/40'
        : isUnread
          ? 'bg-white dark:bg-white/8 border-zinc-200 dark:border-white/15 hover:bg-zinc-50 dark:hover:bg-white/10'
          : 'bg-white/60 dark:bg-white/3 border-zinc-200/80 dark:border-white/8 hover:bg-white dark:hover:bg-white/6'
        }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-linear-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center shrink-0 text-white text-xs font-bold">
          {message.authorName.charAt(0).toUpperCase()}
        </div>
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

export function InboxColumn({
  title,
  icon: Icon,
  messages,
  emptyTitle,
  emptyDescription,
  selectedId,
  onSelect,
}: {
  title: string
  icon: ComponentType<{ className?: string }>
  messages: InboxMessage[]
  emptyTitle: string
  emptyDescription: string
  selectedId?: string | null
  onSelect?: (message: InboxMessage) => void
}) {
  const unread = messages.filter((m) => m.status === 'unread').length

  return (
    <div className="flex-1 min-w-[300px] max-w-[400px] flex flex-col rounded-2xl overflow-hidden bg-white/40 dark:bg-white/2 border border-zinc-200 dark:border-white/8">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-200 dark:border-white/8 bg-zinc-50/80 dark:bg-white/5">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-zinc-500 dark:text-white/50" />
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">{title}</h3>
        </div>
        <span className="min-w-[1.5rem] h-6 px-1.5 rounded-full bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-white/60 flex items-center justify-center text-[11px] font-bold">
          {messages.length}
          {unread > 0 && (
            <span className="sr-only">{unread} unread</span>
          )}
        </span>
      </div>

      <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto min-h-[320px] max-h-[calc(100vh-20rem)] custom-scrollbar">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <InboxMessageCard
              key={msg.id}
              message={msg}
              isSelected={selectedId === msg.id}
              onSelect={onSelect}
            />
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center mb-3">
              <Icon className="w-5 h-5 text-zinc-400 dark:text-white/25" />
            </div>
            <p className="text-sm font-medium text-zinc-700 dark:text-white/70 mb-1">
              {emptyTitle}
            </p>
            <p className="text-xs text-zinc-500 dark:text-white/35 max-w-[200px] leading-relaxed">
              {emptyDescription}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
=======
import { AtSign, MessageCircle, MessageSquareText } from 'lucide-react'
import { formatDistanceToNow } from '@/lib/social/format-relative'
import type { InboxQueueItem } from '@/lib/inbox-utils'
import type { InboxMessageType } from '@/types/social'
import { cn } from '@/lib/utils'

const TYPE_META: Record<
  InboxMessageType,
  { label: string; Icon: typeof MessageCircle }
> = {
  dm: { label: 'DM', Icon: MessageCircle },
  mention: { label: 'Mention', Icon: AtSign },
  comment: { label: 'Comment', Icon: MessageSquareText },
}

export function InboxAvatar({
  name,
  src,
  size = 36,
}: {
  name: string
  src?: string | null
  size?: number
}) {
  const initial = (name.trim().charAt(0) || '?').toUpperCase()
  const style = { width: size, height: size, fontSize: Math.max(11, size * 0.36) }

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={style}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full bg-sky-500/15 font-semibold text-sky-700 dark:text-sky-300"
      style={style}
    >
      {initial}
    </div>
  )
}

export function InboxQueueRow({
  item,
  isSelected,
  onSelect,
}: {
  item: InboxQueueItem
  isSelected?: boolean
  onSelect: (item: InboxQueueItem) => void
}) {
  const meta = TYPE_META[item.type]
  const TypeIcon = meta.Icon

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={cn(
        'flex w-full items-start gap-3 px-3 py-3 text-left transition-colors active:scale-[0.99]',
        isSelected
          ? 'bg-sky-500/10'
          : item.unread
            ? 'bg-white hover:bg-zinc-50 dark:bg-white/6 dark:hover:bg-white/8'
            : 'hover:bg-zinc-50 dark:hover:bg-white/4'
      )}
    >
      <InboxAvatar name={item.name} src={item.avatarUrl} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'truncate text-sm text-zinc-900 dark:text-white',
              item.unread ? 'font-semibold' : 'font-medium'
            )}
          >
            {item.name}
          </span>
          <span className="shrink-0 text-[10px] text-zinc-400 dark:text-white/35">
            {formatDistanceToNow(item.receivedAt)}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[11px] text-zinc-500 dark:text-white/40">
          @{item.handle}
        </p>
        <p
          className={cn(
            'mt-1 line-clamp-2 text-xs leading-relaxed',
            item.unread
              ? 'font-medium text-zinc-800 dark:text-white/85'
              : 'text-zinc-500 dark:text-white/55'
          )}
        >
          {item.preview}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-white/8 dark:text-white/50">
            <TypeIcon className="size-3" aria-hidden="true" />
            {meta.label}
          </span>
          {item.postUrl ? (
            <span className="truncate text-[10px] text-sky-600 dark:text-sky-400">
              On a post
            </span>
          ) : null}
        </div>
      </div>
      {item.unread ? (
        <span className="mt-2 size-2 shrink-0 rounded-full bg-sky-500" />
      ) : null}
    </button>
  )
}
>>>>>>> origin/development
