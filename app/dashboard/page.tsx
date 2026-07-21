import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { getBusinessProfileAction } from '@/app/api/business-profile/_actions'
import type { DashboardStats } from '@/lib/dashboard-utils'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const EMPTY_STATS: DashboardStats = {
  postsCount: 0,
  scheduledCount: 0,
  publishedCount: 0,
  draftCount: 0,
  plansCount: 0,
  scheduledThisWeek: 0,
  upcomingPosts: [],
}

async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)

  const { data: allPosts, error: postsError } = await supabaseAdmin
    .from('posts')
    .select('id, content, platform, scheduled_at, status')
    .eq('user_id', userId)
    .order('scheduled_at', { ascending: true, nullsFirst: false })

  if (postsError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[dashboard] posts:', postsError.message)
    }
    return EMPTY_STATS
  }

  const posts = allPosts ?? []
  const scheduledCount = posts.filter(
    (p) => p.status === 'scheduled' || (p.scheduled_at && p.status !== 'published')
  ).length
  const publishedCount = posts.filter((p) => p.status === 'published').length
  const draftCount = posts.filter((p) => p.status === 'draft').length

  const scheduledThisWeek = posts.filter((p) => {
    if (!p.scheduled_at) return false
    const d = new Date(p.scheduled_at)
    return d >= weekStart && d < weekEnd
  }).length

  const upcomingPosts = posts
    .filter((p) => p.scheduled_at && new Date(p.scheduled_at) >= now)
    .sort(
      (a, b) =>
        new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime()
    )
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      content: p.content,
      platform: p.platform,
      scheduled_at: p.scheduled_at!,
      status: p.status,
    }))

  const { count: plansCount, error: plansError } = await supabaseAdmin
    .from('content_plans')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (plansError && process.env.NODE_ENV === 'development') {
    console.error('[dashboard] content_plans count:', plansError.message)
  }

  return {
    postsCount: posts.length,
    scheduledCount,
    publishedCount,
    draftCount,
    plansCount: plansCount ?? 0,
    scheduledThisWeek,
    upcomingPosts,
  }
}

export default async function DashboardPage() {
  const user = await getAuthenticatedUser()

  if (!user) redirect('/login')

  const [profileResult, stats] = await Promise.all([
    getBusinessProfileAction(),
    getDashboardStats(user.id),
  ])

  if (process.env.NODE_ENV === 'development' && profileResult.error) {
    console.error('[dashboard] getBusinessProfileAction:', profileResult.error)
  }

  const profile = profileResult.data

  return (
    <DashboardShell
      profile={profile}
      stats={stats}
    />
  )
}
