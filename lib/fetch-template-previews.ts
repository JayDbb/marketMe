import { supabaseAdmin } from '@/lib/supabase/admin'
import type { TemplatePreviewSource } from '@/lib/post-utils'

export async function fetchTemplatePreviewsById(
  templateIds: string[]
): Promise<Map<string, TemplatePreviewSource>> {
  const uniqueIds = [...new Set(templateIds.filter(Boolean))]
  if (uniqueIds.length === 0) return new Map()

  const { data, error } = await supabaseAdmin
    .from('studio_templates')
    .select('id, file_url, template_type, canvas_data')
    .in('id', uniqueIds)

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[fetchTemplatePreviewsById]', error.message)
    }
    return new Map()
  }

  const map = new Map<string, TemplatePreviewSource>()
  for (const row of data ?? []) {
    map.set(row.id as string, {
      file_url: row.file_url as string | null,
      template_type: row.template_type as string | null,
      canvas_data: row.canvas_data as TemplatePreviewSource['canvas_data'],
    })
  }
  return map
}

export function collectTemplateIds(rows: Record<string, unknown>[]): string[] {
  return rows
    .map((row) => row.template_id as string | null | undefined)
    .filter((id): id is string => Boolean(id))
}
