import type { Platform } from '@/types/content'
import { toDatetimeLocalValue } from '@/lib/calendar-utils'

/** Local daytime slots used when the AI API returns UTC / past times. */
const GENERATED_POST_SLOTS: Array<{ hour: number; minute: number }> = [
  { hour: 9, minute: 0 },
  { hour: 11, minute: 30 },
  { hour: 14, minute: 0 },
  { hour: 16, minute: 30 },
  { hour: 18, minute: 0 },
]

const EARLIEST_POST_HOUR = 7
const LATEST_POST_HOUR = 21

/**
 * Parse a datetime-local value (`YYYY-MM-DDTHH:mm`) as local wall clock.
 * `new Date('2026-08-17T09:00')` is timezone-ambiguous across browsers.
 */
export function parseDatetimeLocal(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value.trim())
  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4]),
      Number(match[5]),
      0,
      0
    )
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

export const PLATFORM_CHAR_LIMITS: Record<string, number> = {
  twitter: 280,
  linkedin: 3000,
  instagram: 2200,
}

export function getPlatformCharLimit(platform: Platform): number {
  return PLATFORM_CHAR_LIMITS[platform] ?? 2200
}

export function toSocialHandle(displayName: string, email: string): string {
  const slug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 20)
  if (slug.length >= 3) return slug
  const fromEmail = email.split('@')[0]?.toLowerCase().replace(/[^a-z0-9_]/g, '') ?? ''
  return fromEmail || 'mybrand'
}

export function formatScheduledPreview(isoLocal: string): string {
  if (!isoLocal) return 'Pick a date & time'
  const d = parseDatetimeLocal(isoLocal)
  if (Number.isNaN(d.getTime())) return 'Pick a date & time'
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Convert a pipeline `scheduled_at` into a datetime-local string in the
 * user's timezone, with a sensible daytime slot.
 *
 * The AI API often stores 09:00 UTC ("morning") with no timezone. In Jamaica
 * (UTC−5) that becomes 4:00 AM the same day — including times already past.
 */
export function toLocalGeneratedSchedule(
  iso: string | null | undefined,
  index: number,
  now = new Date()
): string {
  const slot = GENERATED_POST_SLOTS[index % GENERATED_POST_SLOTS.length]
  const extraWeeks = Math.floor(index / GENERATED_POST_SLOTS.length)
  const minTime = new Date(now.getTime() + 60 * 60 * 1000)

  let base = iso ? new Date(iso) : new Date(now)
  if (Number.isNaN(base.getTime())) {
    base = new Date(now)
  }

  const localHour = base.getHours()
  const looksLikeUtcMorningDump =
    !iso ||
    localHour < EARLIEST_POST_HOUR ||
    localHour >= LATEST_POST_HOUR

  const scheduled = new Date(base)
  if (looksLikeUtcMorningDump) {
    scheduled.setHours(slot.hour, slot.minute, 0, 0)
  }

  if (extraWeeks > 0) {
    scheduled.setDate(scheduled.getDate() + extraWeeks * 7)
  }

  while (scheduled.getTime() <= minTime.getTime()) {
    scheduled.setDate(scheduled.getDate() + 1)
    if (looksLikeUtcMorningDump) {
      scheduled.setHours(slot.hour, slot.minute, 0, 0)
    }
  }

  return toDatetimeLocalValue(scheduled)
}

export function getDefaultScheduleDatetime(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)
  return toDatetimeLocalValue(tomorrow)
}

export function getMinScheduleDatetime(): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 5)
  return toDatetimeLocalValue(now)
}

export type SchedulePreset = { label: string; value: string }

export function getSchedulePresets(): SchedulePreset[] {
  const presets: SchedulePreset[] = []

  const inOneHour = new Date()
  inOneHour.setHours(inOneHour.getHours() + 1, 0, 0, 0)
  presets.push({ label: 'In 1 hour', value: toDatetimeLocalValue(inOneHour) })

  const tomorrowMorning = new Date()
  tomorrowMorning.setDate(tomorrowMorning.getDate() + 1)
  tomorrowMorning.setHours(9, 0, 0, 0)
  presets.push({ label: 'Tomorrow 9 AM', value: toDatetimeLocalValue(tomorrowMorning) })

  const tomorrowEvening = new Date()
  tomorrowEvening.setDate(tomorrowEvening.getDate() + 1)
  tomorrowEvening.setHours(18, 0, 0, 0)
  presets.push({ label: 'Tomorrow 6 PM', value: toDatetimeLocalValue(tomorrowEvening) })

  const nextMonday = new Date()
  const day = nextMonday.getDay()
  const daysUntilMonday = day === 0 ? 1 : day === 1 ? 7 : 8 - day
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday)
  nextMonday.setHours(10, 0, 0, 0)
  presets.push({ label: 'Next Monday', value: toDatetimeLocalValue(nextMonday) })

  return presets
}
