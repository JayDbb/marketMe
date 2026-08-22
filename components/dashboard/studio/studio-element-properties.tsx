'use client'

import {
  AlignCenter,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Type,
  Image as ImageIcon,
  Square,
} from 'lucide-react'
import type { CanvasData, CanvasNode, CircleNode, ImageNode, RectNode, TextNode } from '@/types/canvas'
import { STUDIO_FONT_FAMILIES } from '@/lib/instagram-formats'
import { alignLayerToCanvas, duplicateLayer, fitImageToCanvas } from '@/lib/canvas-layer-utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface StudioElementPropertiesProps {
  canvasData: CanvasData
  selectedLayer: CanvasNode | undefined
  onUpdateLayer: (layer: CanvasNode) => void
  onDeleteLayer: (id: string) => void
  onDuplicateLayer: (layer: CanvasNode) => void
}

const LAYER_LABELS: Record<CanvasNode['type'], { label: string; icon: React.ElementType }> = {
  text: { label: 'Edit text', icon: Type },
  image: { label: 'Edit image', icon: ImageIcon },
  rect: { label: 'Edit shape', icon: Square },
  circle: { label: 'Edit shape', icon: Square },
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-[11px] font-medium text-zinc-600 dark:text-white/50 mb-2 block">
      {children}
    </Label>
  )
}

export function StudioElementProperties({
  canvasData,
  selectedLayer,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
}: StudioElementPropertiesProps) {
  if (!selectedLayer) return null

  const meta = LAYER_LABELS[selectedLayer.type]
  const LayerIcon = meta.icon

  const align = (mode: 'center' | 'center-h' | 'center-v') => {
    onUpdateLayer(alignLayerToCanvas(selectedLayer, canvasData.canvas, mode))
  }

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-[1] flex items-center justify-between gap-2 px-4 py-3 bg-zinc-100/90 dark:bg-[#1c2128]/95 backdrop-blur-sm border-b border-black/5 dark:border-white/8">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <LayerIcon className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <h4 className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
            {meta.label}
          </h4>
        </div>
        <div className="flex gap-0.5 shrink-0">
          <IconAction
            onClick={() => onUpdateLayer({ ...selectedLayer, locked: !selectedLayer.locked })}
            active={selectedLayer.locked}
            activeClass="text-amber-400 bg-amber-500/10"
            title={selectedLayer.locked ? 'Unlock layer' : 'Lock layer'}
          >
            {selectedLayer.locked ? (
              <Lock className="w-3.5 h-3.5" />
            ) : (
              <Unlock className="w-3.5 h-3.5" />
            )}
          </IconAction>
          <IconAction
            onClick={() => onDuplicateLayer(duplicateLayer(selectedLayer))}
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </IconAction>
          <IconAction
            onClick={() => onDeleteLayer(selectedLayer.id)}
            title="Delete"
            className="hover:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </IconAction>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {selectedLayer.type === 'text' && (
          <TextProperties layer={selectedLayer as TextNode} onUpdate={onUpdateLayer} />
        )}

        {selectedLayer.type === 'image' && (
          <ImageProperties
            layer={selectedLayer as ImageNode}
            canvas={canvasData.canvas}
            onUpdate={onUpdateLayer}
          />
        )}

        {(selectedLayer.type === 'rect' || selectedLayer.type === 'circle') && (
          <ShapeProperties
            layer={selectedLayer as RectNode | CircleNode}
            onUpdate={onUpdateLayer}
          />
        )}

        <div className="rounded-xl border border-black/5 dark:border-white/8 bg-white/60 dark:bg-white/[0.02] p-3 space-y-2">
          <SectionLabel>Position on canvas</SectionLabel>
          <div className="flex gap-1">
            <AlignButton onClick={() => align('center-h')} title="Center horizontally">
              <AlignHorizontalJustifyCenter className="w-3.5 h-3.5" />
            </AlignButton>
            <AlignButton onClick={() => align('center-v')} title="Center vertically">
              <AlignVerticalJustifyCenter className="w-3.5 h-3.5" />
            </AlignButton>
            <AlignButton onClick={() => align('center')} title="Center on canvas">
              <AlignCenter className="w-3.5 h-3.5" />
            </AlignButton>
          </div>
        </div>

        <OpacityControl layer={selectedLayer} onUpdate={onUpdateLayer} />
      </div>
    </div>
  )
}

