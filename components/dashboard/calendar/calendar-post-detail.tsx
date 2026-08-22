'use client'

import { useState } from 'react'
import type { Post } from '@/types/content'
import { Button } from '@/components/ui/button'
import { PostStatusBadge } from '@/components/dashboard/post-status-badge'
<<<<<<< HEAD
import { formatTimeRange, DEFAULT_POST_DURATION_MIN } from '@/lib/calendar-utils'
import { getPlatformEventStyle } from '@/components/dashboard/calendar/calendar-post-event'
import { CheckCircle2, Clock, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
=======
import { formatTimeRange, DEFAULT_POST_DURATION_MIN, parseScheduledDate } from '@/lib/calendar-utils'
import { formatPlatform } from '@/lib/post-utils'
import { CheckCircle2, Clock, Loader2, Pencil, X } from 'lucide-react'
>>>>>>> origin/development

interface CalendarPostDetailProps {
  post: Post
  onClose: () => void
<<<<<<< HEAD
  onApprove: (postId: string) => Promise<{ success: boolean; error?: string }>
  onSchedule: (postId: string) => Promise<{ success: boolean; error?: string }>
  onUpdated?: () => void
=======
  onEdit: (post: Post) => void
  onApprove: (postId: string) => Promise<{ success: boolean; error?: string }>
  onSchedule: (postId: string) => Promise<{ success: boolean; error?: string }>
  onUpdated?: () => void
  timeZone?: string
>>>>>>> origin/development
}

export function CalendarPostDetail({
  post,
  onClose,
<<<<<<< HEAD
  onApprove,
  onSchedule,
  onUpdated,
=======
  onEdit,
  onApprove,
  onSchedule,
  onUpdated,
  timeZone,
>>>>>>> origin/development
}: CalendarPostDetailProps) {
  const [loading, setLoading] = useState<'approve' | 'schedule' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

<<<<<<< HEAD
  const platform = post.social_account?.platform ?? 'Social'
  const styles = getPlatformEventStyle(platform)
  const postId = String(post.post_id)
  const timeLabel = formatTimeRange(
    new Date(post.scheduled_date),
    DEFAULT_POST_DURATION_MIN
  )
=======
  const platform = formatPlatform(post.social_account?.platform)
  const start = parseScheduledDate(post.scheduled_date)
  const postId = String(post.post_id)
  const timeLabel = start
    ? formatTimeRange(start, DEFAULT_POST_DURATION_MIN, timeZone)
    : 'Not scheduled'

  const canEdit = post.status !== 'published'
>>>>>>> origin/development

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
<<<<<<< HEAD
            <span
              className={cn(
                'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md text-white',
                styles.bg
              )}
            >
=======
            <span className="rounded-md border border-sky-500/25 bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-sky-700 uppercase dark:text-sky-300">
>>>>>>> origin/development
              {platform}
            </span>
            <PostStatusBadge status={post.status} />
          </div>
          <p className="text-[11px] font-mono text-zinc-500 dark:text-white/40">{timeLabel}</p>
        </div>
<<<<<<< HEAD
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10"
          aria-label="Close post detail"
        >
          <X className="w-4 h-4" />
        </button>
=======
        <div className="flex shrink-0 items-center gap-1">
          {canEdit ? (
            <button
              type="button"
              onClick={() => onEdit(post)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-sky-400 ui-transition hover:bg-sky-500/10 hover:text-sky-300 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              Edit
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 ui-transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80"
            aria-label="Close post detail"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
>>>>>>> origin/development
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
<<<<<<< HEAD
=======
        {canEdit ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => onEdit(post)}
            className="h-9 gap-2 rounded-xl border-border text-xs font-semibold"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit post
          </Button>
        ) : null}
>>>>>>> origin/development
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
