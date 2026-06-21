'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import { CanvasData } from '@/types/canvas'

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
  author_name: string | null
  author_url: string | null
  created_at: string
}

// ─── Fetch all templates for the current user ─────────────────────────────────
export async function getUserTemplatesAction(): Promise<StudioTemplate[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('studio_templates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching studio templates:', error)
    return []
  }

  return (data ?? []) as StudioTemplate[]
}

// ─── Upload a file to Supabase Storage + insert metadata row ─────────────────
export async function uploadTemplateAction(formData: FormData): Promise<{
  success: boolean
  error?: string
  template?: StudioTemplate
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const file = formData.get('file') as File | null
  const name = (formData.get('name') as string) || 'Untitled'
  const category = (formData.get('category') as string) || null

  if (!file) return { success: false, error: 'No file provided' }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Only JPEG, PNG, WebP, and GIF files are allowed' }
  }

  // Validate file size (10 MB max)
  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: 'File must be smaller than 10 MB' }
  }

  // Build a unique storage path: {userId}/{timestamp}-{sanitized-filename}
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const filePath = `${user.id}/${fileName}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('studio-templates')
    .upload(filePath, file, { contentType: file.type, upsert: false })

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    return { success: false, error: 'Upload failed. Please try again.' }
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from('studio-templates')
    .getPublicUrl(filePath)

  const fileUrl = urlData.publicUrl

  // Insert metadata row
  const { data: template, error: dbError } = await supabase
    .from('studio_templates')
    .insert({
      user_id: user.id,
      name,
      category,
      file_path: filePath,
      file_url: fileUrl,
      source: 'upload',
    })
    .select()
    .single()

  if (dbError) {
    console.error('DB insert error:', dbError)
    // Clean up the uploaded file if DB insert fails
    await supabase.storage.from('studio-templates').remove([filePath])
    return { success: false, error: 'Failed to save template metadata.' }
  }

  revalidatePath('/dashboard/studio')
  return { success: true, template: template as StudioTemplate }
}

// ─── Save an Unsplash photo as a template ─────────────────────────────────────
export async function saveUnsplashTemplateAction(data: {
  name: string
  category?: string
  file_url: string
  unsplash_id: string
  author_name: string
  author_url: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Check for duplicate saves
  const { data: existing } = await supabase
    .from('studio_templates')
    .select('id')
    .eq('user_id', user.id)
    .eq('unsplash_id', data.unsplash_id)
    .maybeSingle()

  if (existing) return { success: false, error: 'Already saved to your templates.' }

  const { error } = await supabase.from('studio_templates').insert({
    user_id: user.id,
    name: data.name,
    category: data.category ?? null,
    file_path: `unsplash/${data.unsplash_id}`,
    file_url: data.file_url,
    source: 'unsplash',
    unsplash_id: data.unsplash_id,
    author_name: data.author_name,
    author_url: data.author_url,
  })

  if (error) {
    console.error('Error saving Unsplash template:', error)
    return { success: false, error: 'Failed to save template.' }
  }

  revalidatePath('/dashboard/studio')
  return { success: true }
}

// ─── Delete a template ────────────────────────────────────────────────────────
export async function deleteTemplateAction(
  id: string,
  filePath: string,
  source: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Only delete from storage if it was a user upload (not an Unsplash reference)
  if (source === 'upload') {
    const { error: storageError } = await supabase.storage
      .from('studio-templates')
      .remove([filePath])

    if (storageError) {
      console.error('Storage delete error:', storageError)
      // Don't block DB deletion even if storage fails
    }
  }

  const { error: dbError } = await supabase
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

// ─── Save a Canvas JSON Template ───────────────────────────────────────────────
export async function saveCanvasTemplateAction(data: {
  name: string
  category?: string
  canvasData: CanvasData
}): Promise<{ success: boolean; error?: string; template?: StudioTemplate }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // We use a placeholder for now; later we can export the canvas to a real image and save it to storage
  const dummyUrl = 'https://via.placeholder.com/1080x1080.png?text=Canvas+Template'

  const { data: template, error } = await supabase
    .from('studio_templates')
    .insert({
      user_id: user.id,
      name: data.name,
      category: data.category ?? null,
      file_path: `canvas/${Date.now()}.json`,
      file_url: dummyUrl,
      source: 'upload',
      template_type: 'canvas',
      canvas_data: data.canvasData as any,
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving Canvas template:', error)
    return { success: false, error: 'Failed to save canvas template.' }
  }

  revalidatePath('/dashboard/studio')
  return { success: true, template: template as StudioTemplate }
}

