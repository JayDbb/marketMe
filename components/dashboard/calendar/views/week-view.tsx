'use client'

import type { Post } from '@/types/content'
import {
  CALENDAR_END_HOUR,
  CALENDAR_START_HOUR,
  DEFAULT_POST_DURATION_MIN,
  getCalendarHours,
  getEventHeightPx,
  getEventTopPx,
  getPostsForDay,
  getPostsForWeek,
  getWeekDays,
  HOUR_HEIGHT_PX,
  isSameDay,
  isToday,
} from '@/lib/calendar-utils'
import { CalendarPostEvent } from '@/components/dashboard/calendar/calendar-post-event'

import type { WeekStartsOn } from '@/types/settings'

interface WeekViewProps {
  posts: Post[]
  selectedDate: Date
  selectedPostId?: string | number | null
  onDateSelect: (date: Date) => void
  onPostSelect: (post: Post) => void
  onSlotClick: (date: Date) => void
  weekStartsOn?: WeekStartsOn
}

export function WeekView({
  posts,
  selectedDate,
  selectedPostId,
  onDateSelect,
  onPostSelect,
  onSlotClick,
  weekStartsOn = 'monday',
}: WeekViewProps) {
  const hours = getCalendarHours()
  const weekDays = getWeekDays(selectedDate, weekStartsOn)
  const weekPosts = getPostsForWeek(posts, selectedDate, weekStartsOn)
  const totalHeight = hours.length * HOUR_HEIGHT_PX

  const handleColumnClick = (
    day: Date,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const hourFraction = y / HOUR_HEIGHT_PX
    const hour = Math.floor(hourFraction + CALENDAR_START_HOUR)
    const minute = Math.round(((hourFraction % 1) * 60) / 15) * 15
    const slotDate = new Date(day)
    slotDate.setHours(
      Math.min(CALENDAR_END_HOUR - 1, Math.max(CALENDAR_START_HOUR, hour)),
      minute,
      0,
      0
    )
    onSlotClick(slotDate)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex pl-[52px] pr-1 pb-3 shrink-0">
        {weekDays.map((day) => {
          const selected = isSameDay(day, selectedDate)
          const today = isToday(day)
          const postCount = getPostsForDay(weekPosts, day).length
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDateSelect(day)}
              className={`flex-1 flex flex-col items-center justify-center mx-0.5 py-2.5 rounded-xl border transition-all ${
                selected
                  ? 'bg-blue-500/15 border-blue-500/40'
                  : 'bg-white dark:bg-white/5 border-zinc-200 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/8'
              }`}
            >
              <span className="text-[10px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-wider mb-0.5">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span
                className={`text-xl font-bold tracking-tight ${
                  today
                    ? 'text-blue-400'
                    : selected
                      ? 'text-blue-300'
                      : 'text-zinc-900 dark:text-white'
                }`}
              >
                {day.getDate()}
              </span>
              {postCount > 0 && (
                <span className="text-[9px] font-medium text-blue-400/80 mt-0.5">
                  {postCount} post{postCount !== 1 ? 's' : ''}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar min-h-0">
        <div className="flex" style={{ height: totalHeight }}>
          <div className="w-[52px] shrink-0 relative">
            {hours.map((hour, idx) => (
              <div
                key={hour}
                className="absolute right-2 text-[10px] font-medium text-zinc-500 dark:text-white/30 -translate-y-1/2"
                style={{ top: idx * HOUR_HEIGHT_PX }}
              >
                {hour === 12 ? '12 pm' : hour < 12 ? `${hour} am` : `${hour - 12} pm`}
              </div>
            ))}
          </div>

          <div
            className="flex-1 grid grid-cols-7 min-w-0"
            style={{ height: totalHeight }}
          >
            {weekDays.map((day) => {
              const dayPosts = getPostsForDay(weekPosts, day)
              const selected = isSameDay(day, selectedDate)

              return (
                <div
                  key={day.toISOString()}
                  className={`relative min-w-0 overflow-hidden border-l border-zinc-200 dark:border-white/5 cursor-pointer group h-full ${
                    selected ? 'bg-blue-500/3' : ''
                  }`}
                  onClick={(e) => handleColumnClick(day, e)}
                >
                  {hours.map((_, idx) => (
                    <div
                      key={idx}
                      className="absolute left-0 right-0 border-t border-zinc-200 dark:border-white/5 pointer-events-none"
                      style={{ top: idx * HOUR_HEIGHT_PX }}
                    />
                  ))}

                  {hours.map((_, idx) => (
                    <div
                      key={`half-${idx}`}
                      className="absolute left-0 right-0 border-t border-dashed border-zinc-200/50 dark:border-white/[0.03] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ top: idx * HOUR_HEIGHT_PX + HOUR_HEIGHT_PX / 2 }}
                    />
                  ))}

                  {dayPosts.map((post, idx) => {
                    const start = new Date(post.scheduled_date)
                    const top = getEventTopPx(start)
                    const height = getEventHeightPx(DEFAULT_POST_DURATION_MIN)

                    if (top < 0 || top >= totalHeight) return null

                    return (
                      <CalendarPostEvent
                        key={post.post_id}
                        post={post}
                        top={top}
                        height={height}
                        compact
                        index={idx}
                        selected={selectedPostId === post.post_id}
                        onSelect={onPostSelect}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
