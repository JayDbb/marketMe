'use client'

import { useEffect, useMemo, useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import type { AdminDashboardStats, AdminWorkflowRow } from '@/types/admin'
import { useAdminUrlState } from './use-admin-url-state'
import { cn } from '@/lib/utils'

const RUN_STATUS_CONFIG: Record<
  NonNullable<AdminWorkflowRow['lastRunStatus']>,
  { icon: typeof CheckCircle2; cls: string; label: string }
> = {
  success: {
    icon: CheckCircle2,
    cls: 'text-emerald-600 dark:text-emerald-400',
    label: 'Success',
  },
  failed: {
    icon: XCircle,
    cls: 'text-red-600 dark:text-red-400',
    label: 'Failed',
  },
  pending: {
    icon: Clock,
    cls: 'text-amber-600 dark:text-amber-400',
    label: 'Pending',
  },
  running: {
    icon: Activity,
    cls: 'text-sky-600 dark:text-sky-400',
    label: 'Running',
  },
}

export function AdminWorkflowsTab({ stats }: { stats: AdminDashboardStats }) {
  const { q, wf, setParams } = useAdminUrlState()

  // Safely derive props to state without triggering setState inside useEffect
  const [prevQ, setPrevQ] = useState(q)
  const [localQuery, setLocalQuery] = useState(q)

  if (q !== prevQ) {
    setPrevQ(q)
    setLocalQuery(q)
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (localQuery !== q) setParams({ q: localQuery })
    }, 300)
    return () => window.clearTimeout(handle)
  }, [localQuery, q, setParams])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return stats.workflows
      .filter((w) => {
        const matchesQuery =
          !query ||
          w.name.toLowerCase().includes(query) ||
          w.userEmail.toLowerCase().includes(query)
        const matchesStatus =
          wf === 'all' ||
          (wf === 'active' && w.isActive) ||
          (wf === 'failed' && w.lastRunStatus === 'failed')
        return matchesQuery && matchesStatus
      })
      .sort((a, b) => {
        if (wf === 'all') {
          const af = a.lastRunStatus === 'failed' ? 0 : 1
          const bf = b.lastRunStatus === 'failed' ? 0 : 1
          if (af !== bf) return af - bf
        }
        const at = a.lastRunAt ? new Date(a.lastRunAt).getTime() : 0
        const bt = b.lastRunAt ? new Date(b.lastRunAt).getTime() : 0
        return bt - at
      })
  }, [q, stats.workflows, wf])

  const failedCount = stats.workflows.filter(
    (w) => w.lastRunStatus === 'failed'
  ).length

  return (
    <div className="flex flex-col gap-4">
      {failedCount > 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3">
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              {failedCount} workflow{failedCount > 1 ? 's' : ''} failed recently
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Review failed rows below and check Trigger.dev for error traces.
            </p>
          </div>
          {wf !== 'failed' ? (
            <button
              type="button"
              onClick={() => setParams({ wf: 'failed' })}
              className="shrink-0 text-xs font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400"
            >
              Show failed
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="size-4 text-muted-foreground" aria-hidden />
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Automations — {filtered.length} of {stats.workflows.length}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1" role="group" aria-label="Filter workflows">
              {(['all', 'active', 'failed'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setParams({ wf: s })}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-colors',
                    wf === s
                      ? 'bg-sky-500 text-white'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <label htmlFor="admin-workflow-search" className="sr-only">
                Search workflows
              </label>
              <input
                id="admin-workflow-search"
                type="search"
                name="admin-workflow-search"
                autoComplete="off"
                spellCheck={false}
                placeholder="Search workflows…"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="h-8 w-[180px] rounded-xl border border-border bg-background py-1 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
              />
            </div>
          </div>
        </div>

        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b border-border text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2.5 font-semibold">Workflow</th>
                <th className="px-3 py-2.5 font-semibold">Trigger</th>
                <th className="px-3 py-2.5 font-semibold">Last run</th>
                <th className="px-3 py-2.5 text-right font-semibold">Runs</th>
                <th className="px-3 py-2.5 text-right font-semibold">Failures</th>
                <th className="px-3 py-2.5 text-right font-semibold">When</th>
                <th className="px-4 py-2.5 text-right font-semibold">State</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Activity
                      className="mx-auto mb-3 size-8 text-muted-foreground"
                      aria-hidden
                    />
                    <p className="text-sm text-muted-foreground">
                      {stats.workflows.length === 0
                        ? 'No workflows have been created yet.'
                        : 'No workflows match your filters.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((w) => {
                  const statusCfg = w.lastRunStatus
                    ? RUN_STATUS_CONFIG[w.lastRunStatus]
                    : null
                  const StatusIcon = statusCfg?.icon ?? CircleDot
                  return (
                    <tr
                      key={w.id}
                      className={cn(
                        'border-b border-border/70 transition-colors hover:bg-sky-500/[0.03]',
                        w.lastRunStatus === 'failed' && 'bg-red-500/[0.03]'
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className={cn(
                              'size-2 shrink-0 rounded-full',
                              w.isActive ? 'bg-emerald-500' : 'bg-muted-foreground'
                            )}
                            title={w.isActive ? 'Active' : 'Inactive'}
                          />
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-foreground">
                              {w.name}
                            </span>
                            <span className="block truncate text-[11px] text-muted-foreground">
                              {w.userEmail || w.userId}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {w.triggerType}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {statusCfg ? (
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 text-[11px] font-medium',
                              statusCfg.cls
                            )}
                          >
                            <StatusIcon className="size-3.5" aria-hidden />
                            {statusCfg.label}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-foreground">
                        {w.totalRuns}
                      </td>
                      <td
                        className={cn(
                          'px-3 py-3 text-right font-mono tabular-nums',
                          w.failureCount > 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-muted-foreground'
                        )}
                      >
                        {w.failureCount}
                      </td>
                      <td className="px-3 py-3 text-right text-[11px] text-muted-foreground">
                        {w.lastRunAt
                          ? new Date(w.lastRunAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                          : 'Never'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge
                          variant={w.isActive ? 'default' : 'outline'}
                          className={cn(
                            'h-5 text-[10px]',
                            w.isActive
                              ? 'border-emerald-500/20 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                              : 'text-muted-foreground'
                          )}
                        >
                          {w.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}