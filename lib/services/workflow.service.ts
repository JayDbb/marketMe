import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  DEFAULT_PREFERENCES,
  getZonedParts,
  isValidTimeZone,
  zonedLocalToUtc,
} from '@/lib/settings-utils'
import {
  getWorkflowTemplateDefinition,
  WORKFLOW_TEMPLATE_DEFINITIONS,
  WORKFLOW_WEEKDAYS,
  WORKFLOW_WEEKDAY_LABELS,
} from '@/lib/workflow-definitions'
import { getBusinessProfileId } from '@/lib/services/business.service'
import { listMirroredConnections } from '@/lib/services/social-connections.service'
import { getSocialConnections } from '@/lib/services/marketing-ai.service'
import { transitionPostStatus } from '@/lib/services/post-lifecycle.service'
import { triggerNotification, triggerWeeklyContent } from '@/lib/services/scheduler.service'
import type { Post } from '@/types/content-plan'
import type {
  AutoQueueApprovedPostsConfig,
  PublishGuardrailConfig,
  StaleDraftReviewConfig,
  WeeklyContentBatchConfig,
  WorkflowConfig,
  WorkflowDashboardData,
  WorkflowRow,
  WorkflowRunRow,
  WorkflowRunStatus,
  WorkflowStatus,
  WorkflowSummary,
  WorkflowTemplateKey,
  WorkflowTriggerKind,
  WorkflowWeekday,
} from '@/types/workflow'

type CreateWorkflowInput = {
  name: string
  description?: string | null
  templateKey: WorkflowTemplateKey
  config?: Partial<WorkflowConfig>
  status?: WorkflowStatus
}

type UpdateWorkflowInput = {
  name: string
  description?: string | null
  config?: Partial<WorkflowConfig>
  status?: WorkflowStatus
}

type WorkflowExecutionResult = {
  status: WorkflowRunStatus
  summary: string
  details?: Record<string, unknown>
}

const MAX_RECENT_RUNS = 6

function clampHour(value: unknown, fallback: number) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(23, Math.max(0, Math.trunc(n)))
}

function clampMinute(value: unknown, fallback: number) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(59, Math.max(0, Math.trunc(n)))
}

function clampPositiveInt(value: unknown, fallback: number, max: number) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(1, Math.trunc(n)))
}

function isWorkflowWeekday(value: unknown): value is WorkflowWeekday {
  return typeof value === 'string' && WORKFLOW_WEEKDAYS.includes(value as WorkflowWeekday)
}

