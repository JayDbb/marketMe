'use client'

import { Suspense } from 'react'
import {
  Activity,
  AlertTriangle,
  Coins,
  ShieldCheck,
  Users,
  Workflow,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { AdminDashboardStats } from '@/types/admin'
import { AdminOverviewTab } from './admin-overview-tab'
import { AdminUsersTab } from './admin-users-tab'
import { AdminWorkflowsTab } from './admin-workflows-tab'
import { useAdminUrlState, type AdminTabId } from './use-admin-url-state'
import { cn } from '@/lib/utils'

const TABS: { id: AdminTabId; label: string; icon: typeof Activity }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'workflows', label: 'Workflows', icon: Workflow },
]

function KpiCell({
  label,
  value,
  sub,
  onClick,
  alert,
}: {
  label: string
  value: string | number
  sub?: string
  onClick?: () => void
  alert?: boolean
}) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex min-w-0 flex-col gap-1 px-4 py-3 text-left transition-colors duration-150',
        onClick &&
          'hover:bg-sky-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-inset active:scale-[0.99]'
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          'font-mono text-2xl font-semibold tabular-nums tracking-tight',
          alert ? 'text-red-600 dark:text-red-400' : 'text-foreground'
        )}
      >
        {value}
      </span>
      {sub ? (
        <span
          className={cn(
            'text-[11px]',
            alert ? 'text-red-600/80 dark:text-red-400/80' : 'text-muted-foreground'
          )}
        >
          {sub}
        </span>
      ) : null}
    </Comp>
  )
}

function AdminContentInner({ stats }: { stats: AdminDashboardStats }) {
  const { tab, setParams } = useAdminUrlState()

  const liveIssues = stats.systemServices.filter(
    (s) => s.status === 'degraded' || s.status === 'down'
  ).length
  const creditPct =
    stats.creditStats.totalAllocated > 0
      ? Math.round(
          (stats.creditStats.totalUsed / stats.creditStats.totalAllocated) * 100
        )
      : 0

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400/80">
            Administration
          </p>
          <div
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
              liveIssues === 0
                ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300'
            )}
          >
            <span
              className={cn(
                'size-1.5 rounded-full',
                liveIssues === 0 ? 'bg-emerald-500' : 'bg-amber-500'
              )}
            />
            {liveIssues === 0
              ? 'No live incidents'
              : `${liveIssues} live issue${liveIssues > 1 ? 's' : ''}`}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-sans text-2xl font-medium tracking-tight text-foreground md:text-3xl">
              Admin Console
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Users, credits, activation funnel, publish health, and first-party performance — all
              from MarketMe data.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-sky-500" aria-hidden />
            <span className="font-mono tabular-nums">
              {stats.totalUsers.toLocaleString()} users
            </span>
          </div>
        </div>
      </div>

      {/* 4 action-linked KPIs in one surface */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-2 divide-border lg:grid-cols-4 lg:divide-x">
          <KpiCell
            label="Active users"
            value={stats.activeUsers.toLocaleString()}
            sub={`${stats.newUsersThisMonth} new this month`}
            onClick={() => setParams({ tab: 'users' })}
          />
          <KpiCell
            label="Credit burn"
            value={`${creditPct}%`}
            sub={`${stats.creditStats.totalUsed.toLocaleString()} / ${stats.creditStats.totalAllocated.toLocaleString()}`}
            onClick={() => setParams({ tab: 'users', plan: 'pro' })}
          />
          <KpiCell
            label="Publish 7d"
            value={
              stats.contentStats.publishSuccessRate7d == null
                ? '—'
                : `${stats.contentStats.publishSuccessRate7d}%`
            }
            sub={`${stats.contentStats.publishedLast7Days} ok · ${stats.contentStats.failedLast7Days} failed`}
            alert={(stats.contentStats.failedLast7Days ?? 0) > 0}
            onClick={() => setParams({ tab: 'overview' })}
          />
          <KpiCell
            label="Failures today"
            value={stats.workflowStats.failuresToday}
            sub={
              stats.workflowStats.failuresToday > 0
                ? 'Open failed workflows'
                : `${stats.funnel.instagramConnected} IG connected`
            }
            alert={stats.workflowStats.failuresToday > 0}
            onClick={() => setParams({ tab: 'workflows', wf: 'failed' })}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Coins className="size-3 text-sky-500" aria-hidden />
            {stats.creditStats.totalRemaining.toLocaleString()} credits remaining
            {stats.creditStats.spentLast7Days > 0
              ? ` · ${stats.creditStats.spentLast7Days.toLocaleString()} spent (7d)`
              : ''}
          </span>
          <span>
            Plans · Free {stats.planBreakdown.free} · Pro {stats.planBreakdown.pro} ·
            Team {stats.planBreakdown.team}
          </span>
          <span>
            Content · {stats.contentStats.totalPosts.toLocaleString()} posts ·{' '}
            {stats.contentStats.totalPlans.toLocaleString()} plans
          </span>
          {stats.workflowStats.failuresToday > 0 ? (
            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="size-3" aria-hidden />
              Ops attention needed
            </span>
          ) : null}
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Admin sections"
        className="mb-5 flex items-center gap-1 border-b border-border"
      >
        {TABS.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setParams({ tab: t.id })}
              className={cn(
                '-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors duration-150',
                active
                  ? 'border-sky-500 text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="size-4" aria-hidden />
              {t.label}
              {t.id === 'users' ? (
                <Badge variant="outline" className="h-4 px-1 text-[10px] tabular-nums">
                  {stats.users.length}
                </Badge>
              ) : null}
              {t.id === 'workflows' ? (
                <Badge variant="outline" className="h-4 px-1 text-[10px] tabular-nums">
                  {stats.workflows.length}
                </Badge>
              ) : null}
            </button>
          )
        })}
      </div>

      <div role="tabpanel">
        {tab === 'overview' ? <AdminOverviewTab stats={stats} /> : null}
        {tab === 'users' ? <AdminUsersTab stats={stats} /> : null}
        {tab === 'workflows' ? <AdminWorkflowsTab stats={stats} /> : null}
      </div>
    </div>
  )
}

export function AdminContent({ stats }: { stats: AdminDashboardStats }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-muted-foreground">
          Loading admin console…
        </div>
      }
    >
      <AdminContentInner stats={stats} />
    </Suspense>
  )
}
