'use client'

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
