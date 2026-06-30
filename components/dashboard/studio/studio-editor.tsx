'use client'

import React, { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Undo2, Redo2 } from 'lucide-react'
import { CanvasData, CanvasNode, ImageNode } from '@/types/canvas'
import { StudioToolsPanel, type StudioToolTab } from './studio-tools-panel'
import { StudioElementProperties } from './studio-element-properties'
import { StudioLayersPanel } from './studio-layers-panel'
import { StudioPageTabs } from './studio-page-tabs'
import { getInstagramFormat, type InstagramFormatId } from '@/lib/instagram-formats'
import { nextZIndex, resizeCanvasData } from '@/lib/canvas-layer-utils'
import { getActiveLayers, withActiveLayers } from '@/lib/canvas-pages'
import type { StudioBrandKit } from '@/lib/studio-brand-kit'
import type { CanvasExportApi } from './canvas-editor'
import { Loader2 } from 'lucide-react'

const CanvasEditor = dynamic(
  () => import('./canvas-editor').then((m) => m.CanvasEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full min-h-[320px]">
        <Loader2 className="w-8 h-8 text-blue-400/60 animate-spin" />
      </div>
    ),
  }
)

interface StudioEditorProps {
  canvasData: CanvasData
  onChange: (data: CanvasData) => void
  brandKit?: StudioBrandKit
  canUndo?: boolean
  canRedo?: boolean
  onUndo?: () => void
  onRedo?: () => void
  exportApiRef?: React.MutableRefObject<CanvasExportApi | null>
  initialSelectedLayerId?: string
}

export function StudioEditor({
  canvasData,
  onChange,
  brandKit,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  exportApiRef,
  initialSelectedLayerId,
}: StudioEditorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedLayerId ?? null)
  const [toolTab, setToolTab] = useState<StudioToolTab>(
    initialSelectedLayerId ? 'text' : 'design'
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const layers = getActiveLayers(canvasData)
  const selectedLayer = layers.find((l) => l.id === selectedId)

  const patchLayers = (nextLayers: CanvasNode[]) => {
    onChange(withActiveLayers(canvasData, nextLayers))
  }

  const updateLayer = (updatedLayer: CanvasNode) => {
    patchLayers(layers.map((l) => (l.id === updatedLayer.id ? updatedLayer : l)))
  }

  const deleteLayer = (id: string) => {
    patchLayers(layers.filter((l) => l.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const addLayer = (layer: CanvasNode) => {
    patchLayers([...layers, layer])
    setSelectedId(layer.id)
  }

  const handleDuplicate = (layer: CanvasNode) => {
    const copy = { ...layer, id: `${layer.type}-${Date.now()}`, zIndex: nextZIndex(layers) }
    addLayer(copy)
  }

  const handleFormatChange = (formatId: InstagramFormatId) => {
    onChange(resizeCanvasData(canvasData, getInstagramFormat(formatId)))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const src = event.target?.result as string
      const img = new Image()
      img.onload = () => {
        const maxW = canvasData.canvas.width * 0.6
        let w = img.width
        let h = img.height
        if (w > maxW) {
          h = h * (maxW / w)
          w = maxW
        }

        const newLayer: ImageNode = {
          id: `img-${Date.now()}`,
          type: 'image',
          src,
          x: (canvasData.canvas.width - w) / 2,
          y: (canvasData.canvas.height - h) / 2,
          width: w,
          height: h,
          zIndex: nextZIndex(layers),
        }
        addLayer(newLayer)
        setToolTab('elements')
      }
      img.src = src
    }
    reader.readAsDataURL(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const mod = e.metaKey || e.ctrlKey

      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        onUndo?.()
        return
      }
      if ((mod && e.key === 'y') || (mod && e.shiftKey && e.key === 'z')) {
        e.preventDefault()
        onRedo?.()
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          e.preventDefault()
          deleteLayer(selectedId)
        }
        return
      }
      if (mod && e.key === 'd' && selectedLayer) {
        e.preventDefault()
        handleDuplicate(selectedLayer)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedId, selectedLayer, onUndo, onRedo, layers])

  return (
    <div className="w-full h-full min-h-0 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 shrink-0">
        <StudioPageTabs canvasData={canvasData} onChange={onChange} />
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        <div className="w-72 shrink-0 flex flex-col min-h-0 overflow-hidden bg-zinc-50/80 dark:bg-[#161b22]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl shadow-xl">
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <StudioToolsPanel
              canvasData={canvasData}
              activeTab={toolTab}
              onTabChange={setToolTab}
              onCanvasChange={onChange}
              onFormatChange={handleFormatChange}
              onAddLayer={addLayer}
              onImageUpload={() => fileInputRef.current?.click()}
              brandKit={brandKit}
            />

            {selectedLayer && (
              <div className="border-t border-black/8 dark:border-white/10">
                <StudioElementProperties
                  canvasData={canvasData}
                  selectedLayer={selectedLayer}
                  onUpdateLayer={updateLayer}
                  onDeleteLayer={deleteLayer}
                  onDuplicateLayer={handleDuplicate}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 bg-zinc-100 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden p-4 md:p-6 flex items-center justify-center min-h-0">
          <CanvasEditor
            canvasData={canvasData}
            onChange={(data) => patchLayers(data.layers)}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id)
              if (id) {
                const layer = layers.find((l) => l.id === id)
                if (layer?.type === 'text') setToolTab('text')
                else if (layer?.type === 'image') setToolTab('photos')
                else if (layer?.type === 'rect' || layer?.type === 'circle') setToolTab('elements')
              }
            }}
            exportApiRef={exportApiRef}
          />
        </div>

        <div className="w-64 shrink-0 flex flex-col bg-zinc-50/80 dark:bg-[#161b22]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl min-h-0">
          <StudioLayersPanel
            canvasData={{ ...canvasData, layers }}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChange={(data) => patchLayers(data.layers)}
            onDeleteLayer={deleteLayer}
          />
        </div>
      </div>
    </div>
  )
}
