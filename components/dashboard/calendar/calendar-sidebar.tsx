'use client'

import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { Post } from '@/types/content'
import {
  DEFAULT_POST_DURATION_MIN,
  formatTimeRange,
  getPostsForDay,
  isDateInWeek,
  isSameDay,
  isToday,
} from '@/lib/calendar-utils'
import { getPlatformEventStyle } from '@/components/dashboard/calendar/calendar-post-event'
import { cn } from '@/lib/utils'

import type { WeekStartsOn } from '@/types/settings'

interface CalendarSidebarProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  posts: Post[]
  selectedPostId?: string | number | null
  onPostSelect: (post: Post) => void
  onCreatePost: () => void
  viewMode: 'Month' | 'Week' | 'Day'
  weekStartsOn?: WeekStartsOn
}

function CalendarPostListItem({
  post,
  selected,
  onSelect,
}: {
  post: Post
  selected: boolean
  onSelect: () => void
}) {
  const platform = post.social_account?.platform ?? 'Social'
  const styles = getPlatformEventStyle(platform)

  return (
    <button
      type="button"
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
        <span
          className={cn(
            'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md text-white shrink-0',
            styles.bg
          )}
        >
          {platform}
        </span>
      </div>
      <p className="text-xs text-zinc-700 dark:text-white/70 line-clamp-2 leading-relaxed">
        {post.caption || 'Scheduled post'}
      </p>
    </button>
  )
}

export function CalendarSidebar({
  selectedDate,
  onDateChange,
  posts,
  selectedPostId,
  onPostSelect,
  onCreatePost,
  viewMode,
  weekStartsOn = 'monday',
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

  const remainingCells =
    (7 - ((startingDayOfWeek + daysInMonth) % 7)) % 7
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

  const dayPosts = getPostsForDay(posts, selectedDate)

  const dayLabel = isToday(selectedDate)
    ? 'Today'
    : selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })

  return (
    <div className="w-[320px] shrink-0 bg-card/90 dark:bg-[#161b22]/90 backdrop-blur-3xl border border-border dark:border-white/10 rounded-[2rem] flex flex-col p-6 overflow-y-auto overflow-x-hidden custom-scrollbar shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative z-10">
      {/* Mini Calendar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white tracking-wide">
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h4>
          <div className="flex gap-1">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="w-7 h-7 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center text-zinc-500 dark:text-white/50 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="w-7 h-7 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center text-zinc-500 dark:text-white/50 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-2 mb-1">
          {dayLabels.map((d) => (
            <div
              key={d}
              className="text-[10px] font-bold text-zinc-500 dark:text-white/30 text-center uppercase tracking-wider"
            >
              {d}
            </div>
          ))}

          {prevMonthDates.map((d) => {
            const cellDate = new Date(year, month - 1, d)
            const selected = isSameDay(cellDate, selectedDate)
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
            )
          })}

          {currentMonthDates.map((d) => {
            const cellDate = new Date(year, month, d)
            const selected = isSameDay(cellDate, selectedDate)
            const today = cellDate.toDateString() === new Date().toDateString()
            const inVisibleWeek = viewMode === 'Week' && isDateInWeek(cellDate, selectedDate, weekStartsOn)
            const hasPosts = getPostsForDay(posts, cellDate).length > 0

            return (
              <div key={d} className="flex justify-center">
                <button
                  onClick={() => handleDateClick(d)}
                  className={`relative w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    selected
                      ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                      : inVisibleWeek
                        ? 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/25'
                        : today
                          ? 'text-blue-400 ring-1 ring-blue-400/50 hover:bg-blue-500/10'
                          : 'text-zinc-600 dark:text-white/70 hover:bg-zinc-100 dark:hover:bg-white/10'
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
                key={post.post_id}
                post={post}
                selected={selectedPostId === post.post_id}
                onSelect={() => onPostSelect(post)}
              />
            ))}
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-sm text-zinc-500 dark:text-white/50 mb-1">No posts scheduled</p>
            <p className="text-xs text-zinc-400 dark:text-white/30">
              Click a time slot in the calendar or create a new post.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onCreatePost}
          className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-colors flex items-center justify-center gap-1.5 mt-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Schedule Post
        </button>
      </div>
    </div>
  )
}
