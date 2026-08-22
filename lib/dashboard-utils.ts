import type { BusinessProfile } from '@/types/business-profile'
import { AI_PROFILE_ESSENTIALS } from '@/lib/marketing-profile-prompt'

export interface UpcomingPost {
  id: string
  content: string | null
  platform: string | null
  scheduled_at: string
  status: string
}

export interface DashboardStats {
  postsCount: number
  scheduledCount: number
  publishedCount: number
  draftCount: number
  plansCount: number
  scheduledThisWeek: number
  upcomingPosts: UpcomingPost[]
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
