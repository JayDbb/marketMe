'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import {
  Upload, Search, Trash2, LayoutTemplate, Image as ImageIcon,
  Bookmark, X, CheckCircle2, Loader2, Plus, ExternalLink, FolderOpen, Key, ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { StudioTemplate } from '@/app/dashboard/studio/actions'
import {
  uploadTemplateAction,
  deleteTemplateAction,
  saveUnsplashTemplateAction,
} from '@/app/dashboard/studio/actions'
import { StudioEditor } from './studio/studio-editor'
import { CanvasData } from '@/types/canvas'

// ─── Types ────────────────────────────────────────────────────────────────────
interface UnsplashPhoto {
  id: string
  urls: { regular: string; small: string; thumb: string }
  alt_description: string | null
  user: { name: string; links: { html: string } }
}

type Tab = 'home' | 'my-templates' | 'unsplash' | 'saved' | 'canvas-demo'

const DUMMY_CANVAS_DATA: CanvasData = {
  version: '1.0',
  canvas: { width: 1080, height: 1080, backgroundColor: '#0f172a', aspectRatioName: 'square' },
  layers: [
    { id: 'bg', type: 'image', src: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1080&q=80', x: 0, y: 0, width: 1080, height: 1080, opacity: 0.3, zIndex: 1 },
    { id: 't1', type: 'text', content: 'SUMMER SALE', x: 100, y: 200, fontSize: 120, fontFamily: 'Inter', fill: '#ffffff', zIndex: 2 },
    { id: 't2', type: 'text', content: 'UP TO 50% OFF', x: 100, y: 350, fontSize: 60, fontFamily: 'Inter', fill: '#fbbf24', zIndex: 2 },
    { id: 'btn', type: 'rect', x: 100, y: 500, width: 300, height: 80, fill: '#3b82f6', cornerRadius: 16, zIndex: 2 },
    { id: 'btn-t', type: 'text', content: 'Shop Now', x: 160, y: 525, fontSize: 32, fontFamily: 'Inter', fill: '#ffffff', zIndex: 3 }
  ]
}


// ─── Animations ───────────────────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } },
}

const CATEGORIES = ['All', 'Fashion', 'Food', 'Retail', 'Events', 'Fitness', 'Interior', 'Tech', 'Sports', 'Other']

