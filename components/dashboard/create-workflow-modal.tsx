'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bot,
  CalendarClock,
  Clock3,
  Loader2,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
<<<<<<< HEAD
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GitPullRequest } from "lucide-react"
=======
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AppSelect } from '@/components/ui/app-select'
import { InlineNotice } from '@/components/ui/inline-notice'
import {
  getWorkflowTemplateDefinition,
  WORKFLOW_TEMPLATES,
  WORKFLOW_WEEKDAYS,
  WORKFLOW_WEEKDAY_LABELS,
  workflowTimeLabel,
} from '@/lib/workflow-definitions'
import { createWorkflowAction, updateWorkflowAction } from '@/app/dashboard/workflows/actions'
import type {
  AutoQueueApprovedPostsConfig,
  PublishGuardrailConfig,
  StaleDraftReviewConfig,
  WeeklyContentBatchConfig,
  WorkflowSummary,
  WorkflowTemplateKey,
} from '@/types/workflow'
>>>>>>> origin/development

type CreateWorkflowModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  workflow?: WorkflowSummary | null
}

type WorkflowFormState = {
  templateKey: WorkflowTemplateKey
  name: string
  description: string
  weekday: string
  hour: string
  minute: string
  spacingHours: string
  maxPostsPerRun: string
  staleDays: string
  lookAheadHours: string
}

const TEMPLATE_ICONS = {
  weekly_content_batch: Sparkles,
  auto_queue_approved_posts: CalendarClock,
  stale_draft_review: TimerReset,
  publish_guardrail: ShieldCheck,
} as const

function workflowToFormState(workflow?: WorkflowSummary | null): WorkflowFormState {
  const templateKey = workflow?.template_key ?? 'weekly_content_batch'
  const template = getWorkflowTemplateDefinition(templateKey)
  const config = workflow?.config ?? template.config

  return {
    templateKey,
    name: workflow?.name ?? template.defaultName,
    description: workflow?.description ?? template.defaultDescription,
    weekday:
      'weekday' in config && typeof config.weekday === 'string'
        ? config.weekday
        : 'monday',
    hour: String('hour' in config ? config.hour : 9),
    minute: String('minute' in config ? config.minute : 0),
    spacingHours: String('spacingHours' in config ? config.spacingHours : 24),
    maxPostsPerRun: String('maxPostsPerRun' in config ? config.maxPostsPerRun : 5),
    staleDays: String('staleDays' in config ? config.staleDays : 7),
    lookAheadHours: String('lookAheadHours' in config ? config.lookAheadHours : 48),
  }
}

function templateToFormState(templateKey: WorkflowTemplateKey): WorkflowFormState {
  const template = getWorkflowTemplateDefinition(templateKey)
  return workflowToFormState({
    id: '',
    user_id: '',
    name: template.defaultName,
    description: template.defaultDescription,
    template_key: templateKey,
    trigger_kind: template.triggerKind,
    action_kind: template.actionKind,
    config: template.config,
    status: 'enabled',
    last_run_at: null,
    last_run_status: null,
    created_at: '',
    updated_at: '',
    templateLabel: template.label,
    templateSummary: template.summary,
    supportsAutomation: template.supportsAutomation,
    recentRuns: [],
  })
}

function buildConfig(state: WorkflowFormState) {
  switch (state.templateKey) {
    case 'weekly_content_batch':
      return {
        weekday: state.weekday as WeeklyContentBatchConfig['weekday'],
        hour: Number(state.hour),
        minute: Number(state.minute),
      } satisfies WeeklyContentBatchConfig
    case 'auto_queue_approved_posts':
      return {
        hour: Number(state.hour),
        minute: Number(state.minute),
        spacingHours: Number(state.spacingHours),
        maxPostsPerRun: Number(state.maxPostsPerRun),
      } satisfies AutoQueueApprovedPostsConfig
    case 'stale_draft_review':
      return {
        hour: Number(state.hour),
        minute: Number(state.minute),
        staleDays: Number(state.staleDays),
      } satisfies StaleDraftReviewConfig
    case 'publish_guardrail':
      return {
        hour: Number(state.hour),
        minute: Number(state.minute),
        lookAheadHours: Number(state.lookAheadHours),
      } satisfies PublishGuardrailConfig
  }
}

function templateFields(state: WorkflowFormState) {
  switch (state.templateKey) {
    case 'weekly_content_batch':
      return 'Choose the weekday and time when new weekly drafts should be generated.'
    case 'auto_queue_approved_posts':
      return 'Choose the default publish time and spacing for newly approved posts.'
    case 'stale_draft_review':
      return 'Choose when to scan drafts and how old a draft must be before it needs review.'
    case 'publish_guardrail':
      return 'Choose when to inspect upcoming scheduled posts and how far ahead to check.'
  }
}

