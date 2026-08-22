'use client'

<<<<<<< HEAD
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { Post } from '@/types/content'
import {
=======
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { Post } from '@/types/content'
import {
  canReschedulePost,
>>>>>>> origin/development
  DEFAULT_POST_DURATION_MIN,
  formatTimeRange,
  getPostsForDay,
  isDateInWeek,
  isSameDay,
  isToday,
<<<<<<< HEAD
} from '@/lib/calendar-utils'
import { getPlatformEventStyle } from '@/components/dashboard/calendar/calendar-post-event'
import { CalendarPostDetail } from '@/components/dashboard/calendar/calendar-post-detail'
import { PostStatusBadge } from '@/components/dashboard/post-status-badge'
import { cn } from '@/lib/utils'

import type { WeekStartsOn } from '@/types/settings'
=======
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
>>>>>>> origin/development

interface CalendarSidebarProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  posts: Post[]
<<<<<<< HEAD
  selectedPostId?: string | number | null
  onPostSelect: (post: Post) => void
  onCreatePost: () => void
=======
  undatedDrafts: Post[]
  selectedPostId?: string | number | null
  onPostSelect: (post: Post) => void
  onCreatePost: () => void
  onEditPost: (post: Post) => void
>>>>>>> origin/development
  onApprovePost: (postId: string) => Promise<{ success: boolean; error?: string }>
  onSchedulePost: (postId: string) => Promise<{ success: boolean; error?: string }>
  onClearSelection?: () => void
  onPostsUpdated?: () => void
<<<<<<< HEAD
  viewMode: 'Month' | 'Week' | 'Day'
  weekStartsOn?: WeekStartsOn
=======
  viewMode: PlannerViewMode
  weekStartsOn?: WeekStartsOn
  timeZone?: string
  className?: string
>>>>>>> origin/development
}

function CalendarPostListItem({
  post,
  selected,
  onSelect,
<<<<<<< HEAD
=======
  timeZone,
>>>>>>> origin/development
}: {
  post: Post
  selected: boolean
  onSelect: () => void
<<<<<<< HEAD
}) {
  const platform = post.social_account?.platform ?? 'Social'
  const styles = getPlatformEventStyle(platform)
=======
  timeZone?: string
}) {
  const platform = formatPlatform(post.social_account?.platform)
  const start = parseScheduledDate(post.scheduled_date)
  const movable = canReschedulePost(post)
>>>>>>> origin/development

  return (
    <button
      type="button"
<<<<<<< HEAD
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-xl border px-3 py-2.5 transition-all',
        selected
          ? 'border-blue-500/50 bg-blue-500/10 ring-1 ring-blue-500/30'
          : 'bg-white/60 dark:bg-white/5 border-zinc-200 dark:border-white/8 hover:bg-white dark:hover:bg-white/8'
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[11px] font-mono text-zinc-500 dark:text-white/40">
          {formatTimeRange(
            new Date(post.scheduled_date),
            DEFAULT_POST_DURATION_MIN
          )}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <PostStatusBadge status={post.status} compact />
          <span
            className={cn(
              'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md text-white',
              styles.bg
            )}
          >
            {platform.slice(0, 3)}
          </span>
        </div>
      </div>
      <p className="text-xs text-zinc-700 dark:text-white/70 line-clamp-2 leading-relaxed">
        {post.caption || 'Scheduled post'}
      </p>
=======
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
>>>>>>> origin/development
    </button>
  )
}

