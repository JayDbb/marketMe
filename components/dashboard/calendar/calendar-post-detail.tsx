'use client'

import { useState } from 'react'
import type { Post } from '@/types/content'
import { Button } from '@/components/ui/button'
import { PostStatusBadge } from '@/components/dashboard/post-status-badge'
import { formatTimeRange, DEFAULT_POST_DURATION_MIN } from '@/lib/calendar-utils'
import { getPlatformEventStyle } from '@/components/dashboard/calendar/calendar-post-event'
import { CheckCircle2, Clock, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalendarPostDetailProps {
  post: Post
  onClose: () => void
  onApprove: (postId: string) => Promise<{ success: boolean; error?: string }>
  onSchedule: (postId: string) => Promise<{ success: boolean; error?: string }>
  onUpdated?: () => void
}

export function CalendarPostDetail({
  post,
  onClose,
  onApprove,
  onSchedule,
  onUpdated,
}: CalendarPostDetailProps) {
  const [loading, setLoading] = useState<'approve' | 'schedule' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const platform = post.social_account?.platform ?? 'Social'
  const styles = getPlatformEventStyle(platform)
  const postId = String(post.post_id)
  const timeLabel = formatTimeRange(
    new Date(post.scheduled_date),
    DEFAULT_POST_DURATION_MIN
  )

  const runAction = async (
    type: 'approve' | 'schedule',
    fn: () => Promise<{ success: boolean; error?: string }>
  ) => {
    setLoading(type)
    setActionError(null)
    const result = await fn()
    setLoading(null)
    if (!result.success) {
      setActionError(result.error ?? 'Action failed')
      return
    }
    onUpdated?.()
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-white/5 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={cn(
                'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md text-white',
                styles.bg
              )}
            >
              {platform}
            </span>
            <PostStatusBadge status={post.status} />
          </div>
          <p className="text-[11px] font-mono text-zinc-500 dark:text-white/40">{timeLabel}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10"
          aria-label="Close post detail"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {post.media_url ? (
        <div className="relative w-full h-28 rounded-lg overflow-hidden border border-zinc-200 dark:border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.media_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ) : null}

      <p className="text-sm text-zinc-700 dark:text-white/80 leading-relaxed line-clamp-5">
        {post.caption || 'No caption'}
      </p>

      {actionError ? (
        <p
          role="alert"
          className="text-xs text-red-600 dark:text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
        >
          {actionError}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 pt-1">
        {post.status === 'draft' && (
          <Button
            type="button"
            disabled={loading !== null}
            onClick={() => void runAction('approve', () => onApprove(postId))}
            className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-2"
          >
            {loading === 'approve' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            Approve post
          </Button>
        )}
        {post.status === 'approved' && (
          <Button
            type="button"
            disabled={loading !== null}
            onClick={() => void runAction('schedule', () => onSchedule(postId))}
            className="h-9 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs gap-2"
          >
            {loading === 'schedule' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Clock className="w-3.5 h-3.5" />
            )}
            Queue for publish
          </Button>
        )}
        {post.status === 'scheduled' && (
          <p className="text-xs text-zinc-500 dark:text-white/45 text-center py-1">
            Queued — will publish when Instagram is connected.
          </p>
        )}
        {post.status === 'published' && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center py-1 font-medium">
            Published
          </p>
        )}
      </div>
    </div>
  )
}