// ─── UploadZone ───────────────────────────────────────────────────────────────
function UploadZone({ onUploadSuccess }: { onUploadSuccess: (t: StudioTemplate) => void }) {
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
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10 MB.'); return }
    setPendingFile(file)
    setTemplateName(file.name.replace(/\.[^.]+$/, ''))
    setPreview(URL.createObjectURL(file))
    setError(null)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const handleSubmit = async () => {
    if (!pendingFile || !templateName.trim()) return
    setIsUploading(true); setError(null)
    const fd = new FormData()
    fd.append('file', pendingFile)
    fd.append('name', templateName.trim())
    fd.append('category', category)
    const result = await uploadTemplateAction(fd)
    setIsUploading(false)
    if (!result.success) { setError(result.error ?? 'Upload failed.'); return }
    setSuccess(true)
    onUploadSuccess(result.template!)
    setTimeout(() => {
      setSuccess(false); setPendingFile(null); setPreview(null)
      setTemplateName(''); setCategory('Other')
    }, 1800)
  }

  const clearPending = () => {
    setPendingFile(null); setPreview(null); setTemplateName(''); setError(null)
  }

  return (
    <div className="mb-8">
      {!pendingFile ? (
        <motion.div
          whileHover={{ borderColor: 'rgba(255,255,255,0.18)' }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-8 py-12 cursor-pointer transition-all duration-300 select-none group
            ${isDragging ? 'border-blue-400/70 bg-blue-500/6 shadow-[inset_0_0_40px_rgba(59,130,246,0.06)]' : 'border-zinc-200 dark:border-white/8 bg-white/[0.015]'}`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border
            ${isDragging ? 'bg-blue-500/15 border-blue-400/30 shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'bg-white dark:bg-white/4 border-zinc-200 dark:border-white/8 group-hover:bg-white dark:bg-white/6 group-hover:border-zinc-200 dark:border-white/14'}`}>
            <Upload className={`w-5 h-5 transition-colors duration-300 ${isDragging ? 'text-blue-400' : 'text-zinc-500 dark:text-white/30 group-hover:text-zinc-500 dark:text-white/50'}`} />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-zinc-500 dark:text-white/70 group-hover:text-zinc-900 dark:text-white transition-colors">
              Drop an image or{' '}<span className="text-blue-400">click to browse</span>
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-white/25">JPEG · PNG · WebP · GIF &nbsp;·&nbsp; max 10 MB</p>
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] overflow-hidden"
        >
          {/* Preview strip */}
          <div className="flex gap-0">
            {preview && (
              <div className="relative shrink-0 w-40 h-40">
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-r from-transparent to-[#0c0c18]/60" />
                <button onClick={clearPending}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm border border-zinc-200 dark:border-white/10 flex items-center justify-center hover:bg-black/80 transition-colors">
                  <X className="w-3 h-3 text-zinc-900 dark:text-white" />
                </button>
              </div>
            )}
            <div className="flex-1 p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="text-[10px] text-zinc-500 dark:text-white/30 uppercase tracking-[0.12em] font-semibold block mb-1.5">Template Name</label>
                <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Summer Sale Banner"
                  className="h-9 bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/40 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:text-white/20 rounded-xl text-sm shadow-none" />
              </div>
              {/* Category pills */}
              <div>
                <label className="text-[10px] text-zinc-500 dark:text-white/30 uppercase tracking-[0.12em] font-semibold block mb-2">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.filter(c => c !== 'All').map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-150 border ${
                        category === c
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          : 'bg-white dark:bg-white/4 border-zinc-200 text-zinc-500 dark:text-white/40 dark:border-white/8 hover:bg-white dark:bg-white/7 hover:text-zinc-500 dark:text-white/60 hover:border-zinc-200 dark:border-white/14'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-200 dark:border-white/6 bg-white dark:bg-white/1 border-zinc-200.5">
            {error
              ? <p className="text-[11px] text-red-400 flex items-center gap-1.5">{error}</p>
              : <p className="text-[11px] text-zinc-500 dark:text-white/25">{pendingFile?.name}</p>
            }
            <div className="flex items-center gap-2">
              <button onClick={clearPending}
                className="h-7 px-3 text-[11px] font-medium text-zinc-500 dark:text-white/40 hover:text-zinc-500 dark:text-white/70 transition-colors">
                Cancel
              </button>
              <Button onClick={handleSubmit} disabled={isUploading || !templateName.trim()}
                className="h-7 px-4 text-[11px] bg-blue-500 hover:bg-blue-400 active:scale-[0.97] text-zinc-900 dark:text-white rounded-lg font-semibold gap-1.5 border-0 transition-all">
                {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : success ? <CheckCircle2 className="w-3 h-3" /> : <Upload className="w-3 h-3" />}
                {isUploading ? 'Uploading...' : success ? 'Saved!' : 'Save template'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ─── DeleteModal ──────────────────────────────────────────────────────────────
function DeleteModal({
  name, onConfirm, onCancel, isDeleting,
}: { name: string; onConfirm: () => void; onCancel: () => void; isDeleting: boolean }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCancel])

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.94, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm mx-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-[#111118] shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          {/* Top accent line */}
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-red-500/40 to-transparent" />

          <div className="p-6">
            {/* Icon */}
            <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>

            <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-1 tracking-tight">Delete template</h3>
            <p className="text-sm text-zinc-500 dark:text-white/40 leading-relaxed">
              <span className="text-zinc-500 dark:text-white/70 font-medium">&ldquo;{name}&rdquo;</span> will be permanently removed from your library. This cannot be undone.
            </p>
          </div>

          <div className="flex items-center gap-2 px-6 pb-5">
            <button
              onClick={onCancel}
              className="flex-1 h-9 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/4 text-zinc-500 dark:text-white/60 hover:bg-white dark:bg-white/7 hover:text-zinc-900 dark:text-white text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 h-9 rounded-xl bg-red-500/90 hover:bg-red-500 active:scale-[0.97] text-zinc-900 dark:text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── TemplateCard ─────────────────────────────────────────────────────────────
function TemplateCard({ template, onDelete }: { template: StudioTemplate; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    await deleteTemplateAction(template.id, template.file_path, template.source)
    onDelete(template.id)
    setShowDeleteModal(false)
  }

  return (
    <motion.div variants={itemVariants}
      className="group relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/8 bg-white dark:bg-white/4 hover:border-zinc-200 dark:border-white/16 transition-all cursor-pointer aspect-square">
      <img src={template.file_url} alt={template.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {template.category && (
          <span className="text-[9px] font-mono text-zinc-500 dark:text-white/50 uppercase tracking-widest mb-1">{template.category}</span>
        )}
        <p className="text-xs font-semibold text-zinc-900 dark:text-white leading-tight truncate">{template.name}</p>
        {template.source === 'unsplash' && template.author_name && (
          <a href={`${template.author_url}?utm_source=marketme&utm_medium=referral`} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[9px] text-zinc-500 dark:text-white/40 hover:text-zinc-500 dark:text-white/60 mt-0.5">
            Photo by {template.author_name} · Unsplash
          </a>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true) }}
        disabled={deleting}
        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 backdrop-blur-sm border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-500 dark:text-white/40 hover:text-red-400 hover:border-red-400/30 opacity-0 group-hover:opacity-100 transition-all">
        {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
      </button>

      {showDeleteModal && (
        <DeleteModal
          name={template.name}
          isDeleting={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </motion.div>
  )
}

// ─── UnsplashGrid ─────────────────────────────────────────────────────────────
function UnsplashGrid({ onSave }: { onSave: () => void }) {
  const [query, setQuery] = useState('small business marketing')
  const [inputVal, setInputVal] = useState('')
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [notConfigured, setNotConfigured] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const fetchPhotos = useCallback(async (q: string, p: number) => {
    setLoading(true)
    const res = await fetch(`/api/unsplash?query=${encodeURIComponent(q)}&page=${p}&per_page=18`)
    const data = await res.json()
    if (data.error === 'UNSPLASH_NOT_CONFIGURED') { setNotConfigured(true); setLoading(false); return }
    setPhotos(data.results ?? [])
    setTotalPages(data.total_pages ?? 0)
    setLoading(false)
  }, [])

  useEffect(() => { fetchPhotos(query, page) }, [query, page, fetchPhotos])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); setPage(1); setQuery(inputVal || 'small business marketing')
  }

  const handleSave = async (photo: UnsplashPhoto) => {
    setSavingId(photo.id)
    const result = await saveUnsplashTemplateAction({
      name: photo.alt_description || `Photo by ${photo.user.name}`,
      category: 'Unsplash',
      file_url: photo.urls.regular,
      unsplash_id: photo.id,
      author_name: photo.user.name,
      author_url: photo.user.links.html,
    })
    setSavingId(null)
    if (result.success) { setSavedIds(prev => new Set([...prev, photo.id])); onSave() }
    else alert(result.error)
  }

  if (notConfigured) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Key className="w-6 h-6 text-amber-400" />
        </div>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Unsplash Not Configured</h3>
        <p className="text-sm text-zinc-500 dark:text-white/40 max-w-xs">
          Add your <code className="text-amber-400 bg-white dark:bg-white/5 border-zinc-200 px-1.5 py-0.5 rounded">UNSPLASH_ACCESS_KEY</code> to{' '}
          <code className="text-zinc-500 dark:text-white/60 bg-white dark:bg-white/5 border-zinc-200 px-1.5 py-0.5 rounded">.env.local</code> to enable stock photo browsing.
        </p>
        <a href="https://unsplash.com/developers" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 border border-blue-400/20 bg-blue-500/8 px-4 py-2 rounded-xl transition-colors">
          Get API Key <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    )
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-white/30" />
          <Input value={inputVal} onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search photos (e.g. coffee shop, fitness...)"
            className="pl-10 h-10 bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/50 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:text-white/20 rounded-xl text-sm" />
        </div>
        <Button type="submit" className="h-10 px-5 bg-white text-zinc-950 hover:bg-zinc-100 dark:hover:bg-white/90 font-bold rounded-xl text-sm">Search</Button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-zinc-500 dark:text-white/20 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-white/8 cursor-pointer">
                <img src={photo.urls.thumb} alt={photo.alt_description ?? ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[9px] text-zinc-500 dark:text-white/50 truncate">
                    <a href={`${photo.user.links.html}?utm_source=marketme&utm_medium=referral`} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()} className="hover:text-zinc-500 dark:text-white/80">{photo.user.name}</a>
                  </p>
                </div>
                <button onClick={() => handleSave(photo)} disabled={savingId === photo.id || savedIds.has(photo.id)}
                  className={`absolute top-2 right-2 w-7 h-7 rounded-lg backdrop-blur-sm border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all
                    ${savedIds.has(photo.id) ? 'bg-blue-500/80 border-blue-400/50 text-zinc-900 dark:text-white' : 'bg-black/50 border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:text-white hover:border-zinc-200 dark:border-white/30'}`}>
                  {savingId === photo.id ? <Loader2 className="w-3 h-3 animate-spin" /> : savedIds.has(photo.id) ? <CheckCircle2 className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                </button>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="h-8 px-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/4 text-zinc-500 dark:text-white/50 text-xs hover:text-zinc-900 dark:text-white hover:bg-white dark:bg-white/8 disabled:opacity-30 transition-all">Prev</button>
              <span className="text-xs text-zinc-500 dark:text-white/30 font-mono">Page {page} of {Math.min(totalPages, 20)}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= Math.min(totalPages, 20)}
                className="h-8 px-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/4 text-zinc-500 dark:text-white/50 text-xs hover:text-zinc-900 dark:text-white hover:bg-white dark:bg-white/8 disabled:opacity-30 transition-all">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Studio Hero ──────────────────────────────────────────────────────────────
const PREVIEW_TEMPLATES = [
  { id: 'a', imgUrl: 'https://picsum.photos/id/64/400/400', label: 'Fashion', tag: 'Elevate Your Style', bg: 'from-zinc-800 to-zinc-900' },
  { id: 'b', imgUrl: 'https://picsum.photos/id/436/400/400', label: 'Events', tag: 'Wedding Announcement', bg: 'from-orange-950 to-zinc-900' },
  { id: 'c', imgUrl: 'https://picsum.photos/id/1058/400/400', label: 'Sports', tag: 'Love All. Play All.', bg: 'from-emerald-950 to-zinc-900' },
  { id: 'd', imgUrl: 'https://picsum.photos/id/335/400/400', label: 'Retail', tag: 'Special Sale 15%', bg: 'from-amber-950 to-zinc-900' },
  { id: 'e', imgUrl: 'https://picsum.photos/id/425/400/400', label: 'Food', tag: 'Healthy & Fresh', bg: 'from-green-950 to-zinc-900' },
  { id: 'f', imgUrl: 'https://picsum.photos/id/163/400/400', label: 'Interior', tag: 'Comfort Starts Here', bg: 'from-slate-800 to-zinc-900' },
  { id: 'g', imgUrl: 'https://picsum.photos/id/1/400/400', label: 'Tech', tag: 'Ship Faster', bg: 'from-blue-950 to-zinc-900' },
]

function StudioHero({ onUploadClick, onBrowseClick }: { onUploadClick: () => void; onBrowseClick: () => void }) {
  return (
    <div className="relative w-full min-h-[65vh] flex flex-col justify-between overflow-visible mb-12">
      {/* Subtle page-level gradient */}
      <div className="absolute -inset-10 bg-[radial-gradient(ellipse_100%_100%_at_50%_-20%,rgba(59,130,246,0.12),transparent)] pointer-events-none" />

      {/* Ambient orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-48 bg-purple-600/10 blur-[90px] rounded-full pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 pt-20 pb-12 px-8 text-center flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-semibold text-blue-400 tracking-[0.15em] uppercase mb-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          Template Library
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-zinc-900 dark:text-white mb-4"
        >
          Explore the template library
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="text-base text-zinc-500 dark:text-white/50 max-w-lg mx-auto mb-10 leading-relaxed"
        >
          Hundreds of templates for posts, stories, and ads. Pick a template and get started in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          className="flex items-center justify-center gap-4"
        >
          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-white text-zinc-950 text-sm font-bold hover:bg-zinc-100 dark:hover:bg-white/90 active:scale-[0.97] transition-all shadow-[0_0_30px_rgba(255,255,255,0.12)]"
          >
            <Plus className="w-4 h-4" />
            Upload template
          </button>
          <button
            onClick={onBrowseClick}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/4 text-zinc-900 dark:text-white text-sm font-medium hover:bg-white dark:bg-white/10 active:scale-[0.97] transition-all"
          >
            <ImageIcon className="w-4 h-4 text-zinc-500 dark:text-white/60" />
            Browse Unsplash
          </button>
        </motion.div>
      </div>

      {/* Scrolling template strip (full bleed) */}
      <div className="relative z-10 overflow-hidden pt-12 pb-8 -mx-6 sm:-mx-12 lg:-mx-24 px-6 sm:px-12 lg:px-24">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />

        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          className="flex gap-4 px-4 w-max"
        >
          {[...PREVIEW_TEMPLATES, ...PREVIEW_TEMPLATES].map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              className={`relative shrink-0 w-[180px] h-[180px] md:w-[200px] md:h-[200px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-linear-to-br ${t.bg} cursor-pointer group hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 shadow-xl`}
            >
              <img
                src={t.imgUrl}
                alt={t.label}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-4">
                <span className="text-[10px] font-mono text-zinc-500 dark:text-white/50 uppercase tracking-[0.15em] block mb-1">{t.label}</span>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">{t.tag}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

// ─── Main StudioContent ───────────────────────────────────────────────────────
interface StudioContentProps { initialTemplates: StudioTemplate[] }

export function StudioContent({ initialTemplates }: StudioContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [templates, setTemplates] = useState<StudioTemplate[]>(initialTemplates)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const triggerUpload = () => setActiveTab('my-templates')

  const myUploads = templates.filter(t => t.source === 'upload')
  const saved = templates.filter(t => t.source !== 'upload')

  const filteredUploads = myUploads.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCat = activeCategory === 'All' || t.category === activeCategory
    return matchesSearch && matchesCat
  })

  const filteredSaved = saved.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (id: string) => setTemplates(prev => prev.filter(t => t.id !== id))
  const handleUploadSuccess = (t: StudioTemplate) => setTemplates(prev => [t, ...prev])
  const handleUnsplashSave = async () => {
    // Refetch is handled by revalidatePath in the action; locally we'll refresh templates silently
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'my-templates', label: 'My Templates', icon: FolderOpen, count: myUploads.length },
    { id: 'unsplash', label: 'Unsplash', icon: ImageIcon },
    { id: 'saved', label: 'Saved', icon: Bookmark, count: saved.length },
    { id: 'canvas-demo', label: 'Canvas Demo', icon: LayoutTemplate },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show"
      className="max-w-7xl mx-auto px-6 py-8 relative z-10">

      <AnimatePresence mode="wait">
        {activeTab === 'home' ? (
          <motion.div key="home" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <StudioHero
              onUploadClick={() => setActiveTab('my-templates')}
              onBrowseClick={() => setActiveTab('unsplash')}
            />
            {/* Recent templates preview below the hero */}
            {saved.length > 0 && (
              <div className="mt-12">
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-white/70 mb-4 px-2">Recent Saved Designs</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {saved.slice(0, 6).map((t) => (
                    <div key={t.id} onClick={() => setActiveTab('saved')} className="aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-white/8 cursor-pointer group">
                      <img src={t.file_url} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="library" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => setActiveTab('home')}
                className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border-zinc-200 border dark:border-white/10 flex items-center justify-center text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:text-white hover:bg-white dark:bg-white/10 transition-all active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold tracking-tighter text-zinc-900 dark:text-white">Studio Library</h1>
                <p className="text-zinc-500 dark:text-white/40 text-sm mt-0.5">Manage your templates and assets.</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white dark:bg-white/4 border-zinc-200 border dark:border-white/8 rounded-xl p-1 mb-8 w-fit">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white dark:bg-white/10 border-zinc-200 text-zinc-900 dark:text-white border dark:border-white/8 shadow-sm' : 'text-zinc-500 dark:text-white/40 hover:text-zinc-500 dark:text-white/70'}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-blue-500/20 text-blue-400' : 'bg-white dark:bg-white/8 border-zinc-200 text-zinc-500 dark:text-white/30'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'my-templates' && (
          <motion.div key="my-templates" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <UploadZone onUploadSuccess={handleUploadSuccess} />

            {/* Filters */}
            {myUploads.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 dark:text-white/30" />
                  <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates..."
                    className="pl-9 h-9 w-52 bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/50 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:text-white/20 rounded-xl text-sm" />
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${activeCategory === cat ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25' : 'text-zinc-500 dark:text-white/40 hover:text-zinc-500 dark:text-white/60 border-transparent hover:border-zinc-200 dark:border-white/8'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredUploads.length > 0 ? (
              <motion.div variants={containerVariants} initial="hidden" animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredUploads.map((t) => (
                  <TemplateCard key={t.id} template={t} onDelete={handleDelete} />
                ))}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3 border border-dashed border-zinc-200 dark:border-white/8 rounded-2xl bg-white dark:bg-white/2">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/4 border-zinc-200 border dark:border-white/8 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-zinc-500 dark:text-white/20" />
                </div>
                <p className="text-sm font-medium text-zinc-500 dark:text-white/40">No templates yet — upload your first one above</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'unsplash' && (
          <motion.div key="unsplash" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <UnsplashGrid onSave={handleUnsplashSave} />
          </motion.div>
        )}

        {activeTab === 'saved' && (
          <motion.div key="saved" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 dark:text-white/30" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search saved..."
                  className="pl-9 h-9 w-52 bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/50 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:text-white/20 rounded-xl text-sm" />
              </div>
            </div>
            {filteredSaved.length > 0 ? (
              <motion.div variants={containerVariants} initial="hidden" animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredSaved.map((t) => (
                  <TemplateCard key={t.id} template={t} onDelete={handleDelete} />
                ))}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3 border border-dashed border-zinc-200 dark:border-white/8 rounded-2xl bg-white dark:bg-white/2">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/4 border-zinc-200 border dark:border-white/8 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-zinc-500 dark:text-white/20" />
                </div>
                <p className="text-sm font-medium text-zinc-500 dark:text-white/40">No saved photos yet</p>
                <p className="text-xs text-zinc-500 dark:text-white/25">Browse Unsplash and click the bookmark icon to save photos here</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'canvas-demo' && (
          <motion.div key="canvas-demo" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">JSON-Based Canvas Engine</h2>
              <p className="text-zinc-500 dark:text-white/50 text-sm">This post is entirely generated from a JSON payload. The background image, text, and button are individual editable layers. The "Export PNG" perfectly bundles it into a crisp graphic for Instagram.</p>
            </div>
            <StudioEditor initialData={DUMMY_CANVAS_DATA} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )}
  </AnimatePresence>
</motion.div>
  )
}
