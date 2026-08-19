export const PLANNER_POST_MIME = 'application/x-marketme-planner-post'

export type PlannerDragPayload = {
  postId: string
  source: 'event' | 'draft'
  scheduledDate?: string
}

export function setPlannerDragData(
  event: React.DragEvent,
  payload: PlannerDragPayload
) {
  const encoded = JSON.stringify(payload)
  event.dataTransfer.setData(PLANNER_POST_MIME, encoded)
  event.dataTransfer.setData('text/plain', payload.postId)
  event.dataTransfer.effectAllowed = 'move'
}

export function getPlannerDragPayload(
  event: React.DragEvent
): PlannerDragPayload | null {
  const raw =
    event.dataTransfer.getData(PLANNER_POST_MIME) ||
    event.dataTransfer.getData('text/plain')
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as PlannerDragPayload
    if (parsed?.postId) return parsed
  } catch {
    return { postId: raw, source: 'event' }
  }
  return { postId: raw, source: 'event' }
}

export function allowPlannerDrop(event: React.DragEvent) {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}
