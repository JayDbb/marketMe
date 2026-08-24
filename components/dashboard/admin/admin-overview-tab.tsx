'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Clock,
  Filter,
  Gauge,
  Minus,
  TrendingUp,
} from 'lucide-react'
import type {
  AdminAuditEvent,
  AdminAuditEventType,
  AdminDashboardStats,
  SystemService,
} from '@/types/admin'
import { useAdminUrlState } from './use-admin-url-state'
import { cn } from '@/lib/utils'

const AUDIT_TYPE_CONFIG: Record<
  AdminAuditEventType,
  { label: string; color: string }
> = {
  user_signup: {
    label: 'Signup',
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  plan_change: { label: 'Plan', color: 'text-sky-600 dark:text-sky-400' },
  credit_top_up: { label: 'Credit grant', color: 'text-sky-600 dark:text-sky-400' },
  credit_spend: {
    label: 'Credit spend',
    color: 'text-amber-600 dark:text-amber-400',
  },
  workflow_run: {
    label: 'Workflow',
    color: 'text-muted-foreground',
  },
  system_error: {
    label: 'Error',
    color: 'text-red-600 dark:text-red-400',
  },
  admin_action: {
    label: 'Admin',
    color: 'text-foreground',
  },
}

function ServiceRow({ service }: { service: SystemService }) {
  const map = {
    operational: {
      cls: 'text-emerald-600 dark:text-emerald-400',
      dot: 'bg-emerald-500',
      label: 'Operational',
    },
    configured: {
      cls: 'text-sky-600 dark:text-sky-400',
      dot: 'bg-sky-500',
      label: 'Configured',
    },
    degraded: {
      cls: 'text-amber-600 dark:text-amber-400',
      dot: 'bg-amber-500',
      label: 'Degraded',
    },
    down: {
      cls: 'text-red-600 dark:text-red-400',
      dot: 'bg-red-500',
      label: 'Down',
    },
    unknown: {
      cls: 'text-muted-foreground',
      dot: 'bg-muted-foreground',
      label: 'Unknown',
    },
  } as const
  const cfg = map[service.status]
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-2">
      <span className={cn('size-2 shrink-0 rounded-full', cfg.dot)} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-foreground">{service.name}</p>
        {service.detail ? (
          <p className="truncate text-[10px] text-muted-foreground">{service.detail}</p>
        ) : null}
      </div>
      <span className={cn('text-[11px] font-semibold', cfg.cls)}>{cfg.label}</span>
      {service.latencyMs != null ? (
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {service.latencyMs}ms
        </span>
      ) : null}
    </div>
  )
}

function AuditEventRow({ event }: { event: AdminAuditEvent }) {
  const cfg = AUDIT_TYPE_CONFIG[event.type]
  return (
    <div className="flex items-start gap-3 border-b border-border px-1 py-3 last:border-0">
      <CircleDot className={cn('mt-0.5 size-3.5 shrink-0', cfg.color)} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium text-foreground">
          {event.description}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className={cn('text-[11px] font-semibold', cfg.color)}>
            {cfg.label}
          </span>
          {event.userEmail ? (
            <span className="truncate text-[11px] text-muted-foreground">
              {event.userEmail}
            </span>
          ) : null}
        </div>
      </div>
      <time
        className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground"
        dateTime={event.createdAt}
      >
        {new Date(event.createdAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })}
      </time>
    </div>
  )
}

