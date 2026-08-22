'use client'

<<<<<<< HEAD
import { motion } from 'framer-motion'
import type { Post } from '@/types/content'
import { formatTime } from '@/lib/calendar-utils'
import { getPostStatusEventModifiers, PostStatusBadge } from '@/components/dashboard/post-status-badge'
import { cn } from '@/lib/utils'

const PLATFORM_EVENT_STYLES: Record<
  string,
  { bg: string; border: string; badge: string }
> = {
  instagram: {
    bg: 'bg-gradient-to-br from-fuchsia-600 to-purple-700',
    border: 'border-fuchsia-400/40',
    badge: 'bg-white/20 text-white',
  },
  twitter: {
    bg: 'bg-gradient-to-br from-sky-600 to-sky-800',
    border: 'border-sky-400/40',
    badge: 'bg-white/20 text-white',
  },
  linkedin: {
    bg: 'bg-gradient-to-br from-blue-600 to-blue-800',
    border: 'border-blue-400/40',
    badge: 'bg-white/20 text-white',
  },
  facebook: {
    bg: 'bg-gradient-to-br from-indigo-600 to-indigo-800',
    border: 'border-indigo-400/40',
    badge: 'bg-white/20 text-white',
  },
}

const DEFAULT_EVENT_STYLE = {
  bg: 'bg-gradient-to-br from-blue-600 to-blue-800',
  border: 'border-blue-400/40',
  badge: 'bg-white/20 text-white',
}

export function getPlatformEventStyle(platform?: string) {
  return PLATFORM_EVENT_STYLES[platform?.toLowerCase() ?? ''] ?? DEFAULT_EVENT_STYLE
=======
import { useRef, useState } from 'react'
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
>>>>>>> origin/development
}

interface CalendarPostEventProps {
  post: Post
  top: number
  height: number
  selected?: boolean
<<<<<<< HEAD
  index?: number
  compact?: boolean
=======
  compact?: boolean
  col?: number
  colCount?: number
  timeZone?: string
>>>>>>> origin/development
  onSelect: (post: Post) => void
}

export function CalendarPostEvent({
  post,
  top,
  height,
  selected = false,
<<<<<<< HEAD
  index = 0,
  compact = false,
  onSelect,
}: CalendarPostEventProps) {
  const start = new Date(post.scheduled_date)
  const platform = post.social_account?.platform ?? 'Social'
  const styles = getPlatformEventStyle(platform)
  const statusModifiers = getPostStatusEventModifiers(post.status)
  const captionPreview =
    post.caption?.trim().split('\n')[0]?.slice(0, 60) || 'Scheduled post'

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02 }}
=======
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
  className,
}: {
  url?: string | null
  compact?: boolean
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const size = compact ? 'size-5' : 'size-8'

  if (!url || failed) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded border border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-white/5',
          className ?? size
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
      className={cn('shrink-0 rounded object-cover', className ?? size)}
      onError={() => setFailed(true)}
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
>>>>>>> origin/development
      onClick={(e) => {
        e.stopPropagation()
        onSelect(post)
      }}
      className={cn(
<<<<<<< HEAD
        'absolute z-10 max-w-full min-w-0 text-left shadow-sm overflow-hidden',
        'text-white transition-[box-shadow,filter] hover:z-20 hover:brightness-110 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80',
        compact
          ? 'left-0.5 right-0.5 rounded-md border px-1 py-0.5'
          : 'left-1 right-1 rounded-lg border px-2 py-1.5',
        styles.bg,
        styles.border,
        statusModifiers.opacity,
        statusModifiers.ring,
        selected && 'z-30 ring-2 ring-inset ring-white/90 shadow-md brightness-110'
      )}
      style={{ top, height }}
      aria-pressed={selected}
      aria-label={`${platform} post at ${formatTime(start)}: ${captionPreview}`}
    >
      {compact ? (
        <div className="flex flex-col h-full min-w-0 gap-0.5">
          <div className="flex items-center justify-between gap-0.5 min-w-0">
            <span className="text-[8px] font-bold uppercase tracking-wide truncate shrink min-w-0">
              {platform.slice(0, 3)}
            </span>
            <span className="text-[8px] font-semibold tabular-nums shrink-0 opacity-90">
              {formatTime(start).replace(':00', '').replace(' ', '')}
            </span>
          </div>
          {height >= 36 && (
            <p className="text-[8px] leading-tight line-clamp-2 opacity-90 min-w-0 break-words">
              {captionPreview}
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-1 min-w-0">
            <span
              className={cn(
                'text-[9px] font-bold uppercase tracking-wider px-1 py-px rounded truncate shrink min-w-0',
                styles.badge
              )}
            >
              {platform}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {!compact && height >= 48 && (
                <PostStatusBadge status={post.status} compact className="scale-90 origin-right border-white/20 bg-black/20 text-white" />
              )}
              <span className="text-[10px] font-semibold tabular-nums">
                {formatTime(start)}
              </span>
            </div>
          </div>
          {height >= 40 && (
            <p className="text-[10px] font-medium leading-tight line-clamp-2 mt-0.5 text-white/95 min-w-0 break-words">
              {captionPreview}
            </p>
          )}
        </>
      )}
    </motion.button>
=======
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
>>>>>>> origin/development
  )
}
