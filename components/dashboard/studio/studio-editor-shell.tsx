'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { ChevronLeft, Save, Sparkles, Loader2, Cloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StudioEditor } from './studio-editor'
import type { CanvasData } from '@/types/canvas'
import type { StudioTemplate } from '@/app/dashboard/studio/actions'
import {
  saveCanvasTemplateAction,
  updateCanvasTemplateAction,
} from '@/app/dashboard/studio/actions'
import { previewUrlFromCanvas } from '@/lib/studio-utils'
import { useCanvasHistory } from '@/hooks/use-canvas-history'
import type { StudioBrandKit } from '@/lib/studio-brand-kit'
import type { CanvasExportApi } from './canvas-editor'
import { toast } from 'sonner'
import { useIsClient } from '@/hooks/use-is-client'

interface StudioEditorShellProps {
  initialData: CanvasData
  template: StudioTemplate | null
  initialName?: string
  initialCategory?: string
  initialSelectedLayerId?: string
  brandKit?: StudioBrandKit
  onBack: () => void
  onSaved: (template: StudioTemplate, canvasData: CanvasData) => void
}

export function StudioEditorShell({
  initialData,
  template,
  initialName,
  initialCategory,
  initialSelectedLayerId,
  brandKit,
  onBack,
  onSaved,
}: StudioEditorShellProps) {
  const {
    canvasData,
    push,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCanvasHistory(initialData)

  const [name, setName] = useState(template?.name ?? initialName ?? 'Untitled design')
  const [savedTemplate, setSavedTemplate] = useState<StudioTemplate | null>(template)
  const [isSaving, setIsSaving] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const mounted = useIsClient()
  const templateIdRef = useRef<string | undefined>(template?.id)
  const exportApiRef = useRef<CanvasExportApi | null>(null)
  const canvasDataRef = useRef(canvasData)
  const nameRef = useRef(name)

  useEffect(() => {
    canvasDataRef.current = canvasData
    nameRef.current = name
  }, [canvasData, name])

  useEffect(() => {
    templateIdRef.current = savedTemplate?.id ?? template?.id
  }, [savedTemplate?.id, template?.id])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const activeTemplateId = savedTemplate?.id ?? template?.id

  const resolvePreviewUrl = useCallback(() => {
    const rendered = exportApiRef.current?.getPreviewDataUrl('jpeg')
    if (rendered) return rendered
    return previewUrlFromCanvas(canvasDataRef.current)
  }, [])

  const persist = useCallback(
    async (silent = false) => {
      const trimmedName = nameRef.current.trim()
      if (!trimmedName) {
        if (!silent) toast.error('Please enter a design name')
        return false
      }

      if (!silent) setIsSaving(true)
      else setAutoSaveStatus('saving')

      const previewUrl = resolvePreviewUrl()
      const templateId = templateIdRef.current ?? savedTemplate?.id
      const data = canvasDataRef.current

      const result = templateId
        ? await updateCanvasTemplateAction(templateId, {
            name: trimmedName,
            category: savedTemplate?.category ?? template?.category ?? 'Other',
            canvasData: data,
            previewUrl,
          })
        : await saveCanvasTemplateAction({
            name: trimmedName,
            category: template?.category ?? initialCategory ?? 'Other',
            canvasData: data,
            previewUrl,
          })

      if (!silent) setIsSaving(false)
      else setAutoSaveStatus('idle')

      if (!result.success || !result.template) {
        if (!silent) toast.error(result.error ?? 'Failed to save design')
        return false
      }

      templateIdRef.current = result.template.id
      setSavedTemplate(result.template)

      if (silent) {
        setAutoSaveStatus('saved')
        setTimeout(() => setAutoSaveStatus('idle'), 2000)
      } else {
        toast.success(templateId ? 'Design updated' : 'Design saved')
      }

      onSaved(result.template, data)
      return true
    },
    [savedTemplate, template, initialCategory, onSaved, resolvePreviewUrl]
  )

  const handleSave = () => void persist(false)

  useEffect(() => {
    if (!activeTemplateId) return

    const interval = setInterval(() => {
      void persist(true)
    }, 30_000)

    return () => clearInterval(interval)
  }, [persist, activeTemplateId])

  const handleChange = (data: CanvasData) => {
    push(data)
  }

  const shell = (
    <div className="fixed inset-0 z-[100] bg-[#0d1117] flex flex-col isolate">
      <div className="shrink-0 flex items-center gap-4 px-4 sm:px-6 py-3 border-b border-white/8 bg-[#0d1117]/95 backdrop-blur-xl">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-blue-400/80 font-medium mb-0.5">
            Studio Editor
          </p>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 max-w-xs bg-white/5 border-white/10 text-white font-semibold rounded-lg text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          {autoSaveStatus === 'saving' && (
            <span className="text-[10px] text-white/40 flex items-center gap-1">
              <Cloud className="w-3 h-3 animate-pulse" />
              Auto-saving…
            </span>
          )}
          {autoSaveStatus === 'saved' && (
            <span className="text-[10px] text-emerald-400/80 flex items-center gap-1">
              <Cloud className="w-3 h-3" />
              Saved
            </span>
          )}
          {activeTemplateId ? (
            <Link
              href={`/dashboard/generate?templateId=${activeTemplateId}`}
              className="h-9 px-4 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-sm font-medium flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Use in Generate
            </Link>
          ) : null}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-9 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving…' : 'Save design'}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden p-4 md:p-6">
        <StudioEditor
          canvasData={canvasData}
          onChange={handleChange}
          brandKit={brandKit}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          exportApiRef={exportApiRef}
          initialSelectedLayerId={initialSelectedLayerId}
        />
      </div>
    </div>
  )

  if (!mounted) return null
  return createPortal(shell, document.body)
}
