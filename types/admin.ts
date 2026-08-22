export type AdminPlanId = 'free' | 'pro' | 'team'

/** Reserved for future suspend/ban controls — not yet mutable in UI. */
export type AdminUserStatus = 'active' | 'suspended' | 'banned'

/** `configured` = env present but not live-probed; `operational` = real check passed. */
export type SystemServiceStatus =
  | 'operational'
  | 'degraded'
  | 'down'
  | 'configured'
  | 'unknown'

export interface SystemService {
  name: string
  status: SystemServiceStatus
  latencyMs?: number | null
  detail?: string | null
}

export interface AdminUserRow {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
  plan: AdminPlanId
  subscriptionStatus: string
  creditsRemaining: number
  creditsTotal: number
  postsCount: number
  status: AdminUserStatus
  joinedAt: string
  lastActiveAt: string | null
}

export interface AdminWorkflowRow {
  id: string
  userId: string
  userEmail: string
  name: string
  triggerType: string
  lastRunAt: string | null
  lastRunStatus: 'success' | 'failed' | 'pending' | 'running' | null
  totalRuns: number
  failureCount: number
  isActive: boolean
}

export type AdminAuditEventType =
  | 'user_signup'
  | 'plan_change'
  | 'credit_top_up'
  | 'credit_spend'
  | 'workflow_run'
  | 'system_error'
  | 'admin_action'

export interface AdminAuditEvent {
  id: string
  type: AdminAuditEventType
  description: string
  userId: string | null
  userEmail: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface AdminUserSearchResult {
  users: AdminUserRow[]
  total: number
  page: number
  pageSize: number
}

export interface AdminDashboardStats {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  totalBusinesses: number
  planBreakdown: {
    free: number
    pro: number
    team: number
  }
  creditStats: {
    totalAllocated: number
    totalUsed: number
    totalRemaining: number
  }
  workflowStats: {
    totalWorkflows: number
    activeWorkflows: number
    runsToday: number
    failuresToday: number
  }
  contentStats: {
    totalPosts: number
    postsThisMonth: number
    totalPlans: number
  }
  systemServices: SystemService[]
  recentAuditEvents: AdminAuditEvent[]
  users: AdminUserRow[]
  workflows: AdminWorkflowRow[]
}