<<<<<<< HEAD
export function CalendarSidebar({
  selectedDate,
  onDateChange,
  posts,
  selectedPostId,
  onPostSelect,
  onCreatePost,
  onApprovePost,
  onSchedulePost,
  onClearSelection,
  onPostsUpdated,
  viewMode,
  weekStartsOn = 'monday',
}: CalendarSidebarProps) {
  const dayLabels =
    weekStartsOn === 'sunday'
      ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
      : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

=======
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

>>>>>>> origin/development
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

<<<<<<< HEAD
  const remainingCells =
    (7 - ((startingDayOfWeek + daysInMonth) % 7)) % 7
=======
  const remainingCells = (7 - ((startingDayOfWeek + daysInMonth) % 7)) % 7
>>>>>>> origin/development
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

<<<<<<< HEAD
  const dayPosts = getPostsForDay(posts, selectedDate)
  const selectedPost =
    selectedPostId != null
      ? posts.find((p) => p.post_id === selectedPostId) ?? null
      : null

  const dayLabel = isToday(selectedDate)
=======
  const dayPosts = getPostsForDay(posts, selectedDate, timeZone)
  const selectedPost =
    selectedPostId != null
      ? posts.find((p) => p.post_id === selectedPostId) ??
        undatedDrafts.find((p) => p.post_id === selectedPostId) ??
        null
      : null

  const dayLabel = isToday(selectedDate, timeZone)
>>>>>>> origin/development
    ? 'Today'
    : selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })

  return (
<<<<<<< HEAD
    <div className="w-[320px] shrink-0 bg-card/90 dark:bg-[#161b22]/90 backdrop-blur-3xl border border-border dark:border-white/10 rounded-[2rem] flex flex-col p-6 overflow-y-auto overflow-x-hidden custom-scrollbar shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative z-10">
      {/* Mini Calendar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white tracking-wide">
=======
    <div
      className={cn(
        'relative z-10 flex w-[320px] shrink-0 flex-col overflow-x-hidden overflow-y-auto rounded-[2rem] border border-border bg-card p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] custom-scrollbar dark:border-white/10 dark:bg-[#161b22] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]',
        className
      )}
    >
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-bold tracking-wide text-zinc-900 dark:text-white">
>>>>>>> origin/development
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h4>
          <div className="flex gap-1">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
<<<<<<< HEAD
              className="w-7 h-7 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center text-zinc-500 dark:text-white/50 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
=======
              className="flex size-7 items-center justify-center rounded-lg bg-white text-zinc-500 transition-colors hover:bg-zinc-100 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
>>>>>>> origin/development
            </button>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
<<<<<<< HEAD
              className="w-7 h-7 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center text-zinc-500 dark:text-white/50 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
=======
              className="flex size-7 items-center justify-center rounded-lg bg-white text-zinc-500 transition-colors hover:bg-zinc-100 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" />
>>>>>>> origin/development
            </button>
          </div>
        </div>

<<<<<<< HEAD
        <div className="grid grid-cols-7 gap-y-2 mb-1">
          {dayLabels.map((d) => (
            <div
              key={d}
              className="text-[10px] font-bold text-zinc-500 dark:text-white/30 text-center uppercase tracking-wider"
=======
        <div className="mb-1 grid grid-cols-7 gap-y-2">
          {dayLabels.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-white/30"
>>>>>>> origin/development
            >
              {d}
            </div>
          ))}

          {prevMonthDates.map((d) => {
            const cellDate = new Date(year, month - 1, d)
            const selected = isSameDay(cellDate, selectedDate)
<<<<<<< HEAD
            const inVisibleWeek = viewMode === 'Week' && isDateInWeek(cellDate, selectedDate, weekStartsOn)
            return (
            <div key={`prev-${d}`} className="flex justify-center">
              <button
                onClick={() => handleDateClick(d, -1)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                  selected
                    ? 'bg-blue-500 text-white'
                    : inVisibleWeek
                      ? 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/25'
                      : 'text-zinc-400 dark:text-white/20 hover:bg-zinc-100 dark:hover:bg-white/5'
                }`}
              >
                {d}
              </button>
            </div>
=======
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
>>>>>>> origin/development
            )
          })}

          {currentMonthDates.map((d) => {
            const cellDate = new Date(year, month, d)
            const selected = isSameDay(cellDate, selectedDate)
<<<<<<< HEAD
            const today = cellDate.toDateString() === new Date().toDateString()
            const inVisibleWeek = viewMode === 'Week' && isDateInWeek(cellDate, selectedDate, weekStartsOn)
            const hasPosts = getPostsForDay(posts, cellDate).length > 0
=======
            const today = isToday(cellDate, timeZone)
            const inVisibleWeek =
              viewMode === 'Week' && isDateInWeek(cellDate, selectedDate, weekStartsOn)
            const hasPosts = getPostsForDay(posts, cellDate, timeZone).length > 0
>>>>>>> origin/development

            return (
              <div key={d} className="flex justify-center">
                <button
                  onClick={() => handleDateClick(d)}
<<<<<<< HEAD
                  className={`relative w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    selected
                      ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
=======
                  className={`relative flex size-7 items-center justify-center rounded-full text-xs font-medium ui-transition ${
                    selected
                      ? 'bg-blue-500 text-white'
>>>>>>> origin/development
                      : inVisibleWeek
                        ? 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/25'
                        : today
                          ? 'text-blue-400 ring-1 ring-blue-400/50 hover:bg-blue-500/10'
<<<<<<< HEAD
                          : 'text-zinc-600 dark:text-white/70 hover:bg-zinc-100 dark:hover:bg-white/10'
=======
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
>>>>>>> origin/development
                  }`}
                >
                  {d}
                  {hasPosts && !selected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
                  )}
                </button>
              </div>
            )
          })}

          {nextMonthDates.map((d) => {
            const cellDate = new Date(year, month + 1, d)
            const selected = isSameDay(cellDate, selectedDate)
            const inVisibleWeek = viewMode === 'Week' && isDateInWeek(cellDate, selectedDate, weekStartsOn)
            return (
            <div key={`next-${d}`} className="flex justify-center">
              <button
                onClick={() => handleDateClick(d, 1)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                  selected
                    ? 'bg-blue-500 text-white'
                    : inVisibleWeek
                      ? 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/25'
                      : 'text-zinc-400 dark:text-white/20 hover:bg-zinc-100 dark:hover:bg-white/5'
                }`}
              >
                {d}
              </button>
            </div>
            )
          })}
        </div>
      </div>

<<<<<<< HEAD
      {/* Selected day — compact list only */}
      <div className="flex flex-col flex-1 min-h-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-white/40 mb-3">
          {dayLabel}
        </p>

        {dayPosts.length > 0 ? (
          <div className="space-y-2 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-white/30 px-1">
              {dayPosts.length} post{dayPosts.length !== 1 ? 's' : ''} this day
            </p>
            {dayPosts.map((post) => (
              <CalendarPostListItem
=======
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
>>>>>>> origin/development
                key={post.post_id}
                post={post}
                selected={selectedPostId === post.post_id}
                onSelect={() => onPostSelect(post)}
              />
            ))}
<<<<<<< HEAD
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-sm text-zinc-500 dark:text-white/50 mb-1">No posts scheduled</p>
            <p className="text-xs text-zinc-400 dark:text-white/30">
              Click a time slot in the calendar or create a new post.
            </p>
          </div>
        )}

        {selectedPost ? (
          <div className="mb-4">
            <CalendarPostDetail
              post={selectedPost}
              onClose={() => onClearSelection?.()}
              onApprove={onApprovePost}
              onSchedule={onSchedulePost}
              onUpdated={onPostsUpdated}
            />
          </div>
        ) : null}

        <button
          type="button"
          onClick={onCreatePost}
          className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-colors flex items-center justify-center gap-1.5 mt-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Schedule Post
        </button>
      </div>
=======
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
>>>>>>> origin/development
    </div>
  )
}
