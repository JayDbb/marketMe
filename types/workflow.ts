export type WorkflowTemplateKey =
  | 'weekly_content_batch'
  | 'auto_queue_approved_posts'
  | 'stale_draft_review'
  | 'publish_guardrail'

export type WorkflowTriggerKind = 'weekly_schedule' | 'post_approved' | 'daily_schedule'

export type WorkflowActionKind =
  | 'generate_weekly_content'
  | 'queue_approved_posts'
  | 'review_stale_drafts'
  | 'check_publish_guardrail'

export type WorkflowRunStatus = 'running' | 'success' | 'warning' | 'failed'

export type WorkflowStatus = 'enabled' | 'disabled'

export type WorkflowWeekday =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'

export interface WeeklyContentBatchConfig {
  weekday: WorkflowWeekday
  hour: number
  minute: number
}

export interface AutoQueueApprovedPostsConfig {
  hour: number
  minute: number
  spacingHours: number
  maxPostsPerRun: number
}

export interface StaleDraftReviewConfig {
  hour: number
  minute: number
  staleDays: number
}

export interface PublishGuardrailConfig {
  hour: number
  minute: number
  lookAheadHours: number
}

export type WorkflowConfig =
  | WeeklyContentBatchConfig
  | AutoQueueApprovedPostsConfig
  | StaleDraftReviewConfig
  | PublishGuardrailConfig

export interface WorkflowRow {
  id: string
  user_id: string
  name: string
  description: string | null
  template_key: WorkflowTemplateKey
  trigger_kind: WorkflowTriggerKind
  action_kind: WorkflowActionKind
  config: WorkflowConfig
  status: WorkflowStatus
  last_run_at: string | null
  last_run_status: WorkflowRunStatus | null
  created_at: string
  updated_at: string
}

export interface WorkflowRunRow {
  id: string
  workflow_id: string
  user_id: string
  trigger_source: 'manual' | 'automation' | 'event'
  status: WorkflowRunStatus
  summary: string
  details: Record<string, unknown> | null
  started_at: string
  finished_at: string | null
  created_at: string
}

export interface WorkflowTemplateDefinition<TConfig extends WorkflowConfig = WorkflowConfig> {
  key: WorkflowTemplateKey
  label: string
  summary: string
  description: string
  triggerKind: WorkflowTriggerKind
  actionKind: WorkflowActionKind
  defaultName: string
  defaultDescription: string
  supportsAutomation: boolean
  config: TConfig
}

export interface WorkflowSummary extends WorkflowRow {
  templateLabel: string
  templateSummary: string
  supportsAutomation: boolean
  recentRuns: WorkflowRunRow[]
}

export interface WorkflowDashboardData {
  workflows: WorkflowSummary[]
  total: number
  enabled: number
  issues: number
  manualOnly: number
}
