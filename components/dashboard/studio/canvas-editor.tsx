'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Text, Rect, Image as KonvaImage, Ellipse, Transformer } from 'react-konva'
import type Konva from 'konva'
import useImage from 'use-image'
import { ZoomIn, ZoomOut, Grid3X3, Smartphone, ImageDown } from 'lucide-react'
import { useIsClient } from '@/hooks/use-is-client'
import {
  CanvasData,
  TextNode,
  ImageNode,
  RectNode,
  CircleNode,
  CanvasNode as CanvasLayer,
} from '@/types/canvas'
import { INSTAGRAM_FORMATS } from '@/lib/instagram-formats'

interface CanvasEditorProps {
  canvasData: CanvasData
  onChange?: (data: CanvasData) => void
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  maxWidth?: number
  exportApiRef?: React.MutableRefObject<CanvasExportApi | null>
  /** Read-only embed (e.g. Generate review) — no toolbar clutter */
  variant?: 'editor' | 'preview'
}

export interface CanvasExportApi {
  getPreviewDataUrl: (format?: 'png' | 'jpeg') => string | null
}

function URLImage({
  imageNode,
  onSelect,
  onChange,
}: {
  imageNode: ImageNode
  onSelect?: (id: string | null) => void
  onChange?: (node: ImageNode) => void
}) {
  const [img] = useImage(imageNode.src, 'anonymous')
  const shapeRef = useRef<Konva.Image>(null)

  return (
    <KonvaImage
      id={imageNode.id}
      ref={shapeRef}
      x={imageNode.x}
      y={imageNode.y}
      width={imageNode.width}
      height={imageNode.height}
      rotation={imageNode.rotation || 0}
      scaleX={imageNode.scaleX || 1}
      scaleY={imageNode.scaleY || 1}
      opacity={imageNode.opacity ?? 1}
      image={img}
      cornerRadius={imageNode.cornerRadius as number}
      draggable={!!onChange && !imageNode.locked}
      onClick={() => onSelect?.(imageNode.id)}
      onTap={() => onSelect?.(imageNode.id)}
      onDragEnd={(e) => {
        onChange?.({ ...imageNode, x: e.target.x(), y: e.target.y() })
      }}
      onTransformEnd={() => {
        const node = shapeRef.current
        if (!node) return
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        node.scaleX(1)
        node.scaleY(1)
        onChange?.({
          ...imageNode,
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(5, node.height() * scaleY),
        })
      }}
    />
  )
}

function getSafeZone(canvas: CanvasData['canvas']) {
  const { width, height } = canvas
  if (height === 1920) {
    const zoneH = 1420
    return { x: 0, y: (height - zoneH) / 2, width, height: zoneH, label: 'Story safe zone' }
  }
  if (width === 1080 && height === 1350) {
    const margin = height * 0.1
    return {
      x: width * 0.05,
      y: margin,
      width: width * 0.9,
      height: height - margin * 2,
      label: 'Safe area (grid crop)',
    }
  }
  return null
}

