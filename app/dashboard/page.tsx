import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { getBusinessProfileAction } from '@/app/api/business-profile/_actions'
import { getUserPreferencesAction } from '@/app/dashboard/settings/actions'
import {
  DASHBOARD_DRAFT_STATUSES,
  EMPTY_DASHBOARD_STATS,
  getWeekBoundsIso,
} from '@/lib/dashboard-utils'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getAuthenticatedUser()

  if (!user) redirect('/login')

  const [profileResult, statsResult] = await Promise.all([
    getBusinessProfileAction(),
    getDashboardStats(user.id),
  ])

  if (process.env.NODE_ENV === 'development' && profileResult.error) {
    console.error('[dashboard] getBusinessProfileAction:', profileResult.error)
  }

  return (
    <DashboardShell
      profile={profileResult.data ?? null}
      stats={statsResult.stats ?? EMPTY_DASHBOARD_STATS}
      loadError={statsResult.error}
    />
  )
}

async function getDashboardStats(userId: string) {
  const prefs = await getUserPreferencesAction()
  const nowIso = new Date().toISOString()
  const { startIso, endIso } = getWeekBoundsIso(prefs.timezone, prefs.weekStartsOn)
  const draftStatuses = [...DASHBOARD_DRAFT_STATUSES]

  const scheduledWeekQuery = supabaseAdmin
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'scheduled')
    .gte('scheduled_at', startIso)
    .lt('scheduled_at', endIso)

  const publishedWeekQuery = supabaseAdmin
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'published')
    .gte('scheduled_at', startIso)
    .lt('scheduled_at', endIso)

  const draftCountQuery = supabaseAdmin
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', draftStatuses)

  const plansQuery = supabaseAdmin
    .from('content_plans')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const upcomingQuery = supabaseAdmin
    .from('posts')
    .select('id, content, platform, scheduled_at, status')
    .eq('user_id', userId)
    .eq('status', 'scheduled')
    .gte('scheduled_at', nowIso)
    .order('scheduled_at', { ascending: true })
    .limit(3)

  const draftsQuery = supabaseAdmin
    .from('posts')
    .select('id, content, platform, status')
    .eq('user_id', userId)
    .in('status', draftStatuses)
    .order('created_at', { ascending: false })
    .limit(4)

  const [
    scheduledWeek,
    publishedWeek,
    draftsCount,
    plansResult,
    upcomingResult,
    draftsResult,
  ] = await Promise.all([
    scheduledWeekQuery,
    publishedWeekQuery,
    draftCountQuery,
    plansQuery,
    upcomingQuery,
    draftsQuery,
  ])

  const logDev = (label: string, message?: string) => {
    if (message && process.env.NODE_ENV === 'development') {
      console.error(`[dashboard] ${label}:`, message)
    }
  }
  logDev('scheduled week', scheduledWeek.error?.message)
  logDev('published week', publishedWeek.error?.message)
  logDev('drafts count', draftsCount.error?.message)
  logDev('content_plans', plansResult.error?.message)
  logDev('upcoming', upcomingResult.error?.message)
  logDev('drafts', draftsResult.error?.message)

  const errors = [
    scheduledWeek.error?.message,
    publishedWeek.error?.message,
    draftsCount.error?.message,
    plansResult.error?.message,
    upcomingResult.error?.message,
    draftsResult.error?.message,
  ].filter(Boolean)

  return {
    stats: {
      scheduledThisWeek: scheduledWeek.count ?? 0,
      publishedThisWeek: publishedWeek.count ?? 0,
      draftCount: draftsCount.count ?? 0,
      plansCount: plansResult.count ?? 0,
      upcomingPosts: (upcomingResult.data ?? [])
      .filter((p) => Boolean(p.scheduled_at))
      .map((p) => ({
        id: p.id,
        content: p.content,
        platform: p.platform,
        scheduled_at: p.scheduled_at as string,
        status: p.status,
      })),
      recentDrafts: (draftsResult.data ?? []).map((p) => ({
        id: p.id,
        content: p.content,
        platform: p.platform,
        status: p.status,
      })),
    },
    error:
      errors.length > 0
        ? 'Some dashboard metrics could not be loaded. Counts may be incomplete until you refresh.'
        : null,
  }
}
