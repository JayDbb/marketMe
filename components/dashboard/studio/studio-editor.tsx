'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Undo2, Redo2, Layers, Wrench } from 'lucide-react'
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

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
  designName?: string
  onSaveCopyAs?: (formatId: InstagramFormatId) => void
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
  designName,
  onSaveCopyAs,
}: StudioEditorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedLayerId ?? null)
  const [toolTab, setToolTab] = useState<StudioToolTab>(
    initialSelectedLayerId ? 'text' : 'design'
  )
  const [toolsOpen, setToolsOpen] = useState(false)
  const [layersOpen, setLayersOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const layers = getActiveLayers(canvasData)
  const selectedLayer = layers.find((l) => l.id === selectedId)

  const patchLayers = useCallback(
    (nextLayers: CanvasNode[]) => {
      onChange(withActiveLayers(canvasData, nextLayers))
    },
    [canvasData, onChange]
  )

  const updateLayer = (updatedLayer: CanvasNode) => {
    patchLayers(layers.map((l) => (l.id === updatedLayer.id ? updatedLayer : l)))
  }

  const addLayer = useCallback(
    (layer: CanvasNode) => {
      patchLayers([...layers, layer])
      setSelectedId(layer.id)
      // Mobile tools live in a bottom sheet — close it so the user sees the new layer.
      if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
        setToolsOpen(false)
        setLayersOpen(false)
      }
    },
    [layers, patchLayers]
  )

  const deleteLayer = useCallback(
    (id: string) => {
      patchLayers(layers.filter((l) => l.id !== id))
      if (selectedId === id) setSelectedId(null)
    },
    [layers, patchLayers, selectedId]
  )

  const handleDuplicate = useCallback(
    (layer: CanvasNode) => {
      const copy = {
        ...layer,
        id: `${layer.type}-${Date.now()}`,
        zIndex: nextZIndex(layers),
      }
      addLayer(copy)
    },
    [addLayer, layers]
  )

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
  }, [selectedId, selectedLayer, onUndo, onRedo, deleteLayer, handleDuplicate])

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-2">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <StudioPageTabs canvasData={canvasData} onChange={onChange} />
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setToolsOpen(true)}
            className="inline-flex h-11 min-h-11 items-center justify-center gap-1.5 rounded-lg border border-sky-400/40 bg-sky-500/10 px-3 text-sky-200 hover:bg-sky-500/20 md:hidden"
            aria-label="Open tools"
          >
            <Wrench className="h-4 w-4" />
            <span className="text-xs font-semibold">Tools</span>
          </button>
          <button
            type="button"
            onClick={() => setLayersOpen(true)}
            className="inline-flex size-11 min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/10 text-white/70 hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Open layers"
          >
            <Layers className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="inline-flex size-11 min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-30"
            title="Undo (Ctrl+Z)"
            aria-label="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="inline-flex size-11 min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-30"
            title="Redo (Ctrl+Y)"
            aria-label="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        <div className="hidden w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-black/5 bg-zinc-50 shadow-xl md:flex dark:border-white/10 dark:bg-[#161b22]">
          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
            <StudioToolsPanel
              canvasData={canvasData}
              activeTab={toolTab}
              onTabChange={setToolTab}
              onCanvasChange={onChange}
              onFormatChange={handleFormatChange}
              onAddLayer={addLayer}
              onImageUpload={() => fileInputRef.current?.click()}
              brandKit={brandKit}
              onSaveCopyAs={onSaveCopyAs}
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

        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl border border-black/5 bg-zinc-100 p-2 sm:p-4 md:p-6 dark:border-white/10 dark:bg-black/40">
          <CanvasEditor
            canvasData={canvasData}
            onChange={(data) => patchLayers(data.layers)}
            selectedId={selectedId}
            maxWidth={560}
            onSelect={(id) => {
              setSelectedId(id)
              if (id) {
                const layer = layers.find((l) => l.id === id)
                if (layer?.type === 'text') setToolTab('text')
                else if (layer?.type === 'image') setToolTab('photos')
                else if (layer?.type === 'rect' || layer?.type === 'circle') setToolTab('elements')
                // Keep mobile canvas free; open tools only from the Tools button.
                if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) {
                  setToolsOpen(true)
                }
              }
            }}
            exportApiRef={exportApiRef}
            designName={designName}
          />
        </div>

        <div className="hidden w-64 shrink-0 flex-col overflow-hidden rounded-2xl border border-black/5 bg-zinc-50 shadow-xl md:flex dark:border-white/10 dark:bg-[#161b22]">
          <StudioLayersPanel
            canvasData={{ ...canvasData, layers }}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChange={(data) => patchLayers(data.layers)}
            onDeleteLayer={deleteLayer}
          />
        </div>
      </div>

      <Sheet open={toolsOpen} onOpenChange={setToolsOpen}>
        <SheetContent
          side="bottom"
          className="flex max-h-[85dvh] flex-col gap-0 border-border bg-zinc-50 p-0 dark:bg-[#161b22] data-[side=bottom]:h-[min(85dvh,40rem)] data-[side=bottom]:max-h-[85dvh] md:hidden"
        >
          <SheetHeader className="shrink-0 border-b border-border px-4 py-3 pr-14 text-left">
            <SheetTitle>Tools</SheetTitle>
          </SheetHeader>
          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y">
            <StudioToolsPanel
              canvasData={canvasData}
              activeTab={toolTab}
              onTabChange={setToolTab}
              onCanvasChange={onChange}
              onFormatChange={handleFormatChange}
              onAddLayer={addLayer}
              onImageUpload={() => {
                // Keep the sheet open until the file dialog returns — closing early
                // cancels the user gesture on iOS and makes Upload appear broken.
                fileInputRef.current?.click()
              }}
              brandKit={brandKit}
              onSaveCopyAs={onSaveCopyAs}
            />
            {selectedLayer ? (
              <div className="border-t border-black/8 dark:border-white/10">
                <StudioElementProperties
                  canvasData={canvasData}
                  selectedLayer={selectedLayer}
                  onUpdateLayer={updateLayer}
                  onDeleteLayer={deleteLayer}
                  onDuplicateLayer={handleDuplicate}
                />
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={layersOpen} onOpenChange={setLayersOpen}>
        <SheetContent
          side="bottom"
          className="flex max-h-[75dvh] flex-col gap-0 border-border bg-zinc-50 p-0 dark:bg-[#161b22] data-[side=bottom]:h-[min(75dvh,36rem)] data-[side=bottom]:max-h-[75dvh] md:hidden"
        >
          <SheetHeader className="shrink-0 border-b border-border px-4 py-3 pr-14 text-left">
            <SheetTitle>Layers</SheetTitle>
          </SheetHeader>
          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y">
            <StudioLayersPanel
              canvasData={{ ...canvasData, layers }}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id)
                setLayersOpen(false)
              }}
              onChange={(data) => patchLayers(data.layers)}
              onDeleteLayer={deleteLayer}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
