import type {
  AutoQueueApprovedPostsConfig,
  PublishGuardrailConfig,
  StaleDraftReviewConfig,
  WeeklyContentBatchConfig,
  WorkflowTemplateDefinition,
  WorkflowTemplateKey,
  WorkflowWeekday,
} from '@/types/workflow'

export const WORKFLOW_WEEKDAYS: WorkflowWeekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

export const WORKFLOW_WEEKDAY_LABELS: Record<WorkflowWeekday, string> = {
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
}

export const WORKFLOW_TEMPLATE_DEFINITIONS: Record<
  WorkflowTemplateKey,
  WorkflowTemplateDefinition
> = {
  weekly_content_batch: {
    key: 'weekly_content_batch',
    label: 'Weekly draft batch',
    summary: 'Generate a fresh batch of weekly content on a fixed weekday.',
    description:
      'Runs the existing weekly content generator so your team starts each cycle with new Instagram drafts.',
    triggerKind: 'weekly_schedule',
    actionKind: 'generate_weekly_content',
    defaultName: 'Weekly Instagram drafts',
    defaultDescription: 'Generate weekly content every Monday morning.',
    supportsAutomation: true,
    config: {
      weekday: 'monday',
      hour: 9,
      minute: 0,
    } satisfies WeeklyContentBatchConfig,
  },
  auto_queue_approved_posts: {
    key: 'auto_queue_approved_posts',
    label: 'Auto-queue approved posts',
    summary: 'When a post is approved, assign the next available publish slot.',
    description:
      'Applies a simple queueing rule so approved Instagram posts move into the Planner without manual date picking.',
    triggerKind: 'post_approved',
    actionKind: 'queue_approved_posts',
    defaultName: 'Queue approved Instagram posts',
    defaultDescription: 'Auto-schedule approved posts into the next available slot.',
    supportsAutomation: true,
    config: {
      hour: 10,
      minute: 0,
      spacingHours: 24,
      maxPostsPerRun: 5,
    } satisfies AutoQueueApprovedPostsConfig,
  },
  stale_draft_review: {
    key: 'stale_draft_review',
    label: 'Stale draft review',
    summary: 'Surface old drafts that have stalled before they go forgotten.',
    description:
      'Scans draft posts on a daily schedule and records how many items need attention.',
    triggerKind: 'daily_schedule',
    actionKind: 'review_stale_drafts',
    defaultName: 'Review stale drafts',
    defaultDescription: 'Check every day for drafts that need attention.',
    supportsAutomation: true,
    config: {
      hour: 8,
      minute: 30,
      staleDays: 7,
    } satisfies StaleDraftReviewConfig,
  },
  publish_guardrail: {
    key: 'publish_guardrail',
    label: 'Publish guardrail',
    summary: 'Check connection health and upcoming scheduled content before publish windows.',
    description:
      'Looks ahead at scheduled content and flags missing Instagram connections or incomplete posts before publish time.',
    triggerKind: 'daily_schedule',
    actionKind: 'check_publish_guardrail',
    defaultName: 'Instagram publish guardrail',
    defaultDescription: 'Check upcoming scheduled posts before publish windows.',
    supportsAutomation: true,
    config: {
      hour: 7,
      minute: 45,
      lookAheadHours: 48,
    } satisfies PublishGuardrailConfig,
  },
}

export const WORKFLOW_TEMPLATES = Object.values(WORKFLOW_TEMPLATE_DEFINITIONS)

export function getWorkflowTemplateDefinition(templateKey: WorkflowTemplateKey) {
  return WORKFLOW_TEMPLATE_DEFINITIONS[templateKey]
}

export function workflowTimeLabel(hour: number, minute: number) {
  const date = new Date(Date.UTC(2026, 0, 1, hour, minute, 0))
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}
