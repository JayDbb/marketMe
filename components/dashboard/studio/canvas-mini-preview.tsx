'use client'

import type {
  CanvasData,
  CanvasNode,
  CircleNode,
  RectNode,
  TextNode,
  ImageNode,
} from '@/types/canvas'

interface CanvasMiniPreviewProps {
  canvasData: CanvasData
  className?: string
}

function fontWeightFromStyle(fontStyle?: string) {
  if (!fontStyle) return 'normal'
  return fontStyle.includes('bold') ? 'bold' : 'normal'
}

function fontStyleFromStyle(fontStyle?: string) {
  if (!fontStyle) return 'normal'
  return fontStyle.includes('italic') ? 'italic' : 'normal'
}

function renderTextLayer(node: TextNode) {
  const align = node.align ?? 'left'
  const boxWidth = node.width ?? 0
  const x =
    align === 'center'
      ? node.x + boxWidth / 2
      : align === 'right'
        ? node.x + boxWidth
        : node.x

  return (
    <text
      key={node.id}
      x={x}
      y={node.y + node.fontSize}
      fill={node.fill}
      fontSize={node.fontSize}
      fontFamily={node.fontFamily}
      fontWeight={fontWeightFromStyle(node.fontStyle)}
      fontStyle={fontStyleFromStyle(node.fontStyle)}
      textAnchor={align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start'}
      opacity={node.opacity ?? 1}
    >
      {node.content}
    </text>
  )
}

function renderRectLayer(node: RectNode) {
  const hasGradient = node.gradientColors && node.gradientColors.length >= 2
  const radius = Array.isArray(node.cornerRadius)
    ? node.cornerRadius[0]
    : node.cornerRadius ?? 0

  return (
    <rect
      key={node.id}
      x={node.x}
      y={node.y}
      width={node.width}
      height={node.height}
      fill={hasGradient ? `url(#grad-${node.id})` : node.fill ?? 'transparent'}
      rx={radius}
      ry={radius}
      opacity={node.opacity ?? 1}
    />
  )
}

function renderCircleLayer(node: CircleNode) {
  return (
    <ellipse
      key={node.id}
      cx={node.x + node.width / 2}
      cy={node.y + node.height / 2}
      rx={node.width / 2}
      ry={node.height / 2}
      fill={node.fill ?? 'transparent'}
      opacity={node.opacity ?? 1}
    />
  )
}

function renderImageLayer(node: ImageNode) {
  return (
    <image
      key={node.id}
      href={node.src}
      x={node.x}
      y={node.y}
      width={node.width}
      height={node.height}
      opacity={node.opacity ?? 1}
      preserveAspectRatio="xMidYMid slice"
    />
  )
}

function renderLayer(node: CanvasNode) {
  switch (node.type) {
    case 'text':
      return renderTextLayer(node)
    case 'rect':
      return renderRectLayer(node)
    case 'circle':
      return renderCircleLayer(node)
    case 'image':
      return renderImageLayer(node)
    default:
      return null
  }
}

function renderGradientDefs(layers: CanvasNode[]) {
  return layers
    .filter((l): l is RectNode => l.type === 'rect')
    .filter((l) => l.gradientColors && l.gradientColors.length >= 2)
    .map((node) => (
      <linearGradient key={node.id} id={`grad-${node.id}`} x1="0" y1="0" x2="0" y2="1">
        {node.gradientColors!.map((color, index) => (
          <stop
            key={index}
            offset={`${(index / (node.gradientColors!.length - 1)) * 100}%`}
            stopColor={color}
          />
        ))}
      </linearGradient>
    ))
}

export function CanvasMiniPreview({ canvasData, className }: CanvasMiniPreviewProps) {
  const { width, height, backgroundColor } = canvasData.canvas
  const layers = [...canvasData.layers].sort(
    (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)
  )
  const gradientDefs = renderGradientDefs(layers)

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg border border-white/10 shrink-0 ${className ?? ''}`}
      style={{
        aspectRatio: `${width} / ${height}`,
        backgroundColor,
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {gradientDefs.length > 0 && <defs>{gradientDefs}</defs>}
        {layers.map(renderLayer)}
      </svg>
    </div>
  )
}
