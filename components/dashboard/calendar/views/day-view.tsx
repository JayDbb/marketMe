'use client'

import type { Post } from '@/types/content'
import {
<<<<<<< HEAD
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
=======
  getCalendarGridHeightPx,
  getCalendarHours,
  partitionDayPosts,
} from '@/lib/calendar-utils'
import { OverflowPostChip } from '@/components/dashboard/calendar/calendar-post-event'
import { PlannerTimeColumn } from '@/components/dashboard/calendar/planner-time-column'
>>>>>>> origin/development

interface DayViewProps {
  posts: Post[]
  selectedDate: Date
  selectedPostId?: string | number | null
  onPostSelect: (post: Post) => void
  onSlotClick: (date: Date) => void
<<<<<<< HEAD
=======
  onReschedule: (postId: string, next: Date) => void
  timeZone?: string
>>>>>>> origin/development
}

export function DayView({
  posts,
  selectedDate,
  selectedPostId,
  onPostSelect,
  onSlotClick,
<<<<<<< HEAD
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
=======
  onReschedule,
  timeZone,
}: DayViewProps) {
  const hours = getCalendarHours()
  const { inGrid, before, after } = partitionDayPosts(posts, selectedDate, timeZone)
  const totalHeight = getCalendarGridHeightPx()

  return (
    <div className="flex h-full min-h-0 flex-col">
      {before.length > 0 ? (
        <div className="shrink-0 space-y-0.5 pb-2 pl-[52px] pr-1">
          {before.map((post) => (
            <OverflowPostChip
              key={post.post_id}
              post={post}
              selected={selectedPostId === post.post_id}
              onSelect={onPostSelect}
              timeZone={timeZone}
            />
          ))}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar">
        <div className="flex" style={{ height: totalHeight }}>
          <div className="relative w-[52px] shrink-0">
            {hours.map((hour, idx) => (
              <div
                key={hour}
                className="absolute right-2 -translate-y-1/2 text-[10px] font-medium text-zinc-500 dark:text-white/30"
                style={{ top: idx * (totalHeight / hours.length) }}
>>>>>>> origin/development
              >
                {hour === 12 ? '12 pm' : hour < 12 ? `${hour} am` : `${hour - 12} pm`}
              </div>
            ))}
          </div>
<<<<<<< HEAD

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
=======
          <div className="min-w-0 flex-1" style={{ height: totalHeight }}>
            <PlannerTimeColumn
              day={selectedDate}
              inGridPosts={inGrid}
              selectedPostId={selectedPostId}
              emptyHint="Click a time slot to create a post"
              onPostSelect={onPostSelect}
              onSlotClick={onSlotClick}
              onReschedule={onReschedule}
              timeZone={timeZone}
            />
          </div>
        </div>
      </div>

      {after.length > 0 ? (
        <div className="shrink-0 space-y-0.5 pt-2 pl-[52px] pr-1">
          {after.map((post) => (
            <OverflowPostChip
              key={post.post_id}
              post={post}
              selected={selectedPostId === post.post_id}
              onSelect={onPostSelect}
              timeZone={timeZone}
            />
          ))}
        </div>
      ) : null}
>>>>>>> origin/development
    </div>
  )
}
