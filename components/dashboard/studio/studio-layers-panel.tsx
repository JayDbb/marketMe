'use client'

import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Type,
  Square,
  Circle,
  Image as ImageIcon,
} from 'lucide-react'
import type { CanvasData, CanvasNode, TextNode } from '@/types/canvas'
import { moveLayer } from '@/lib/canvas-layer-utils'

interface StudioLayersPanelProps {
  canvasData: CanvasData
  selectedId: string | null
  onSelect: (id: string | null) => void
  onChange: (data: CanvasData) => void
  onDeleteLayer: (id: string) => void
}

export function StudioLayersPanel({
  canvasData,
  selectedId,
  onSelect,
  onChange,
  onDeleteLayer,
}: StudioLayersPanelProps) {
  const handleMove = (id: string, direction: 'up' | 'down') => {
    onChange({
      ...canvasData,
      layers: moveLayer(canvasData.layers, id, direction),
    })
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-4 border-b border-black/5 dark:border-white/5 shrink-0">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Layers</h3>
        <p className="text-[10px] text-zinc-500 dark:text-white/40 mt-0.5">
          Top to bottom · front to back
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-0">
        {canvasData.layers.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-white/35 text-center py-8 px-2">
            No layers yet. Add elements from the tools panel.
          </p>
        ) : (
          [...canvasData.layers]
            .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
            .map((layer) => (
              <LayerRow
                key={layer.id}
                layer={layer}
                selected={selectedId === layer.id}
                onSelect={() => onSelect(layer.id)}
                onMoveUp={() => handleMove(layer.id, 'up')}
                onMoveDown={() => handleMove(layer.id, 'down')}
                onDelete={() => onDeleteLayer(layer.id)}
              />
            ))
        )}
      </div>
    </div>
  )
}

function LayerRow({
  layer,
  selected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  layer: CanvasNode
  selected: boolean
  onSelect: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}) {
  const Icon =
    layer.type === 'text'
      ? Type
      : layer.type === 'image'
        ? ImageIcon
        : layer.type === 'circle'
          ? Circle
          : Square

  const label =
    layer.type === 'text'
      ? (layer as TextNode).content.slice(0, 40) +
        ((layer as TextNode).content.length > 40 ? '…' : '')
      : layer.type === 'image'
        ? layer.id === 'photo' || layer.id === 'bg-image'
          ? 'Photo'
          : 'Image'
        : layer.type === 'circle'
          ? 'Circle'
          : layer.id === 'overlay'
            ? 'Overlay'
            : 'Shape'

  return (
    <div
      onClick={onSelect}
      className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer border transition-colors ${
        selected
          ? 'bg-white dark:bg-white/10 border-black/10 dark:border-white/20 shadow-sm'
          : 'bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden min-w-0">
        <Icon className="w-4 h-4 text-zinc-500 dark:text-white/50 shrink-0" />
        <span className="text-xs text-zinc-900 dark:text-white truncate">{label}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <div className="flex flex-col">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onMoveUp()
            }}
            className="text-zinc-500 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white"
            aria-label="Move layer up"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onMoveDown()
            }}
            className="text-zinc-500 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white"
            aria-label="Move layer down"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="w-6 h-6 flex items-center justify-center text-red-400 hover:bg-red-500/20 rounded-md"
          aria-label="Delete layer"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
