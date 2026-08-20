import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { PLAN_CREDIT_ALLOWANCES } from '@/types/pipeline'
import type {
  AdminDashboardStats,
  AdminUserRow,
  AdminWorkflowRow,
  AdminAuditEvent,
  SystemService,
} from '@/types/admin'

// ─── helpers ────────────────────────────────────────────────────────────────

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

// ─── system health ping ──────────────────────────────────────────────────────

async function pingSupabase(): Promise<SystemService> {
  const t0 = Date.now()
  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('user_subscriptions').select('user_id').limit(1)
    const latencyMs = Date.now() - t0
    return { name: 'Database', status: error ? 'degraded' : 'operational', latencyMs }
  } catch {
    return { name: 'Database', status: 'down', latencyMs: Date.now() - t0 }
  }
}

async function pingEnvService(
  name: string,
  envKey: string
): Promise<SystemService> {
  const configured = Boolean(process.env[envKey])
  return {
    name,
    status: configured ? 'operational' : 'unknown',
    latencyMs: null,
  }
}

// ─── type helpers for Better Auth tables (camelCase columns, quoted names) ──

type BaUser = { id: string; email: string; name: string | null; image: string | null; createdAt: string; updatedAt: string }
type BaSession = { userId: string; updatedAt: string; expiresAt: string }
type BaUserMin = { id: string; email: string }

