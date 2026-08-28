'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Save, Sparkles, Loader2, Cloud, ImageDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StudioEditor } from './studio-editor'
import type { CanvasData } from '@/types/canvas'
import type { StudioTemplate } from '@/app/dashboard/studio/actions'
import {
  saveCanvasTemplateAction,
  updateCanvasTemplateAction,
} from '@/app/dashboard/studio/actions'
import { designDownloadFilename, previewUrlFromCanvas } from '@/lib/studio-utils'
import { useCanvasHistory } from '@/hooks/use-canvas-history'
import type { StudioBrandKit } from '@/lib/studio-brand-kit'
import type { CanvasExportApi } from './canvas-editor'
import { resizeCanvasData } from '@/lib/canvas-layer-utils'
import { getInstagramFormat, type InstagramFormatId } from '@/lib/instagram-formats'
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
  onLibraryChange?: (template: StudioTemplate) => void
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
  onLibraryChange,
}: StudioEditorShellProps) {
  const router = useRouter()
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
  const [dirty, setDirty] = useState(!template?.id)
  const mounted = useIsClient()
  const templateIdRef = useRef<string | undefined>(template?.id)
  const exportApiRef = useRef<CanvasExportApi | null>(null)
  const canvasDataRef = useRef(canvasData)
  const nameRef = useRef(name)
  const dirtyRef = useRef(dirty)

  useEffect(() => {
    canvasDataRef.current = canvasData
    nameRef.current = name
    dirtyRef.current = dirty
  }, [canvasData, name, dirty])

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

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

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
      setDirty(false)
      dirtyRef.current = false

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

  useEffect(() => {
    let cancelled = false
    const timeout = window.setTimeout(() => {
      if (cancelled || templateIdRef.current) return
      void persist(true)
    }, 700)
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
    // Create the file once when the editor opens, not on every persist identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!dirtyRef.current) return
      void persist(true)
    }, 30_000)
    return () => clearInterval(interval)
  }, [persist])

  const handleSave = () => void persist(false)

  const handleChange = (data: CanvasData) => {
    setDirty(true)
    push(data)
  }

  const handleBack = () => {
    if (dirtyRef.current) {
      const leave = window.confirm('Leave Studio? Unsaved changes will be lost.')
      if (!leave) return
    }
    onBack()
  }

  const handleGenerate = async () => {
    if (dirtyRef.current || !templateIdRef.current) {
      const ok = await persist(false)
      if (!ok) return
    }
    const id = templateIdRef.current
    if (id) router.push(`/dashboard/generate?templateId=${id}`)
  }

  const handleDownload = (format: 'png' | 'jpeg') => {
    const dataUrl = exportApiRef.current?.getPreviewDataUrl(format === 'jpeg' ? 'jpeg' : 'png')
    if (!dataUrl) {
      toast.error('Could not export this design')
      return
    }
    const link = document.createElement('a')
    link.download = designDownloadFilename(nameRef.current, format === 'jpeg' ? 'jpg' : 'png')
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSaveCopyAs = async (formatId: InstagramFormatId) => {
    const format = getInstagramFormat(formatId)
    const resized = resizeCanvasData(
      JSON.parse(JSON.stringify(canvasDataRef.current)) as CanvasData,
      format
    )
    const copyName = `${nameRef.current.trim() || 'Untitled'} · ${format.label}`
    const result = await saveCanvasTemplateAction({
      name: copyName,
      category: savedTemplate?.category ?? template?.category ?? initialCategory ?? 'Other',
      canvasData: resized,
      previewUrl: previewUrlFromCanvas(resized),
    })
    if (!result.success || !result.template) {
      toast.error(result.error ?? 'Could not save a copy')
      return
    }
    onLibraryChange?.(result.template)
    toast.success(`Saved ${format.label} copy`)
  }

  const shell = (
    <div className="fixed inset-0 z-100 flex flex-col isolate bg-[#0d1117]">
      <div className="flex shrink-0 flex-col gap-2 border-b border-white/8 bg-[#0d1117]/95 px-3 py-2.5 backdrop-blur-xl sm:gap-3 sm:px-6 sm:py-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back to Studio"
            className="flex size-11 min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/10 text-white/60 hover:bg-white/5 hover:text-white ui-transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <label htmlFor="studio-design-name" className="sr-only">
              Design name
            </label>
            <Input
              id="studio-design-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setDirty(true)
              }}
              onBlur={() => {
                if (dirtyRef.current) void persist(true)
              }}
              className="h-11 max-w-full rounded-lg border-white/10 bg-white/5 text-sm font-semibold text-white sm:max-w-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:justify-end">
          {autoSaveStatus === 'saving' && (
            <span className="hidden items-center gap-1 text-[10px] text-white/40 sm:flex">
              <Cloud className="h-3 w-3 animate-pulse" />
              Auto-saving…
            </span>
          )}
          {autoSaveStatus === 'saved' && (
            <span className="hidden items-center gap-1 text-[10px] text-emerald-400/80 sm:flex">
              <Cloud className="h-3 w-3" />
              Saved
            </span>
          )}
          <button
            type="button"
            onClick={() => handleDownload('png')}
            className="inline-flex size-11 min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/10 text-white/70 hover:bg-white/5 hover:text-white sm:h-11 sm:w-auto sm:gap-2 sm:px-3"
            aria-label="Download"
          >
            <ImageDown className="h-4 w-4" />
            <span className="hidden sm:inline text-sm font-medium">Download</span>
          </button>
          <Button
            type="button"
            onClick={() => void handleGenerate()}
            className="h-11 min-h-11 flex-1 gap-2 rounded-xl bg-blue-600 px-3 font-semibold text-white hover:bg-blue-500 sm:flex-none sm:px-4"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden min-[400px]:inline">Use in Generate</span>
            <span className="min-[400px]:hidden">Generate</span>
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            variant="outline"
            className="h-11 min-h-11 flex-1 gap-2 rounded-xl border-white/15 bg-transparent px-3 font-semibold text-white hover:bg-white/5 sm:flex-none sm:px-5"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-2 sm:p-4 md:p-6">
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
          designName={name}
          onSaveCopyAs={handleSaveCopyAs}
        />
      </div>
    </div>
  )

  if (!mounted) return null
  return createPortal(shell, document.body)
}