export function CreateWorkflowModal({
  open,
  onOpenChange,
  workflow,
}: CreateWorkflowModalProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [notice, setNotice] = useState<string | null>(null)
  const [form, setForm] = useState<WorkflowFormState>(() => workflowToFormState(workflow))

  const template = useMemo(() => getWorkflowTemplateDefinition(form.templateKey), [form.templateKey])
  const TemplateIcon = TEMPLATE_ICONS[form.templateKey] ?? Bot
  const isEditing = Boolean(workflow)
  const timePreview = workflowTimeLabel(Number(form.hour), Number(form.minute))

  const submit = () => {
    setNotice(null)

    if (!form.name.trim()) {
      setNotice('Give the workflow a name so it is easy to find later.')
      return
    }

    startTransition(async () => {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        config: buildConfig(form),
      }

      const result = isEditing
        ? await updateWorkflowAction({
            workflowId: workflow!.id,
            ...payload,
            status: workflow!.status,
          })
        : await createWorkflowAction({
            ...payload,
            templateKey: form.templateKey,
            status: 'enabled',
          })

      if (!result.success) {
        setNotice(result.error ?? 'Workflow could not be saved.')
        return
      }

      onOpenChange(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
<<<<<<< HEAD
      <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6">
        <DialogHeader className="flex flex-col items-start mb-6 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-2">
            <GitPullRequest className="w-5 h-5 text-blue-400" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">Create Workflow</DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-white/50 text-sm">
            Set up a new automated workflow for your content pipeline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-zinc-500 dark:text-white/50 font-medium text-xs">Workflow Name</Label>
            <Input
              placeholder="e.g., Weekly Twitter Thread"
              className="h-11 bg-white dark:bg-white/5 border-transparent dark:border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/50 text-zinc-900 dark:text-white rounded-xl shadow-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-500 dark:text-white/50 font-medium text-xs">Trigger</Label>
            <div className="h-11 bg-white dark:bg-white/5 border-transparent border dark:border-white/10 rounded-xl flex items-center px-4 cursor-not-allowed opacity-50">
              <span className="text-sm text-zinc-500 dark:text-white/50">Select trigger event...</span>
=======
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] max-w-2xl flex-col overflow-hidden rounded-3xl p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b bg-muted/40 px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-border bg-background text-foreground">
              <TemplateIcon className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl tracking-tight">
                {isEditing ? 'Edit workflow' : 'Create workflow'}
              </DialogTitle>
              <DialogDescription className="max-w-xl">
                {template.description}
              </DialogDescription>
>>>>>>> origin/development
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            {!isEditing ? (
              <div className="space-y-3">
                <Label>Template</Label>
                <div className="grid gap-2">
                  {WORKFLOW_TEMPLATES.map((item) => {
                    const Icon = TEMPLATE_ICONS[item.key]
                    const active = item.key === form.templateKey
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setForm(templateToFormState(item.key))}
                        className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition-colors ${
                          active
                            ? 'border-foreground/20 bg-foreground/3'
                            : 'border-border hover:border-foreground/15 hover:bg-muted/40'
                        }`}
                      >
                        <div className="mt-0.5 flex size-9 items-center justify-center rounded-xl border border-border bg-background">
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {item.summary}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="workflow-name">Workflow name</Label>
                <Input
                  id="workflow-name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder={template.defaultName}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="workflow-description">Description</Label>
                <Textarea
                  id="workflow-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder={template.defaultDescription}
                  className="min-h-24 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-border bg-muted/30 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Automation rules</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {templateFields(form)}
                </p>
              </div>

              {form.templateKey === 'weekly_content_batch' ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <Label>Weekday</Label>
                    <AppSelect
                      value={
                        WORKFLOW_WEEKDAY_LABELS[
                          form.weekday as keyof typeof WORKFLOW_WEEKDAY_LABELS
                        ] ?? WORKFLOW_WEEKDAY_LABELS.monday
                      }
                      options={WORKFLOW_WEEKDAYS.map((day) => WORKFLOW_WEEKDAY_LABELS[day])}
                      onChange={(value) => {
                        const weekday =
                          WORKFLOW_WEEKDAYS.find((day) => WORKFLOW_WEEKDAY_LABELS[day] === value) ??
                          'monday'
                        setForm((current) => ({ ...current, weekday }))
                      }}
                      aria-label="Workflow weekday"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="workflow-hour">Hour</Label>
                    <Input
                      id="workflow-hour"
                      type="number"
                      min={0}
                      max={23}
                      value={form.hour}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, hour: event.target.value }))
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="workflow-minute">Minute</Label>
                    <Input
                      id="workflow-minute"
                      type="number"
                      min={0}
                      max={59}
                      value={form.minute}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, minute: event.target.value }))
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              ) : null}

              {form.templateKey === 'auto_queue_approved_posts' ? (
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="grid gap-2">
                    <Label htmlFor="queue-hour">Hour</Label>
                    <Input
                      id="queue-hour"
                      type="number"
                      min={0}
                      max={23}
                      value={form.hour}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, hour: event.target.value }))
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="queue-minute">Minute</Label>
                    <Input
                      id="queue-minute"
                      type="number"
                      min={0}
                      max={59}
                      value={form.minute}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, minute: event.target.value }))
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="queue-spacing">Spacing hours</Label>
                    <Input
                      id="queue-spacing"
                      type="number"
                      min={1}
                      max={72}
                      value={form.spacingHours}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, spacingHours: event.target.value }))
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="queue-limit">Max posts</Label>
                    <Input
                      id="queue-limit"
                      type="number"
                      min={1}
                      max={20}
                      value={form.maxPostsPerRun}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, maxPostsPerRun: event.target.value }))
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              ) : null}

              {form.templateKey === 'stale_draft_review' ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="stale-hour">Hour</Label>
                    <Input
                      id="stale-hour"
                      type="number"
                      min={0}
                      max={23}
                      value={form.hour}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, hour: event.target.value }))
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stale-minute">Minute</Label>
                    <Input
                      id="stale-minute"
                      type="number"
                      min={0}
                      max={59}
                      value={form.minute}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, minute: event.target.value }))
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stale-days">Stale after days</Label>
                    <Input
                      id="stale-days"
                      type="number"
                      min={1}
                      max={90}
                      value={form.staleDays}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, staleDays: event.target.value }))
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              ) : null}

              {form.templateKey === 'publish_guardrail' ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="guardrail-hour">Hour</Label>
                    <Input
                      id="guardrail-hour"
                      type="number"
                      min={0}
                      max={23}
                      value={form.hour}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, hour: event.target.value }))
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="guardrail-minute">Minute</Label>
                    <Input
                      id="guardrail-minute"
                      type="number"
                      min={0}
                      max={59}
                      value={form.minute}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, minute: event.target.value }))
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="guardrail-lookahead">Look-ahead hours</Label>
                    <Input
                      id="guardrail-lookahead"
                      type="number"
                      min={1}
                      max={168}
                      value={form.lookAheadHours}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, lookAheadHours: event.target.value }))
                      }
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {notice ? (
              <InlineNotice
                tone="error"
                title="Workflow could not be saved"
                description={notice}
              />
            ) : null}
          </div>

          <div className="space-y-4 rounded-3xl border border-border bg-muted/20 p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">What this workflow does</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{template.summary}</p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Clock3 className="size-4 text-muted-foreground" />
                Trigger preview
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {form.templateKey === 'weekly_content_batch'
                  ? `Runs every ${WORKFLOW_WEEKDAY_LABELS[form.weekday as keyof typeof WORKFLOW_WEEKDAY_LABELS]} at ${timePreview}.`
                  : form.templateKey === 'auto_queue_approved_posts'
                    ? `Runs when a post is approved and places it at ${timePreview}, spacing posts ${form.spacingHours} hour(s) apart.`
                    : form.templateKey === 'stale_draft_review'
                      ? `Runs every day at ${timePreview} and flags drafts older than ${form.staleDays} day(s).`
                      : `Runs every day at ${timePreview} and checks posts scheduled in the next ${form.lookAheadHours} hour(s).`}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Bot className="size-4 text-muted-foreground" />
                Execution notes
              </div>
              <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
                <li>Runs are logged so failures stay visible on the Workflows page.</li>
                <li>Use &quot;Run now&quot; after saving to verify the workflow against live workspace data.</li>
                <li>The workflow starts enabled, but you can pause it anytime from the list view.</li>
              </ul>
            </div>
          </div>
        </div>
        </div>

        <DialogFooter className="shrink-0 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
<<<<<<< HEAD
            className="h-11 bg-transparent border-border text-foreground hover:bg-muted font-medium rounded-xl"
=======
            disabled={pending}
            className="rounded-xl"
>>>>>>> origin/development
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending} className="rounded-xl">
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {isEditing ? 'Save workflow' : 'Create workflow'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