function IconAction({
  children,
  onClick,
  title,
  active,
  activeClass,
  className,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  active?: boolean
  activeClass?: string
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 dark:text-white/45 hover:text-blue-400 hover:bg-blue-500/10 transition-colors ${
        active ? activeClass : ''
      } ${className ?? ''}`}
    >
      {children}
    </button>
  )
}

function AlignButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="flex-1 h-9 rounded-lg border border-black/5 dark:border-white/10 flex items-center justify-center text-zinc-500 dark:text-white/50 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5 transition-colors"
    >
      {children}
    </button>
  )
}

function TextProperties({
  layer,
  onUpdate,
}: {
  layer: TextNode
  onUpdate: (l: CanvasNode) => void
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <SectionLabel>Content</SectionLabel>
        <textarea
          value={layer.content}
          onChange={(e) => onUpdate({ ...layer, content: e.target.value })}
          rows={3}
          placeholder="Type your text…"
          className="w-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-white px-3 py-2.5 rounded-xl resize-y text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2 min-w-0 col-span-2">
          <SectionLabel>Font</SectionLabel>
          <select
            value={layer.fontFamily}
            onChange={(e) => onUpdate({ ...layer, fontFamily: e.target.value })}
            className="w-full h-9 px-3 rounded-xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-sm text-zinc-900 dark:text-white"
          >
            {STUDIO_FONT_FAMILIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 min-w-0">
          <SectionLabel>Size</SectionLabel>
          <Input
            type="number"
            min={8}
            value={layer.fontSize}
            onChange={(e) => onUpdate({ ...layer, fontSize: Number(e.target.value) })}
            className="w-full min-w-0 h-9 bg-white dark:bg-white/5 border-black/5 dark:border-white/10 text-zinc-900 dark:text-white"
          />
        </div>
        <div className="space-y-2 min-w-0">
          <SectionLabel>Weight</SectionLabel>
          <select
            value={layer.fontStyle ?? 'normal'}
            onChange={(e) =>
              onUpdate({ ...layer, fontStyle: e.target.value as TextNode['fontStyle'] })
            }
            className="w-full h-9 px-2 rounded-xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-sm text-zinc-900 dark:text-white"
          >
            <option value="normal">Regular</option>
            <option value="bold">Bold</option>
            <option value="italic">Italic</option>
            <option value="bold italic">Bold italic</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel>Alignment</SectionLabel>
        <div className="flex gap-1 p-1 rounded-xl bg-zinc-100/80 dark:bg-white/[0.04] border border-black/5 dark:border-white/8">
          {(['left', 'center', 'right'] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => onUpdate({ ...layer, align: a })}
              className={`flex-1 h-8 rounded-lg text-xs font-medium capitalize transition-colors ${
                (layer.align ?? 'left') === a
                  ? 'bg-white dark:bg-white/10 text-blue-500 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 dark:text-white/45 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <ColorField
        label="Text color"
        value={layer.fill}
        onChange={(fill) => onUpdate({ ...layer, fill })}
      />
    </div>
  )
}

function ImageProperties({
  layer,
  canvas,
  onUpdate,
}: {
  layer: ImageNode
  canvas: CanvasData['canvas']
  onUpdate: (l: CanvasNode) => void
}) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => onUpdate(fitImageToCanvas(layer, canvas))}
        className="w-full h-9 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold hover:bg-blue-500/15"
      >
        Fill canvas (cover)
      </button>
      <div className="space-y-2">
        <SectionLabel>Corner radius</SectionLabel>
        <Input
          type="number"
          value={(layer.cornerRadius as number) || 0}
          onChange={(e) => onUpdate({ ...layer, cornerRadius: Number(e.target.value) })}
          className="h-9 bg-white dark:bg-white/5 border-black/5 dark:border-white/10 text-zinc-900 dark:text-white"
        />
      </div>
    </div>
  )
}

function ShapeProperties({
  layer,
  onUpdate,
}: {
  layer: RectNode | CircleNode
  onUpdate: (l: CanvasNode) => void
}) {
  return (
    <div className="space-y-4">
      <ColorField
        label="Fill"
        value={(layer.fill as string) || '#3b82f6'}
        onChange={(fill) => onUpdate({ ...layer, fill })}
      />
      {layer.type === 'rect' && (
        <div className="space-y-2">
          <SectionLabel>Corner radius</SectionLabel>
          <Input
            type="number"
            value={(layer.cornerRadius as number) || 0}
            onChange={(e) => onUpdate({ ...layer, cornerRadius: Number(e.target.value) })}
            className="h-9 bg-white dark:bg-white/5 border-black/5 dark:border-white/10 text-zinc-900 dark:text-white"
          />
        </div>
      )}
      <ColorField
        label="Stroke"
        value={(layer.stroke as string) || '#000000'}
        onChange={(stroke) => onUpdate({ ...layer, stroke, strokeWidth: layer.strokeWidth ?? 2 })}
      />
      <div className="space-y-2">
        <SectionLabel>Stroke width</SectionLabel>
        <Input
          type="number"
          min={0}
          value={layer.strokeWidth ?? 0}
          onChange={(e) => onUpdate({ ...layer, strokeWidth: Number(e.target.value) })}
          className="h-9 bg-white dark:bg-white/5 border-black/5 dark:border-white/10 text-zinc-900 dark:text-white"
        />
      </div>
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      <SectionLabel>{label}</SectionLabel>
      <div className="flex gap-2">
        <input
          type="color"
          value={value.startsWith('#') ? value : '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg bg-transparent border border-black/5 dark:border-white/10 cursor-pointer shrink-0"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 bg-white dark:bg-white/5 border-black/5 dark:border-white/10 text-zinc-900 dark:text-white font-mono text-xs"
        />
      </div>
    </div>
  )
}

function OpacityControl({
  layer,
  onUpdate,
}: {
  layer: CanvasNode
  onUpdate: (l: CanvasNode) => void
}) {
  return (
    <div className="space-y-2 pt-1">
      <div className="flex justify-between items-center">
        <SectionLabel>Opacity</SectionLabel>
        <span className="text-[11px] font-mono text-zinc-500 dark:text-white/45">
          {Math.round((layer.opacity ?? 1) * 100)}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={layer.opacity ?? 1}
        onChange={(e) => onUpdate({ ...layer, opacity: Number(e.target.value) })}
        className="w-full accent-blue-500"
      />
    </div>
  )
}
