'use client'

import { useRef } from 'react'
import { ImageIcon } from 'lucide-react'
import type { Post } from '@/types/content'
import {
  canReschedulePost,
  formatTime,
  parseScheduledDate,
} from '@/lib/calendar-utils'
import { setPlannerDragData } from '@/lib/planner-dnd'
import { PostStatusBadge } from '@/components/dashboard/post-status-badge'
import { formatPlatform } from '@/lib/post-utils'
import { cn } from '@/lib/utils'

function statusAccent(status: Post['status'] | string): string {
  switch (status) {
    case 'scheduled':
      return 'border-l-sky-500'
    case 'approved':
      return 'border-l-emerald-500'
    case 'published':
      return 'border-l-sky-300'
    case 'failed':
    case 'rejected':
      return 'border-l-red-400'
    default:
      return 'border-l-zinc-400'
  }
}

interface CalendarPostEventProps {
  post: Post
  top: number
  height: number
  selected?: boolean
  compact?: boolean
  col?: number
  colCount?: number
  timeZone?: string
  onSelect: (post: Post) => void
}

export function CalendarPostEvent({
  post,
  top,
  height,
  selected = false,
  compact = false,
  col = 0,
  colCount = 1,
  timeZone,
  onSelect,
}: CalendarPostEventProps) {
  const start = parseScheduledDate(post.scheduled_date)
  const platform = formatPlatform(post.social_account?.platform)
  const captionPreview =
    post.caption?.trim().split('\n')[0]?.slice(0, 60) || 'Untitled post'
  const movable = canReschedulePost(post)
  const timeLabel = start ? formatTime(start, timeZone) : 'No time'
  const insetPct = colCount > 1 ? (col / colCount) * 100 : 0
  const widthPct = colCount > 1 ? 100 / colCount : 100
  const didDrag = useRef(false)

  return (
    <button
      type="button"
      draggable={movable}
      onDragStart={(e) => {
        if (!movable) {
          e.preventDefault()
          return
        }
        e.stopPropagation()
        didDrag.current = true
        setPlannerDragData(e, {
          postId: String(post.post_id),
          source: 'event',
          scheduledDate: post.scheduled_date,
        })
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (didDrag.current) {
          didDrag.current = false
          return
        }
        onSelect(post)
      }}
      className={cn(
        'absolute z-10 overflow-hidden text-left',
        'border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#1c2330]',
        'border-l-[3px] shadow-sm',
        'transition-[box-shadow,border-color,opacity] duration-150',
        'hover:z-20 hover:border-sky-500/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80',
        'active:scale-[0.99]',
        compact ? 'rounded-md px-1 py-0.5' : 'rounded-lg px-1.5 py-1',
        statusAccent(post.status),
        selected && 'z-30 ring-2 ring-sky-500/70',
        movable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      )}
      style={{
        top,
        height,
        left: `calc(${insetPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
      }}
      aria-pressed={selected}
      aria-label={`${platform} post at ${timeLabel}: ${captionPreview}`}
    >
      {compact ? (
        <div className="flex h-full min-w-0 items-start gap-1">
          <EventThumb url={post.media_url} compact />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-0.5">
              <span className="truncate text-[10px] font-semibold text-zinc-700 dark:text-white/80">
                {platform}
              </span>
              <span className="shrink-0 text-[10px] font-medium tabular-nums text-zinc-500 dark:text-white/50">
                {timeLabel.replace(':00', '')}
              </span>
            </div>
            {height >= 36 ? (
              <p className="line-clamp-2 text-[10px] leading-tight text-zinc-500 dark:text-white/55">
                {captionPreview}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex h-full min-w-0 gap-1.5">
          <EventThumb url={post.media_url} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
                {platform}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                {height >= 48 ? (
                  <PostStatusBadge status={post.status} compact />
                ) : null}
                <span className="text-[10px] font-medium tabular-nums text-zinc-500 dark:text-white/50">
                  {timeLabel}
                </span>
              </div>
            </div>
            {height >= 40 ? (
              <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-tight text-zinc-800 dark:text-white/85">
                {captionPreview}
              </p>
            ) : null}
          </div>
        </div>
      )}
    </button>
  )
}

export function EventThumb({
  url,
  compact = false,
}: {
  url?: string | null
  compact?: boolean
}) {
  const size = compact ? 'size-5' : 'size-8'
  if (!url) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded border border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-white/5',
          size
        )}
      >
        <ImageIcon className="size-3 text-zinc-400" aria-hidden="true" />
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      className={cn('shrink-0 rounded object-cover', size)}
    />
  )
}

export function OverflowPostChip({
  post,
  selected,
  onSelect,
  timeZone,
}: {
  post: Post
  selected?: boolean
  onSelect: (post: Post) => void
  timeZone?: string
}) {
  const start = parseScheduledDate(post.scheduled_date)
  const movable = canReschedulePost(post)
  const platform = formatPlatform(post.social_account?.platform)
  const timeLabel = start ? formatTime(start, timeZone) : ''

  return (
    <button
      type="button"
      draggable={movable}
      onDragStart={(e) => {
        if (!movable) {
          e.preventDefault()
          return
        }
        e.stopPropagation()
        setPlannerDragData(e, {
          postId: String(post.post_id),
          source: 'event',
          scheduledDate: post.scheduled_date,
        })
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(post)
      }}
      className={cn(
        'flex w-full items-center gap-1 rounded-md border px-1 py-0.5 text-left',
        'border-zinc-200 bg-white dark:border-white/10 dark:bg-[#1c2330]',
        'hover:border-sky-500/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80',
        selected && 'ring-2 ring-sky-500/70',
        movable ? 'cursor-grab' : 'cursor-pointer'
      )}
      aria-label={`${platform} post at ${timeLabel} (outside visible hours)`}
    >
      <EventThumb url={post.media_url} compact />
      <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-zinc-700 dark:text-white/80">
        {timeLabel} {platform}
      </span>
    </button>
  )
}
