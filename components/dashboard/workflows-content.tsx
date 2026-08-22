'use client'

<<<<<<< HEAD
import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
=======
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bot,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Play,
  Plus,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Trash2,
} from 'lucide-react'
>>>>>>> origin/development
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { InlineNotice } from '@/components/ui/inline-notice'
import { CreateWorkflowModal } from './create-workflow-modal'
import {
  getWorkflowTemplateDefinition,
  WORKFLOW_WEEKDAY_LABELS,
  WORKFLOW_TEMPLATES,
  workflowTimeLabel,
} from '@/lib/workflow-definitions'
import {
  deleteWorkflowAction,
  runWorkflowNowAction,
  toggleWorkflowAction,
} from '@/app/dashboard/workflows/actions'
import type {
  AutoQueueApprovedPostsConfig,
  PublishGuardrailConfig,
  StaleDraftReviewConfig,
  WeeklyContentBatchConfig,
  WorkflowDashboardData,
  WorkflowSummary,
} from '@/types/workflow'

const TEMPLATE_ICONS = {
  weekly_content_batch: Sparkles,
  auto_queue_approved_posts: CalendarClock,
  stale_draft_review: TimerReset,
  publish_guardrail: ShieldCheck,
} as const

const STATUS_TONE = {
  enabled: 'default',
  disabled: 'outline',
  success: 'default',
  warning: 'secondary',
  failed: 'destructive',
  running: 'secondary',
} as const

function formatWorkflowSchedule(workflow: WorkflowSummary) {
  switch (workflow.template_key) {
    case 'weekly_content_batch': {
      const config = workflow.config as WeeklyContentBatchConfig
      return `${WORKFLOW_WEEKDAY_LABELS[config.weekday]} at ${workflowTimeLabel(config.hour, config.minute)}`
    }
    case 'auto_queue_approved_posts': {
      const config = workflow.config as AutoQueueApprovedPostsConfig
      return `Approvals at ${workflowTimeLabel(config.hour, config.minute)} with ${config.spacingHours}h spacing`
    }
    case 'stale_draft_review': {
      const config = workflow.config as StaleDraftReviewConfig
      return `Daily at ${workflowTimeLabel(config.hour, config.minute)} for drafts older than ${config.staleDays} days`
    }
    case 'publish_guardrail': {
      const config = workflow.config as PublishGuardrailConfig
      return `Daily at ${workflowTimeLabel(config.hour, config.minute)} checking ${config.lookAheadHours}h ahead`
    }
  }
}

<<<<<<< HEAD
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
=======
function formatRunTime(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
>>>>>>> origin/development
}

