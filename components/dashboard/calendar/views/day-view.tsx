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
  HOUR_HEIGHT_PX,
} from '@/lib/calendar-utils'
import { CalendarPostEvent } from '@/components/dashboard/calendar/calendar-post-event'

interface DayViewProps {
  posts: Post[]
  selectedDate: Date
  selectedPostId?: string | number | null
  onPostSelect: (post: Post) => void
  onSlotClick: (date: Date) => void
}

export function DayView({
  posts,
  selectedDate,
  selectedPostId,
  onPostSelect,
  onSlotClick,
}: DayViewProps) {
  const hours = getCalendarHours()
  const dayPosts = getPostsForDay(posts, selectedDate)
  const totalHeight = hours.length * HOUR_HEIGHT_PX

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const hourFraction = y / HOUR_HEIGHT_PX
    const hour = Math.floor(hourFraction + CALENDAR_START_HOUR)
    const minute = Math.round(((hourFraction % 1) * 60) / 15) * 15
    const slotDate = new Date(selectedDate)
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
            className="flex-1 relative min-w-0 overflow-hidden border-l border-zinc-200 dark:border-white/5 cursor-pointer group"
            style={{ height: totalHeight }}
            onClick={handleTimelineClick}
          >
            {hours.map((_, idx) => (
              <div
                key={idx}
                className="absolute left-0 right-0 border-t border-zinc-200 dark:border-white/5 pointer-events-none"
                style={{ top: idx * HOUR_HEIGHT_PX }}
              />
            ))}

            {dayPosts.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-white/20 text-sm pointer-events-none">
                Click a time slot to schedule a post
              </div>
            )}

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
                  index={idx}
                  selected={selectedPostId === post.post_id}
                  onSelect={onPostSelect}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
