'use server'

import { revalidatePath } from 'next/cache'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { persistCanvasImageLayers, uploadCanvasPreview } from '@/lib/canvas-persist-images'

import { CanvasData } from '@/types/canvas'
import { isWithinImageUploadLimit, MAX_IMAGE_UPLOAD_LABEL } from '@/lib/upload-limits'
import { previewUrlFromCanvas, photoToEditableCanvas } from '@/lib/studio-utils'

export interface StudioTemplate {
  id: string
  name: string
  category: string | null
  file_url: string
  file_path: string
  source: 'upload' | 'unsplash' | 'pexels'
  template_type: 'image' | 'canvas'
  canvas_data: CanvasData | null
  unsplash_id: string | null
  pexels_id: string | null
  author_name: string | null
  author_url: string | null
  created_at: string
}

export type StudioTemplatesResult = {
  templates: StudioTemplate[]
  error: string | null
}

type InsertStudioTemplateInput = {
  name: string
  file_path: string
  file_url: string
  source: 'upload' | 'unsplash' | 'pexels'
  category?: string | null
  template_type?: 'image' | 'canvas'
  canvas_data?: CanvasData | null
  pexels_id?: string | null
  unsplash_id?: string | null
  author_name?: string | null
  author_url?: string | null
}

async function insertStudioTemplateForUser(
  userId: string,
  input: InsertStudioTemplateInput
): Promise<{ template?: StudioTemplate; error?: string }> {
  const { data, error } = await supabaseAdmin
    .from('studio_templates')
    .insert({
      user_id: userId,
      name: input.name,
      category: input.category ?? null,
      file_path: input.file_path,
      file_url: input.file_url,
      source: input.source,
      template_type: input.template_type ?? 'image',
      canvas_data: input.canvas_data ?? null,
      pexels_id: input.pexels_id ?? null,
      unsplash_id: input.unsplash_id ?? null,
      author_name: input.author_name ?? null,
      author_url: input.author_url ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('insert studio template:', error.message)
    return { error: 'Failed to save template.' }
  }

  return { template: data as StudioTemplate }
}

export async function getUserTemplatesResult(): Promise<StudioTemplatesResult> {
  const user = await getAuthenticatedUser()
  if (!user) return { templates: [], error: 'Not authenticated' }

  const { data, error } = await supabaseAdmin
    .from('studio_templates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching studio templates:', error.message)
    return { templates: [], error: 'Could not load your templates. Please try again.' }
  }

  return { templates: (data ?? []) as StudioTemplate[], error: null }
}

/** @deprecated Prefer getUserTemplatesResult when you need error surfacing */
export async function getUserTemplatesAction(): Promise<StudioTemplate[]> {
  const { templates } = await getUserTemplatesResult()
  return templates
}

export async function uploadTemplateAction(formData: FormData): Promise<{
  success: boolean
  error?: string
  template?: StudioTemplate
}> {
  // Kept for compatibility; prefer prepareStudioTemplateUpload + completeStudioTemplateUpload
  // so large files are not sent through the Vercel server-action body (413).
  const user = await getAuthenticatedUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const file = formData.get('file') as File | null
  const name = (formData.get('name') as string) || 'Untitled'
  const category = (formData.get('category') as string) || null

  if (!file) return { success: false, error: 'No file provided' }

  const typeError = validateImageUploadMeta(file.type, file.size)
  if (typeError) return { success: false, error: typeError }

  const ext = file.name.split('.').pop() || 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const filePath = `${user.id}/${fileName}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('studio-templates')
    .upload(filePath, file, { contentType: file.type, upsert: false })

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    return { success: false, error: 'Upload failed. Please try again.' }
  }

  return completeStudioTemplateUploadAction({
    filePath,
    name,
    category,
  })
}

/**
 * Step 1 of Vercel-safe uploads: create a short-lived signed upload URL.
 * The browser uploads the file bytes directly to Supabase (avoids 413 on Vercel).
 */
export async function prepareStudioTemplateUploadAction(input: {
  fileName: string
  contentType: string
  fileSize: number
}): Promise<{
  success: boolean
  error?: string
  path?: string
  token?: string
  signedUrl?: string
}> {
  const user = await getAuthenticatedUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const typeError = validateImageUploadMeta(input.contentType, input.fileSize)
  if (typeError) return { success: false, error: typeError }

  const ext = input.fileName.split('.').pop()?.toLowerCase() || 'jpg'
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`
  const filePath = `${user.id}/${fileName}`

  const { data, error } = await supabaseAdmin.storage
    .from('studio-templates')
    .createSignedUploadUrl(filePath)

  if (error || !data) {
    console.error('Signed upload URL error:', error?.message)
    return { success: false, error: 'Could not start upload. Please try again.' }
  }

  return {
    success: true,
    path: data.path,
    token: data.token,
    signedUrl: data.signedUrl,
  }
}

/**
 * Step 2: after the browser uploads to the signed URL, register the template row.
 */
