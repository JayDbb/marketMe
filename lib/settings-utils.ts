import type { WeekStartsOn } from '@/types/settings'
import { DEFAULT_AI_PREFERENCES } from '@/lib/ai-models'

/** Friendly labels for common zones. Unknown IANA ids still appear in the picker. */
export const TIMEZONE_LABELS: Record<string, string> = {
  'America/New_York': 'Eastern (US)',
  'America/Chicago': 'Central (US)',
  'America/Denver': 'Mountain (US)',
  'America/Los_Angeles': 'Pacific (US)',
  'Europe/London': 'London',
  'Europe/Paris': 'Paris',
  'Asia/Tokyo': 'Tokyo',
  'Australia/Sydney': 'Sydney',
  UTC: 'UTC',
}

/** @deprecated Use formatTimezoneLabel + listTimeZones */
export const TIMEZONE_OPTIONS = (
  Object.entries(TIMEZONE_LABELS) as [string, string][]
).map(([value, label]) => ({ value, label }))

export const DEFAULT_PREFERENCES = {
  timezone: 'America/New_York',
  weekStartsOn: 'monday' as WeekStartsOn,
}

export { DEFAULT_AI_PREFERENCES }

export function formatTimezoneLabel(timeZone: string): string {
  const known = TIMEZONE_LABELS[timeZone]
  if (known) return `${known} · ${timeZone.replace(/_/g, ' ')}`
  return timeZone.replace(/_/g, ' ')
}

export function detectBrowserTimeZone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return tz?.trim() || null
  } catch {
    return null
  }
}

export function listTimeZones(extra: Array<string | null | undefined> = []): string[] {
  const supported =
    typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl
      ? Intl.supportedValuesOf('timeZone')
      : Object.keys(TIMEZONE_LABELS)

  const extras = extra.filter((tz): tz is string => Boolean(tz && tz.trim()))
  return Array.from(new Set([...extras, ...supported])).sort((a, b) =>
    formatTimezoneLabel(a).localeCompare(formatTimezoneLabel(b))
  )
}

export function isValidTimeZone(timeZone: string | null | undefined): boolean {
  const tz = timeZone?.trim()
  if (!tz) return false
  try {
    Intl.DateTimeFormat('en-US', { timeZone: tz })
    return true
  } catch {
    return false
  }
}

export function parseWeekStartsOn(value: unknown): WeekStartsOn {
  return value === 'sunday' ? 'sunday' : 'monday'
}

const TIMEZONE_PICKER_LIMIT = 80

/** Empty query: common zones, with the saved and detected values pinned first. */
export function listTimezonePickerOptions(
  query: string,
  selected: string,
  detected: string | null = null
): string[] {
  const pinned = [selected, detected].filter(
    (tz): tz is string => Boolean(tz && tz.trim())
  )
  const q = query.trim().toLowerCase()

  if (!q) {
    return Array.from(new Set([...pinned, ...Object.keys(TIMEZONE_LABELS)]))
  }

  const matched = listTimeZones(pinned).filter((tz) => {
    const label = formatTimezoneLabel(tz).toLowerCase()
    return label.includes(q) || tz.toLowerCase().includes(q)
  })

  return Array.from(new Set([selected, ...matched])).slice(0, TIMEZONE_PICKER_LIMIT)
}

const WEEKDAY: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

export function getZonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const n = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  let hour = Number(n('hour'))
  if (hour === 24) hour = 0
  return {
    weekday: WEEKDAY[n('weekday')] ?? 0,
    year: Number(n('year')),
    month: Number(n('month')),
    day: Number(n('day')),
    hour,
    minute: Number(n('minute')),
    second: Number(n('second')),
  }
}

function tzOffsetMs(date: Date, timeZone: string): number {
  const p = getZonedParts(date, timeZone)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return asUtc - date.getTime()
}

export function zonedLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0)
  const offset = tzOffsetMs(new Date(guess), timeZone)
  return new Date(guess - offset)
}

export const MIN_PASSWORD_LENGTH = 8
