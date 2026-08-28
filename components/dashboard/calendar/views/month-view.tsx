'use client'

import { useRef, useState } from 'react'
import type { Post } from '@/types/content'
import {
  applyTimeToDate,
  canReschedulePost,
  defaultDraftSlot,
  getMonthCells,
  getMonthWeekdayLabels,
  getPostsForDay,
  isSameDay,
  isToday,
  parseScheduledDate,
} from '@/lib/calendar-utils'
import { allowPlannerDrop, getPlannerDragPayload, setPlannerDragData } from '@/lib/planner-dnd'
import { EventThumb } from '@/components/dashboard/calendar/calendar-post-event'
import { formatPlatform } from '@/lib/post-utils'
import { cn } from '@/lib/utils'
import type { WeekStartsOn } from '@/types/settings'

interface MonthViewProps {
  posts: Post[]
  selectedDate: Date
  selectedPostId?: string | number | null
  onDateSelect: (date: Date) => void
  onPostSelect: (post: Post) => void
  onReschedule: (postId: string, next: Date) => void
  weekStartsOn?: WeekStartsOn
  timeZone?: string
}

export function MonthView({
  posts,
  selectedDate,
  selectedPostId,
  onDateSelect,
  onPostSelect,
  onReschedule,
  weekStartsOn = 'monday',
  timeZone,
}: MonthViewProps) {
  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()
  const { cells, rowCount } = getMonthCells(year, month, weekStartsOn)
  const weekdayHeaders = getMonthWeekdayLabels(weekStartsOn)
  const ignoreClickUntil = useRef(0)
  const [dropKey, setDropKey] = useState<number | null>(null)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-1 grid shrink-0 grid-cols-7">
        {weekdayHeaders.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-white/30"
          >
            {d}
          </div>
        ))}
      </div>

      <div
        className="grid min-h-0 flex-1 grid-cols-7 gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 dark:border-white/5 dark:bg-white/5"
        style={{ gridTemplateRows: `repeat(${rowCount}, minmax(96px, 1fr))` }}
      >
        {cells.map((cell, idx) => {
          const dayPosts = getPostsForDay(posts, cell.date, timeZone)
          const isSelected = isSameDay(cell.date, selectedDate)
          const today = isToday(cell.date, timeZone)

          return (
            <div
              key={idx}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (Date.now() < ignoreClickUntil.current) return
                onDateSelect(cell.date)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onDateSelect(cell.date)
                }
              }}
              onDragOver={(e) => {
                allowPlannerDrop(e)
                setDropKey(idx)
              }}
              onDragLeave={() => setDropKey((current) => (current === idx ? null : current))}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setDropKey(null)
                ignoreClickUntil.current = Date.now() + 400
                const payload = getPlannerDragPayload(e)
                if (!payload) return
                const from = parseScheduledDate(payload.scheduledDate)
                const next = from
                  ? applyTimeToDate(cell.date, from, timeZone)
                  : defaultDraftSlot(cell.date, timeZone)
                onReschedule(payload.postId, next)
              }}
              className={cn(
                'relative flex h-full min-h-[96px] cursor-pointer flex-col p-2 text-left select-none',
                'bg-zinc-50 transition-colors dark:bg-[#161b22]',
                'focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_rgba(59,130,246,0.6)]',
                cell.isCurrentMonth
                  ? 'hover:bg-white dark:hover:bg-white/[0.07]'
                  : 'opacity-40',
                isSelected && 'bg-blue-500/8 shadow-[inset_0_0_0_2px_rgba(59,130,246,0.45)]',
                dropKey === idx && 'bg-sky-500/15'
              )}
            >
              <span
                className={cn(
                  'inline-flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold',
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

              <div className="mt-1 min-h-0 flex-1 space-y-0.5 overflow-hidden">
                {dayPosts.slice(0, 3).map((p) => {
                  const isPostSelected = selectedPostId === p.post_id
                  const start = parseScheduledDate(p.scheduled_date)
                  const movable = canReschedulePost(p)
                  return (
                    <button
                      key={p.post_id}
                      type="button"
                      draggable={movable}
                      onDragStart={(e) => {
                        if (!movable) {
                          e.preventDefault()
                          return
                        }
                        e.stopPropagation()
                        setPlannerDragData(e, {
                          postId: String(p.post_id),
                          source: 'event',
                          scheduledDate: p.scheduled_date,
                        })
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onPostSelect(p)
                      }}
                      className={cn(
                        'flex w-full items-center gap-1 truncate rounded border px-1 py-1 text-left text-[10px] font-semibold capitalize',
                        'transition-colors',
                        isPostSelected
                          ? 'border-sky-400 bg-sky-500 text-white'
                          : 'border-sky-500/15 bg-sky-500/10 text-sky-800 hover:bg-sky-500/20 dark:text-sky-200',
                        movable ? 'cursor-grab' : 'cursor-pointer'
                      )}
                    >
                      <EventThumb url={p.media_url} compact />
                      <span className="min-w-0 truncate">
                        {start
                          ? start.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })
                          : ''}{' '}
                        {formatPlatform(p.social_account?.platform)}
                      </span>
                    </button>
                  )
                })}
                {dayPosts.length > 3 ? (
                  <div className="pointer-events-none px-1.5 text-[10px] text-zinc-500 dark:text-white/30">
                    +{dayPosts.length - 3} more
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
