'use client'

import type { Post } from '@/types/content'
import {
  getCalendarGridHeightPx,
  getCalendarHours,
  partitionDayPosts,
} from '@/lib/calendar-utils'
import { OverflowPostChip } from '@/components/dashboard/calendar/calendar-post-event'
import { PlannerTimeColumn } from '@/components/dashboard/calendar/planner-time-column'

interface DayViewProps {
  posts: Post[]
  selectedDate: Date
  selectedPostId?: string | number | null
  onPostSelect: (post: Post) => void
  onSlotClick: (date: Date) => void
  onReschedule: (postId: string, next: Date) => void
  timeZone?: string
}

export function DayView({
  posts,
  selectedDate,
  selectedPostId,
  onPostSelect,
  onSlotClick,
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
              >
                {hour === 12 ? '12 pm' : hour < 12 ? `${hour} am` : `${hour - 12} pm`}
              </div>
            ))}
          </div>
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
    </div>
  )
}
