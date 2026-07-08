import type { CanvasData, ImageNode } from '@/types/canvas'
import type { StudioTemplate } from '@/app/dashboard/studio/actions'
import type { StudioRecentEntry } from '@/lib/studio-recents'

export const STUDIO_CATEGORIES = [
  'All',
  'Fashion',
  'Food',
  'Retail',
  'Events',
  'Fitness',
  'Interior',
  'Tech',
  'Sports',
  'Other',
] as const

export type StudioCategory = (typeof STUDIO_CATEGORIES)[number]

export function createBlankCanvas(): CanvasData {
  return {
    version: '1.0',
    canvas: {
      width: 1080,
      height: 1350,
      backgroundColor: '#0f172a',
      aspectRatioName: 'portrait',
    },
    layers: [
      {
        id: 'headline',
        type: 'text',
        content: 'Your Headline',
        x: 80,
        y: 480,
        width: 920,
        fontSize: 72,
        fontFamily: 'Inter',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        zIndex: 2,
      },
      {
        id: 'subtext',
        type: 'text',
        content: 'Add your message here',
        x: 120,
        y: 600,
        width: 840,
        fontSize: 36,
        fontFamily: 'Inter',
        fill: '#cbd5e1',
        align: 'center',
        zIndex: 2,
      },
    ],
  }
}

/**
 * Turn a stock photo or upload into a multi-layer Canva-style design
 * (photo, overlay, heading, subheading — each editable separately).
 */
export function photoToEditableCanvas(imageUrl: string): CanvasData {
  const width = 1080
  const height = 1350
  return {
    version: '1.0',
    canvas: {
      width,
      height,
      backgroundColor: '#0f172a',
      aspectRatioName: 'portrait',
    },
    layers: [
      {
        id: 'photo',
        type: 'image',
        src: imageUrl,
        x: 0,
        y: 0,
        width,
        height,
        zIndex: 1,
      },
      {
        id: 'overlay',
        type: 'rect',
        x: 0,
        y: height * 0.45,
        width,
        height: height * 0.55,
        fill: 'rgba(0,0,0,0.45)',
        gradientColors: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)'],
        zIndex: 2,
      },
      {
        id: 'headline',
        type: 'text',
        content: 'Add a heading',
        x: 80,
        y: height * 0.62,
        width: 920,
        fontSize: 72,
        fontFamily: 'Inter',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        zIndex: 3,
      },
      {
        id: 'subtext',
        type: 'text',
        content: 'Add a subheading',
        x: 120,
        y: height * 0.74,
        width: 840,
        fontSize: 36,
        fontFamily: 'Inter',
        fill: '#e2e8f0',
        align: 'center',
        zIndex: 4,
      },
    ],
  }
}

/** @deprecated Use photoToEditableCanvas — kept for callers that pass a headline arg */
export function imageToCanvas(imageUrl: string, headline = 'Your Headline'): CanvasData {
  const canvas = photoToEditableCanvas(imageUrl)
  return {
    ...canvas,
    layers: canvas.layers.map((layer) =>
      layer.id === 'headline' && layer.type === 'text'
        ? { ...layer, content: headline }
        : layer
    ),
  }
}

export function templateToCanvas(template: StudioTemplate): CanvasData {
  if (template.template_type === 'canvas' && template.canvas_data) {
    return JSON.parse(JSON.stringify(template.canvas_data)) as CanvasData
  }
  return photoToEditableCanvas(template.file_url)
}

export function previewUrlFromCanvas(canvasData: CanvasData): string {
  const imgLayer = canvasData.layers.find((l) => l.type === 'image') as ImageNode | undefined
  return imgLayer?.src ?? 'https://via.placeholder.com/1080x1080.png?text=Canvas+Design'
}

export function getTemplatePreviewUrl(template: StudioTemplate): string {
  if (template.template_type === 'canvas' && template.canvas_data) {
    return previewUrlFromCanvas(template.canvas_data)
  }
  return template.file_url
}

export function filterTemplates(
  templates: StudioTemplate[],
  opts: { search?: string; category?: string; source?: 'upload' | 'saved' | 'all' }
): StudioTemplate[] {
  const search = opts.search?.toLowerCase().trim() ?? ''
  const category = opts.category ?? 'All'

  return templates.filter((t) => {
    if (opts.source === 'upload' && t.source !== 'upload') return false
    if (opts.source === 'saved' && t.source === 'upload') return false
    if (category !== 'All' && t.category !== category) return false
    if (search && !t.name.toLowerCase().includes(search)) return false
    return true
  })
}

export function getStudioStats(templates: StudioTemplate[]) {
  const uploads = templates.filter((t) => t.source === 'upload')
  const saved = templates.filter((t) => t.source !== 'upload')
  const canvasDesigns = templates.filter((t) => t.template_type === 'canvas')
  return {
    total: templates.length,
    uploads: uploads.length,
    saved: saved.length,
    canvasDesigns: canvasDesigns.length,
  }
}

/** Merge local open-history with templates; fall back to newest created when no history. */
export function getRecentTemplates(
  templates: StudioTemplate[],
  recentEntries: StudioRecentEntry[],
  limit = 8
): { template: StudioTemplate; openedAt: string }[] {
  const byId = new Map(templates.map((t) => [t.id, t]))

  const fromHistory = recentEntries
    .map((entry) => {
      const template = byId.get(entry.id)
      return template ? { template, openedAt: entry.openedAt } : null
    })
    .filter((item): item is { template: StudioTemplate; openedAt: string } => item !== null)

  if (fromHistory.length > 0) return fromHistory.slice(0, limit)

  return [...templates]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
    .map((template) => ({ template, openedAt: template.created_at }))
}