export function WorkflowsContent({ data }: { data: WorkflowDashboardData }) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowSummary | null>(null)
  const [notice, setNotice] = useState<{
    tone: 'success' | 'warning' | 'error'
    title: string
    description: string
  } | null>(null)
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const templates = useMemo(() => WORKFLOW_TEMPLATES, [])

  const openCreate = () => {
    setEditingWorkflow(null)
    setIsModalOpen(true)
  }

  const openEdit = (workflow: WorkflowSummary) => {
    setEditingWorkflow(workflow)
    setIsModalOpen(true)
  }

  const runAction = (key: string, action: () => Promise<{ success: boolean; error?: string; summary?: string; status?: string }>) => {
    setNotice(null)
    setPendingKey(key)
    startTransition(async () => {
      const result = await action()
      setPendingKey(null)

      if (!result.success) {
        setNotice({
          tone: 'error',
          title: 'Workflow action failed',
          description: result.error ?? 'Try again in a moment.',
        })
        return
      }

      setNotice({
        tone: result.status === 'warning' ? 'warning' : 'success',
        title: 'Workflow updated',
        description: result.summary ?? 'The workflow action completed successfully.',
      })
      router.refresh()
    })
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Workflows
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
            Build repeatable content automations around generation, approvals, scheduling, and publish safety. This version is intentionally opinionated so workflows stay clear and supportable.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="rounded-xl" onClick={() => router.refresh()}>
            Refresh
          </Button>
          <Button className="rounded-xl" onClick={openCreate}>
            <Plus className="size-4" />
            Create workflow
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardDescription>Total workflows</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{data.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardDescription>Enabled now</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{data.enabled}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardDescription>Need attention</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{data.issues}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardDescription>Live templates</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{templates.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {notice ? (
        <InlineNotice tone={notice.tone} title={notice.title} description={notice.description} />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
        <div className="space-y-4">
          {data.workflows.length === 0 ? (
            <Card className="rounded-3xl border-dashed">
              <CardContent className="flex min-h-80 flex-col items-center justify-center gap-5 py-14 text-center">
                <div className="flex size-16 items-center justify-center rounded-3xl border border-border bg-muted/40">
                  <Bot className="size-7 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    Create your first workflow
                  </h2>
                  <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground">
                    Start with a template for weekly draft generation, approval queueing, stale draft review, or publish checks. Each run is logged so the workflow is easy to trust and debug.
                  </p>
                </div>
                <Button onClick={openCreate} className="rounded-xl">
                  <Plus className="size-4" />
                  Create workflow
                </Button>
              </CardContent>
            </Card>
          ) : (
            data.workflows.map((workflow) => {
              const TemplateIcon = TEMPLATE_ICONS[workflow.template_key] ?? Bot
              const template = getWorkflowTemplateDefinition(workflow.template_key)
              const toggleKey = `toggle-${workflow.id}`
              const runKey = `run-${workflow.id}`
              const deleteKey = `delete-${workflow.id}`

              return (
                <Card key={workflow.id} className="rounded-3xl">
                  <CardHeader className="gap-3">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex size-11 items-center justify-center rounded-2xl border border-border bg-muted/30">
                          <TemplateIcon className="size-5 text-foreground" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-xl tracking-tight">{workflow.name}</CardTitle>
                            <Badge variant={STATUS_TONE[workflow.status]}>
                              {workflow.status === 'enabled' ? 'Enabled' : 'Paused'}
                            </Badge>
                            {workflow.last_run_status ? (
                              <Badge variant={STATUS_TONE[workflow.last_run_status]}>
                                {workflow.last_run_status}
                              </Badge>
                            ) : null}
                          </div>
                          <CardDescription>{workflow.description || template.summary}</CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => openEdit(workflow)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          disabled={pending && pendingKey === toggleKey}
                          onClick={() =>
                            runAction(toggleKey, () =>
                              toggleWorkflowAction(workflow.id, workflow.status !== 'enabled')
                            )
                          }
                        >
                          {workflow.status === 'enabled' ? 'Pause' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border border-border bg-muted/20 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Template
                        </p>
                        <p className="mt-2 text-sm font-medium text-foreground">{workflow.templateLabel}</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {workflow.templateSummary}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border bg-muted/20 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Trigger
                        </p>
                        <p className="mt-2 text-sm font-medium text-foreground">
                          {formatWorkflowSchedule(workflow)}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {workflow.supportsAutomation ? 'Runs from automation or event hooks.' : 'Manual run only.'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border bg-muted/20 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Last activity
                        </p>
                        <p className="mt-2 text-sm font-medium text-foreground">
                          {workflow.last_run_at ? formatRunTime(workflow.last_run_at) : 'Not run yet'}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {workflow.last_run_status
                            ? `Latest result: ${workflow.last_run_status}.`
                            : 'Use Run now to verify this workflow against live data.'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Clock3 className="size-4 text-muted-foreground" />
                        Recent runs
                      </div>
                      {workflow.recentRuns.length > 0 ? (
                        <div className="grid gap-3">
                          {workflow.recentRuns.map((run) => (
                            <div
                              key={run.id}
                              className="flex flex-col gap-2 rounded-2xl border border-border bg-background px-4 py-3 sm:flex-row sm:items-start sm:justify-between"
                            >
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant={STATUS_TONE[run.status]}>{run.status}</Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {run.trigger_source} • {formatRunTime(run.started_at)}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-foreground">
                                  {run.summary}
                                </p>
                              </div>
                              {run.details && Object.keys(run.details).length > 0 ? (
                                <div className="text-xs text-muted-foreground sm:text-right">
                                  {run.details.jobId ? `Job ${String(run.details.jobId)}` : null}
                                  {run.details.queued
                                    ? `${run.details.jobId ? ' • ' : ''}${String(run.details.queued)} queued`
                                    : null}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                          No runs yet. Save the workflow, then use Run now to verify the setup against live workspace data.
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="size-4" />
                      Built for Instagram-first content operations.
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        disabled={pending && pendingKey === deleteKey}
                        onClick={() =>
                          runAction(deleteKey, () => deleteWorkflowAction(workflow.id))
                        }
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-xl"
                        disabled={pending && pendingKey === runKey}
                        onClick={() =>
                          runAction(runKey, () => runWorkflowNowAction(workflow.id))
                        }
                      >
                        <Play className="size-4" />
                        Run now
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )
            })
          )}
        </div>

        <div className="space-y-4">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Template library</CardTitle>
              <CardDescription>
                Start with narrow, product-shaped automations instead of a generic node editor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map((template) => {
                const Icon = TEMPLATE_ICONS[template.key]
                return (
                  <button
                    key={template.key}
                    type="button"
                    onClick={openCreate}
                    className="flex w-full items-start gap-3 rounded-2xl border border-border bg-muted/20 p-3 text-left transition-colors hover:border-foreground/15 hover:bg-muted/40"
                  >
                    <div className="flex size-10 items-center justify-center rounded-2xl border border-border bg-background">
                      <Icon className="size-4 text-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{template.label}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {template.summary}
                      </p>
                    </div>
                  </button>
                )
              })}
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>How this version works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>Scheduled templates are picked up by an automation sweep every 15 minutes.</p>
              <p>Approved-post queueing also hooks into the live approval flow, so new approvals can be auto-scheduled without leaving Planner or Posts.</p>
              <p>Every run is recorded with a status and summary so support and debugging stay visible inside the product.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateWorkflowModal
        key={`${editingWorkflow?.id ?? 'create'}-${isModalOpen ? 'open' : 'closed'}`}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        workflow={editingWorkflow}
      />
    </div>
  )
}
