'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Upload, X, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { StudioTemplate } from '@/app/dashboard/studio/actions'
import {
  completeStudioTemplateUploadAction,
  prepareStudioTemplateUploadAction,
} from '@/app/dashboard/studio/actions'
import { createClient } from '@/lib/supabase/client'
import { STUDIO_CATEGORIES } from '@/lib/studio-utils'
import { isWithinImageUploadLimit, MAX_IMAGE_UPLOAD_LABEL } from '@/lib/upload-limits'
import { toast } from 'sonner'

export function StudioUploadZone({
  onUploadSuccess,
}: {
  onUploadSuccess: (t: StudioTemplate) => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [category, setCategory] = useState('Other')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Only JPEG, PNG, WebP, or GIF files are allowed.')
      return
    }
    if (!isWithinImageUploadLimit(file.size)) {
      setError(`File must be under ${MAX_IMAGE_UPLOAD_LABEL}.`)
      return
    }
    setPendingFile(file)
    setTemplateName(file.name.replace(/\.[^.]+$/, ''))
    setPreview(URL.createObjectURL(file))
    setError(null)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const clearPending = () => {
    setPendingFile(null)
    setPreview(null)
    setTemplateName('')
    setError(null)
  }

  const handleSubmit = async () => {
    if (!pendingFile || !templateName.trim()) return
    setIsUploading(true)
    setError(null)

    try {
      const prepared = await prepareStudioTemplateUploadAction({
        fileName: pendingFile.name,
        contentType: pendingFile.type,
        fileSize: pendingFile.size,
      })

      if (!prepared.success || !prepared.path || !prepared.token) {
        throw new Error(prepared.error ?? 'Could not start upload.')
      }

      const supabase = createClient()
      const { error: uploadError } = await supabase.storage
        .from('studio-templates')
        .uploadToSignedUrl(prepared.path, prepared.token, pendingFile, {
          contentType: pendingFile.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('[studio-upload]', uploadError.message)
        throw new Error('Upload failed. Please try again.')
      }

      const result = await completeStudioTemplateUploadAction({
        filePath: prepared.path,
        name: templateName.trim(),
        category,
      })

      if (!result.success || !result.template) {
        throw new Error(result.error ?? 'Upload failed.')
      }

      setSuccess(true)
      onUploadSuccess(result.template)
      toast.success('Template uploaded')
      setTimeout(() => {
        setSuccess(false)
        clearPending()
      }, 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed.'
      setError(message)
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  if (!pendingFile) {
    return (
      <motion.div
        whileHover={{ borderColor: 'rgba(147,51,234,0.4)' }}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-8 py-12 cursor-pointer transition-all select-none ${
          isDragging
            ? 'border-purple-400/70 bg-purple-500/6'
            : 'border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/2'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Upload className="w-5 h-5 text-purple-400" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-zinc-700 dark:text-white/80">
            Drop an image or <span className="text-purple-400">browse files</span>
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-white/30">
            JPEG · PNG · WebP · GIF · max {MAX_IMAGE_UPLOAD_LABEL}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/3 overflow-hidden"
    >
      <div className="flex gap-0 flex-col sm:flex-row">
        {preview && (
          <div className="relative shrink-0 w-full sm:w-40 h-40">
            <Image
              src={preview}
              alt="Upload preview"
              fill
              unoptimized
              className="object-cover"
            />
            <button
              onClick={clearPending}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        )}
        <div className="flex-1 p-5 space-y-4">
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block mb-1.5">
              Template name
            </label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g. Summer Sale Banner"
              className="h-9 bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {STUDIO_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                    category === c
                      ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                      : 'bg-transparent border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-800 dark:hover:text-white/70'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-200 dark:border-white/6">
        {error ? (
          <p className="text-[11px] text-red-400">{error}</p>
        ) : (
          <p className="text-[11px] text-zinc-500">{pendingFile.name}</p>
        )}
        <div className="flex gap-2">
          <button onClick={clearPending} className="text-[11px] text-zinc-500 hover:text-zinc-800 px-2">
            Cancel
          </button>
          <Button
            onClick={handleSubmit}
            disabled={isUploading || !templateName.trim()}
            className="h-7 px-4 text-[11px] bg-purple-600 hover:bg-purple-500 text-white rounded-lg gap-1.5"
          >
            {isUploading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : success ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <Upload className="w-3 h-3" />
            )}
            {isUploading ? 'Uploading…' : success ? 'Saved!' : 'Save template'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
