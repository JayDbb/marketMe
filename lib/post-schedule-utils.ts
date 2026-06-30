import type { Platform } from '@/types/content'
import { toDatetimeLocalValue } from '@/lib/calendar-utils'

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
  const d = new Date(isoLocal)
  if (Number.isNaN(d.getTime())) return 'Pick a date & time'
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
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