export async function completeStudioTemplateUploadAction(input: {
  filePath: string
  name: string
  category?: string | null
}): Promise<{
  success: boolean
  error?: string
  template?: StudioTemplate
}> {
  const user = await getAuthenticatedUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const name = input.name.trim() || 'Untitled'
  const category = input.category ?? null
  const filePath = input.filePath.trim()

  if (!filePath.startsWith(`${user.id}/`)) {
    return { success: false, error: 'Invalid upload path.' }
  }

  const { data: existingFile, error: listError } = await supabaseAdmin.storage
    .from('studio-templates')
    .list(user.id)

  if (listError) {
    console.error('Storage verify error:', listError.message)
    return { success: false, error: 'Could not verify upload. Please try again.' }
  }

  const fileName = filePath.split('/').pop()
  if (!fileName || !existingFile?.some((f) => f.name === fileName)) {
    return { success: false, error: 'Upload not found. Please try again.' }
  }

  const { data: urlData } = supabaseAdmin.storage
    .from('studio-templates')
    .getPublicUrl(filePath)

  const fileUrl = urlData.publicUrl
  const canvasData = photoToEditableCanvas(fileUrl)

  const { template, error: dbError } = await insertStudioTemplateForUser(user.id, {
    name,
    file_path: filePath,
    file_url: fileUrl,
    source: 'upload',
    category,
    template_type: 'canvas',
    canvas_data: canvasData,
  })

  if (dbError) {
    await supabaseAdmin.storage.from('studio-templates').remove([filePath])
    return { success: false, error: dbError }
  }

  revalidatePath('/dashboard/studio')
  return { success: true, template }
}

function validateImageUploadMeta(contentType: string, fileSize: number): string | null {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(contentType)) {
    return 'Only JPEG, PNG, WebP, and GIF files are allowed'
  }
  if (!isWithinImageUploadLimit(fileSize)) {
    return `File must be smaller than ${MAX_IMAGE_UPLOAD_LABEL}`
  }
  return null
}

export async function savePexelsTemplateAction(data: {
  name: string
  category?: string
  file_url: string
  pexels_id: string
  author_name: string
  author_url: string
}): Promise<{ success: boolean; error?: string; template?: StudioTemplate }> {
  const user = await getAuthenticatedUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: existing } = await supabaseAdmin
    .from('studio_templates')
    .select('id')
    .eq('user_id', user.id)
    .eq('pexels_id', data.pexels_id)
    .maybeSingle()

  if (existing) return { success: false, error: 'Already saved to your templates.' }

  const canvasData = photoToEditableCanvas(data.file_url)

  const { template, error } = await insertStudioTemplateForUser(user.id, {
    name: data.name,
    file_path: `pexels/${data.pexels_id}`,
    file_url: data.file_url,
    source: 'pexels',
    category: data.category ?? null,
    template_type: 'canvas',
    canvas_data: canvasData,
    pexels_id: data.pexels_id,
    author_name: data.author_name,
    author_url: data.author_url,
  })

  if (error) {
    return { success: false, error }
  }

  revalidatePath('/dashboard/studio')
  return { success: true, template }
}

export async function deleteTemplateAction(
  id: string,
  filePath: string,
  source: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthenticatedUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  if (source === 'upload') {
    const { error: storageError } = await supabaseAdmin.storage
      .from('studio-templates')
      .remove([filePath])

    if (storageError) {
      console.error('Storage delete error:', storageError)
    }
  }

  const { error: dbError } = await supabaseAdmin
    .from('studio_templates')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (dbError) {
    console.error('DB delete error:', dbError)
    return { success: false, error: 'Failed to delete template.' }
  }

  revalidatePath('/dashboard/studio')
  return { success: true }
}

export async function saveCanvasTemplateAction(data: {
  name: string
  category?: string
  canvasData: CanvasData
  previewUrl?: string
}): Promise<{ success: boolean; error?: string; template?: StudioTemplate }> {
  const user = await getAuthenticatedUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { canvasData, previewUrl: uploadedPreview } = await persistCanvasImageLayers(
    user.id,
    data.canvasData
  )

  let previewUrl =
    uploadedPreview ??
    data.previewUrl ??
    previewUrlFromCanvas(canvasData)

  if (previewUrl?.startsWith('data:')) {
    previewUrl =
      (await uploadCanvasPreview(user.id, previewUrl)) ?? previewUrl
  }

  const { template, error } = await insertStudioTemplateForUser(user.id, {
    name: data.name,
    file_path: `canvas/${Date.now()}.json`,
    file_url: previewUrl,
    source: 'upload',
    category: data.category ?? null,
    template_type: 'canvas',
    canvas_data: canvasData,
  })

  if (error) {
    const hint =
      process.env.NODE_ENV === 'development'
        ? error
        : 'Failed to save canvas template.'
    return { success: false, error: hint }
  }

  revalidatePath('/dashboard/studio')
  revalidatePath('/dashboard/generate')
  return { success: true, template }
}

export async function updateCanvasTemplateAction(
  id: string,
  data: {
    name?: string
    category?: string
    canvasData: CanvasData
    previewUrl?: string
  }
): Promise<{ success: boolean; error?: string; template?: StudioTemplate }> {
  const user = await getAuthenticatedUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { canvasData, previewUrl: uploadedPreview } = await persistCanvasImageLayers(
    user.id,
    data.canvasData
  )

  let previewUrl =
    uploadedPreview ??
    data.previewUrl ??
    previewUrlFromCanvas(canvasData)

  if (previewUrl?.startsWith('data:')) {
    previewUrl =
      (await uploadCanvasPreview(user.id, previewUrl)) ?? previewUrl
  }

  const { data: template, error } = await supabaseAdmin
    .from('studio_templates')
    .update({
      name: data.name ?? undefined,
      category: data.category ?? undefined,
      file_url: previewUrl ?? undefined,
      canvas_data: canvasData,
      template_type: 'canvas',
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating canvas template:', error.message)
    const hint =
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'Failed to update design.'
    return { success: false, error: hint }
  }

  revalidatePath('/dashboard/studio')
  revalidatePath('/dashboard/generate')
  return { success: true, template: template as StudioTemplate }
}
