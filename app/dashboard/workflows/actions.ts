'use server'

import { revalidatePath } from 'next/cache'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import { rateLimitMessage } from '@/lib/rate-limit'
import {
  createWorkflow,
  deleteWorkflow,
  runWorkflowNow,
  setWorkflowStatus,
  updateWorkflow,
} from '@/lib/services/workflow.service'
import type { WorkflowConfig, WorkflowStatus, WorkflowTemplateKey } from '@/types/workflow'

function revalidateWorkflowPaths() {
  revalidatePath('/dashboard/workflows')
  revalidatePath('/dashboard/posts')
  revalidatePath('/dashboard/calendar')
}

async function requireWorkflowUser() {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Unauthorized', user: null }

  const limited = rateLimitMessage(`workflows:mutate:${user.id}`, 40, 60_000)
  if (limited) return { error: limited, user: null }

  return { error: null, user }
}

export async function createWorkflowAction(input: {
  name: string
  description?: string | null
  templateKey: WorkflowTemplateKey
  config?: Partial<WorkflowConfig>
  status?: WorkflowStatus
}) {
  const auth = await requireWorkflowUser()
  if (!auth.user) return { success: false, error: auth.error }

  const result = await createWorkflow(auth.user.id, input)
  if (result.error || !result.workflow) {
    return { success: false, error: result.error ?? 'Failed to create workflow' }
  }

  revalidateWorkflowPaths()
  return { success: true, workflow: result.workflow }
}

export async function updateWorkflowAction(input: {
  workflowId: string
  name: string
  description?: string | null
  config?: Partial<WorkflowConfig>
  status?: WorkflowStatus
}) {
  const auth = await requireWorkflowUser()
  if (!auth.user) return { success: false, error: auth.error }

  const result = await updateWorkflow(auth.user.id, input.workflowId, input)
  if (result.error || !result.workflow) {
    return { success: false, error: result.error ?? 'Failed to update workflow' }
  }

  revalidateWorkflowPaths()
  return { success: true, workflow: result.workflow }
}

export async function toggleWorkflowAction(workflowId: string, enabled: boolean) {
  const auth = await requireWorkflowUser()
  if (!auth.user) return { success: false, error: auth.error }

  const result = await setWorkflowStatus(auth.user.id, workflowId, enabled ? 'enabled' : 'disabled')
  if (!result.success) {
    return { success: false, error: result.error ?? 'Failed to update workflow status' }
  }

  revalidateWorkflowPaths()
  return { success: true }
}

export async function deleteWorkflowAction(workflowId: string) {
  const auth = await requireWorkflowUser()
  if (!auth.user) return { success: false, error: auth.error }

  const result = await deleteWorkflow(auth.user.id, workflowId)
  if (!result.success) {
    return { success: false, error: result.error ?? 'Failed to delete workflow' }
  }

  revalidateWorkflowPaths()
  return { success: true }
}

export async function runWorkflowNowAction(workflowId: string) {
  const auth = await requireWorkflowUser()
  if (!auth.user) return { success: false, error: auth.error }

  const result = await runWorkflowNow(auth.user.id, workflowId)
  if (!result.success) {
    return { success: false, error: result.error ?? 'Workflow run failed' }
  }

  revalidateWorkflowPaths()
  return { success: true, status: result.status, summary: result.summary }
}
