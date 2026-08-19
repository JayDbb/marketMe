'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { Post } from '@/types/content'
import {
  canReschedulePost,
  DEFAULT_POST_DURATION_MIN,
  formatTimeRange,
  getPostsForDay,
  isDateInWeek,
  isSameDay,
  isToday,
  parseScheduledDate,
} from '@/lib/calendar-utils'
import { setPlannerDragData } from '@/lib/planner-dnd'
import { EventThumb } from '@/components/dashboard/calendar/calendar-post-event'
import { CalendarPostDetail } from '@/components/dashboard/calendar/calendar-post-detail'
import { PostStatusBadge } from '@/components/dashboard/post-status-badge'
import { formatPlatform } from '@/lib/post-utils'
import { cn } from '@/lib/utils'
import type { WeekStartsOn } from '@/types/settings'
import type { PlannerViewMode } from '@/lib/calendar-utils'

interface CalendarSidebarProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  posts: Post[]
  undatedDrafts: Post[]
  selectedPostId?: string | number | null
  onPostSelect: (post: Post) => void
  onCreatePost: () => void
  onEditPost: (post: Post) => void
  onApprovePost: (postId: string) => Promise<{ success: boolean; error?: string }>
  onSchedulePost: (postId: string) => Promise<{ success: boolean; error?: string }>
  onClearSelection?: () => void
  onPostsUpdated?: () => void
  viewMode: PlannerViewMode
  weekStartsOn?: WeekStartsOn
  timeZone?: string
  className?: string
}

function CalendarPostListItem({
  post,
  selected,
  onSelect,
  timeZone,
}: {
  post: Post
  selected: boolean
  onSelect: () => void
  timeZone?: string
}) {
  const platform = formatPlatform(post.social_account?.platform)
  const start = parseScheduledDate(post.scheduled_date)
  const movable = canReschedulePost(post)

  return (
    <button
      type="button"
      draggable={movable}
      onDragStart={(e) => {
        if (!movable) {
          e.preventDefault()
          return
        }
        setPlannerDragData(e, {
          postId: String(post.post_id),
          source: 'event',
          scheduledDate: post.scheduled_date,
        })
      }}
      onClick={onSelect}
      className={cn(
        'w-full rounded-xl border px-3 py-2.5 text-left ui-transition',
        selected
          ? 'border-blue-500/50 bg-blue-500/10 ring-1 ring-blue-500/30'
          : 'border-zinc-200 bg-white/60 hover:bg-white dark:border-white/8 dark:bg-white/5 dark:hover:bg-white/8',
        movable ? 'cursor-grab' : 'cursor-pointer'
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-zinc-500 dark:text-white/40">
          {start
            ? formatTimeRange(start, DEFAULT_POST_DURATION_MIN, timeZone)
            : 'Not scheduled'}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          <PostStatusBadge status={post.status} compact />
          <span className="rounded-md border border-sky-500/25 bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-sky-700 uppercase dark:text-sky-300">
            {platform}
          </span>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <EventThumb url={post.media_url} compact />
        <p className="line-clamp-2 text-xs leading-relaxed text-zinc-700 dark:text-white/70">
          {post.caption || 'Scheduled post'}
        </p>
      </div>
    </button>
  )
}

function DraftRailItem({
  post,
  selected,
  onSelect,
}: {
  post: Post
  selected: boolean
  onSelect: () => void
}) {
  const platform = formatPlatform(post.social_account?.platform)

  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => {
        setPlannerDragData(e, {
          postId: String(post.post_id),
          source: 'draft',
        })
      }}
      onClick={onSelect}
      className={cn(
        'flex w-full cursor-grab items-center gap-2 rounded-xl border px-2.5 py-2 text-left ui-transition',
        selected
          ? 'border-blue-500/50 bg-blue-500/10'
          : 'border-zinc-200 bg-white/60 hover:bg-white dark:border-white/8 dark:bg-white/5 dark:hover:bg-white/8'
      )}
    >
      <EventThumb url={post.media_url} compact />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-zinc-800 dark:text-white/85">
          {post.caption?.trim().split('\n')[0] || 'Untitled draft'}
        </p>
        <p className="text-[10px] text-zinc-500 dark:text-white/40">{platform}</p>
      </div>
    </button>
  )
}

