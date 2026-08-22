import type { CanvasData, CanvasNode, ImageNode, TextNode } from '@/types/canvas'
import type { InstagramFormat } from '@/lib/instagram-formats'

export function nextZIndex(layers: CanvasNode[]): number {
  return Math.max(0, ...layers.map((l) => l.zIndex || 0)) + 1
}

export function duplicateLayer(layer: CanvasNode): CanvasNode {
  return {
    ...JSON.parse(JSON.stringify(layer)),
    id: `${layer.type}-${Date.now()}`,
    x: layer.x + 24,
    y: layer.y + 24,
    zIndex: (layer.zIndex || 0) + 1,
  }
}

export function resizeCanvasData(data: CanvasData, format: InstagramFormat): CanvasData {
  const oldW = data.canvas.width
  const oldH = data.canvas.height
  if (oldW === format.width && oldH === format.height) {
    return {
      ...data,
      canvas: {
        ...data.canvas,
        width: format.width,
        height: format.height,
        aspectRatioName: format.aspectRatioName,
      },
    }
  }

  const scaleX = format.width / oldW
  const scaleY = format.height / oldH
  // When width is unchanged (all Instagram presets are 1080px), scale text by height
  // so switching portrait ↔ square is reversible. Using min(scaleX, scaleY) only
  // shrinks text and never restores it when height increases again.
  const fontScale =
    Math.abs(scaleX - 1) < 0.001 ? scaleY : Math.abs(scaleY - 1) < 0.001 ? scaleX : Math.min(scaleX, scaleY)

  const scaleLayers = (layers: CanvasNode[]) =>
    layers.map((layer) => {
      const scaled = {
        ...layer,
        x: layer.x * scaleX,
        y: layer.y * scaleY,
      }

      if (layer.type === 'text') {
        const text = scaled as TextNode
        text.fontSize = Math.max(8, Math.round(text.fontSize * fontScale))
        if (text.width) text.width = text.width * scaleX
        // Reset transform scale so fontSize stays the single source of truth
        text.scaleX = 1
        text.scaleY = 1
      }

      if (layer.type === 'image' || layer.type === 'rect' || layer.type === 'circle') {
        const sized = scaled as ImageNode
        if (sized.width) sized.width = sized.width * scaleX
        if (sized.height) sized.height = sized.height * scaleY
      }

      return scaled
    })

  const layers = scaleLayers(data.layers)

  const next: CanvasData = {
    ...data,
    canvas: {
      ...data.canvas,
      width: format.width,
      height: format.height,
      aspectRatioName: format.aspectRatioName,
    },
    layers,
  }

  if (data.pages?.length) {
    next.pages = data.pages.map((page) => ({
      ...page,
      layers: scaleLayers(page.layers),
    }))
    const idx = data.activePageIndex ?? 0
    next.layers = next.pages[idx]?.layers ?? layers
  }

  return next
}

export function alignLayerToCanvas(
  layer: CanvasNode,
  canvas: CanvasData['canvas'],
  alignment: 'center' | 'center-h' | 'center-v'
): CanvasNode {
  const w = 'width' in layer ? (layer.width as number) : 0
  const h = 'height' in layer ? (layer.height as number) : 0
  const boxW = w
  const boxH = h

  let x = layer.x
  let y = layer.y

  if (alignment === 'center' || alignment === 'center-h') {
    x = (canvas.width - boxW) / 2
  }
  if (alignment === 'center' || alignment === 'center-v') {
    y = (canvas.height - boxH) / 2
  }

  return { ...layer, x, y }
}

export function fitImageToCanvas(layer: ImageNode, canvas: CanvasData['canvas']): ImageNode {
  return {
    ...layer,
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
  }
}

export function moveLayer(layers: CanvasNode[], id: string, direction: 'up' | 'down'): CanvasNode[] {
  const sorted = [...layers].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
  sorted.forEach((l, i) => {
    l.zIndex = i + 1
  })

  const idx = sorted.findIndex((l) => l.id === id)
  if (idx < 0) return layers

  if (direction === 'up' && idx < sorted.length - 1) {
    ;[sorted[idx], sorted[idx + 1]] = [sorted[idx + 1], sorted[idx]]
  } else if (direction === 'down' && idx > 0) {
    ;[sorted[idx], sorted[idx - 1]] = [sorted[idx - 1], sorted[idx]]
  }

  sorted.forEach((l, i) => {
    l.zIndex = i + 1
  })

  return sorted
}
