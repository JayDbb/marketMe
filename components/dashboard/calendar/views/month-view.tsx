'use client'

<<<<<<< HEAD
import type { Post } from '@/types/content'
import {
  getPostsForDay,
  isSameDay,
  isToday,
} from '@/lib/calendar-utils'
import { cn } from '@/lib/utils'
=======
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
>>>>>>> origin/development

interface MonthViewProps {
  posts: Post[]
  selectedDate: Date
  selectedPostId?: string | number | null
  onDateSelect: (date: Date) => void
  onPostSelect: (post: Post) => void
<<<<<<< HEAD
=======
  onReschedule: (postId: string, next: Date) => void
  weekStartsOn?: WeekStartsOn
  timeZone?: string
>>>>>>> origin/development
}

export function MonthView({
  posts,
  selectedDate,
  selectedPostId,
  onDateSelect,
  onPostSelect,
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/development
          >
            {d}
          </div>
        ))}
      </div>

      <div
<<<<<<< HEAD
        className="flex-1 grid grid-cols-7 gap-px bg-zinc-200 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-2xl overflow-hidden min-h-0"
        style={{ gridTemplateRows: `repeat(${rowCount}, minmax(96px, 1fr))` }}
      >
        {calendarCells.map((cell, idx) => {
          const dayPosts = getPostsForDay(posts, cell.date)
          const isSelected = isSameDay(cell.date, selectedDate)
          const today = isToday(cell.date)
=======
        className="grid min-h-0 flex-1 grid-cols-7 gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 dark:border-white/5 dark:bg-white/5"
        style={{ gridTemplateRows: `repeat(${rowCount}, minmax(96px, 1fr))` }}
      >
        {cells.map((cell, idx) => {
          const dayPosts = getPostsForDay(posts, cell.date, timeZone)
          const isSelected = isSameDay(cell.date, selectedDate)
          const today = isToday(cell.date, timeZone)
>>>>>>> origin/development

          return (
            <div
              key={idx}
              role="button"
              tabIndex={0}
<<<<<<< HEAD
              onClick={() => onDateSelect(cell.date)}
=======
              onClick={() => {
                if (Date.now() < ignoreClickUntil.current) return
                onDateSelect(cell.date)
              }}
>>>>>>> origin/development
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onDateSelect(cell.date)
                }
              }}
<<<<<<< HEAD
              className={cn(
                'relative flex flex-col h-full min-h-[96px] p-2 text-left cursor-pointer select-none',
                'bg-zinc-50/90 dark:bg-[#161b22]/90 transition-colors',
=======
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
>>>>>>> origin/development
                'focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_rgba(59,130,246,0.6)]',
                cell.isCurrentMonth
                  ? 'hover:bg-white dark:hover:bg-white/[0.07]'
                  : 'opacity-40',
<<<<<<< HEAD
                isSelected && 'bg-blue-500/8 shadow-[inset_0_0_0_2px_rgba(59,130,246,0.45)]'
=======
                isSelected && 'bg-blue-500/8 shadow-[inset_0_0_0_2px_rgba(59,130,246,0.45)]',
                dropKey === idx && 'bg-sky-500/15'
>>>>>>> origin/development
              )}
            >
              <span
                className={cn(
<<<<<<< HEAD
                  'inline-flex w-7 h-7 shrink-0 items-center justify-center rounded-full text-sm font-bold',
=======
                  'inline-flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold',
>>>>>>> origin/development
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

<<<<<<< HEAD
              <div className="mt-1 space-y-0.5 flex-1 min-h-0 overflow-hidden">
                {dayPosts.slice(0, 3).map((p) => {
                  const isPostSelected = selectedPostId === p.post_id
=======
              <div className="mt-1 min-h-0 flex-1 space-y-0.5 overflow-hidden">
                {dayPosts.slice(0, 3).map((p) => {
                  const isPostSelected = selectedPostId === p.post_id
                  const start = parseScheduledDate(p.scheduled_date)
                  const movable = canReschedulePost(p)
>>>>>>> origin/development
                  return (
                    <button
                      key={p.post_id}
                      type="button"
<<<<<<< HEAD
=======
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
>>>>>>> origin/development
                      onClick={(e) => {
                        e.stopPropagation()
                        onPostSelect(p)
                      }}
                      className={cn(
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/development
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
