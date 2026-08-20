export type AdminPlanId = 'free' | 'pro' | 'team'

export type AdminUserStatus = 'active' | 'suspended' | 'banned'

export type SystemServiceStatus = 'operational' | 'degraded' | 'down' | 'unknown'

export interface SystemService {
  name: string
  status: SystemServiceStatus
  latencyMs?: number | null
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

export interface AdminAuditEvent {
  id: string
  type: 'user_signup' | 'plan_change' | 'credit_top_up' | 'workflow_run' | 'system_error' | 'admin_action'
  description: string
  userId: string | null
  userEmail: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
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
