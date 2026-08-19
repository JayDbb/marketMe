'use client'

import { useRef, useState } from 'react'
import type { Post } from '@/types/content'
import {
  getCalendarGridHeightPx,
  getCalendarHours,
  HOUR_HEIGHT_PX,
  layoutOverlappingEvents,
  slotDateFromOffset,
} from '@/lib/calendar-utils'
import { allowPlannerDrop, getPlannerDragPayload } from '@/lib/planner-dnd'
import { CalendarPostEvent } from '@/components/dashboard/calendar/calendar-post-event'
import { cn } from '@/lib/utils'

interface PlannerTimeColumnProps {
  day: Date
  inGridPosts: Post[]
  selected?: boolean
  selectedPostId?: string | number | null
  compact?: boolean
  emptyHint?: string
  onPostSelect: (post: Post) => void
  onSlotClick: (date: Date) => void
  onReschedule: (postId: string, next: Date) => void
  timeZone?: string
}

export function PlannerTimeColumn({
  day,
  inGridPosts,
  selected = false,
  selectedPostId,
  compact = false,
  emptyHint,
  onPostSelect,
  onSlotClick,
  onReschedule,
  timeZone,
}: PlannerTimeColumnProps) {
  const hours = getCalendarHours()
  const totalHeight = getCalendarGridHeightPx()
  const laidOut = layoutOverlappingEvents(inGridPosts, timeZone)
  const [dropActive, setDropActive] = useState(false)
  const ignoreClickUntil = useRef(0)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (Date.now() < ignoreClickUntil.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    onSlotClick(slotDateFromOffset(day, y, timeZone))
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDropActive(false)
    ignoreClickUntil.current = Date.now() + 400
    const payload = getPlannerDragPayload(e)
    if (!payload) return
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    onReschedule(payload.postId, slotDateFromOffset(day, y, timeZone))
  }

  return (
    <div
      className={cn(
        'relative h-full min-w-0 cursor-pointer overflow-hidden border-l border-zinc-200 group dark:border-white/5',
        selected && 'bg-blue-500/3',
        dropActive && 'bg-sky-500/10'
      )}
      style={{ height: totalHeight }}
      onClick={handleClick}
      onDragOver={(e) => {
        allowPlannerDrop(e)
        setDropActive(true)
      }}
      onDragLeave={() => setDropActive(false)}
      onDrop={handleDrop}
    >
      {hours.map((_, idx) => (
        <div
          key={idx}
          className="pointer-events-none absolute right-0 left-0 border-t border-zinc-200 dark:border-white/5"
          style={{ top: idx * HOUR_HEIGHT_PX }}
        />
      ))}
      {hours.map((_, idx) => (
        <div
          key={`half-${idx}`}
          className="pointer-events-none absolute right-0 left-0 border-t border-dashed border-zinc-200/50 opacity-0 transition-opacity group-hover:opacity-100 dark:border-white/[0.03]"
          style={{ top: idx * HOUR_HEIGHT_PX + HOUR_HEIGHT_PX / 2 }}
        />
      ))}

      {inGridPosts.length === 0 && emptyHint ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-zinc-400 dark:text-white/20">
          {emptyHint}
        </div>
      ) : null}

      {laidOut.map((item) => (
        <CalendarPostEvent
          key={item.post.post_id}
          post={item.post}
          top={item.top}
          height={item.height}
          col={item.col}
          colCount={item.colCount}
          compact={compact}
          selected={selectedPostId === item.post.post_id}
          onSelect={onPostSelect}
          timeZone={timeZone}
        />
      ))}
    </div>
  )
}
