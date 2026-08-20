'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Clock,
  Filter,
  Minus,
} from 'lucide-react'
import type { AdminDashboardStats, AdminAuditEvent, SystemService } from '@/types/admin'
import { cn } from '@/lib/utils'

const AUDIT_TYPE_CONFIG: Record<
  AdminAuditEvent['type'],
  { label: string; color: string }
> = {
  user_signup: { label: 'User Signup', color: 'text-emerald-600 dark:text-emerald-400' },
  plan_change: { label: 'Plan Change', color: 'text-blue-600 dark:text-blue-400' },
  credit_top_up: { label: 'Credit Grant', color: 'text-violet-600 dark:text-violet-400' },
  workflow_run: { label: 'Workflow Run', color: 'text-amber-600 dark:text-amber-400' },
  system_error: { label: 'System Error', color: 'text-red-600 dark:text-red-400' },
  admin_action: { label: 'Admin Action', color: 'text-foreground' },
}

function ServiceStatusBadge({ service }: { service: SystemService }) {
  const map = {
    operational: {
      icon: CheckCircle2,
      cls: 'text-emerald-600 dark:text-emerald-400',
      dot: 'bg-emerald-500',
    },
    degraded: {
      icon: AlertTriangle,
      cls: 'text-amber-600 dark:text-amber-400',
      dot: 'bg-amber-500',
    },
    down: {
      icon: AlertTriangle,
      cls: 'text-red-600 dark:text-red-400',
      dot: 'bg-red-500',
    },
    unknown: {
      icon: Minus,
      cls: 'text-muted-foreground',
      dot: 'bg-muted-foreground',
    },
  }
  const cfg = map[service.status]
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
      <span className={cn('size-2 rounded-full shrink-0', cfg.dot)} />
      <span className="text-xs font-medium text-foreground">{service.name}</span>
      <span className={cn('ml-auto text-[11px] font-semibold capitalize', cfg.cls)}>
        {service.status}
      </span>
      {service.latencyMs != null && (
        <span className="text-[10px] text-muted-foreground">{service.latencyMs}ms</span>
      )}
    </div>
  )
}

function AuditEventRow({ event }: { event: AdminAuditEvent }) {
  const cfg = AUDIT_TYPE_CONFIG[event.type]
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background/50 px-4 py-3">
      <CircleDot className={cn('mt-0.5 size-3.5 shrink-0', cfg.color)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground line-clamp-1">{event.description}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className={cn('text-[11px] font-semibold', cfg.color)}>{cfg.label}</span>
          {event.userEmail && (
            <span className="text-[11px] text-muted-foreground truncate">{event.userEmail}</span>
          )}
        </div>
      </div>
      <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
        {new Date(event.createdAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })}
      </span>
    </div>
  )
}

const FILTER_OPTIONS: Array<{ value: AdminAuditEvent['type'] | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'user_signup', label: 'Signups' },
  { value: 'plan_change', label: 'Plans' },
  { value: 'credit_top_up', label: 'Credits' },
  { value: 'workflow_run', label: 'Workflows' },
  { value: 'system_error', label: 'Errors' },
]

export function AdminOverviewTab({ stats }: { stats: AdminDashboardStats }) {
  const [filter, setFilter] = useState<AdminAuditEvent['type'] | 'all'>('all')

  const filteredEvents =
    filter === 'all'
      ? stats.recentAuditEvents
      : stats.recentAuditEvents.filter((e) => e.type === filter)

  const operationalCount = stats.systemServices.filter((s) => s.status === 'operational').length
  const issueCount = stats.systemServices.filter(
    (s) => s.status === 'degraded' || s.status === 'down'
  ).length

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
      {/* System Services Panel */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <Card className="overflow-hidden rounded-2xl border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                System Services
              </CardTitle>
              <div className="flex items-center gap-1.5">
                {issueCount > 0 ? (
                  <Badge variant="destructive" className="h-5 text-[10px]">
                    {issueCount} issue{issueCount > 1 ? 's' : ''}
                  </Badge>
                ) : (
                  <Badge className="h-5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0 text-[10px]">
                    {operationalCount}/{stats.systemServices.length} operational
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {stats.systemServices.map((svc) => (
              <ServiceStatusBadge key={svc.name} service={svc} />
            ))}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="overflow-hidden rounded-2xl border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Today
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="size-4" />
                Workflow runs
              </div>
              <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                {stats.workflowStats.runsToday}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="size-4 text-amber-500" />
                Failures today
              </div>
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
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" />
                New users (month)
              </div>
              <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                {stats.newUsersThisMonth}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log */}
      <div className="lg:col-span-3">
        <Card className="overflow-hidden rounded-2xl border-border bg-card h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Recent Activity
              </CardTitle>
              <div className="flex items-center gap-1">
                <Filter className="size-3 text-muted-foreground" />
                <div className="flex gap-1">
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFilter(opt.value as AdminAuditEvent['type'] | 'all')}
                      className={cn(
                        'rounded-lg px-2 py-1 text-[10px] font-medium transition-colors',
                        filter === opt.value
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 max-h-[520px] overflow-y-auto custom-scrollbar">
            {filteredEvents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-10 text-center">
                <p className="text-sm text-muted-foreground">No events match the selected filter.</p>
              </div>
            ) : (
              filteredEvents.map((evt) => <AuditEventRow key={evt.id} event={evt} />)
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
