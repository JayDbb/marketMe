'use client'

import type { Post } from '@/types/content'
import {
  getCalendarGridHeightPx,
  getCalendarHours,
  getPostsForDay,
  getPostsForWeek,
  getWeekDays,
  isSameDay,
  isToday,
  partitionDayPosts,
} from '@/lib/calendar-utils'
import { OverflowPostChip } from '@/components/dashboard/calendar/calendar-post-event'
import { PlannerTimeColumn } from '@/components/dashboard/calendar/planner-time-column'
import type { WeekStartsOn } from '@/types/settings'

interface WeekViewProps {
  posts: Post[]
  selectedDate: Date
  selectedPostId?: string | number | null
  onDateSelect: (date: Date) => void
  onPostSelect: (post: Post) => void
  onSlotClick: (date: Date) => void
  onReschedule: (postId: string, next: Date) => void
  weekStartsOn?: WeekStartsOn
  timeZone?: string
}

export function WeekView({
  posts,
  selectedDate,
  selectedPostId,
  onDateSelect,
  onPostSelect,
  onSlotClick,
  onReschedule,
  weekStartsOn = 'monday',
  timeZone,
}: WeekViewProps) {
  const hours = getCalendarHours()
  const weekDays = getWeekDays(selectedDate, weekStartsOn)
  const weekPosts = getPostsForWeek(posts, selectedDate, weekStartsOn, timeZone)
  const totalHeight = getCalendarGridHeightPx()
  const partitions = weekDays.map((day) => partitionDayPosts(weekPosts, day, timeZone))
  const showBefore = partitions.some((part) => part.before.length > 0)
  const showAfter = partitions.some((part) => part.after.length > 0)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 pb-2 pl-10 pr-1 sm:pb-3 sm:pl-[52px]">
        {weekDays.map((day) => {
          const selected = isSameDay(day, selectedDate)
          const today = isToday(day, timeZone)
          const postCount = getPostsForDay(weekPosts, day, timeZone).length
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDateSelect(day)}
              className={`mx-0.5 flex flex-1 flex-col items-center justify-center rounded-lg border py-1.5 ui-transition sm:rounded-xl sm:py-2.5 ${
                selected
                  ? 'border-blue-500/40 bg-blue-500/15'
                  : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/8'
              }`}
            >
              <span className="mb-0.5 text-[9px] font-bold tracking-wider text-zinc-500 uppercase sm:text-[10px] dark:text-white/40">
                {day.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)}
              </span>
              <span
                className={`text-base font-bold tracking-tight sm:text-xl ${
                  today
                    ? 'text-blue-400'
                    : selected
                      ? 'text-blue-300'
                      : 'text-zinc-900 dark:text-white'
                }`}
              >
                {day.getDate()}
              </span>
              {postCount > 0 ? (
                <span className="mt-0.5 text-[9px] font-medium text-blue-400/80">
                  {postCount} post{postCount !== 1 ? 's' : ''}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {showBefore ? (
        <div className="flex shrink-0 pb-2 pl-[52px] pr-1">
          {partitions.map((part, idx) => (
            <div key={`before-${weekDays[idx].toISOString()}`} className="min-w-0 flex-1 space-y-0.5 px-0.5">
              {part.before.map((post) => (
                <OverflowPostChip
                  key={post.post_id}
                  post={post}
                  selected={selectedPostId === post.post_id}
                  onSelect={onPostSelect}
                  timeZone={timeZone}
                />
              ))}
            </div>
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
          <div className="grid min-w-0 flex-1 grid-cols-7" style={{ height: totalHeight }}>
            {weekDays.map((day, idx) => (
              <PlannerTimeColumn
                key={day.toISOString()}
                day={day}
                inGridPosts={partitions[idx].inGrid}
                selected={isSameDay(day, selectedDate)}
                selectedPostId={selectedPostId}
                compact
                timeZone={timeZone}
                onPostSelect={onPostSelect}
                onSlotClick={onSlotClick}
                onReschedule={onReschedule}
              />
            ))}
          </div>
        </div>
      </div>

      {showAfter ? (
        <div className="flex shrink-0 pt-2 pl-[52px] pr-1">
          {partitions.map((part, idx) => (
            <div key={`after-${weekDays[idx].toISOString()}`} className="min-w-0 flex-1 space-y-0.5 px-0.5">
              {part.after.map((post) => (
                <OverflowPostChip
                  key={post.post_id}
                  post={post}
                  selected={selectedPostId === post.post_id}
                  onSelect={onPostSelect}
                  timeZone={timeZone}
                />
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