function FunnelStep({
  label,
  value,
  total,
}: {
  label: string
  value: number
  total: number
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums text-foreground">
          {value.toLocaleString()} · {pct}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-sky-500"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  )
}

function formatMs(value: number | null): string {
  if (value == null) return '—'
  if (value >= 1000) return `${(value / 1000).toFixed(2)}s`
  return `${Math.round(value)}ms`
}

const FILTER_OPTIONS: Array<{
  value: AdminAuditEventType | 'all'
  label: string
}> = [
  { value: 'all', label: 'All' },
  { value: 'user_signup', label: 'Signups' },
  { value: 'plan_change', label: 'Plans' },
  { value: 'credit_top_up', label: 'Grants' },
  { value: 'credit_spend', label: 'Spend' },
  { value: 'admin_action', label: 'Admin' },
  { value: 'system_error', label: 'Errors' },
]

export function AdminOverviewTab({ stats }: { stats: AdminDashboardStats }) {
  const { setParams } = useAdminUrlState()
  const [filter, setFilter] = useState<AdminAuditEventType | 'all'>('all')

  const filteredEvents = useMemo(
    () =>
      filter === 'all'
        ? stats.recentAuditEvents
        : stats.recentAuditEvents.filter((e) => e.type === filter),
    [filter, stats.recentAuditEvents]
  )

  const liveIssues = stats.systemServices.filter(
    (s) => s.status === 'degraded' || s.status === 'down'
  ).length

  const funnelBase = Math.max(stats.funnel.signedUp, 1)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="overflow-hidden rounded-2xl border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              <TrendingUp className="size-3.5" aria-hidden />
              Activation funnel
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Live counts from users, profiles, Instagram connections, and published posts.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <FunnelStep label="Signed up" value={stats.funnel.signedUp} total={funnelBase} />
            <FunnelStep label="Onboarded" value={stats.funnel.onboarded} total={funnelBase} />
            <FunnelStep
              label="Instagram connected"
              value={stats.funnel.instagramConnected}
              total={funnelBase}
            />
            <FunnelStep
              label="Published at least once"
              value={stats.funnel.published}
              total={funnelBase}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Publishing · 7 days
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-background/50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Success rate
              </p>
              <p className="font-mono text-xl font-semibold tabular-nums text-foreground">
                {stats.contentStats.publishSuccessRate7d == null
                  ? '—'
                  : `${stats.contentStats.publishSuccessRate7d}%`}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background/50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Published
              </p>
              <p className="font-mono text-xl font-semibold tabular-nums text-foreground">
                {stats.contentStats.publishedLast7Days}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background/50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Failed
              </p>
              <p
                className={cn(
                  'font-mono text-xl font-semibold tabular-nums',
                  stats.contentStats.failedLast7Days > 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-foreground'
                )}
              >
                {stats.contentStats.failedLast7Days}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background/50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Still queued
              </p>
              <p className="font-mono text-xl font-semibold tabular-nums text-foreground">
                {stats.contentStats.scheduledOpen}
              </p>
            </div>
            <div className="col-span-2 text-[11px] text-muted-foreground">
              Credits spent (7d):{' '}
              <span className="font-mono tabular-nums text-foreground">
                {stats.creditStats.spentLast7Days.toLocaleString()}
              </span>
              {' · '}
              All-time published:{' '}
              <span className="font-mono tabular-nums text-foreground">
                {stats.contentStats.publishedTotal.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              <Gauge className="size-3.5" aria-hidden />
              Performance · 7 days
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">
              First-party Web Vitals (consent-gated). p75 across samples.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-border px-2 py-2 text-center">
                <p className="text-[10px] text-muted-foreground">LCP</p>
                <p className="font-mono text-sm font-semibold tabular-nums">
                  {formatMs(stats.webVitals.lcpP75)}
                </p>
              </div>
              <div className="rounded-xl border border-border px-2 py-2 text-center">
                <p className="text-[10px] text-muted-foreground">INP</p>
                <p className="font-mono text-sm font-semibold tabular-nums">
                  {formatMs(stats.webVitals.inpP75)}
                </p>
              </div>
              <div className="rounded-xl border border-border px-2 py-2 text-center">
                <p className="text-[10px] text-muted-foreground">CLS</p>
                <p className="font-mono text-sm font-semibold tabular-nums">
                  {stats.webVitals.clsP75 == null
                    ? '—'
                    : stats.webVitals.clsP75.toFixed(3)}
                </p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {stats.webVitals.sampleCount} samples ·{' '}
              {stats.pageStats.viewsLast7Days.toLocaleString()} pageviews
            </p>
            {stats.webVitals.slowPaths.length > 0 ? (
              <ul className="space-y-1.5">
                {stats.webVitals.slowPaths.map((row) => (
                  <li
                    key={`${row.path}-${row.metric}`}
                    className="flex items-center justify-between gap-2 text-[11px]"
                  >
                    <span className="truncate text-muted-foreground">
                      {row.metric} · {row.path}
                    </span>
                    <span className="shrink-0 font-mono tabular-nums text-amber-700 dark:text-amber-300">
                      {row.metric === 'CLS' ? row.p75.toFixed(3) : formatMs(row.p75)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                No slow paths flagged yet. Accept analytics cookies on the live site to collect
                samples.
              </p>
            )}
            {stats.pageStats.topPaths.length > 0 ? (
              <div className="border-t border-border pt-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Top paths
                </p>
                <ul className="space-y-1">
                  {stats.pageStats.topPaths.slice(0, 5).map((row) => (
                    <li
                      key={row.path}
                      className="flex items-center justify-between gap-2 text-[11px]"
                    >
                      <span className="truncate text-muted-foreground">{row.path}</span>
                      <span className="font-mono tabular-nums text-foreground">
                        {row.views}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card className="overflow-hidden rounded-2xl border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  System services
                </CardTitle>
                {liveIssues > 0 ? (
                  <Badge variant="destructive" className="h-5 text-[10px]">
                    {liveIssues} live
                  </Badge>
                ) : (
                  <Badge className="h-5 border-0 bg-emerald-500/15 text-[10px] text-emerald-700 dark:text-emerald-400">
                    Live checks OK
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Database, MarketMe AI, and Instagram publish rate are live-probed. Others show key
                presence.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {stats.systemServices.map((svc) => (
                <ServiceRow key={svc.name} service={svc} />
              ))}
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-2xl border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Today
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setParams({ tab: 'workflows' })}
                className="flex items-center justify-between rounded-lg px-1 py-1 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
              >
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="size-4" aria-hidden />
                  Workflow runs
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                  {stats.workflowStats.runsToday}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setParams({ tab: 'workflows', wf: 'failed' })}
                className="flex items-center justify-between rounded-lg px-1 py-1 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
              >
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="size-4 text-amber-500" aria-hidden />
                  Failures
                </span>
                <span
                  className={cn(
                    'font-mono text-sm font-semibold tabular-nums',
                    stats.workflowStats.failuresToday > 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-foreground'
                  )}
                >
                  {stats.workflowStats.failuresToday}
                </span>
              </button>
              <div className="flex items-center justify-between px-1">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4" aria-hidden />
                  New users (month)
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                  {stats.newUsersThisMonth}
                </span>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4" aria-hidden />
                  Posts this month
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                  {stats.contentStats.postsThisMonth}
                </span>
              </div>
              <div className="flex items-center gap-2 px-1 pt-1 text-[11px] text-muted-foreground">
                <Minus className="size-3" aria-hidden />
                Env-only services stay labeled Configured until they gain a live probe.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="h-full overflow-hidden rounded-2xl border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Recent activity
                </CardTitle>
                <div className="flex flex-wrap items-center gap-1">
                  <Filter className="size-3 text-muted-foreground" aria-hidden />
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFilter(opt.value)}
                      className={cn(
                        'rounded-lg px-2 py-1 text-[10px] font-medium transition-colors',
                        filter === opt.value
                          ? 'bg-sky-500 text-white'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="custom-scrollbar max-h-[520px] overflow-y-auto">
              {filteredEvents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    No events match the selected filter.
                  </p>
                </div>
              ) : (
                filteredEvents.map((evt) => (
                  <AuditEventRow key={evt.id} event={evt} />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
