import { tasks } from "@trigger.dev/sdk/v3"
import type { generateWeeklyContent, regenerateCaption, generateImage } from "@/src/trigger/content-generator"

/**
 * Trigger the weekly content generation job.
 */
export async function triggerWeeklyContent(
  userId: string,
  businessProfileId: string,
  startDate: string
): Promise<{ jobId: string }> {
  const handle = await tasks.trigger<typeof generateWeeklyContent>("generate-weekly-content", {
    businessProfileId,
    startDate,
    userId,
  })
  return { jobId: handle.id }
}

/**
 * Trigger the image generation job for a post.
 */
export async function triggerImageGeneration(
  postId: string,
  style?: string
): Promise<{ jobId: string }> {
  const handle = await tasks.trigger<typeof generateImage>("generate-image", {
    postId,
    style,
  })
  return { jobId: handle.id }
}

/**
 * Trigger caption regeneration for a post.
 */
export async function triggerCaptionRegeneration(
  postId: string,
  feedback?: string
): Promise<{ jobId: string }> {
  const handle = await tasks.trigger<typeof regenerateCaption>("regenerate-caption", {
    postId,
    feedback,
  })
  return { jobId: handle.id }
}
