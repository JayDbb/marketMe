import { tasks } from "@trigger.dev/sdk/v3"
import type {
  generateWeeklyContent,
  regenerateCaption,
  generateImage,
  businessAnalysis,
  marketingStrategy,
  generateCreativeBrief,
  imageUpload,
  instagramPublishing,
  sendNotification,
} from "@/src/trigger/content-generator"

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

/**
 * Trigger business profile analysis.
 */
export async function triggerBusinessAnalysis(
  businessProfileId: string
): Promise<{ jobId: string }> {
  const handle = await tasks.trigger<typeof businessAnalysis>("business-analysis", {
    businessProfileId,
  })
  return { jobId: handle.id }
}

/**
 * Trigger marketing strategy generation.
 */
export async function triggerMarketingStrategy(
  businessProfileId: string
): Promise<{ jobId: string }> {
  const handle = await tasks.trigger<typeof marketingStrategy>("marketing-strategy", {
    businessProfileId,
  })
  return { jobId: handle.id }
}

/**
 * Trigger creative brief generation.
 */
export async function triggerCreativeBrief(
  postId: string,
  style?: string
): Promise<{ jobId: string }> {
  const handle = await tasks.trigger<typeof generateCreativeBrief>("generate-creative-brief", {
    postId,
    style,
  })
  return { jobId: handle.id }
}

/**
 * Trigger image upload task.
 */
export async function triggerImageUpload(
  postId: string,
  imageUrl: string
): Promise<{ jobId: string }> {
  const handle = await tasks.trigger<typeof imageUpload>("image-upload", {
    postId,
    imageUrl,
  })
  return { jobId: handle.id }
}

/**
 * Trigger direct Instagram publishing.
 */
export async function triggerInstagramPublishing(
  postId: string,
  businessId: string,
  imageUrl: string
): Promise<{ jobId: string }> {
  const handle = await tasks.trigger<typeof instagramPublishing>("instagram-publishing", {
    postId,
    businessId,
    imageUrl,
  })
  return { jobId: handle.id }
}

/**
 * Trigger notification.
 */
export async function triggerNotification(
  title: string,
  body: string
): Promise<{ jobId: string }> {
  const handle = await tasks.trigger<typeof sendNotification>("send-notification", {
    title,
    body,
  })
  return { jobId: handle.id }
}
