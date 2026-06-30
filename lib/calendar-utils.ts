import type { Post } from '@/types/content'
import type { WeekStartsOn } from '@/types/settings'

export const CALENDAR_START_HOUR = 6
export const CALENDAR_END_HOUR = 22
export const HOUR_HEIGHT_PX = 56
export const DEFAULT_POST_DURATION_MIN = 30

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
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

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatTimeRange(start: Date, durationMin: number): string {
  const end = new Date(start.getTime() + durationMin * 60_000)
  return `${formatTime(start)} – ${formatTime(end)}`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h} hr`
  return `${h} hr ${m} min`
}

export function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function getPostsForDay(posts: Post[], day: Date): Post[] {
  return posts
    .filter((p) => isSameDay(new Date(p.scheduled_date), day))
    .sort(
      (a, b) =>
        new Date(a.scheduled_date).getTime() -
        new Date(b.scheduled_date).getTime()
    )
}

export function getPostsForWeek(
  posts: Post[],
  anchor: Date,
  weekStartsOn: WeekStartsOn = 'monday'
): Post[] {
  const start = startOfWeek(anchor, weekStartsOn)
  const end = endOfWeek(anchor, weekStartsOn)
  return posts.filter((p) => {
    const d = new Date(p.scheduled_date)
    return d >= start && d <= end
  })
}

export function getNextPostOnDay(posts: Post[], day: Date): Post | null {
  const dayPosts = getPostsForDay(posts, day)
  if (dayPosts.length === 0) return null

  const now = new Date()
  if (isSameDay(day, now)) {
    const upcoming = dayPosts.find((p) => new Date(p.scheduled_date) >= now)
    return upcoming ?? dayPosts[dayPosts.length - 1]
  }

  return dayPosts[0]
}

export function getEventTopPx(date: Date): number {
  const hours = date.getHours() + date.getMinutes() / 60
  return (hours - CALENDAR_START_HOUR) * HOUR_HEIGHT_PX
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