export function CalendarSidebar({
  selectedDate,
  onDateChange,
  posts,
  undatedDrafts,
  selectedPostId,
  onPostSelect,
  onCreatePost,
  onEditPost,
  onApprovePost,
  onSchedulePost,
  onClearSelection,
  onPostsUpdated,
  viewMode,
  weekStartsOn = 'monday',
  timeZone,
  className,
}: CalendarSidebarProps) {
  const dayLabels =
    weekStartsOn === 'sunday'
      ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
      : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  let startingDayOfWeek =
    weekStartsOn === 'sunday'
      ? firstDayOfMonth.getDay()
      : firstDayOfMonth.getDay() - 1
  if (startingDayOfWeek === -1) startingDayOfWeek = 6

  const prevMonthDays = new Date(year, month, 0).getDate()
  const prevMonthDates = Array.from(
    { length: startingDayOfWeek },
    (_, i) => prevMonthDays - startingDayOfWeek + i + 1
  )
  const currentMonthDates = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const remainingCells = (7 - ((startingDayOfWeek + daysInMonth) % 7)) % 7
  const nextMonthDates = Array.from({ length: remainingCells }, (_, i) => i + 1)

  const handlePrevMonth = () => {
    const d = new Date(selectedDate)
    d.setMonth(d.getMonth() - 1)
    onDateChange(d)
  }

  const handleNextMonth = () => {
    const d = new Date(selectedDate)
    d.setMonth(d.getMonth() + 1)
    onDateChange(d)
  }

  const handleDateClick = (day: number, monthOffset: 0 | -1 | 1 = 0) => {
    const d = new Date(selectedDate)
    d.setMonth(d.getMonth() + monthOffset, day)
    onDateChange(d)
  }

  const dayPosts = getPostsForDay(posts, selectedDate, timeZone)
  const selectedPost =
    selectedPostId != null
      ? posts.find((p) => p.post_id === selectedPostId) ??
        undatedDrafts.find((p) => p.post_id === selectedPostId) ??
        null
      : null

  const dayLabel = isToday(selectedDate, timeZone)
    ? 'Today'
    : selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })

  return (
    <div
      className={cn(
        'relative z-10 flex w-[320px] shrink-0 flex-col overflow-x-hidden overflow-y-auto rounded-[2rem] border border-border bg-card/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] custom-scrollbar dark:border-white/10 dark:bg-[#161b22]/90 dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]',
        className
      )}
    >
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-bold tracking-wide text-zinc-900 dark:text-white">
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h4>
          <div className="flex gap-1">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="flex size-7 items-center justify-center rounded-lg bg-white text-zinc-500 transition-colors hover:bg-zinc-100 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="flex size-7 items-center justify-center rounded-lg bg-white text-zinc-500 transition-colors hover:bg-zinc-100 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-y-2">
          {dayLabels.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-white/30"
            >
              {d}
            </div>
          ))}

          {prevMonthDates.map((d) => {
            const cellDate = new Date(year, month - 1, d)
            const selected = isSameDay(cellDate, selectedDate)
            const inVisibleWeek =
              viewMode === 'Week' && isDateInWeek(cellDate, selectedDate, weekStartsOn)
            return (
              <div key={`prev-${d}`} className="flex justify-center">
                <button
                  onClick={() => handleDateClick(d, -1)}
                  className={`flex size-7 items-center justify-center rounded-full text-xs transition-colors ${
                    selected
                      ? 'bg-blue-500 text-white'
                      : inVisibleWeek
                        ? 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/25'
                        : 'text-zinc-400 hover:bg-zinc-100 dark:text-white/20 dark:hover:bg-white/5'
                  }`}
                >
                  {d}
                </button>
              </div>
            )
          })}

          {currentMonthDates.map((d) => {
            const cellDate = new Date(year, month, d)
            const selected = isSameDay(cellDate, selectedDate)
            const today = isToday(cellDate, timeZone)
            const inVisibleWeek =
              viewMode === 'Week' && isDateInWeek(cellDate, selectedDate, weekStartsOn)
            const hasPosts = getPostsForDay(posts, cellDate, timeZone).length > 0

            return (
              <div key={d} className="flex justify-center">
                <button
                  onClick={() => handleDateClick(d)}
                  className={`relative flex size-7 items-center justify-center rounded-full text-xs font-medium ui-transition ${
                    selected
                      ? 'bg-blue-500 text-white'
                      : inVisibleWeek
                        ? 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/25'
                        : today
                          ? 'text-blue-400 ring-1 ring-blue-400/50 hover:bg-blue-500/10'
                          : 'text-zinc-600 hover:bg-zinc-100 dark:text-white/70 dark:hover:bg-white/10'
                  }`}
                >
                  {d}
                  {hasPosts && !selected ? (
                    <span className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-blue-400" />
                  ) : null}
                </button>
              </div>
            )
          })}

          {nextMonthDates.map((d) => {
            const cellDate = new Date(year, month + 1, d)
            const selected = isSameDay(cellDate, selectedDate)
            const inVisibleWeek =
              viewMode === 'Week' && isDateInWeek(cellDate, selectedDate, weekStartsOn)
            return (
              <div key={`next-${d}`} className="flex justify-center">
                <button
                  onClick={() => handleDateClick(d, 1)}
                  className={`flex size-7 items-center justify-center rounded-full text-xs transition-colors ${
                    selected
                      ? 'bg-blue-500 text-white'
                      : inVisibleWeek
                        ? 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/25'
                        : 'text-zinc-400 hover:bg-zinc-100 dark:text-white/20 dark:hover:bg-white/5'
                  }`}
                >
                  {d}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-white/40">
            Undated drafts
          </p>
          <Link
            href="/dashboard/posts?tab=drafts"
            className="text-[10px] font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400"
          >
            All drafts
          </Link>
        </div>
        {undatedDrafts.length > 0 ? (
          <div className="space-y-1.5">
            {undatedDrafts.slice(0, 8).map((post) => (
              <DraftRailItem
                key={post.post_id}
                post={post}
                selected={selectedPostId === post.post_id}
                onSelect={() => onPostSelect(post)}
              />
            ))}
            <p className="px-1 text-[10px] text-zinc-400 dark:text-white/30">
              Drag a draft onto a time slot.
            </p>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 dark:text-white/40">
            Dated posts live on the grid. Undated drafts from Generate appear here.
          </p>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <p className="mb-3 text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-white/40">
          {dayLabel}
        </p>

        {dayPosts.length > 0 ? (
          <div className="mb-4 space-y-2">
            <p className="px-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-white/30">
              {dayPosts.length} post{dayPosts.length !== 1 ? 's' : ''} this day
            </p>
            {dayPosts.map((post) => (
              <CalendarPostListItem
                key={post.post_id}
                post={post}
                selected={selectedPostId === post.post_id}
                onSelect={() => onPostSelect(post)}
                timeZone={timeZone}
              />
            ))}
          </div>
        ) : (
          <div className="mb-4">
            <p className="mb-1 text-sm text-zinc-500 dark:text-white/50">No posts scheduled</p>
            <p className="text-xs text-zinc-400 dark:text-white/30">
              Click a time slot or drop a draft onto the calendar.
            </p>
          </div>
        )}

        {selectedPost ? (
          <div className="mb-4">
            <CalendarPostDetail
              post={selectedPost}
              onClose={() => onClearSelection?.()}
              onEdit={onEditPost}
              onApprove={onApprovePost}
              onSchedule={onSchedulePost}
              onUpdated={onPostsUpdated}
              timeZone={timeZone}
            />
          </div>
        ) : null}

        <button
          type="button"
          onClick={onCreatePost}
          className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white py-2 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
        >
          <Plus className="h-3.5 w-3.5" />
          Create
        </button>
      </div>
    </div>
  )
}