function normalizeConfig(
  templateKey: WorkflowTemplateKey,
  input?: Partial<WorkflowConfig> | Record<string, unknown> | null
): WorkflowConfig {
  const source = input ?? {}

  switch (templateKey) {
    case 'weekly_content_batch': {
      const defaults = WORKFLOW_TEMPLATE_DEFINITIONS.weekly_content_batch
        .config as WeeklyContentBatchConfig
      return {
        weekday: isWorkflowWeekday((source as WeeklyContentBatchConfig).weekday)
          ? (source as WeeklyContentBatchConfig).weekday
          : defaults.weekday,
        hour: clampHour((source as WeeklyContentBatchConfig).hour, defaults.hour),
        minute: clampMinute((source as WeeklyContentBatchConfig).minute, defaults.minute),
      } satisfies WeeklyContentBatchConfig
    }
    case 'auto_queue_approved_posts': {
      const defaults = WORKFLOW_TEMPLATE_DEFINITIONS.auto_queue_approved_posts
        .config as AutoQueueApprovedPostsConfig
      return {
        hour: clampHour((source as AutoQueueApprovedPostsConfig).hour, defaults.hour),
        minute: clampMinute((source as AutoQueueApprovedPostsConfig).minute, defaults.minute),
        spacingHours: clampPositiveInt(
          (source as AutoQueueApprovedPostsConfig).spacingHours,
          defaults.spacingHours,
          72
        ),
        maxPostsPerRun: clampPositiveInt(
          (source as AutoQueueApprovedPostsConfig).maxPostsPerRun,
          defaults.maxPostsPerRun,
          20
        ),
      } satisfies AutoQueueApprovedPostsConfig
    }
    case 'stale_draft_review': {
      const defaults = WORKFLOW_TEMPLATE_DEFINITIONS.stale_draft_review
        .config as StaleDraftReviewConfig
      return {
        hour: clampHour((source as StaleDraftReviewConfig).hour, defaults.hour),
        minute: clampMinute((source as StaleDraftReviewConfig).minute, defaults.minute),
        staleDays: clampPositiveInt(
          (source as StaleDraftReviewConfig).staleDays,
          defaults.staleDays,
          90
        ),
      } satisfies StaleDraftReviewConfig
    }
    case 'publish_guardrail': {
      const defaults = WORKFLOW_TEMPLATE_DEFINITIONS.publish_guardrail
        .config as PublishGuardrailConfig
      return {
        hour: clampHour((source as PublishGuardrailConfig).hour, defaults.hour),
        minute: clampMinute((source as PublishGuardrailConfig).minute, defaults.minute),
        lookAheadHours: clampPositiveInt(
          (source as PublishGuardrailConfig).lookAheadHours,
          defaults.lookAheadHours,
          168
        ),
      } satisfies PublishGuardrailConfig
    }
  }
}

