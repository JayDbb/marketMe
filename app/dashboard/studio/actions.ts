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
  const user = await getAuthenticatedUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const file = formData.get('file') as File | null
  const name = (formData.get('name') as string) || 'Untitled'
  const category = (formData.get('category') as string) || null

  if (!file) return { success: false, error: 'No file provided' }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Only JPEG, PNG, WebP, and GIF files are allowed' }
  }

  if (!isWithinImageUploadLimit(file.size)) {
    return { success: false, error: `File must be smaller than ${MAX_IMAGE_UPLOAD_LABEL}` }
  }

  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const filePath = `${user.id}/${fileName}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('studio-templates')
    .upload(filePath, file, { contentType: file.type, upsert: false })

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    return { success: false, error: 'Upload failed. Please try again.' }
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

export async function saveUnsplashTemplateAction(data: {
  name: string
  category?: string
  file_url: string
  unsplash_id: string
  author_name: string
  author_url: string
}): Promise<{ success: boolean; error?: string; template?: StudioTemplate }> {
  const user = await getAuthenticatedUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: existing } = await supabaseAdmin
    .from('studio_templates')
    .select('id')
    .eq('user_id', user.id)
    .eq('unsplash_id', data.unsplash_id)
    .maybeSingle()

  if (existing) return { success: false, error: 'Already saved to your templates.' }

  const { template, error } = await insertStudioTemplateForUser(user.id, {
    name: data.name,
    file_path: `unsplash/${data.unsplash_id}`,
    file_url: data.file_url,
    source: 'unsplash',
    category: data.category ?? null,
    unsplash_id: data.unsplash_id,
    author_name: data.author_name,
    author_url: data.author_url,
  })

  if (error) {
    return { success: false, error }
  }

  revalidatePath('/dashboard/studio')
  return { success: true, template }
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
