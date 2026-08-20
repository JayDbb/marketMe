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
  Search,
  Workflow,
  XCircle,
} from 'lucide-react'
import type { AdminDashboardStats, AdminWorkflowRow } from '@/types/admin'
import { cn } from '@/lib/utils'

const RUN_STATUS_CONFIG: Record<
  NonNullable<AdminWorkflowRow['lastRunStatus']>,
  { icon: typeof CheckCircle2; cls: string; label: string }
> = {
  success: { icon: CheckCircle2, cls: 'text-emerald-600 dark:text-emerald-400', label: 'Success' },
  failed: { icon: XCircle, cls: 'text-red-600 dark:text-red-400', label: 'Failed' },
  pending: { icon: Clock, cls: 'text-amber-600 dark:text-amber-400', label: 'Pending' },
  running: { icon: Activity, cls: 'text-blue-600 dark:text-blue-400', label: 'Running' },
}

function WorkflowRow({ workflow }: { workflow: AdminWorkflowRow }) {
  const statusCfg = workflow.lastRunStatus ? RUN_STATUS_CONFIG[workflow.lastRunStatus] : null
  const StatusIcon = statusCfg?.icon ?? CircleDot

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/50 px-4 py-3 sm:flex-row sm:items-center">
      {/* Status dot + name */}
      <div className="flex items-center gap-3 min-w-0 sm:w-[260px] shrink-0">
        <div
          className={cn(
            'size-2 rounded-full shrink-0',
            workflow.isActive ? 'bg-emerald-500' : 'bg-muted-foreground'
          )}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{workflow.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">{workflow.userEmail}</p>
        </div>
      </div>

      {/* Trigger type */}
      <div className="sm:w-[100px] shrink-0">
        <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {workflow.triggerType}
        </span>
      </div>

      {/* Last run status */}
      <div className="flex items-center gap-1.5 sm:w-[100px] shrink-0">
        {statusCfg ? (
          <>
            <StatusIcon className={cn('size-3.5', statusCfg.cls)} />
            <span className={cn('text-[11px] font-medium', statusCfg.cls)}>{statusCfg.label}</span>
          </>
        ) : (
          <span className="text-[11px] text-muted-foreground">—</span>
        )}
      </div>

      {/* Run count */}
      <div className="flex-1 min-w-0 flex items-center gap-4">
        <div className="text-center">
          <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
            {workflow.totalRuns}
          </p>
          <p className="text-[10px] text-muted-foreground">runs</p>
        </div>
        {workflow.failureCount > 0 && (
          <div className="text-center">
            <p className="font-mono text-sm font-semibold tabular-nums text-red-600 dark:text-red-400">
              {workflow.failureCount}
            </p>
            <p className="text-[10px] text-muted-foreground">failures</p>
          </div>
        )}
      </div>

      {/* Last run time */}
      <div className="sm:w-[120px] shrink-0 text-right">
        {workflow.lastRunAt ? (
          <p className="text-[11px] text-muted-foreground">
            {new Date(workflow.lastRunAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground">Never run</p>
        )}
      </div>

      {/* Active badge */}
      <div className="shrink-0">
        <Badge
          variant={workflow.isActive ? 'default' : 'outline'}
          className={cn(
            'text-[10px] h-5',
            workflow.isActive
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
              : 'text-muted-foreground'
          )}
        >
          {workflow.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>
    </div>
  )
}

export function AdminWorkflowsTab({ stats }: { stats: AdminDashboardStats }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'failed'>('all')

  const filtered = stats.workflows.filter((w) => {
    const matchesQuery =
      !query ||
      w.name.toLowerCase().includes(query.toLowerCase()) ||
      w.userEmail.toLowerCase().includes(query.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && w.isActive) ||
      (statusFilter === 'failed' && w.lastRunStatus === 'failed')
    return matchesQuery && matchesStatus
  })

  const failedWorkflows = stats.workflows.filter((w) => w.lastRunStatus === 'failed')

  return (
    <div className="flex flex-col gap-4">
      {/* Alert banner if failures */}
      {failedWorkflows.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {failedWorkflows.length} workflow{failedWorkflows.length > 1 ? 's' : ''} failed recently
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Review the failed workflows below and check Trigger.dev for error traces.
            </p>
          </div>
        </div>
      )}

      <Card className="overflow-hidden rounded-2xl border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Workflow className="size-4 text-muted-foreground" />
              <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Automation Pipelines — {filtered.length} of {stats.workflows.length}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {(['all', 'active', 'failed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={cn(
                      'rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-colors',
                      statusFilter === s
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search workflows…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-8 rounded-xl border border-border bg-background pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-[180px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 max-h-[580px] overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-12 text-center">
              <Activity className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {stats.workflows.length === 0
                  ? 'No workflows have been created yet.'
                  : 'No workflows match your filters.'}
              </p>
            </div>
          ) : (
            filtered.map((w) => <WorkflowRow key={w.id} workflow={w} />)
          )}
        </CardContent>
      </Card>
    </div>
  )
}