function rowToWorkflow(row: Record<string, unknown>): WorkflowRow {
  const templateKey = String(row.template_key) as WorkflowTemplateKey
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    name: String(row.name),
    description: typeof row.description === 'string' ? row.description : null,
    template_key: templateKey,
    trigger_kind: String(row.trigger_kind) as WorkflowTriggerKind,
    action_kind: String(row.action_kind) as WorkflowRow['action_kind'],
    config: normalizeConfig(
      templateKey,
      typeof row.config === 'object' && row.config ? (row.config as Record<string, unknown>) : {}
    ),
    status: String(row.status) === 'disabled' ? 'disabled' : 'enabled',
    last_run_at: typeof row.last_run_at === 'string' ? row.last_run_at : null,
    last_run_status:
      typeof row.last_run_status === 'string'
        ? (row.last_run_status as WorkflowRunStatus)
        : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

function rowToRun(row: Record<string, unknown>): WorkflowRunRow {
  return {
    id: String(row.id),
    workflow_id: String(row.workflow_id),
    user_id: String(row.user_id),
    trigger_source:
      String(row.trigger_source) === 'automation'
        ? 'automation'
        : String(row.trigger_source) === 'event'
          ? 'event'
          : 'manual',
    status: String(row.status) as WorkflowRunStatus,
    summary: String(row.summary ?? ''),
    details:
      row.details && typeof row.details === 'object'
        ? (row.details as Record<string, unknown>)
        : null,
    started_at: String(row.started_at),
    finished_at: typeof row.finished_at === 'string' ? row.finished_at : null,
    created_at: String(row.created_at),
  }
}

async function getUserTimeZone(userId: string) {
  const { data } = await supabaseAdmin
    .from('user_preferences')
    .select('timezone')
    .eq('user_id', userId)
    .maybeSingle()

  if (data?.timezone && isValidTimeZone(data.timezone)) {
    return data.timezone
  }

  return DEFAULT_PREFERENCES.timezone
}

function localDateString(parts: ReturnType<typeof getZonedParts>) {
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function nextTimeSlot(timeZone: string, hour: number, minute: number, after = new Date()) {
  let cursor = new Date(after)
  for (let i = 0; i < 14; i += 1) {
    const parts = getZonedParts(cursor, timeZone)
    const candidate = zonedLocalToUtc(parts.year, parts.month, parts.day, hour, minute, timeZone)
    if (candidate.getTime() > after.getTime()) {
      return candidate
    }
    cursor = addDays(cursor, 1)
  }
  return addDays(after, 1)
}

function nextWeeklySlot(
  timeZone: string,
  weekday: WorkflowWeekday,
  hour: number,
  minute: number,
  after = new Date()
) {
  const targetIndex = WORKFLOW_WEEKDAYS.indexOf(weekday)
  let cursor = new Date(after)
  for (let i = 0; i < 14; i += 1) {
    const parts = getZonedParts(cursor, timeZone)
    if (parts.weekday === targetIndex) {
      const candidate = zonedLocalToUtc(parts.year, parts.month, parts.day, hour, minute, timeZone)
      if (candidate.getTime() > after.getTime()) {
        return candidate
      }
    }
    cursor = addDays(cursor, 1)
  }
  return addDays(after, 7)
}

function isScheduledWorkflowDue(
  workflow: WorkflowRow,
  timeZone: string,
  now: Date
) {
  const lastRun = workflow.last_run_at ? new Date(workflow.last_run_at) : null

  switch (workflow.template_key) {
    case 'weekly_content_batch': {
      const config = workflow.config as WeeklyContentBatchConfig
      const slot = nextWeeklySlot(timeZone, config.weekday, config.hour, config.minute, addDays(now, -7))
      const slotParts = getZonedParts(slot, timeZone)
      const nowParts = getZonedParts(now, timeZone)
      const sameLocalDate = localDateString(slotParts) === localDateString(nowParts)
      const passedSlot = now.getTime() >= slot.getTime()
      const ranAfterSlot = lastRun ? lastRun.getTime() >= slot.getTime() : false
      return sameLocalDate && passedSlot && !ranAfterSlot
    }
    case 'stale_draft_review': {
      const config = workflow.config as StaleDraftReviewConfig
      const parts = getZonedParts(now, timeZone)
      const slot = zonedLocalToUtc(parts.year, parts.month, parts.day, config.hour, config.minute, timeZone)
      const ranAfterSlot = lastRun ? lastRun.getTime() >= slot.getTime() : false
      return now.getTime() >= slot.getTime() && !ranAfterSlot
    }
    case 'publish_guardrail': {
      const config = workflow.config as PublishGuardrailConfig
      const parts = getZonedParts(now, timeZone)
      const slot = zonedLocalToUtc(parts.year, parts.month, parts.day, config.hour, config.minute, timeZone)
      const ranAfterSlot = lastRun ? lastRun.getTime() >= slot.getTime() : false
      return now.getTime() >= slot.getTime() && !ranAfterSlot
    }
    default:
      return false
  }
}

async function createRunRecord(
  workflow: WorkflowRow,
  triggerSource: WorkflowRunRow['trigger_source']
) {
  const { data, error } = await supabaseAdmin
    .from('workflow_runs')
    .insert({
      workflow_id: workflow.id,
      user_id: workflow.user_id,
      trigger_source: triggerSource,
      status: 'running',
      summary: 'Workflow run started.',
    })
    .select('*')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create workflow run')
  }

  await supabaseAdmin
    .from('workflows')
    .update({
      last_run_at: new Date().toISOString(),
      last_run_status: 'running',
    })
    .eq('id', workflow.id)
    .eq('user_id', workflow.user_id)

  return rowToRun(data as Record<string, unknown>)
}

async function finalizeRunRecord(
  workflow: WorkflowRow,
  runId: string,
  result: WorkflowExecutionResult
) {
  const finishedAt = new Date().toISOString()
  await Promise.all([
    supabaseAdmin
      .from('workflow_runs')
      .update({
        status: result.status,
        summary: result.summary,
        details: result.details ?? null,
        finished_at: finishedAt,
      })
      .eq('id', runId)
      .eq('workflow_id', workflow.id),
    supabaseAdmin
      .from('workflows')
      .update({
        last_run_at: finishedAt,
        last_run_status: result.status,
      })
      .eq('id', workflow.id)
      .eq('user_id', workflow.user_id),
  ])
}

async function executeWeeklyContentWorkflow(
  workflow: WorkflowRow,
  timeZone: string
): Promise<WorkflowExecutionResult> {
  const profile = await getBusinessProfileId(workflow.user_id)
  if (!profile.data) {
    return {
      status: 'warning',
      summary: 'Skipped because no business profile is connected yet.',
      details: { reason: profile.error ?? 'missing_business_profile' },
    }
  }

  const nowParts = getZonedParts(new Date(), timeZone)
  const startDate = localDateString(nowParts)
  const job = await triggerWeeklyContent(workflow.user_id, profile.data, startDate)

  return {
    status: 'success',
    summary: `Queued the weekly content generator for ${WORKFLOW_WEEKDAY_LABELS[(workflow.config as WeeklyContentBatchConfig).weekday]}.`,
    details: {
      jobId: job.jobId,
      startDate,
      businessProfileId: profile.data,
    },
  }
}

async function executeAutoQueueApprovedPostsWorkflow(
  workflow: WorkflowRow,
  explicitPostId?: string
): Promise<WorkflowExecutionResult> {
  const config = workflow.config as AutoQueueApprovedPostsConfig
  const timeZone = await getUserTimeZone(workflow.user_id)
  let query = supabaseAdmin
    .from('posts')
    .select('id, scheduled_at, status, created_at')
    .eq('user_id', workflow.user_id)
    .eq('status', 'approved')
    .is('scheduled_at', null)
    .order('created_at', { ascending: true })

  if (explicitPostId) {
    query = query.eq('id', explicitPostId)
  } else {
    query = query.limit(config.maxPostsPerRun)
  }

  const { data, error } = await query
  if (error) {
    return {
      status: 'failed',
      summary: 'Unable to load approved posts for queueing.',
      details: { error: error.message },
    }
  }

  const posts = (data ?? []) as Pick<Post, 'id' | 'created_at' | 'scheduled_at' | 'status'>[]
  if (posts.length === 0) {
    return {
      status: 'warning',
      summary: 'No approved posts are waiting for a schedule slot.',
      details: { queued: 0 },
    }
  }

  let cursor = nextTimeSlot(timeZone, config.hour, config.minute)
  let queued = 0
  const scheduled: Array<{ postId: string; scheduledAt: string }> = []
  const failures: string[] = []

  for (const post of posts) {
    const scheduledAt = cursor.toISOString()
    const result = await transitionPostStatus(workflow.user_id, post.id, 'scheduled', { scheduledAt })
    if (result.error) {
      failures.push(`${post.id}: ${result.error}`)
      continue
    }
    queued += 1
    scheduled.push({ postId: post.id, scheduledAt })
    cursor = new Date(cursor.getTime() + config.spacingHours * 60 * 60 * 1000)
  }

  if (queued === 0) {
    return {
      status: 'failed',
      summary: 'Approved posts were found, but none could be scheduled.',
      details: { failures },
    }
  }

  return {
    status: failures.length > 0 ? 'warning' : 'success',
    summary:
      failures.length > 0
        ? `Queued ${queued} post${queued === 1 ? '' : 's'} and skipped ${failures.length}.`
        : `Queued ${queued} approved post${queued === 1 ? '' : 's'} into the Planner.`,
    details: {
      queued,
      scheduled,
      failures,
      timeZone,
    },
  }
}

async function executeStaleDraftReviewWorkflow(
  workflow: WorkflowRow
): Promise<WorkflowExecutionResult> {
  const config = workflow.config as StaleDraftReviewConfig
  const staleSince = new Date(Date.now() - config.staleDays * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('id, created_at')
    .eq('user_id', workflow.user_id)
    .eq('status', 'draft')
    .lt('created_at', staleSince)
    .order('created_at', { ascending: true })
    .limit(25)

  if (error) {
    return {
      status: 'failed',
      summary: 'Unable to inspect stale drafts.',
      details: { error: error.message },
    }
  }

  const staleDrafts = data ?? []
  if (staleDrafts.length === 0) {
    return {
      status: 'success',
      summary: `No drafts are older than ${config.staleDays} days.`,
      details: { staleCount: 0 },
    }
  }

  await triggerNotification(
    'Stale drafts need review',
    `${staleDrafts.length} draft posts have been waiting longer than ${config.staleDays} days.`
  )

  return {
    status: 'warning',
    summary: `${staleDrafts.length} stale draft${staleDrafts.length === 1 ? '' : 's'} need review.`,
    details: {
      staleCount: staleDrafts.length,
      stalePostIds: staleDrafts.map((post) => post.id),
    },
  }
}

async function executePublishGuardrailWorkflow(
  workflow: WorkflowRow
): Promise<WorkflowExecutionResult> {
  const profile = await getBusinessProfileId(workflow.user_id)
  if (!profile.data) {
    return {
      status: 'warning',
      summary: 'Skipped because no business profile is connected yet.',
      details: { reason: profile.error ?? 'missing_business_profile' },
    }
  }

  // Prefer live MarketMe AI connections (where Meta tokens live). Mirror is fallback only.
  let instagramConnected = false
  let connectionSource: 'marketme-ai' | 'mirror' | 'none' = 'none'
  try {
    const remote = await getSocialConnections(profile.data)
    instagramConnected = (Array.isArray(remote) ? remote : []).some(
      (connection) =>
        String(connection.platform ?? '').toLowerCase() === 'instagram' &&
        String(connection.connected_status ?? '').toLowerCase() !== 'disconnected'
    )
    if (instagramConnected) connectionSource = 'marketme-ai'
  } catch {
    // AI list failed — fall back to local mirror (UI only; publish may still fail).
  }

  if (!instagramConnected) {
    const mirrored = await listMirroredConnections(profile.data, workflow.user_id)
    instagramConnected = mirrored.some((connection) => connection.platform === 'instagram')
    if (instagramConnected) connectionSource = 'mirror'
  }

  const config = workflow.config as PublishGuardrailConfig
  const cutoff = new Date(Date.now() + config.lookAheadHours * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('id, scheduled_at, image_url, status')
    .eq('user_id', workflow.user_id)
    .eq('status', 'scheduled')
    .lte('scheduled_at', cutoff)

  if (error) {
    return {
      status: 'failed',
      summary: 'Unable to inspect upcoming scheduled posts.',
      details: { error: error.message },
    }
  }

  const upcoming = data ?? []
  const missingImages = upcoming.filter((post) => !post.image_url).map((post) => post.id)
  const issues = [
    !instagramConnected
      ? 'Instagram is not connected on the publish service.'
      : connectionSource === 'mirror'
        ? 'Instagram is only saved locally — reconnect so Meta tokens can be verified for publish.'
        : null,
    missingImages.length > 0
      ? `${missingImages.length} scheduled post${missingImages.length === 1 ? '' : 's'} are missing images.`
      : null,
  ].filter(Boolean) as string[]

  if (issues.length === 0) {
    return {
      status: 'success',
      summary: `Checked ${upcoming.length} upcoming scheduled post${upcoming.length === 1 ? '' : 's'} with no publish blockers.`,
      details: {
        checked: upcoming.length,
        instagramConnected,
        connectionSource,
      },
    }
  }

  return {
    status: 'warning',
    summary: issues.join(' '),
    details: {
      checked: upcoming.length,
      instagramConnected,
      connectionSource,
      missingImagePostIds: missingImages,
    },
  }
}

async function executeWorkflowRecord(
  workflow: WorkflowRow,
  triggerSource: WorkflowRunRow['trigger_source'],
  options?: { postId?: string }
) {
  const run = await createRunRecord(workflow, triggerSource)

  try {
    const timeZone = await getUserTimeZone(workflow.user_id)
    let result: WorkflowExecutionResult

    switch (workflow.template_key) {
      case 'weekly_content_batch':
        result = await executeWeeklyContentWorkflow(workflow, timeZone)
        break
      case 'auto_queue_approved_posts':
        result = await executeAutoQueueApprovedPostsWorkflow(workflow, options?.postId)
        break
      case 'stale_draft_review':
        result = await executeStaleDraftReviewWorkflow(workflow)
        break
      case 'publish_guardrail':
        result = await executePublishGuardrailWorkflow(workflow)
        break
      default:
        result = {
          status: 'failed',
          summary: 'Unknown workflow template.',
        }
    }

    await finalizeRunRecord(workflow, run.id, result)
    return result
  } catch (error) {
    const result: WorkflowExecutionResult = {
      status: 'failed',
      summary: error instanceof Error ? error.message : 'Workflow run failed.',
      details: error instanceof Error ? { error: error.message } : undefined,
    }
    await finalizeRunRecord(workflow, run.id, result)
    return result
  }
}

export async function listWorkflowsForUser(userId: string): Promise<WorkflowSummary[]> {
  const { data, error } = await supabaseAdmin
    .from('workflows')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[workflows] list failed:', error.message)
    return []
  }

  const workflows = (data ?? []).map((row) => rowToWorkflow(row as Record<string, unknown>))
  if (workflows.length === 0) return []

  const { data: runs, error: runsError } = await supabaseAdmin
    .from('workflow_runs')
    .select('*')
    .eq('user_id', userId)
    .in(
      'workflow_id',
      workflows.map((workflow) => workflow.id)
    )
    .order('started_at', { ascending: false })
    .limit(workflows.length * MAX_RECENT_RUNS)

  if (runsError) {
    console.error('[workflows] recent runs failed:', runsError.message)
  }

  const runsByWorkflow = new Map<string, WorkflowRunRow[]>()
  for (const row of (runs ?? []) as Record<string, unknown>[]) {
    const run = rowToRun(row)
    const list = runsByWorkflow.get(run.workflow_id) ?? []
    if (list.length < MAX_RECENT_RUNS) list.push(run)
    runsByWorkflow.set(run.workflow_id, list)
  }

  return workflows.map((workflow) => {
    const template = getWorkflowTemplateDefinition(workflow.template_key)
    return {
      ...workflow,
      templateLabel: template.label,
      templateSummary: template.summary,
      supportsAutomation: template.supportsAutomation,
      recentRuns: runsByWorkflow.get(workflow.id) ?? [],
    }
  })
}

export async function getWorkflowDashboardData(userId: string): Promise<WorkflowDashboardData> {
  const workflows = await listWorkflowsForUser(userId)
  return {
    workflows,
    total: workflows.length,
    enabled: workflows.filter((workflow) => workflow.status === 'enabled').length,
    issues: workflows.filter((workflow) => workflow.last_run_status === 'warning' || workflow.last_run_status === 'failed').length,
    manualOnly: 0,
  }
}

export async function createWorkflow(
  userId: string,
  input: CreateWorkflowInput
): Promise<{ workflow: WorkflowSummary | null; error: string | null }> {
  const template = getWorkflowTemplateDefinition(input.templateKey)
  const payload = {
    user_id: userId,
    name: input.name.trim() || template.defaultName,
    description: input.description?.trim() || null,
    template_key: template.key,
    trigger_kind: template.triggerKind,
    action_kind: template.actionKind,
    config: normalizeConfig(template.key, input.config ?? {}),
    status: input.status === 'disabled' ? 'disabled' : 'enabled',
  }

  const { data, error } = await supabaseAdmin
    .from('workflows')
    .insert(payload)
    .select('*')
    .single()

  if (error || !data) {
    return { workflow: null, error: error?.message ?? 'Failed to create workflow' }
  }

  const workflows = await listWorkflowsForUser(userId)
  return {
    workflow: workflows.find((workflow) => workflow.id === String(data.id)) ?? null,
    error: null,
  }
}

export async function updateWorkflow(
  userId: string,
  workflowId: string,
  input: UpdateWorkflowInput
): Promise<{ workflow: WorkflowSummary | null; error: string | null }> {
  const existing = await getWorkflowById(userId, workflowId)
  if (!existing) {
    return { workflow: null, error: 'Workflow not found' }
  }

  const { data, error } = await supabaseAdmin
    .from('workflows')
    .update({
      name: input.name.trim() || existing.name,
      description: input.description?.trim() || null,
      config: normalizeConfig(existing.template_key, input.config ?? existing.config),
      status: input.status === 'disabled' ? 'disabled' : input.status === 'enabled' ? 'enabled' : existing.status,
    })
    .eq('id', workflowId)
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error || !data) {
    return { workflow: null, error: error?.message ?? 'Failed to update workflow' }
  }

  const workflows = await listWorkflowsForUser(userId)
  return {
    workflow: workflows.find((workflow) => workflow.id === String(data.id)) ?? null,
    error: null,
  }
}

export async function getWorkflowById(userId: string, workflowId: string): Promise<WorkflowRow | null> {
  const { data, error } = await supabaseAdmin
    .from('workflows')
    .select('*')
    .eq('id', workflowId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return null
  return rowToWorkflow(data as Record<string, unknown>)
}

export async function setWorkflowStatus(
  userId: string,
  workflowId: string,
  status: WorkflowStatus
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabaseAdmin
    .from('workflows')
    .update({ status })
    .eq('id', workflowId)
    .eq('user_id', userId)

  return { success: !error, error: error?.message ?? null }
}

export async function deleteWorkflow(
  userId: string,
  workflowId: string
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabaseAdmin
    .from('workflows')
    .delete()
    .eq('id', workflowId)
    .eq('user_id', userId)

  return { success: !error, error: error?.message ?? null }
}

export async function runWorkflowNow(
  userId: string,
  workflowId: string
): Promise<{ success: boolean; status?: WorkflowRunStatus; summary?: string; error?: string }> {
  const workflow = await getWorkflowById(userId, workflowId)
  if (!workflow) return { success: false, error: 'Workflow not found' }

  const result = await executeWorkflowRecord(workflow, 'manual')
  return { success: true, status: result.status, summary: result.summary }
}

export async function runApprovedPostQueueingWorkflows(
  userId: string,
  postId: string
): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from('workflows')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'enabled')
    .eq('template_key', 'auto_queue_approved_posts')

  if (error) {
    console.error('[workflows] auto-queue load failed:', error.message)
    return
  }

  for (const row of (data ?? []) as Record<string, unknown>[]) {
    const workflow = rowToWorkflow(row)
    await executeWorkflowRecord(workflow, 'event', { postId })
  }
}

export async function runDueAutomatedWorkflows(now = new Date()) {
  const { data, error } = await supabaseAdmin
    .from('workflows')
    .select('*')
    .eq('status', 'enabled')
    .in('template_key', ['weekly_content_batch', 'stale_draft_review', 'publish_guardrail'])

  if (error) {
    console.error('[workflows] due-workflows load failed:', error.message)
    return { checked: 0, triggered: 0 }
  }

  let triggered = 0
  for (const row of (data ?? []) as Record<string, unknown>[]) {
    const workflow = rowToWorkflow(row)
    const timeZone = await getUserTimeZone(workflow.user_id)
    if (!isScheduledWorkflowDue(workflow, timeZone, now)) continue
    await executeWorkflowRecord(workflow, 'automation')
    triggered += 1
  }

  return { checked: (data ?? []).length, triggered }
}
