'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  Trash2,
  Pencil,
  Sparkles,
  LayoutTemplate,
  Image as ImageIcon,
} from 'lucide-react'
import type { StudioTemplate } from '@/app/dashboard/studio/actions'
import { deleteTemplateAction } from '@/app/dashboard/studio/actions'
import { getTemplatePreviewUrl } from '@/lib/studio-utils'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

function DeleteModal({
  name,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  name: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm mx-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-[#111118] shadow-2xl overflow-hidden p-6"
      >
        <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <Trash2 className="w-5 h-5 text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">Delete template</h3>
        <p className="text-sm text-white/40 mb-5">
          &ldquo;{name}&rdquo; will be permanently removed.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-9 rounded-xl border border-white/10 text-white/70 text-sm hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 h-9 rounded-xl bg-red-500 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

interface StudioTemplateCardProps {
  template: StudioTemplate
  onDelete: (id: string) => void
  onEdit: (template: StudioTemplate) => void
}

export function StudioTemplateCard({ template, onDelete, onEdit }: StudioTemplateCardProps) {
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const preview = getTemplatePreviewUrl(template)
  const isCanvas = template.template_type === 'canvas'

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    await deleteTemplateAction(template.id, template.file_path, template.source)
    onDelete(template.id)
    setShowDeleteModal(false)
  }

  return (
    <>
      <motion.div
        layout
        className="group relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/3 aspect-square"
      >
        <Image
          src={preview}
          alt={template.name}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 left-2 flex gap-1.5">
          {isCanvas && (
            <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/80 text-white border border-purple-400/30">
              Canvas
            </span>
          )}
          {template.category && (
            <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/50 text-white/70 border border-white/10">
              {template.category}
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-xs font-semibold text-white truncate mb-2">{template.name}</p>
          <div className="flex gap-1.5">
            <button
              onClick={() => onEdit(template)}
              className="flex-1 h-8 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1"
            >
              <Pencil className="w-3 h-3" />
              Edit
            </button>
            <Link
              href={`/dashboard/generate?templateId=${template.id}`}
              className="flex-1 h-8 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white text-[11px] font-semibold flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Generate
            </Link>
          </div>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={deleting}
          className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center text-white/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
        >
          {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
        </button>

        {!isCanvas && template.source === 'upload' && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ImageIcon className="w-4 h-4 text-white/40" />
          </div>
        )}
        {isCanvas && (
          <div className="absolute bottom-2 right-2 opacity-60">
            <LayoutTemplate className="w-4 h-4 text-purple-300" />
          </div>
        )}
      </motion.div>

      {showDeleteModal && (
        <DeleteModal
          name={template.name}
          isDeleting={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  )
}
