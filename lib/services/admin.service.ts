import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { PLAN_CREDIT_ALLOWANCES } from '@/types/pipeline'
import { percentile } from '@/lib/analytics/first-party'
import type {
  AdminAuditEvent,
  AdminDashboardStats,
  AdminPlanId,
  AdminUserRow,
  AdminUserSearchResult,
  AdminWorkflowRow,
  SystemService,
} from '@/types/admin'

function monthStart(): string {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function todayStart(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function daysAgoIso(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

type BaUser = {
  id: string
  email: string
  name: string | null
  image: string | null
  createdAt: string
  updatedAt: string
}

type BaSession = { userId: string; updatedAt: string; expiresAt: string }
type BaUserMin = { id: string; email: string }

async function pingDatabase(): Promise<SystemService> {
  const t0 = Date.now()
  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('user_subscriptions').select('user_id').limit(1)
    const latencyMs = Date.now() - t0
    return {
      name: 'Database',
      status: error ? 'degraded' : 'operational',
      latencyMs,
      detail: error ? error.message : null,
    }
  } catch (err) {
    return {
      name: 'Database',
      status: 'down',
      latencyMs: Date.now() - t0,
      detail: (err as Error).message,
    }
  }
}

async function pingMarketMeAi(): Promise<SystemService> {
  const t0 = Date.now()
  const base = (
    process.env.MARKETME_AI_API_URL ||
    process.env.NEXT_PUBLIC_MARKETME_AI_API_URL ||
    ''
  ).replace(/\/+$/, '')
  if (!base) {
    return {
      name: 'MarketMe AI',
      status: 'unknown',
      latencyMs: null,
      detail: 'MARKETME_AI_API_URL missing',
    }
  }
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${base}/api/v1/health`, {
      method: 'GET',
      signal: controller.signal,
    })
    clearTimeout(timer)
    const latencyMs = Date.now() - t0
    if (!res.ok) {
      return {
        name: 'MarketMe AI',
        status: 'degraded',
        latencyMs,
        detail: `HTTP ${res.status}`,
      }
    }
    return {
      name: 'MarketMe AI',
      status: 'operational',
      latencyMs,
      detail: 'Health check OK',
    }
  } catch (err) {
    return {
      name: 'MarketMe AI',
      status: 'down',
      latencyMs: Date.now() - t0,
      detail: (err as Error).message.slice(0, 160),
    }
  }
}

/** Env-only presence check — never report as live "operational". */
function envConfigured(name: string, envKey: string): SystemService {
  const configured = Boolean(process.env[envKey])
  return {
    name,
    status: configured ? 'configured' : 'unknown',
    latencyMs: null,
    detail: configured ? `${envKey} set` : `${envKey} missing`,
  }
}

function mapRunStatus(
  status: string | null | undefined
): AdminWorkflowRow['lastRunStatus'] {
  if (!status) return null
  if (status === 'failed') return 'failed'
  if (status === 'running') return 'running'
  if (status === 'success' || status === 'warning') return 'success'
  return 'pending'
}

async function buildUserRows(
  rawUsers: BaUser[],
  subsByUser: Map<string, { plan: string; status: string; credits_balance: number }>,
  sessionsByUser: Map<string, string>
): Promise<AdminUserRow[]> {
  const supabase = getSupabaseAdmin()
  const userIds = rawUsers.map((u) => u.id)
  const postCountsRes = userIds.length
    ? await supabase.from('posts').select('user_id').in('user_id', userIds)
    : { data: [] as { user_id: string }[] }

  const postsByUser = new Map<string, number>()
  for (const p of postCountsRes.data ?? []) {
    postsByUser.set(p.user_id, (postsByUser.get(p.user_id) ?? 0) + 1)
  }

  return rawUsers.map((u) => {
    const sub = subsByUser.get(u.id)
    const plan = (sub?.plan ?? 'free') as AdminPlanId
    const alloc = PLAN_CREDIT_ALLOWANCES[plan] ?? 0
    return {
      id: u.id,
      email: u.email ?? '',
      displayName: u.name ?? u.email ?? u.id,
      avatarUrl: u.image ?? null,
      plan,
      subscriptionStatus: sub?.status ?? 'active',
      creditsRemaining: sub?.credits_balance ?? 0,
      creditsTotal: alloc,
      postsCount: postsByUser.get(u.id) ?? 0,
      status: 'active' as const,
      joinedAt: u.createdAt ?? new Date().toISOString(),
      lastActiveAt: sessionsByUser.get(u.id) ?? u.updatedAt ?? null,
    }
  })
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = getSupabaseAdmin()
  const ms = monthStart()
  const td = todayStart()
  const weekAgo = daysAgoIso(7)
  const now = new Date().toISOString()

  const [
    totalUsersRes,
    newUsersRes,
    totalBusinessesRes,
    subscriptionsRes,
    totalPostsRes,
    postsMonthRes,
    totalPlansRes,
    workflowsCountRes,
    activeWorkflowsCountRes,
    workflowRunsTodayRes,
    workflowFailuresTodayRes,
    recentUsersRes,
    recentWorkflowsRes,
    activeSessionsRes,
    recentSessionsRes,
    recentCreditTxRes,
    recentAdminAuditRes,
    publishedTotalRes,
    publishedWeekRes,
    failedWeekRes,
    scheduledOpenRes,
    creditsWeekRes,
    onboardedUsersRes,
    igConnectedRes,
    publishedUsersRes,
    vitalsWeekRes,
    pageViewsWeekRes,
    dbPing,
    aiPing,
  ] = await Promise.all([
    supabase.from('user' as never).select('id', { count: 'exact', head: true }),
    supabase
      .from('user' as never)
      .select('id', { count: 'exact', head: true })
      .gte('createdAt' as never, ms),
    supabase.from('business_profiles').select('id', { count: 'exact', head: true }),
    supabase
      .from('user_subscriptions')
      .select('user_id, plan, status, credits_balance, credits_reset_at'),
    supabase.from('posts').select('id', { count: 'exact', head: true }),
    supabase.from('posts').select('id', { count: 'exact', head: true }).gte('created_at', ms),
    supabase.from('content_plans').select('id', { count: 'exact', head: true }),
    supabase.from('workflows').select('id', { count: 'exact', head: true }),
    supabase
      .from('workflows')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'enabled'),
    supabase.from('workflow_runs').select('id', { count: 'exact', head: true }).gte('started_at', td),
    supabase
      .from('workflow_runs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'failed')
      .gte('started_at', td),
    supabase
      .from('user' as never)
      .select('id, email, name, image, createdAt, updatedAt')
      .order('updatedAt' as never, { ascending: false })
      .limit(100),
    supabase
      .from('workflows')
      .select('id, user_id, name, trigger_kind, status, last_run_at, last_run_status')
      .order('last_run_at', { ascending: false, nullsFirst: false })
      .limit(50),
    supabase.from('session' as never).select('userId').gt('expiresAt' as never, now),
    supabase
      .from('session' as never)
      .select('userId, updatedAt')
      .order('updatedAt' as never, { ascending: false })
      .limit(500),
    supabase
      .from('credit_transactions')
      .select('id, user_id, stage, credits_spent, created_at')
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('admin_audit_events')
      .select('id, actor_email, action, target_user_id, target_email, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(30),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('updated_at', weekAgo),
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'failed')
      .gte('updated_at', weekAgo),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'scheduled'),
    supabase
      .from('credit_transactions')
      .select('credits_spent')
      .gte('created_at', weekAgo),
    supabase.from('business_profiles').select('user_id'),
    supabase
      .from('business_social_connections')
      .select('user_id')
      .eq('platform', 'instagram')
      .eq('status', 'connected'),
    supabase.from('posts').select('user_id').eq('status', 'published'),
    supabase
      .from('performance_events')
      .select('metric, value, path')
      .gte('created_at', weekAgo)
      .limit(2000),
    supabase
      .from('page_events')
      .select('path')
      .gte('created_at', weekAgo)
      .limit(5000),
    pingDatabase(),
    pingMarketMeAi(),
  ])

  const publishedLast7Days = publishedWeekRes.count ?? 0
  const failedLast7Days = failedWeekRes.count ?? 0
  const publishAttempts = publishedLast7Days + failedLast7Days
  const publishSuccessRate7d =
    publishAttempts > 0
      ? Math.round((publishedLast7Days / publishAttempts) * 1000) / 10
      : null

  const spentLast7Days = (creditsWeekRes.data ?? []).reduce(
    (sum, row) => sum + (row.credits_spent ?? 0),
    0
  )

  const onboarded = new Set(
    (onboardedUsersRes.data ?? []).map((r) => r.user_id).filter(Boolean)
  ).size
  const igConnected = new Set(
    (igConnectedRes.data ?? []).map((r) => r.user_id).filter(Boolean)
  ).size
  const publishedUsers = new Set(
    (publishedUsersRes.data ?? []).map((r) => r.user_id).filter(Boolean)
  ).size

  type VitalRow = { metric: string; value: number; path: string | null }
  const vitalsRows =
    ((vitalsWeekRes as unknown as { data: VitalRow[] | null; error?: { message: string } })
      .data ?? [])
  const byMetric = new Map<string, number[]>()
  const byPathMetric = new Map<string, number[]>()
  for (const row of vitalsRows) {
    const metric = row.metric
    if (!byMetric.has(metric)) byMetric.set(metric, [])
    byMetric.get(metric)!.push(row.value)
    const path = row.path || '/'
    const key = `${path}::${metric}`
    if (!byPathMetric.has(key)) byPathMetric.set(key, [])
    byPathMetric.get(key)!.push(row.value)
  }
  const sortNums = (arr: number[]) => [...arr].sort((a, b) => a - b)
  const lcpP75 = percentile(sortNums(byMetric.get('LCP') ?? []), 75)
  const clsP75 = percentile(sortNums(byMetric.get('CLS') ?? []), 75)
  const inpP75 = percentile(sortNums(byMetric.get('INP') ?? []), 75)

  const slowPaths = [...byPathMetric.entries()]
    .map(([key, values]) => {
      const [path, metric] = key.split('::')
      const p75 = percentile(sortNums(values), 75)
      return {
        path: path || '/',
        metric: metric || '',
        p75: p75 ?? 0,
        samples: values.length,
      }
    })
    .filter((row) => {
      if (row.metric === 'LCP') return row.p75 >= 2500
      if (row.metric === 'INP') return row.p75 >= 200
      if (row.metric === 'CLS') return row.p75 >= 0.1
      return false
    })
    .sort((a, b) => b.p75 - a.p75)
    .slice(0, 5)

  type PageRow = { path: string }
  const pageRows =
    ((pageViewsWeekRes as unknown as { data: PageRow[] | null }).data ?? [])
  const pathCounts = new Map<string, number>()
  for (const row of pageRows) {
    const path = row.path || '/'
    pathCounts.set(path, (pathCounts.get(path) ?? 0) + 1)
  }
  const topPaths = [...pathCounts.entries()]
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8)

  const publishHealth: SystemService = {
    name: 'Instagram publish (7d)',
    status:
      publishSuccessRate7d == null
        ? 'unknown'
        : publishSuccessRate7d >= 90
          ? 'operational'
          : publishSuccessRate7d >= 70
            ? 'degraded'
            : 'down',
    latencyMs: null,
    detail:
      publishSuccessRate7d == null
        ? 'No publish attempts in the last 7 days'
        : `${publishSuccessRate7d}% success · ${publishedLast7Days} ok · ${failedLast7Days} failed`,
  }

  const subs = subscriptionsRes.data ?? []
  const planBreakdown = { free: 0, pro: 0, team: 0 }
  let totalAllocated = 0
  let totalRemaining = 0

  for (const sub of subs) {
    const plan = (sub.plan ?? 'free') as AdminPlanId
    planBreakdown[plan] = (planBreakdown[plan] ?? 0) + 1
    const alloc = PLAN_CREDIT_ALLOWANCES[plan] ?? 0
    totalAllocated += alloc
    totalRemaining += sub.credits_balance ?? 0
  }
  const totalUsed = Math.max(0, totalAllocated - totalRemaining)

  const activeSessionData =
    ((activeSessionsRes as unknown as { data: BaSession[] | null }).data ?? [])
  const activeUsers = new Set(activeSessionData.map((s) => s.userId)).size

  const sessionsByUser = new Map<string, string>()
  const recentSessionData =
    ((recentSessionsRes as unknown as { data: BaSession[] | null }).data ?? [])
  for (const s of recentSessionData) {
    if (!sessionsByUser.has(s.userId)) sessionsByUser.set(s.userId, s.updatedAt)
  }

  const subsByUser = new Map(
    subs.map((s) => [
      s.user_id,
      {
        plan: s.plan ?? 'free',
        status: s.status ?? 'active',
        credits_balance: s.credits_balance ?? 0,
      },
    ])
  )

  const rawUsers =
    ((recentUsersRes as unknown as { data: BaUser[] | null }).data ?? [])
  const users = await buildUserRows(rawUsers, subsByUser, sessionsByUser)

  const rawWorkflows = recentWorkflowsRes.data ?? []
  const workflowIds = rawWorkflows.map((w) => w.id)
  const workflowUserIds = [
    ...new Set(rawWorkflows.map((w) => w.user_id).filter(Boolean)),
  ]

  const [workflowUsersRes, runAggRes, failAggRes] = await Promise.all([
    workflowUserIds.length
      ? supabase
          .from('user' as never)
          .select('id, email')
          .in('id' as never, workflowUserIds)
      : Promise.resolve({ data: [] }),
    workflowIds.length
      ? supabase.from('workflow_runs').select('workflow_id').in('workflow_id', workflowIds)
      : Promise.resolve({ data: [] as { workflow_id: string }[] }),
    workflowIds.length
      ? supabase
          .from('workflow_runs')
          .select('workflow_id')
          .in('workflow_id', workflowIds)
          .eq('status', 'failed')
      : Promise.resolve({ data: [] as { workflow_id: string }[] }),
  ])

  const workflowUserEmailMap = new Map(
    ((workflowUsersRes as unknown as { data: BaUserMin[] | null }).data ?? []).map(
      (u) => [u.id, u.email]
    )
  )

  const runsByWorkflow = new Map<string, number>()
  for (const r of runAggRes.data ?? []) {
    runsByWorkflow.set(r.workflow_id, (runsByWorkflow.get(r.workflow_id) ?? 0) + 1)
  }
  const failsByWorkflow = new Map<string, number>()
  for (const r of failAggRes.data ?? []) {
    failsByWorkflow.set(r.workflow_id, (failsByWorkflow.get(r.workflow_id) ?? 0) + 1)
  }

  const workflows: AdminWorkflowRow[] = rawWorkflows.map((w) => ({
    id: w.id,
    userId: w.user_id,
    userEmail: workflowUserEmailMap.get(w.user_id) ?? '',
    name: w.name ?? 'Unnamed workflow',
    triggerType: w.trigger_kind ?? 'manual',
    lastRunAt: w.last_run_at ?? null,
    lastRunStatus: mapRunStatus(w.last_run_status),
    totalRuns: runsByWorkflow.get(w.id) ?? 0,
    failureCount: failsByWorkflow.get(w.id) ?? 0,
    isActive: w.status === 'enabled',
  }))

  type CreditTx = {
    id: string
    user_id: string
    stage: string
    credits_spent: number
    created_at: string
  }
  const creditTxData =
    ((recentCreditTxRes as unknown as { data: CreditTx[] | null }).data ?? [])

  const creditUserIds = [...new Set(creditTxData.map((t) => t.user_id))]
  const creditUsersRes = creditUserIds.length
    ? await supabase
        .from('user' as never)
        .select('id, email')
        .in('id' as never, creditUserIds)
    : { data: [] }
  const creditUserEmailMap = new Map(
    ((creditUsersRes as unknown as { data: BaUserMin[] | null }).data ?? []).map(
      (u) => [u.id, u.email]
    )
  )

  const CREDIT_STAGE_LABELS: Record<string, string> = {
    business_profile_intake: 'Business profile intake',
    marketing_strategy_generation: 'Strategy generation',
    content_schedule_generation: 'Schedule generation',
    post_generation: 'Post generation',
    creative_brief_generation: 'Creative brief',
    image_generation: 'Image generation',
    publishing: 'Publishing',
  }

  const creditEvents: AdminAuditEvent[] = creditTxData.map((tx) => ({
    id: `credit-${tx.id}`,
    type: 'credit_spend' as const,
    description: `${CREDIT_STAGE_LABELS[tx.stage] ?? tx.stage.replaceAll('_', ' ')} — ${tx.credits_spent} credit${tx.credits_spent !== 1 ? 's' : ''} spent`,
    userId: tx.user_id,
    userEmail: creditUserEmailMap.get(tx.user_id) ?? null,
    metadata: { stage: tx.stage, credits_spent: tx.credits_spent },
    createdAt: tx.created_at,
  }))

  const signupEvents: AdminAuditEvent[] = rawUsers
    .filter((u) => u.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map((u) => ({
      id: `signup-${u.id}`,
      type: 'user_signup' as const,
      description: `New user signed up: ${u.email ?? u.id}`,
      userId: u.id,
      userEmail: u.email ?? null,
      metadata: null,
      createdAt: u.createdAt,
    }))

  type AdminAuditRow = {
    id: string
    actor_email: string | null
    action: string
    target_user_id: string | null
    target_email: string | null
    metadata: Record<string, unknown> | null
    created_at: string
  }
  const adminAuditData =
    ((recentAdminAuditRes as unknown as { data: AdminAuditRow[] | null }).data ??
      [])

  const adminEvents: AdminAuditEvent[] = adminAuditData.map((row) => {
    const meta = row.metadata ?? {}
    const action = row.action
    let type: AdminAuditEvent['type'] = 'admin_action'
    let description = action

    if (action === 'grant_credits') {
      type = 'credit_top_up'
      description = `Admin granted ${meta.amount ?? '?'} credits to ${row.target_email ?? row.target_user_id}`
    } else if (action === 'change_plan') {
      type = 'plan_change'
      description = `Admin set plan to ${meta.plan ?? '?'} for ${row.target_email ?? row.target_user_id}`
    }

    return {
      id: `admin-${row.id}`,
      type,
      description: row.actor_email
        ? `${description} (by ${row.actor_email})`
        : description,
      userId: row.target_user_id,
      userEmail: row.target_email,
      metadata: { ...meta, actor_email: row.actor_email },
      createdAt: row.created_at,
    }
  })

  const recentAuditEvents = [...creditEvents, ...signupEvents, ...adminEvents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 40)

  const systemServices: SystemService[] = [
    dbPing,
    aiPing,
    publishHealth,
    envConfigured('Resend', 'RESEND_API_KEY'),
    envConfigured('Stripe', 'STRIPE_SECRET_KEY'),
    envConfigured('Trigger.dev', 'TRIGGER_SECRET_KEY'),
    {
      name: 'Better Auth',
      status: 'configured',
      latencyMs: null,
      detail: 'Session auth via app runtime',
    },
    envConfigured('Pexels API', 'PEXELS_API_KEY'),
  ]

  const totalUsers =
    ((totalUsersRes as unknown as { count: number | null }).count) ?? 0

  return {
    totalUsers,
    activeUsers,
    newUsersThisMonth: ((newUsersRes as unknown as { count: number | null }).count) ?? 0,
    totalBusinesses: totalBusinessesRes.count ?? 0,
    planBreakdown,
    creditStats: {
      totalAllocated: totalAllocated,
      totalUsed,
      totalRemaining: totalRemaining,
      spentLast7Days,
    },
    workflowStats: {
      totalWorkflows: workflowsCountRes.count ?? 0,
      activeWorkflows: activeWorkflowsCountRes.count ?? 0,
      runsToday: workflowRunsTodayRes.count ?? 0,
      failuresToday: workflowFailuresTodayRes.count ?? 0,
    },
    contentStats: {
      totalPosts: totalPostsRes.count ?? 0,
      postsThisMonth: postsMonthRes.count ?? 0,
      totalPlans: totalPlansRes.count ?? 0,
      publishedTotal: publishedTotalRes.count ?? 0,
      publishedLast7Days,
      failedLast7Days,
      scheduledOpen: scheduledOpenRes.count ?? 0,
      publishSuccessRate7d,
    },
    funnel: {
      signedUp: totalUsers,
      onboarded,
      instagramConnected: igConnected,
      published: publishedUsers,
    },
    webVitals: {
      sampleCount: vitalsRows.length,
      lcpP75,
      clsP75,
      inpP75,
      slowPaths,
    },
    pageStats: {
      viewsLast7Days: pageRows.length,
      topPaths,
    },
    systemServices,
    recentAuditEvents,
    users,
    workflows,
  }
}

export async function searchAdminUsers(options: {
  query?: string
  plan?: AdminPlanId | 'all'
  page?: number
  pageSize?: number
}): Promise<AdminUserSearchResult> {
  const supabase = getSupabaseAdmin()
  const page = Math.max(1, options.page ?? 1)
  const pageSize = Math.min(100, Math.max(10, options.pageSize ?? 25))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const q = options.query?.trim() ?? ''

  let userQuery = supabase
    .from('user' as never)
    .select('id, email, name, image, createdAt, updatedAt', { count: 'exact' })
    .order('updatedAt' as never, { ascending: false })
    .range(from, to)

  if (q) {
    // PostgREST or-filter on email/name
    userQuery = userQuery.or(`email.ilike.%${q}%,name.ilike.%${q}%` as never)
  }

  const { data, count, error } = await userQuery
  if (error) throw new Error(error.message)

  const rawUsers = (data as unknown as BaUser[] | null) ?? []
  const { data: subs } = await supabase
    .from('user_subscriptions')
    .select('user_id, plan, status, credits_balance')

  const subsByUser = new Map(
    (subs ?? []).map((s) => [
      s.user_id,
      {
        plan: s.plan ?? 'free',
        status: s.status ?? 'active',
        credits_balance: s.credits_balance ?? 0,
      },
    ])
  )

  const now = new Date().toISOString()
  const { data: sessions } = await supabase
    .from('session' as never)
    .select('userId, updatedAt')
    .order('updatedAt' as never, { ascending: false })
    .limit(500)

  const sessionsByUser = new Map<string, string>()
  for (const s of ((sessions as unknown as BaSession[] | null) ?? [])) {
    if (!sessionsByUser.has(s.userId)) sessionsByUser.set(s.userId, s.updatedAt)
  }

  let users = await buildUserRows(rawUsers, subsByUser, sessionsByUser)

  if (options.plan && options.plan !== 'all') {
    users = users.filter((u) => u.plan === options.plan)
  }

  return {
    users,
    total: count ?? users.length,
    page,
    pageSize,
  }
}

async function writeAdminAudit(input: {
  actorUserId: string
  actorEmail: string
  action: string
  targetUserId: string
  targetEmail?: string | null
  metadata?: Record<string, unknown>
}): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('admin_audit_events').insert({
    actor_user_id: input.actorUserId,
    actor_email: input.actorEmail,
    action: input.action,
    target_user_id: input.targetUserId,
    target_email: input.targetEmail ?? null,
    metadata: input.metadata ?? {},
  })
  if (error) {
    // Table may not exist until migration 038 is applied — don't fail the mutation.
    console.error('[admin] audit write failed:', error.message)
  }
}

export async function grantAdminCredits(
  userId: string,
  amount: number,
  actor?: { id: string; email: string }
): Promise<{ error: string | null }> {
  if (!Number.isFinite(amount) || amount < 1 || amount > 10000) {
    return { error: 'Amount must be between 1 and 10,000' }
  }

  const supabase = getSupabaseAdmin()
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('credits_balance')
    .eq('user_id', userId)
    .maybeSingle()

  if (!sub) return { error: 'Subscription not found' }

  const next = (sub.credits_balance ?? 0) + Math.floor(amount)
  const { error } = await supabase
    .from('user_subscriptions')
    .update({ credits_balance: next })
    .eq('user_id', userId)

  if (error) return { error: error.message }

  if (actor) {
    const { data: target } = await supabase
      .from('user' as never)
      .select('email')
      .eq('id' as never, userId)
      .maybeSingle()
    await writeAdminAudit({
      actorUserId: actor.id,
      actorEmail: actor.email,
      action: 'grant_credits',
      targetUserId: userId,
      targetEmail: (target as { email?: string } | null)?.email ?? null,
      metadata: { amount: Math.floor(amount), balance_after: next },
    })
  }

  return { error: null }
}

export async function updateUserPlan(
  userId: string,
  plan: AdminPlanId,
  actor?: { id: string; email: string }
): Promise<{ error: string | null }> {
  if (!['free', 'pro', 'team'].includes(plan)) {
    return { error: 'Invalid plan' }
  }

  const supabase = getSupabaseAdmin()
  const allowance = PLAN_CREDIT_ALLOWANCES[plan]
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      plan,
      credits_balance: allowance,
    })
    .eq('user_id', userId)

  if (error) return { error: error.message }

  if (actor) {
    const { data: target } = await supabase
      .from('user' as never)
      .select('email')
      .eq('id' as never, userId)
      .maybeSingle()
    await writeAdminAudit({
      actorUserId: actor.id,
      actorEmail: actor.email,
      action: 'change_plan',
      targetUserId: userId,
      targetEmail: (target as { email?: string } | null)?.email ?? null,
      metadata: { plan, credits_reset_to: allowance },
    })
  }

  return { error: null }
}
