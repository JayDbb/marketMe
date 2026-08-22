import type { BusinessProfile } from '@/types/business-profile'
import { AI_PROFILE_ESSENTIALS } from '@/lib/marketing-profile-prompt'
<<<<<<< HEAD
=======
import { POST_INBOX_TAB_STATUSES } from '@/lib/post-utils'
import { getZonedParts, zonedLocalToUtc } from '@/lib/settings-utils'
import type { WeekStartsOn } from '@/types/settings'
>>>>>>> origin/development

export interface UpcomingPost {
  id: string
  content: string | null
  platform: string | null
  scheduled_at: string
  status: string
}

<<<<<<< HEAD
export interface DashboardStats {
  postsCount: number
  scheduledCount: number
  publishedCount: number
  draftCount: number
  plansCount: number
  scheduledThisWeek: number
  upcomingPosts: UpcomingPost[]
=======
export interface DashboardDraft {
  id: string
  content: string | null
  platform: string | null
  status: string
}

export interface DashboardStats {
  scheduledThisWeek: number
  publishedThisWeek: number
  draftCount: number
  plansCount: number
  upcomingPosts: UpcomingPost[]
  recentDrafts: DashboardDraft[]
}

export const DASHBOARD_DRAFT_STATUSES = POST_INBOX_TAB_STATUSES.drafts

export const EMPTY_DASHBOARD_STATS: DashboardStats = {
  scheduledThisWeek: 0,
  publishedThisWeek: 0,
  draftCount: 0,
  plansCount: 0,
  upcomingPosts: [],
  recentDrafts: [],
}

export { zonedLocalToUtc }

/** Inclusive start, exclusive end, in the user's timezone week. */
export function getWeekBoundsIso(
  timeZone: string,
  weekStartsOn: WeekStartsOn,
  now = new Date()
): { startIso: string; endIso: string } {
  const p = getZonedParts(now, timeZone)
  const weekStartDow = weekStartsOn === 'sunday' ? 0 : 1
  let diff = p.weekday - weekStartDow
  if (diff < 0) diff += 7
  const startLocal = new Date(Date.UTC(p.year, p.month - 1, p.day))
  startLocal.setUTCDate(startLocal.getUTCDate() - diff)
  const y = startLocal.getUTCFullYear()
  const m = startLocal.getUTCMonth() + 1
  const d = startLocal.getUTCDate()
  const start = zonedLocalToUtc(y, m, d, 0, 0, timeZone)
  const endDate = new Date(Date.UTC(y, m - 1, d))
  endDate.setUTCDate(endDate.getUTCDate() + 7)
  const end = zonedLocalToUtc(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth() + 1,
    endDate.getUTCDate(),
    0,
    0,
    timeZone
  )
  return { startIso: start.toISOString(), endIso: end.toISOString() }
>>>>>>> origin/development
}

export function getProfileCompleteness(profile: BusinessProfile | null): number {
  if (!profile) return 0
  const filled = AI_PROFILE_ESSENTIALS.filter((f) => {
    const v = profile[f]
    if (f === 'channels') return Array.isArray(v) && v.length > 0
    return typeof v === 'string' && v.trim().length > 0
  }).length
  return Math.round((filled / AI_PROFILE_ESSENTIALS.length) * 100)
}

export function formatUpcomingDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function getPlannerDateParam(iso: string): string {
  const d = new Date(iso)
  const pad = (n: string | number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
<<<<<<< HEAD
=======

export function dashboardGreetingName(businessName: string | null | undefined): string {
  const name = businessName?.trim()
  if (!name || name.toLowerCase() === 'welcome') return 'there'
  return name
}
>>>>>>> origin/development
