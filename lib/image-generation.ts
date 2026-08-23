import { resolveImageModel } from '@/lib/ai-models'
import {
  getOpenAiApiKey,
  hasOpenAiConfigured,
  isOpenRouterApiKey,
  openAiClientHeaders,
} from '@/lib/openai-config'
import { openai } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { hasTriggerConfigured } from '@/lib/trigger-env'
import { tasks } from '@trigger.dev/sdk/v3'
import { generateImage } from '@/src/trigger/content-generator'

type GeneratedImagePayload = {
  buffer: Buffer
  contentType: string
}

function resolveOpenRouterImageModel(preferred: string | null | undefined): string {
  const model = resolveImageModel(preferred)
  if (model === 'gpt-image-1') return 'openai/gpt-5-image'
  return 'openai/gpt-5-image'
}

async function generateWithNativeOpenAi(
  prompt: string,
  imageModel: string
): Promise<GeneratedImagePayload> {
  const imageResponse = await openai.images.generate({
    model: imageModel as 'dall-e-3',
    prompt: prompt.slice(0, 4000),
    n: 1,
    size: '1024x1024',
  })

  const tempUrl = imageResponse.data?.[0]?.url
  if (!tempUrl) {
    throw new Error('Image model returned no URL.')
  }

  const fetchResponse = await fetch(tempUrl)
  if (!fetchResponse.ok) {
    throw new Error('Failed to download generated image.')
  }

  return {
    buffer: Buffer.from(await fetchResponse.arrayBuffer()),
    contentType: fetchResponse.headers.get('content-type') || 'image/png',
  }
}

async function generateWithOpenRouter(
  prompt: string,
  imageModel: string
): Promise<GeneratedImagePayload> {
  const apiKey = getOpenAiApiKey()
  const response = await fetch('https://openrouter.ai/api/v1/images', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...openAiClientHeaders(),
    },
    body: JSON.stringify({
      model: resolveOpenRouterImageModel(imageModel),
      prompt: prompt.slice(0, 4000),
      n: 1,
      aspect_ratio: '1:1',
      output_format: 'png',
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(
      detail.trim()
        ? `OpenRouter image generation failed: ${detail.slice(0, 240)}`
        : `OpenRouter image generation failed (${response.status}).`
    )
  }

  const payload = (await response.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>
  }

  const item = payload.data?.[0]
  if (item?.b64_json) {
    return {
      buffer: Buffer.from(item.b64_json, 'base64'),
      contentType: 'image/png',
    }
  }

  if (item?.url) {
    const fetchResponse = await fetch(item.url)
    if (!fetchResponse.ok) {
      throw new Error('Failed to download generated image from OpenRouter.')
    }
    return {
      buffer: Buffer.from(await fetchResponse.arrayBuffer()),
      contentType: fetchResponse.headers.get('content-type') || 'image/png',
    }
  }

  throw new Error('OpenRouter returned no image data.')
}

const TRIGGER_IMAGE_POLL_MS = 2500
const TRIGGER_IMAGE_TIMEOUT_MS = 120_000

export async function revisePostImageViaTrigger(
  postId: string,
  instruction: string
): Promise<{ imagePrompt: string; imageUrl: string }> {
  if (!hasTriggerConfigured()) {
    throw new Error(
      'Image revision is not configured for this environment. Add TRIGGER_SECRET_KEY or TRIGGER_DEV_API_KEY to the server.'
    )
  }

  const { data: before } = await supabaseAdmin
    .from('posts')
    .select('image_url, image_prompt')
    .eq('id', postId)
    .maybeSingle()

  const previousUrl =
    typeof before?.image_url === 'string' ? before.image_url.trim() : ''

  await tasks.trigger<typeof generateImage>('generate-image', {
    postId,
    revisionInstruction: instruction,
  })

  const deadline = Date.now() + TRIGGER_IMAGE_TIMEOUT_MS
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, TRIGGER_IMAGE_POLL_MS))
    const { data: row } = await supabaseAdmin
      .from('posts')
      .select('image_url, image_prompt')
      .eq('id', postId)
      .maybeSingle()

    const nextUrl = typeof row?.image_url === 'string' ? row.image_url.trim() : ''
    if (nextUrl && nextUrl !== previousUrl) {
      return {
        imagePrompt:
          typeof row?.image_prompt === 'string' && row.image_prompt.trim()
            ? row.image_prompt.trim()
            : instruction,
        imageUrl: nextUrl,
      }
    }
  }

  throw new Error(
    'Image revision is still running. Refresh the page in a moment and check the post again.'
  )
}

export async function generateImageBuffer(
  prompt: string,
  preferredImageModel?: string | null
): Promise<GeneratedImagePayload> {
  if (!hasOpenAiConfigured()) {
    throw new Error(
      'Image generation is not configured. Add OPENAI_API_KEY or OPENROUTER_API_KEY to the server environment.'
    )
  }

  const imageModel = resolveImageModel(preferredImageModel)
  if (isOpenRouterApiKey()) {
    return generateWithOpenRouter(prompt, imageModel)
  }

  return generateWithNativeOpenAi(prompt, imageModel)
}
