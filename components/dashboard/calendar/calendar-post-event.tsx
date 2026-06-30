'use client'

import { motion } from 'framer-motion'
import type { Post } from '@/types/content'
import { formatTime } from '@/lib/calendar-utils'
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
}

interface CalendarPostEventProps {
  post: Post
  top: number
  height: number
  selected?: boolean
  index?: number
  compact?: boolean
  onSelect: (post: Post) => void
}

export function CalendarPostEvent({
  post,
  top,
  height,
  selected = false,
  index = 0,
  compact = false,
  onSelect,
}: CalendarPostEventProps) {
  const start = new Date(post.scheduled_date)
  const platform = post.social_account?.platform ?? 'Social'
  const styles = getPlatformEventStyle(platform)
  const captionPreview =
    post.caption?.trim().split('\n')[0]?.slice(0, 60) || 'Scheduled post'

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02 }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(post)
      }}
      className={cn(
        'absolute z-10 max-w-full min-w-0 text-left shadow-sm overflow-hidden',
        'text-white transition-[box-shadow,filter] hover:z-20 hover:brightness-110 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80',
        compact
          ? 'left-0.5 right-0.5 rounded-md border px-1 py-0.5'
          : 'left-1 right-1 rounded-lg border px-2 py-1.5',
        styles.bg,
        styles.border,
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
            <span className="text-[10px] font-semibold tabular-nums shrink-0">
              {formatTime(start)}
            </span>
          </div>
          {height >= 40 && (
            <p className="text-[10px] font-medium leading-tight line-clamp-2 mt-0.5 text-white/95 min-w-0 break-words">
              {captionPreview}
            </p>
          )}
        </>
      )}
    </motion.button>
  )
}
