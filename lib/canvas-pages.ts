import type { CanvasData, CanvasNode } from '@/types/canvas'

export interface CanvasPage {
  id: string
  name: string
  layers: CanvasNode[]
}

export function hasPages(data: CanvasData): boolean {
  return (data.pages?.length ?? 0) > 0
}

export function getActivePageIndex(data: CanvasData): number {
  if (!hasPages(data)) return 0
  return Math.min(data.activePageIndex ?? 0, (data.pages?.length ?? 1) - 1)
}

export function getActiveLayers(data: CanvasData): CanvasNode[] {
  if (!hasPages(data)) return data.layers
  const idx = getActivePageIndex(data)
  return data.pages![idx]?.layers ?? data.layers
}

export function withActiveLayers(data: CanvasData, layers: CanvasNode[]): CanvasData {
  if (!hasPages(data)) return { ...data, layers }
  const idx = getActivePageIndex(data)
  const pages = data.pages!.map((p, i) => (i === idx ? { ...p, layers } : p))
  return { ...data, pages, layers }
}

export function enablePages(data: CanvasData): CanvasData {
  if (hasPages(data)) return data
  return {
    ...data,
    pages: [{ id: 'page-1', name: 'Slide 1', layers: [...data.layers] }],
    activePageIndex: 0,
  }
}

export function addPage(data: CanvasData): CanvasData {
  const withPages = enablePages(data)
  const n = (withPages.pages?.length ?? 0) + 1
  const newPage: CanvasPage = {
    id: `page-${Date.now()}`,
    name: `Slide ${n}`,
    layers: [],
  }
  return {
    ...withPages,
    pages: [...(withPages.pages ?? []), newPage],
    activePageIndex: n - 1,
    layers: [],
  }
}

export function removePage(data: CanvasData, pageIndex: number): CanvasData {
  if (!hasPages(data) || (data.pages?.length ?? 0) <= 1) return data
  const pages = data.pages!.filter((_, i) => i !== pageIndex)
  const nextIndex = Math.min(pageIndex, pages.length - 1)
  return {
    ...data,
    pages,
    activePageIndex: nextIndex,
    layers: pages[nextIndex]?.layers ?? [],
  }
}

export function switchPage(data: CanvasData, pageIndex: number): CanvasData {
  if (!hasPages(data)) return data
  const idx = Math.max(0, Math.min(pageIndex, data.pages!.length - 1))
  return {
    ...data,
    activePageIndex: idx,
    layers: data.pages![idx]?.layers ?? [],
  }
}

export function renamePage(data: CanvasData, pageIndex: number, name: string): CanvasData {
  if (!hasPages(data)) return data
  const pages = data.pages!.map((p, i) => (i === pageIndex ? { ...p, name } : p))
  return { ...data, pages }
}
