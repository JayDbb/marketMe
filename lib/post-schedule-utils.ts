import type { Platform } from '@/types/content'
import { toDatetimeLocalValue } from '@/lib/calendar-utils'
<<<<<<< HEAD
=======
import { getZonedParts, zonedLocalToUtc } from '@/lib/settings-utils'

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
 * Parse a datetime-local value (`YYYY-MM-DDTHH:mm`) as wall clock.
 * Pass `timeZone` to interpret the clock in the saved Preferences zone.
 */
export function parseDatetimeLocal(value: string, timeZone?: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value.trim())
  if (match) {
    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])
    const hour = Number(match[4])
    const minute = Number(match[5])
    if (timeZone) {
      return zonedLocalToUtc(year, month, day, hour, minute, timeZone)
    }
    return new Date(year, month - 1, day, hour, minute, 0, 0)
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}
>>>>>>> origin/development

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

<<<<<<< HEAD
export function formatScheduledPreview(isoLocal: string): string {
  if (!isoLocal) return 'Pick a date & time'
  const d = new Date(isoLocal)
=======
export function formatScheduledPreview(isoLocal: string, timeZone?: string): string {
  if (!isoLocal) return 'Pick a date & time'
  const d = parseDatetimeLocal(isoLocal, timeZone)
>>>>>>> origin/development
  if (Number.isNaN(d.getTime())) return 'Pick a date & time'
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
<<<<<<< HEAD
  })
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
=======
    ...(timeZone ? { timeZone } : {}),
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

export function getDefaultScheduleDatetime(timeZone?: string): string {
  if (!timeZone) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)
    return toDatetimeLocalValue(tomorrow)
  }
  const p = getZonedParts(new Date(), timeZone)
  const noon = zonedLocalToUtc(p.year, p.month, p.day, 12, 0, timeZone)
  const next = new Date(noon.getTime() + 24 * 60 * 60 * 1000)
  const n = getZonedParts(next, timeZone)
  return toDatetimeLocalValue(
    zonedLocalToUtc(n.year, n.month, n.day, 10, 0, timeZone),
    timeZone
  )
}

export function getMinScheduleDatetime(timeZone?: string): string {
  const now = new Date(Date.now() + 5 * 60 * 1000)
  return toDatetimeLocalValue(now, timeZone)
>>>>>>> origin/development
}

export type SchedulePreset = { label: string; value: string }

<<<<<<< HEAD
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
=======
export function getSchedulePresets(timeZone?: string): SchedulePreset[] {
  const presets: SchedulePreset[] = []
  const now = new Date()

  if (!timeZone) {
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

  presets.push({
    label: 'In 1 hour',
    value: toDatetimeLocalValue(new Date(now.getTime() + 60 * 60 * 1000), timeZone),
  })

  const p = getZonedParts(now, timeZone)
  const noon = zonedLocalToUtc(p.year, p.month, p.day, 12, 0, timeZone)
  const tomorrow = new Date(noon.getTime() + 24 * 60 * 60 * 1000)
  const t = getZonedParts(tomorrow, timeZone)
  presets.push({
    label: 'Tomorrow 9 AM',
    value: toDatetimeLocalValue(
      zonedLocalToUtc(t.year, t.month, t.day, 9, 0, timeZone),
      timeZone
    ),
  })
  presets.push({
    label: 'Tomorrow 6 PM',
    value: toDatetimeLocalValue(
      zonedLocalToUtc(t.year, t.month, t.day, 18, 0, timeZone),
      timeZone
    ),
  })

  let cursor = noon
  for (let i = 1; i <= 8; i++) {
    cursor = new Date(noon.getTime() + i * 24 * 60 * 60 * 1000)
    const c = getZonedParts(cursor, timeZone)
    if (c.weekday === 1) {
      presets.push({
        label: 'Next Monday',
        value: toDatetimeLocalValue(
          zonedLocalToUtc(c.year, c.month, c.day, 10, 0, timeZone),
          timeZone
        ),
      })
      break
    }
  }
>>>>>>> origin/development

  return presets
}
