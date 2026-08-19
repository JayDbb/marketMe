import type { Post } from '@/types/content'
import type { WeekStartsOn } from '@/types/settings'
import { getZonedParts, zonedLocalToUtc } from '@/lib/settings-utils'

export const CALENDAR_START_HOUR = 6
export const CALENDAR_END_HOUR = 22
export const HOUR_HEIGHT_PX = 56
export const DEFAULT_POST_DURATION_MIN = 30

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function civilYmd(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function ymdInZone(date: Date, timeZone?: string): string {
  if (!timeZone) return civilYmd(date)
  const p = getZonedParts(date, timeZone)
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`
}

function hoursInZone(date: Date, timeZone?: string): number {
  if (!timeZone) return date.getHours() + date.getMinutes() / 60
  const p = getZonedParts(date, timeZone)
  return p.hour + p.minute / 60
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isToday(date: Date, timeZone?: string): boolean {
  if (!timeZone) return isSameDay(date, new Date())
  return civilYmd(date) === ymdInZone(new Date(), timeZone)
}

export function startOfWeek(date: Date, weekStartsOn: WeekStartsOn = 'monday'): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  if (weekStartsOn === 'sunday') {
    d.setDate(d.getDate() - day)
  } else {
    const diff = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + diff)
  }
  return d
}

export function endOfWeek(date: Date, weekStartsOn: WeekStartsOn = 'monday'): Date {
  const d = startOfWeek(date, weekStartsOn)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

export function getWeekDays(date: Date, weekStartsOn: WeekStartsOn = 'monday'): Date[] {
  const start = startOfWeek(date, weekStartsOn)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export function getCalendarHours(): number[] {
  return Array.from(
    { length: CALENDAR_END_HOUR - CALENDAR_START_HOUR },
    (_, i) => i + CALENDAR_START_HOUR
  )
}

export function formatHourLabel(hour: number): string {
  if (hour === 0 || hour === 24) return '12 am'
  if (hour === 12) return '12 pm'
  return hour < 12 ? `${hour} am` : `${hour - 12} pm`
}

export function formatTime(date: Date, timeZone?: string): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...(timeZone ? { timeZone } : {}),
  })
}

export function formatTimeRange(start: Date, durationMin: number, timeZone?: string): string {
  const end = new Date(start.getTime() + durationMin * 60_000)
  return `${formatTime(start, timeZone)} – ${formatTime(end, timeZone)}`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h} hr`
  return `${h} hr ${m} min`
}

export type PlannerViewMode = 'Month' | 'Week' | 'Day'

export function toDatetimeLocalValue(date: Date, timeZone?: string): string {
  if (!timeZone) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`
  }
  const p = getZonedParts(date, timeZone)
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}T${pad2(p.hour)}:${pad2(p.minute)}`
}

export function formatDateParam(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseDateParam(value: string | null | undefined): Date | null {
  if (!value) return null
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

export function parsePlannerView(
  viewParam: string | null | undefined,
  dateParam: string | null | undefined
): PlannerViewMode {
  const v = (viewParam ?? '').trim().toLowerCase()
  if (v === 'month') return 'Month'
  if (v === 'week') return 'Week'
  if (v === 'day') return 'Day'
  if (dateParam) return 'Day'
  return 'Week'
}

export function plannerViewToParam(view: PlannerViewMode): string {
  return view.toLowerCase()
}

export function parseScheduledDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function hasValidSchedule(post: Post): boolean {
  return parseScheduledDate(post.scheduled_date) != null
}

export function canReschedulePost(post: Post): boolean {
  return post.status !== 'published'
}

export function getCalendarGridHeightPx(): number {
  return (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * HOUR_HEIGHT_PX
}

export function isBeforeCalendarGrid(date: Date, timeZone?: string): boolean {
  return hoursInZone(date, timeZone) < CALENDAR_START_HOUR
}

export function isAfterCalendarGrid(date: Date, timeZone?: string): boolean {
  return getEventTopPx(date, timeZone) >= getCalendarGridHeightPx()
}

export function slotDateFromOffset(day: Date, offsetY: number, timeZone?: string): Date {
  const hourFraction = offsetY / HOUR_HEIGHT_PX
  let hour = Math.floor(hourFraction + CALENDAR_START_HOUR)
  let minute = Math.round(((hourFraction % 1) * 60) / 15) * 15
  if (minute === 60) {
    hour += 1
    minute = 0
  }
  hour = Math.min(23, Math.max(0, hour))
  if (!timeZone) {
    const d = new Date(day)
    d.setHours(hour, minute, 0, 0)
    return d
  }
  return zonedLocalToUtc(
    day.getFullYear(),
    day.getMonth() + 1,
    day.getDate(),
    hour,
    minute,
    timeZone
  )
}

export function applyTimeToDate(day: Date, from: Date, timeZone?: string): Date {
  if (!timeZone) {
    const d = new Date(day)
    d.setHours(from.getHours(), from.getMinutes(), 0, 0)
    return d
  }
  const p = getZonedParts(from, timeZone)
  return zonedLocalToUtc(
    day.getFullYear(),
    day.getMonth() + 1,
    day.getDate(),
    p.hour,
    p.minute,
    timeZone
  )
}

export function defaultDraftSlot(day: Date, timeZone?: string): Date {
  if (!timeZone) {
    const d = new Date(day)
    d.setHours(10, 0, 0, 0)
    return d
  }
  return zonedLocalToUtc(day.getFullYear(), day.getMonth() + 1, day.getDate(), 10, 0, timeZone)
}

export function getPostsForDay(posts: Post[], day: Date, timeZone?: string): Post[] {
  const dayKey = civilYmd(day)
  return posts
    .filter((p) => {
      const d = parseScheduledDate(p.scheduled_date)
      return d != null && ymdInZone(d, timeZone) === dayKey
    })
    .sort((a, b) => {
      const ta = parseScheduledDate(a.scheduled_date)?.getTime() ?? 0
      const tb = parseScheduledDate(b.scheduled_date)?.getTime() ?? 0
      return ta - tb
    })
}

export function getPostsForWeek(
  posts: Post[],
  anchor: Date,
  weekStartsOn: WeekStartsOn = 'monday',
  timeZone?: string
): Post[] {
  const keys = new Set(getWeekDays(anchor, weekStartsOn).map(civilYmd))
  return posts.filter((p) => {
    const d = parseScheduledDate(p.scheduled_date)
    return d != null && keys.has(ymdInZone(d, timeZone))
  })
}

export type MonthCell = {
  day: number
  isCurrentMonth: boolean
  date: Date
}

export function getMonthWeekdayLabels(weekStartsOn: WeekStartsOn): string[] {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  if (weekStartsOn === 'sunday') return labels
  return [...labels.slice(1), labels[0]]
}

export function getMonthCells(
  year: number,
  month: number,
  weekStartsOn: WeekStartsOn
): { cells: MonthCell[]; rowCount: number } {
  const firstDayOfMonth = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  let startingDayOfWeek =
    weekStartsOn === 'sunday'
      ? firstDayOfMonth.getDay()
      : firstDayOfMonth.getDay() - 1
  if (startingDayOfWeek === -1) startingDayOfWeek = 6

  const prevMonthDays = new Date(year, month, 0).getDate()
  const totalSlots = startingDayOfWeek + daysInMonth
  const totalGridCells = Math.ceil(totalSlots / 7) * 7
  const rowCount = totalGridCells / 7

  const cells = Array.from({ length: totalGridCells }, (_, idx) => {
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

  return { cells, rowCount }
}

export type LaidOutEvent = {
  post: Post
  top: number
  height: number
  col: number
  colCount: number
}

export function partitionDayPosts(posts: Post[], day: Date, timeZone?: string) {
  const dayPosts = getPostsForDay(posts, day, timeZone)
  const inGrid: Post[] = []
  const before: Post[] = []
  const after: Post[] = []
  for (const post of dayPosts) {
    const d = parseScheduledDate(post.scheduled_date)
    if (!d) continue
    if (isBeforeCalendarGrid(d, timeZone)) before.push(post)
    else if (isAfterCalendarGrid(d, timeZone)) after.push(post)
    else inGrid.push(post)
  }
  return { inGrid, before, after }
}

export function layoutOverlappingEvents(posts: Post[], timeZone?: string): LaidOutEvent[] {
  const items = posts
    .map((post) => {
      const start = parseScheduledDate(post.scheduled_date)
      if (!start) return null
      const startMs = start.getTime()
      const endMs = startMs + DEFAULT_POST_DURATION_MIN * 60_000
      return {
        post,
        startMs,
        endMs,
        top: getEventTopPx(start, timeZone),
        height: getEventHeightPx(DEFAULT_POST_DURATION_MIN),
      }
    })
    .filter((item): item is NonNullable<typeof item> => item != null)
    .sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs)

  const result: LaidOutEvent[] = []
  const columns: { endMs: number }[] = []
  let cluster: Array<(typeof items)[number] & { col: number }> = []
  let clusterEnd = 0

  const flushCluster = () => {
    if (cluster.length === 0) return
    const colCount = Math.max(1, ...cluster.map((item) => item.col + 1))
    for (const item of cluster) {
      result.push({
        post: item.post,
        top: item.top,
        height: item.height,
        col: item.col,
        colCount,
      })
    }
    cluster = []
    columns.length = 0
    clusterEnd = 0
  }

  for (const item of items) {
    if (cluster.length > 0 && item.startMs >= clusterEnd) {
      flushCluster()
    }
    let col = columns.findIndex((column) => column.endMs <= item.startMs)
    if (col === -1) {
      col = columns.length
      columns.push({ endMs: item.endMs })
    } else {
      columns[col].endMs = item.endMs
    }
    cluster.push({ ...item, col })
    clusterEnd = Math.max(clusterEnd, item.endMs)
  }
  flushCluster()
  return result
}

export function getNextPostOnDay(posts: Post[], day: Date, timeZone?: string): Post | null {
  const dayPosts = getPostsForDay(posts, day, timeZone)
  if (dayPosts.length === 0) return null

  const now = new Date()
  if (isToday(day, timeZone)) {
    const upcoming = dayPosts.find((p) => new Date(p.scheduled_date) >= now)
    return upcoming ?? dayPosts[dayPosts.length - 1]
  }

  return dayPosts[0]
}

export function getEventTopPx(date: Date, timeZone?: string): number {
  return (hoursInZone(date, timeZone) - CALENDAR_START_HOUR) * HOUR_HEIGHT_PX
}

export function getEventHeightPx(durationMin = DEFAULT_POST_DURATION_MIN): number {
  return (durationMin / 60) * HOUR_HEIGHT_PX
}

export function getHeaderTitle(
  date: Date,
  viewMode: 'Month' | 'Week' | 'Day',
  weekStartsOn: WeekStartsOn = 'monday'
): string {
  if (viewMode === 'Day') {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (viewMode === 'Week') {
    const days = getWeekDays(date, weekStartsOn)
    const start = days[0]
    const end = days[6]
    const sameMonth = start.getMonth() === end.getMonth()
    if (sameMonth) {
      return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`
    }
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function dateFromSlot(day: Date, hour: number, minute = 0): Date {
  const d = new Date(day)
  d.setHours(hour, minute, 0, 0)
  return d
}

export function isDateInWeek(
  date: Date,
  anchor: Date,
  weekStartsOn: WeekStartsOn = 'monday'
): boolean {
  const start = startOfWeek(anchor, weekStartsOn)
  const end = endOfWeek(anchor, weekStartsOn)
  const d = new Date(date)
  d.setHours(12, 0, 0, 0)
  return d >= start && d <= end
}

export function getMinuteOffsetInDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}
