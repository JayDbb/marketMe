import { supabaseAdmin } from '@/lib/supabase/admin'
import type { CanvasData, ImageNode } from '@/types/canvas'

const BUCKET = 'studio-templates'

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; contentType: string; ext: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return null
  const contentType = match[1]
  const ext = contentType.split('/')[1]?.replace('jpeg', 'jpg') || 'png'
  return { buffer: Buffer.from(match[2], 'base64'), contentType, ext }
}

/**
 * Upload embedded data-URL image layers to Supabase Storage so canvas_data
 * stays small and previews / Generate can load images reliably.
 */
export async function persistCanvasImageLayers(
  userId: string,
  canvasData: CanvasData
): Promise<{ canvasData: CanvasData; previewUrl: string | null }> {
  const next: CanvasData = JSON.parse(JSON.stringify(canvasData)) as CanvasData
  let previewUrl: string | null = null

  for (const layer of next.layers) {
    if (layer.type !== 'image') continue
    const imageLayer = layer as ImageNode
    if (!imageLayer.src?.startsWith('data:')) {
      if (!previewUrl) previewUrl = imageLayer.src
      continue
    }

    const uploaded = await uploadLayerImage(userId, imageLayer)
    if (uploaded) {
      imageLayer.src = uploaded
      if (!previewUrl) previewUrl = uploaded
    }
  }

  if (next.pages?.length) {
    for (const page of next.pages) {
      for (const layer of page.layers) {
        if (layer.type !== 'image') continue
        const imageLayer = layer as ImageNode
        if (!imageLayer.src?.startsWith('data:')) continue
        const uploaded = await uploadLayerImage(userId, imageLayer)
        if (uploaded) imageLayer.src = uploaded
      }
    }
    const idx = next.activePageIndex ?? 0
    if (next.pages[idx]) next.layers = next.pages[idx].layers
  }

  return { canvasData: next, previewUrl }
}

async function uploadLayerImage(
  userId: string,
  imageLayer: ImageNode
): Promise<string | null> {
  if (!imageLayer.src?.startsWith('data:')) return imageLayer.src

  const parsed = dataUrlToBuffer(imageLayer.src)
  if (!parsed) return null

  const fileName = `canvas-${Date.now()}-${Math.random().toString(36).slice(2)}.${parsed.ext}`
  const filePath = `${userId}/${fileName}`

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filePath, parsed.buffer, {
      contentType: parsed.contentType,
      upsert: false,
    })

  if (error) {
    console.error('Canvas image upload error:', error)
    return null
  }

  const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath)
  return urlData.publicUrl
}

/** Upload a rendered canvas preview (PNG/JPEG data URL) for template thumbnails. */
export async function uploadCanvasPreview(
  userId: string,
  dataUrl: string
): Promise<string | null> {
  if (!dataUrl.startsWith('data:')) return dataUrl

  const parsed = dataUrlToBuffer(dataUrl)
  if (!parsed) return null

  const fileName = `preview-${Date.now()}-${Math.random().toString(36).slice(2)}.${parsed.ext}`
  const filePath = `${userId}/${fileName}`

  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(filePath, parsed.buffer, {
    contentType: parsed.contentType,
    upsert: false,
  })

  if (error) {
    console.error('Preview upload error:', error)
    return null
  }

  const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath)
  return urlData.publicUrl
}
