'use client'

import type { Post } from '@/types/content'
import {
  getPostsForDay,
  isSameDay,
  isToday,
} from '@/lib/calendar-utils'
import { cn } from '@/lib/utils'

interface MonthViewProps {
  posts: Post[]
  selectedDate: Date
  selectedPostId?: string | number | null
  onDateSelect: (date: Date) => void
  onPostSelect: (post: Post) => void
}

export function MonthView({
  posts,
  selectedDate,
  selectedPostId,
  onDateSelect,
  onPostSelect,
}: MonthViewProps) {
  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  let startingDayOfWeek = firstDayOfMonth.getDay() - 1
  if (startingDayOfWeek === -1) startingDayOfWeek = 6

  const prevMonthDays = new Date(year, month, 0).getDate()
  const totalSlots = startingDayOfWeek + daysInMonth
  const totalGridCells = Math.ceil(totalSlots / 7) * 7
  const rowCount = totalGridCells / 7

  const calendarCells = Array.from({ length: totalGridCells }).map((_, idx) => {
    if (idx < startingDayOfWeek) {
      const day = prevMonthDays - startingDayOfWeek + idx + 1
      return {
        day,
        isCurrentMonth: false,
        date: new Date(year, month - 1, day),
      }
    }
    if (idx >= startingDayOfWeek + daysInMonth) {
      const day = idx - (startingDayOfWeek + daysInMonth) + 1
      return {
        day,
        isCurrentMonth: false,
        date: new Date(year, month + 1, day),
      }
    }
    const currentDay = idx - startingDayOfWeek + 1
    return {
      day: currentDay,
      isCurrentMonth: true,
      date: new Date(year, month, currentDay),
    }
  })

  const weekdayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="grid grid-cols-7 mb-1 shrink-0">
        {weekdayHeaders.map((d) => (
          <div
            key={d}
            className="text-[10px] font-bold text-zinc-500 dark:text-white/30 text-center uppercase tracking-wider py-2"
          >
            {d}
          </div>
        ))}
      </div>

      <div
        className="flex-1 grid grid-cols-7 gap-px bg-zinc-200 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-2xl overflow-hidden min-h-0"
        style={{ gridTemplateRows: `repeat(${rowCount}, minmax(96px, 1fr))` }}
      >
        {calendarCells.map((cell, idx) => {
          const dayPosts = getPostsForDay(posts, cell.date)
          const isSelected = isSameDay(cell.date, selectedDate)
          const today = isToday(cell.date)

          return (
            <div
              key={idx}
              role="button"
              tabIndex={0}
              onClick={() => onDateSelect(cell.date)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onDateSelect(cell.date)
                }
              }}
              className={cn(
                'relative flex flex-col h-full min-h-[96px] p-2 text-left cursor-pointer select-none',
                'bg-zinc-50/90 dark:bg-[#161b22]/90 transition-colors',
                'focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_rgba(59,130,246,0.6)]',
                cell.isCurrentMonth
                  ? 'hover:bg-white dark:hover:bg-white/[0.07]'
                  : 'opacity-40',
                isSelected && 'bg-blue-500/8 shadow-[inset_0_0_0_2px_rgba(59,130,246,0.45)]'
              )}
            >
              <span
                className={cn(
                  'inline-flex w-7 h-7 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                  today && 'bg-blue-500 text-white',
                  !today && isSelected && 'text-blue-400',
                  !today &&
                    !isSelected &&
                    (cell.isCurrentMonth
                      ? 'text-zinc-900 dark:text-white'
                      : 'text-zinc-500 dark:text-white/20')
                )}
              >
                {cell.day}
              </span>

              <div className="mt-1 space-y-0.5 flex-1 min-h-0 overflow-hidden">
                {dayPosts.slice(0, 3).map((p) => {
                  const isPostSelected = selectedPostId === p.post_id
                  return (
                    <button
                      key={p.post_id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onPostSelect(p)
                      }}
                      className={cn(
                        'w-full text-left text-[10px] truncate px-1.5 py-1 rounded font-semibold border capitalize transition-colors',
                        isPostSelected
                          ? 'bg-blue-500 text-white border-blue-400'
                          : 'bg-blue-500/15 text-blue-300 border-blue-500/15 hover:bg-blue-500/25'
                      )}
                    >
                      {new Date(p.scheduled_date).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}{' '}
                      {p.social_account?.platform || 'Post'}
                    </button>
                  )
                })}
                {dayPosts.length > 3 && (
                  <div className="text-[10px] text-zinc-500 dark:text-white/30 px-1.5 pointer-events-none">
                    +{dayPosts.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