export function CanvasEditor({
  canvasData,
  onChange,
  selectedId,
  onSelect,
  maxWidth = 520,
  exportApiRef,
  variant = 'editor',
}: CanvasEditorProps) {
  const isPreview = variant === 'preview'
  const mounted = useIsClient()
  const stageRef = useRef<Konva.Stage>(null)
  const trRef = useRef<Konva.Transformer>(null)
  const [zoom, setZoom] = useState(1)
  const [showGuides, setShowGuides] = useState(!isPreview)
  const [showFeedMockup, setShowFeedMockup] = useState(false)

  const captureDataUrl = (format: 'png' | 'jpeg' = 'png') => {
    const stage = stageRef.current
    if (!stage) return null
    onSelect?.(null)
    return stage.toDataURL({
      pixelRatio: format === 'jpeg' ? 1 : 2,
      mimeType: format === 'jpeg' ? 'image/jpeg' : 'image/png',
      quality: format === 'jpeg' ? 0.92 : undefined,
    })
  }

  useEffect(() => {
    if (!exportApiRef) return
    exportApiRef.current = {
      getPreviewDataUrl: (format = 'png') => captureDataUrl(format),
    }
  })

  useEffect(() => {
    const transformer = trRef.current
    const stage = stageRef.current
    if (selectedId && transformer && stage) {
      const selectedNode = stage.findOne(`#${selectedId}`)
      const layer = canvasData.layers.find((l) => l.id === selectedId)
      if (selectedNode && !layer?.locked) {
        transformer.nodes([selectedNode])
        transformer.getLayer()?.batchDraw()
      } else {
        transformer.nodes([])
      }
    } else if (transformer) {
      transformer.nodes([])
    }
  }, [selectedId, canvasData])

  if (!mounted) return null

  const handleExport = (format: 'png' | 'jpeg') => {
    setTimeout(() => {
      const dataURL = captureDataUrl(format)
      if (!dataURL) return
      const link = document.createElement('a')
      link.download = format === 'jpeg' ? 'instagram-post.jpg' : 'instagram-post.png'
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }, 100)
  }

  const baseScale =
    canvasData.canvas.width > maxWidth ? maxWidth / canvasData.canvas.width : 1.0
  const scale = baseScale * zoom
  const safeZone = showGuides ? getSafeZone(canvasData.canvas) : null

  const formatLabel =
    INSTAGRAM_FORMATS.find(
      (f) => f.width === canvasData.canvas.width && f.height === canvasData.canvas.height
    )?.label ?? `${canvasData.canvas.width}×${canvasData.canvas.height}`

  const handleNodeChange = (updatedNode: CanvasLayer) => {
    if (!onChange) return
    onChange({
      ...canvasData,
      layers: canvasData.layers.map((layer) =>
        layer.id === updatedNode.id ? updatedNode : layer
      ),
    })
  }

  const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.id() === 'bg-rect'
    if (clickedOnEmpty) onSelect?.(null)
  }

  const renderRect = (rectNode: RectNode) => {
    const hasGradient = rectNode.gradientColors && rectNode.gradientColors.length >= 2
    return (
      <Rect
        key={rectNode.id}
        id={rectNode.id}
        x={rectNode.x}
        y={rectNode.y}
        width={rectNode.width}
        height={rectNode.height}
        fill={hasGradient ? undefined : rectNode.fill}
        fillLinearGradientStartPoint={hasGradient ? { x: 0, y: 0 } : undefined}
        fillLinearGradientEndPoint={
          hasGradient ? { x: 0, y: rectNode.height } : undefined
        }
        fillLinearGradientColorStops={
          hasGradient
            ? [0, rectNode.gradientColors![0], 1, rectNode.gradientColors![1]]
            : undefined
        }
        stroke={rectNode.stroke}
        strokeWidth={rectNode.strokeWidth}
        cornerRadius={rectNode.cornerRadius as number}
        rotation={rectNode.rotation || 0}
        scaleX={rectNode.scaleX || 1}
        scaleY={rectNode.scaleY || 1}
        opacity={rectNode.opacity ?? 1}
        draggable={!!onChange && !rectNode.locked}
        onClick={() => onSelect?.(rectNode.id)}
        onTap={() => onSelect?.(rectNode.id)}
        onDragEnd={(e) => {
          handleNodeChange({ ...rectNode, x: e.target.x(), y: e.target.y() })
        }}
        onTransformEnd={(e) => {
          const node = e.target
          const scaleX = node.scaleX()
          const scaleY = node.scaleY()
          node.scaleX(1)
          node.scaleY(1)
          handleNodeChange({
            ...rectNode,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          })
        }}
      />
    )
  }

  const renderCircle = (circleNode: CircleNode) => (
    <Ellipse
      key={circleNode.id}
      id={circleNode.id}
      x={circleNode.x + circleNode.width / 2}
      y={circleNode.y + circleNode.height / 2}
      radiusX={circleNode.width / 2}
      radiusY={circleNode.height / 2}
      fill={circleNode.fill}
      stroke={circleNode.stroke}
      strokeWidth={circleNode.strokeWidth}
      rotation={circleNode.rotation || 0}
      scaleX={circleNode.scaleX || 1}
      scaleY={circleNode.scaleY || 1}
      opacity={circleNode.opacity ?? 1}
      draggable={!!onChange && !circleNode.locked}
      onClick={() => onSelect?.(circleNode.id)}
      onTap={() => onSelect?.(circleNode.id)}
      onDragEnd={(e) => {
        const node = e.target
        handleNodeChange({
          ...circleNode,
          x: node.x() - circleNode.width / 2,
          y: node.y() - circleNode.height / 2,
        })
      }}
      onTransformEnd={(e) => {
        const node = e.target
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        node.scaleX(1)
        node.scaleY(1)
        const newW = Math.max(10, circleNode.width * scaleX)
        const newH = Math.max(10, circleNode.height * scaleY)
        handleNodeChange({
          ...circleNode,
          x: node.x() - newW / 2,
          y: node.y() - newH / 2,
          width: newW,
          height: newH,
          rotation: node.rotation(),
        })
      }}
    />
  )

  return (
    <div className="flex flex-col items-center gap-3 w-full h-full min-h-0">
      {isPreview ? (
        <div className="w-full flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-white/50">
            {formatLabel}
            <span className="text-zinc-300 dark:text-white/20">·</span>
            {canvasData.canvas.width}×{canvasData.canvas.height}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-full shrink-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-zinc-500 dark:text-white/40 uppercase tracking-wider">
              {formatLabel}
            </h3>
            <p className="text-[10px] text-zinc-400 dark:text-white/30">
              {canvasData.canvas.width} × {canvasData.canvas.height}px
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setShowFeedMockup((v) => !v)}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                showFeedMockup
                  ? 'border-blue-500/40 bg-blue-500/15 text-blue-400'
                  : 'border-black/10 dark:border-white/10 text-zinc-500'
              }`}
              title="Feed preview mockup"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowGuides((v) => !v)}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                showGuides
                  ? 'border-blue-500/40 bg-blue-500/15 text-blue-400'
                  : 'border-black/10 dark:border-white/10 text-zinc-500'
              }`}
              title="Toggle safe zone guides"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
              className="w-8 h-8 rounded-lg border border-black/10 dark:border-white/10 flex items-center justify-center text-zinc-500 hover:text-blue-400"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-zinc-500 dark:text-white/40 w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
              className="w-8 h-8 rounded-lg border border-black/10 dark:border-white/10 flex items-center justify-center text-zinc-500 hover:text-blue-400"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleExport('png')}
              className="ml-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg flex items-center gap-1"
            >
              <ImageDown className="w-3 h-3" />
              PNG
            </button>
            <button
              onClick={() => handleExport('jpeg')}
              className="px-2.5 py-1.5 border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            >
              JPG
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-auto w-full flex items-center justify-center custom-scrollbar">
        <div
          className={`relative shrink-0 transition-all ${
            showFeedMockup ? 'p-4 rounded-[2rem] bg-zinc-900 border-4 border-zinc-800 shadow-2xl' : ''
          }`}
        >
          {showFeedMockup && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-zinc-700 z-10 pointer-events-none" />
          )}
          <div className="bg-white dark:bg-[#161b22] border border-black/5 dark:border-white/10 overflow-hidden shadow-2xl rounded-xl shrink-0">
          <Stage
            width={canvasData.canvas.width * scale}
            height={canvasData.canvas.height * scale}
            scale={{ x: scale, y: scale }}
            ref={stageRef}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
          >
            <Layer>
              <Rect
                id="bg-rect"
                x={0}
                y={0}
                width={canvasData.canvas.width}
                height={canvasData.canvas.height}
                fill={canvasData.canvas.backgroundColor}
              />
            </Layer>

            <Layer>
              {canvasData.layers
                .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                .map((node) => {
                  if (node.type === 'text') {
                    const textNode = node as TextNode
                    return (
                      <Text
                        key={textNode.id}
                        id={textNode.id}
                        x={textNode.x}
                        y={textNode.y}
                        text={textNode.content}
                        fontSize={textNode.fontSize}
                        fontFamily={textNode.fontFamily}
                        fontStyle={textNode.fontStyle ?? 'normal'}
                        fill={textNode.fill}
                        align={textNode.align || 'left'}
                        width={textNode.width}
                        lineHeight={textNode.lineHeight}
                        rotation={textNode.rotation || 0}
                        scaleX={textNode.scaleX || 1}
                        scaleY={textNode.scaleY || 1}
                        opacity={textNode.opacity ?? 1}
                        draggable={!!onChange && !textNode.locked}
                        onClick={() => onSelect?.(textNode.id)}
                        onTap={() => onSelect?.(textNode.id)}
                        onDragEnd={(e) => {
                          handleNodeChange({
                            ...textNode,
                            x: e.target.x(),
                            y: e.target.y(),
                          })
                        }}
                        onTransformEnd={(e) => {
                          const shape = e.target
                          handleNodeChange({
                            ...textNode,
                            x: shape.x(),
                            y: shape.y(),
                            rotation: shape.rotation(),
                            scaleX: shape.scaleX(),
                            scaleY: shape.scaleY(),
                          })
                        }}
                      />
                    )
                  }

                  if (node.type === 'image') {
                    return (
                      <URLImage
                        key={node.id}
                        imageNode={node as ImageNode}
                        onSelect={onSelect}
                        onChange={handleNodeChange}
                      />
                    )
                  }

                  if (node.type === 'rect') return renderRect(node as RectNode)
                  if (node.type === 'circle') return renderCircle(node as CircleNode)
                  return null
                })}

              {onChange && (
                <Transformer
                  ref={trRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 5 || newBox.height < 5) return oldBox
                    return newBox
                  }}
                />
              )}
            </Layer>

            {safeZone && (
              <Layer listening={false}>
                <Rect
                  x={safeZone.x}
                  y={safeZone.y}
                  width={safeZone.width}
                  height={safeZone.height}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dash={[12, 8]}
                  opacity={0.7}
                />
              </Layer>
            )}
          </Stage>
          </div>
          {showFeedMockup && (
            <div className="mt-3 px-2 flex items-center gap-2 pointer-events-none">
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-purple-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-white/90 truncate">your_brand</p>
                <p className="text-[9px] text-white/40">Feed preview</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {safeZone && !isPreview && (
        <p className="text-[10px] text-blue-400/70 text-center shrink-0">
          {safeZone.label} — keep headlines and faces inside the dashed area
        </p>
      )}
    </div>
  )
}