// ─── main data fetch ─────────────────────────────────────────────────────────

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = getSupabaseAdmin()
  const ms = monthStart()
  const td = todayStart()
  const now = new Date().toISOString()

  const [
    totalUsersRes,
    newUsersRes,
    totalBusinessesRes,
    subscriptionsRes,
    totalPostsRes,
    postsMonthRes,
    totalPlansRes,
    workflowsRes,
    workflowRunsTodayRes,
    workflowFailuresTodayRes,
    recentUsersRes,
    recentWorkflowsRes,
    // Active sessions = sessions that haven't expired yet
    activeSessionsRes,
    // Most recent session per user for lastActiveAt
    recentSessionsRes,
    // Real audit events: recent credit transactions
    recentCreditTxRes,
    dbPing,
    resendService,
    stripeService,
    triggerService,
  ] = await Promise.all([
    // Better Auth uses camelCase quoted columns — use .from('user') not 'users'
    supabase.from('user' as never).select('id', { count: 'exact', head: true }),
    supabase.from('user' as never).select('id', { count: 'exact', head: true }).gte('createdAt' as never, ms),
    supabase.from('business_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('user_subscriptions').select('user_id, plan, status, credits_balance, credits_reset_at'),
    supabase.from('posts').select('id', { count: 'exact', head: true }),
    supabase.from('posts').select('id', { count: 'exact', head: true }).gte('created_at', ms),
    supabase.from('content_plans').select('id', { count: 'exact', head: true }),
    supabase.from('workflows').select('id', { count: 'exact', head: true }),
    supabase.from('workflow_runs').select('id', { count: 'exact', head: true }).gte('created_at', td),
    supabase.from('workflow_runs').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', td),
    // User list sorted by most recently active (updatedAt)
    supabase
      .from('user' as never)
      .select('id, email, name, image, createdAt, updatedAt')
      .order('updatedAt' as never, { ascending: false })
      .limit(100),
    // Workflow list
    supabase
      .from('workflows')
      .select('id, user_id, name, trigger_type, last_run_at, last_run_status, total_runs, failure_count, is_active')
      .order('last_run_at', { ascending: false, nullsFirst: false })
      .limit(50),
    // Active users = distinct userIds with a non-expired Better Auth session
    supabase
      .from('session' as never)
      .select('userId')
      .gt('expiresAt' as never, now),
    // Most recent session per user for lastActiveAt
    supabase
      .from('session' as never)
      .select('userId, updatedAt')
      .order('updatedAt' as never, { ascending: false })
      .limit(500),
    // Real activity: recent credit transactions across all users
    supabase
      .from('credit_transactions')
      .select('id, user_id, stage, credits_spent, created_at')
      .order('created_at', { ascending: false })
      .limit(30),
    // System service pings
    pingSupabase(),
    pingEnvService('Resend', 'RESEND_API_KEY'),
    pingEnvService('Stripe', 'STRIPE_SECRET_KEY'),
    pingEnvService('Trigger.dev', 'TRIGGER_SECRET_KEY'),
  ])

  // ── subscriptions breakdown ──
  const subs = subscriptionsRes.data ?? []
  const planBreakdown = { free: 0, pro: 0, team: 0 }
  let totalAllocated = 0
  let totalRemaining = 0

  for (const sub of subs) {
    const plan = (sub.plan ?? 'free') as 'free' | 'pro' | 'team'
    planBreakdown[plan] = (planBreakdown[plan] ?? 0) + 1
    const alloc = PLAN_CREDIT_ALLOWANCES[plan] ?? 0
    totalAllocated += alloc
    totalRemaining += sub.credits_balance ?? 0
  }
  const totalUsed = Math.max(0, totalAllocated - totalRemaining)

  // ── active users: users with at least one live (non-expired) session ──
  const activeSessionData = ((activeSessionsRes as unknown as { data: BaSession[] | null }).data ?? [])
  const activeUserIds = new Set(activeSessionData.map((s) => s.userId))
  const activeUsers = activeUserIds.size

  // ── lastActiveAt per user: most recent session updatedAt ──
  const sessionsByUser = new Map<string, string>()
  const recentSessionData = ((recentSessionsRes as unknown as { data: BaSession[] | null }).data ?? [])
  for (const s of recentSessionData) {
    if (!sessionsByUser.has(s.userId)) {
      sessionsByUser.set(s.userId, s.updatedAt)
    }
  }

  // ── build user rows ──
  const subsMap = new Map(subs.map((s) => [s.user_id, s]))
  const rawUsers = ((recentUsersRes as unknown as { data: BaUser[] | null }).data ?? [])

  // Get post counts for these users in one query
  const userIds = rawUsers.map((u) => u.id)
  const postCountsRes = userIds.length
    ? await supabase.from('posts').select('user_id').in('user_id', userIds)
    : { data: [] }

  const postsByUser = new Map<string, number>()
  for (const p of postCountsRes.data ?? []) {
    postsByUser.set(p.user_id, (postsByUser.get(p.user_id) ?? 0) + 1)
  }

  const users: AdminUserRow[] = rawUsers.map((u) => {
    const sub = subsMap.get(u.id)
    const plan = (sub?.plan ?? 'free') as 'free' | 'pro' | 'team'
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
      // Real: from most recent session, fallback to user updatedAt
      lastActiveAt: sessionsByUser.get(u.id) ?? u.updatedAt ?? null,
    }
  })

  // ── workflow rows ──
  const rawWorkflows = recentWorkflowsRes.data ?? []
  const workflowUserIds = [...new Set(rawWorkflows.map((w) => w.user_id).filter(Boolean))]
  const workflowUsersRes = workflowUserIds.length
    ? await supabase.from('user' as never).select('id, email').in('id' as never, workflowUserIds)
    : { data: [] }
  const workflowUserData = ((workflowUsersRes as unknown as { data: BaUserMin[] | null }).data ?? [])
  const workflowUserEmailMap = new Map(workflowUserData.map((u) => [u.id, u.email]))

  const workflows: AdminWorkflowRow[] = rawWorkflows.map((w) => ({
    id: w.id,
    userId: w.user_id,
    userEmail: workflowUserEmailMap.get(w.user_id) ?? '',
    name: w.name ?? 'Unnamed workflow',
    triggerType: w.trigger_type ?? 'manual',
    lastRunAt: w.last_run_at ?? null,
    lastRunStatus: (w.last_run_status as AdminWorkflowRow['lastRunStatus']) ?? null,
    totalRuns: w.total_runs ?? 0,
    failureCount: w.failure_count ?? 0,
    isActive: w.is_active ?? false,
  }))

  // ── real audit events: credit transactions + signups ──
  type CreditTx = { id: string; user_id: string; stage: string; credits_spent: number; created_at: string }
  const creditTxData = ((recentCreditTxRes as unknown as { data: CreditTx[] | null }).data ?? [])

  // Email lookup for credit tx users
  const creditUserIds = [...new Set(creditTxData.map((t) => t.user_id))]
  const creditUsersRes = creditUserIds.length
    ? await supabase.from('user' as never).select('id, email').in('id' as never, creditUserIds)
    : { data: [] }
  const creditUserEmailMap = new Map(
    ((creditUsersRes as unknown as { data: BaUserMin[] | null }).data ?? []).map((u) => [u.id, u.email])
  )

  const CREDIT_STAGE_LABELS: Record<string, string> = {
    marketing_strategy_generation: 'Strategy generation',
    content_schedule_generation: 'Schedule generation',
    post_generation: 'Post generation',
    creative_brief_generation: 'Creative brief',
    image_generation: 'Image generation',
    publishing: 'Publishing',
  }

  const creditEvents: AdminAuditEvent[] = creditTxData.map((tx) => ({
    id: `credit-${tx.id}`,
    type: 'workflow_run' as const,
    description: `${CREDIT_STAGE_LABELS[tx.stage] ?? tx.stage.replaceAll('_', ' ')} — ${tx.credits_spent} credit${tx.credits_spent !== 1 ? 's' : ''} spent`,
    userId: tx.user_id,
    userEmail: creditUserEmailMap.get(tx.user_id) ?? null,
    metadata: { stage: tx.stage, credits_spent: tx.credits_spent },
    createdAt: tx.created_at,
  }))

  // Signup events from real user list (most recently joined first)
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

  // Merge all events and sort by most recent
  const recentAuditEvents = [...creditEvents, ...signupEvents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 40)

  const systemServices: SystemService[] = [
    dbPing,
    resendService,
    stripeService,
    triggerService,
    { name: 'Better Auth', status: 'operational', latencyMs: null },
    { name: 'Pexels API', status: process.env.PEXELS_API_KEY ? 'operational' : 'unknown', latencyMs: null },
  ]

  return {
    totalUsers: ((totalUsersRes as unknown as { count: number | null }).count) ?? 0,
    activeUsers,
    newUsersThisMonth: ((newUsersRes as unknown as { count: number | null }).count) ?? 0,
    totalBusinesses: totalBusinessesRes.count ?? 0,
    planBreakdown,
    creditStats: { totalAllocated, totalUsed, totalRemaining },
    workflowStats: {
      totalWorkflows: workflowsRes.count ?? 0,
      activeWorkflows: rawWorkflows.filter((w) => w.is_active).length,
      runsToday: workflowRunsTodayRes.count ?? 0,
      failuresToday: workflowFailuresTodayRes.count ?? 0,
    },
    contentStats: {
      totalPosts: totalPostsRes.count ?? 0,
      postsThisMonth: postsMonthRes.count ?? 0,
      totalPlans: totalPlansRes.count ?? 0,
    },
    systemServices,
    recentAuditEvents,
    users,
    workflows,
  }
}

// ─── mutations ───────────────────────────────────────────────────────────────

export async function grantAdminCredits(
  userId: string,
  amount: number
): Promise<{ error: string | null }> {
  const supabase = getSupabaseAdmin()
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('credits_balance')
    .eq('user_id', userId)
    .maybeSingle()

  if (!sub) return { error: 'Subscription not found' }

  const { error } = await supabase
    .from('user_subscriptions')
    .update({ credits_balance: (sub.credits_balance ?? 0) + amount })
    .eq('user_id', userId)

  return { error: error?.message ?? null }
}

export async function updateUserPlan(
  userId: string,
  plan: 'free' | 'pro' | 'team'
): Promise<{ error: string | null }> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      plan,
      credits_balance: PLAN_CREDIT_ALLOWANCES[plan],
    })
    .eq('user_id', userId)

  return { error: error?.message ?? null }
}
