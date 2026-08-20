'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Coins,
  FileText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Workflow,
} from 'lucide-react'
import type { AdminDashboardStats } from '@/types/admin'
import { AdminOverviewTab } from './admin-overview-tab'
import { AdminUsersTab } from './admin-users-tab'
import { AdminWorkflowsTab } from './admin-workflows-tab'
import { cn } from '@/lib/utils'

// ─── metric card ─────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  accent,
  wide,
}: {
  label: string
  value: string | number
  sub?: string
  icon: typeof Activity
  trend?: { label: string; positive: boolean }
  accent?: boolean
  wide?: boolean
}) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden rounded-2xl border-border bg-card text-card-foreground',
        wide && 'sm:col-span-2',
        accent && 'border-primary/20 bg-primary/5'
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </CardTitle>
        <Icon
          className={cn(
            'size-4',
            accent ? 'text-primary' : 'text-accent-foreground'
          )}
          aria-hidden
        />
      </CardHeader>
      <CardContent className="mt-1">
        <div
          className={cn(
            'font-mono font-bold tracking-tight text-foreground tabular-nums',
            wide ? 'text-3xl md:text-4xl' : 'text-2xl'
          )}
        >
          {value}
        </div>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            <TrendingUp
              className={cn(
                'size-3',
                trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              )}
            />
            <span
              className={cn(
                'text-[11px] font-medium',
                trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              )}
            >
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── credit gauge ─────────────────────────────────────────────────────────────

function CreditGauge({ stats }: { stats: AdminDashboardStats }) {
  const pct =
    stats.creditStats.totalAllocated > 0
      ? Math.round((stats.creditStats.totalUsed / stats.creditStats.totalAllocated) * 100)
      : 0

  return (
    <Card className="overflow-hidden rounded-2xl border-border bg-card sm:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          AI Credit Usage — System Wide
        </CardTitle>
        <Coins className="size-4 text-accent-foreground" />
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="font-mono text-3xl font-bold tabular-nums text-foreground">
              {stats.creditStats.totalUsed.toLocaleString()}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">credits consumed</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-lg font-semibold tabular-nums text-foreground">
              {stats.creditStats.totalRemaining.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">remaining</p>
          </div>
        </div>
        <Progress value={pct} className="h-2.5" />
        <div className="mt-2 flex justify-between text-[11px] tabular-nums text-muted-foreground">
          <span>{pct}% used</span>
          <span>{stats.creditStats.totalAllocated.toLocaleString()} allocated</span>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── plan distribution ────────────────────────────────────────────────────────

function PlanDistribution({ stats }: { stats: AdminDashboardStats }) {
  const total =
    (stats.planBreakdown.free ?? 0) +
    (stats.planBreakdown.pro ?? 0) +
    (stats.planBreakdown.team ?? 0) || 1

  const plans: { label: string; count: number; color: string }[] = [
    { label: 'Free', count: stats.planBreakdown.free, color: 'bg-muted-foreground' },
    { label: 'Pro', count: stats.planBreakdown.pro, color: 'bg-blue-500' },
    { label: 'Team', count: stats.planBreakdown.team, color: 'bg-violet-500' },
  ]

  return (
    <Card className="overflow-hidden rounded-2xl border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Plan Distribution
        </CardTitle>
        <BarChart3 className="size-4 text-accent-foreground" />
      </CardHeader>
      <CardContent>
        {/* stacked bar */}
        <div className="flex h-2.5 overflow-hidden rounded-full">
          {plans.map((p) => (
            <div
              key={p.label}
              className={cn('h-full transition-all', p.color)}
              style={{ width: `${(p.count / total) * 100}%` }}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          {plans.map((p) => (
            <div key={p.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn('size-2 rounded-full', p.color)} />
                <span className="text-xs text-muted-foreground">{p.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
                  {p.count}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  ({Math.round((p.count / total) * 100)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'workflows', label: 'Workflows', icon: Workflow },
] as const

type TabId = (typeof TABS)[number]['id']

// ─── main component ───────────────────────────────────────────────────────────

export function AdminContent({ stats }: { stats: AdminDashboardStats }) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const operationalCount = stats.systemServices.filter((s) => s.status === 'operational').length
  const totalServices = stats.systemServices.length
  const allGood = operationalCount === totalServices

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-widest text-accent-foreground">
            Administration
          </p>
          <div
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
              allGood
                ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300'
            )}
          >
            <span
              className={cn(
                'size-1.5 rounded-full',
                allGood ? 'bg-emerald-500' : 'bg-amber-500'
              )}
            />
            {allGood ? 'All Systems Operational' : `${operationalCount}/${totalServices} Operational`}
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-pretty font-sans text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Admin Console
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              System-wide metrics, user management, and operational controls.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              {stats.totalUsers.toLocaleString()} total users
            </span>
          </div>
        </div>
      </div>

      {/* Core Metrics Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
        <MetricCard
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          sub={`${stats.activeUsers} active accounts`}
          icon={Users}
          trend={{ label: `+${stats.newUsersThisMonth} this month`, positive: true }}
          wide
        />
        <MetricCard
          label="Total Businesses"
          value={stats.totalBusinesses.toLocaleString()}
          icon={Activity}
        />
        <MetricCard
          label="Active Workflows"
          value={stats.workflowStats.activeWorkflows}
          sub={`${stats.workflowStats.totalWorkflows} total`}
          icon={Workflow}
        />
        <CreditGauge stats={stats} />
        <PlanDistribution stats={stats} />
        <MetricCard
          label="Posts Published"
          value={stats.contentStats.totalPosts.toLocaleString()}
          sub={`${stats.contentStats.postsThisMonth} this month`}
          icon={FileText}
        />
        <MetricCard
          label="Content Plans"
          value={stats.contentStats.totalPlans.toLocaleString()}
          icon={Sparkles}
        />
        <MetricCard
          label="Workflow Runs Today"
          value={stats.workflowStats.runsToday}
          sub={
            stats.workflowStats.failuresToday > 0
              ? `${stats.workflowStats.failuresToday} failures`
              : 'No failures'
          }
          icon={CheckCircle2}
          accent={stats.workflowStats.failuresToday === 0}
        />
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex items-center gap-1 border-b border-border">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors -mb-px',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="size-4" />
              {tab.label}
              {tab.id === 'users' && (
                <Badge variant="outline" className="h-4 px-1 text-[10px] tabular-nums">
                  {stats.users.length}
                </Badge>
              )}
              {tab.id === 'workflows' && (
                <Badge variant="outline" className="h-4 px-1 text-[10px] tabular-nums">
                  {stats.workflows.length}
                </Badge>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <AdminOverviewTab stats={stats} />}
      {activeTab === 'users' && <AdminUsersTab stats={stats} />}
      {activeTab === 'workflows' && <AdminWorkflowsTab stats={stats} />}
    </div>
  )
}
