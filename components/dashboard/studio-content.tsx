'use client'

<<<<<<< HEAD
import { useState, useMemo, useCallback } from 'react'
=======
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
>>>>>>> origin/development
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  LayoutTemplate,
  FolderOpen,
  Image as ImageIcon,
  Bookmark,
  Plus,
  Search,
  Sparkles,
  Upload,
  Loader2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { StudioTemplate } from '@/app/dashboard/studio/actions'
import { StudioUploadZone } from '@/components/dashboard/studio/studio-upload-zone'
import { StudioStockGrid } from '@/components/dashboard/studio/studio-stock-grid'
import { StudioTemplateCard } from '@/components/dashboard/studio/studio-template-card'
import { StudioRecentsSection } from '@/components/dashboard/studio/studio-recents-section'
import { StudioStarterPicker } from '@/components/dashboard/studio/studio-starter-picker'
import {
<<<<<<< HEAD
  STUDIO_CATEGORIES,
=======
  categoriesPresent,
>>>>>>> origin/development
  filterTemplates,
  getRecentTemplates,
  getStudioStats,
  photoToEditableCanvas,
  templateToCanvas,
} from '@/lib/studio-utils'
import {
  getStudioRecentEntries,
  recordStudioRecent,
  removeStudioRecent,
} from '@/lib/studio-recents'
import type { CanvasData } from '@/types/canvas'
import type { StudioRecentEntry } from '@/lib/studio-recents'
import type { StudioBrandKit } from '@/lib/studio-brand-kit'
import type { StockPhoto } from '@/lib/stock-media'

const StudioEditorShell = dynamic(
  () =>
    import('@/components/dashboard/studio/studio-editor-shell').then(
      (m) => m.StudioEditorShell
    ),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    ),
  }
)

type Tab = 'all' | 'uploads' | 'saved' | 'stock'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All templates', icon: LayoutTemplate },
  { id: 'uploads', label: 'My uploads', icon: FolderOpen },
  { id: 'saved', label: 'Saved photos', icon: Bookmark },
  { id: 'stock', label: 'Browse Pexels', icon: ImageIcon },
]

interface StudioContentProps {
  initialTemplates: StudioTemplate[]
  brandKit?: StudioBrandKit
  loadError?: string | null
}

export function StudioContent({ initialTemplates, brandKit, loadError = null }: StudioContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [templates, setTemplates] = useState<StudioTemplate[]>(initialTemplates)
  const [recentEntries, setRecentEntries] = useState<StudioRecentEntry[]>(() =>
    typeof window === 'undefined' ? [] : getStudioRecentEntries()
  )
  const [activeTab, setActiveTab] = useState<Tab>(
    (searchParams.get('tab') as Tab) || 'all'
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const [editorState, setEditorState] = useState<{
    canvasData: CanvasData
    template: StudioTemplate | null
    draftName?: string
    draftCategory?: string
    initialSelectedLayerId?: string
  } | null>(null)

  const [starterPickerOpen, setStarterPickerOpen] = useState(false)

<<<<<<< HEAD
=======
  const setTab = (tab: Tab) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    if (tab === 'all') params.delete('tab')
    else params.set('tab', tab)
    const query = params.toString()
    router.replace(query ? `/dashboard/studio?${query}` : '/dashboard/studio', { scroll: false })
  }

>>>>>>> origin/development
  const stats = useMemo(() => getStudioStats(templates), [templates])

  const recentItems = useMemo(
    () => getRecentTemplates(templates, recentEntries),
    [templates, recentEntries]
  )

<<<<<<< HEAD
=======
  const pickerLibraryTemplates = useMemo(() => {
    const recents = recentItems.map((item) => item.template)
    if (recents.length >= 8) return recents.slice(0, 8)
    const seen = new Set(recents.map((template) => template.id))
    const extras: StudioTemplate[] = []
    for (const template of templates) {
      if (seen.has(template.id)) continue
      extras.push(template)
      if (recents.length + extras.length >= 8) break
    }
    return [...recents, ...extras]
  }, [recentItems, templates])

>>>>>>> origin/development
  const refreshRecents = useCallback(() => {
    setRecentEntries(getStudioRecentEntries())
  }, [])

  const stockSavedIds = useMemo(
    () =>
      new Set(
        templates
          .map((t) => t.pexels_id)
          .filter((id): id is string => Boolean(id))
      ),
    [templates]
  )

  const filteredTemplates = useMemo(() => {
    const source =
<<<<<<< HEAD
      activeTab === 'uploads' || activeTab === 'all'
=======
      activeTab === 'uploads'
>>>>>>> origin/development
        ? 'upload'
        : activeTab === 'saved'
          ? 'saved'
          : 'all'
    return filterTemplates(templates, {
      search: searchQuery,
      category: activeCategory,
<<<<<<< HEAD
      source: source as 'upload' | 'saved' | 'all',
    })
  }, [templates, activeTab, searchQuery, activeCategory])

  const savedRecentItems = useMemo(
    () => recentItems.filter(({ template }) => template.source !== 'upload'),
    [recentItems]
  )

  const handleEdit = (template: StudioTemplate) => {
    recordStudioRecent(template.id)
    refreshRecents()
    const canvasData = templateToCanvas(template)
    setEditorState({
      template,
      canvasData,
      initialSelectedLayerId: canvasData.layers.some((l) => l.id === 'headline')
        ? 'headline'
        : undefined,
    })
  }

  const handleOpenStockPhoto = useCallback(
    (photo: StockPhoto, template?: StudioTemplate) => {
      const name = photo.alt_description || `Photo by ${photo.user.name}`
      const canvasData = template ? templateToCanvas(template) : photoToEditableCanvas(photo.urls.regular)
      if (template) {
        recordStudioRecent(template.id)
        refreshRecents()
        setEditorState({
          template,
          canvasData,
          initialSelectedLayerId: 'headline',
        })
        return
      }
      setEditorState({
        canvasData,
        template: null,
        draftName: name,
        draftCategory: 'Pexels',
        initialSelectedLayerId: 'headline',
      })
    },
    [refreshRecents]
  )

  const handleNewDesign = () => {
    setStarterPickerOpen(true)
  }

=======
      source,
    })
  }, [templates, activeTab, searchQuery, activeCategory])

  const tabCategoryOptions = useMemo(() => {
    const source =
      activeTab === 'uploads'
        ? 'upload'
        : activeTab === 'saved'
          ? 'saved'
          : 'all'
    return categoriesPresent(
      filterTemplates(templates, { search: searchQuery, category: 'All', source })
    )
  }, [templates, activeTab, searchQuery])

  const savedRecentItems = useMemo(
    () => recentItems.filter(({ template }) => template.source !== 'upload'),
    [recentItems]
  )

  const handleEdit = useCallback((template: StudioTemplate) => {
    recordStudioRecent(template.id)
    refreshRecents()
    const canvasData = templateToCanvas(template)
    setEditorState({
      template,
      canvasData,
      initialSelectedLayerId: canvasData.layers.some((l) => l.id === 'headline')
        ? 'headline'
        : undefined,
    })
  }, [refreshRecents])

  const openedTemplateFromUrl = useRef<string | null>(null)

  useEffect(() => {
    const templateId = searchParams.get('templateId')
    if (!templateId || editorState) return
    if (openedTemplateFromUrl.current === templateId) return
    const template = templates.find((item) => item.id === templateId)
    if (!template) return
    openedTemplateFromUrl.current = templateId
    queueMicrotask(() => handleEdit(template))
  }, [editorState, handleEdit, searchParams, templates])

  const handleOpenStockPhoto = useCallback(
    (photo: StockPhoto, template?: StudioTemplate) => {
      const name = photo.alt_description || `Photo by ${photo.user.name}`
      const canvasData = template ? templateToCanvas(template) : photoToEditableCanvas(photo.urls.regular)
      if (template) {
        recordStudioRecent(template.id)
        refreshRecents()
        setEditorState({
          template,
          canvasData,
          initialSelectedLayerId: 'headline',
        })
        return
      }
      setEditorState({
        canvasData,
        template: null,
        draftName: name,
        draftCategory: 'Pexels',
        initialSelectedLayerId: 'headline',
      })
    },
    [refreshRecents]
  )

  const handleNewDesign = () => {
    setStarterPickerOpen(true)
  }

>>>>>>> origin/development
  const handleStarterSelect = (
    canvasData: CanvasData,
    draftName: string,
    draftCategory: string
  ) => {
    setEditorState({
      canvasData,
      template: null,
      draftName,
      draftCategory,
      initialSelectedLayerId: canvasData.layers.some((l) => l.id === 'headline')
        ? 'headline'
        : undefined,
    })
  }

  const handleEditorBack = () => {
    setEditorState(null)
    router.replace('/dashboard/studio')
  }

  const handleEditorSaved = (template: StudioTemplate) => {
    recordStudioRecent(template.id)
    refreshRecents()
    setTemplates((prev) => {
      const idx = prev.findIndex((t) => t.id === template.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = template
        return next
      }
      return [template, ...prev]
    })
    setEditorState((prev) =>
      prev ? { ...prev, template, draftName: undefined, draftCategory: undefined } : null
    )
  }

  const handleTemplateAdded = (template: StudioTemplate) => {
    setTemplates((prev) => [template, ...prev.filter((t) => t.id !== template.id)])
  }

  const handleDelete = (id: string) => {
    removeStudioRecent(id)
    refreshRecents()
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  if (editorState) {
    return (
      <StudioEditorShell
        key={editorState.template?.id ?? 'new-design'}
        initialData={editorState.canvasData}
        template={editorState.template}
        initialName={editorState.draftName}
        initialCategory={editorState.draftCategory}
        initialSelectedLayerId={editorState.initialSelectedLayerId}
        brandKit={brandKit}
        onBack={handleEditorBack}
        onSaved={(template) => handleEditorSaved(template)}
<<<<<<< HEAD
=======
        onLibraryChange={handleTemplateAdded}
>>>>>>> origin/development
      />
    )
  }

  return (
    <>
      <StudioStarterPicker
        open={starterPickerOpen}
        onClose={() => setStarterPickerOpen(false)}
        onSelect={handleStarterSelect}
<<<<<<< HEAD
=======
        libraryTemplates={pickerLibraryTemplates}
>>>>>>> origin/development
      />
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
<<<<<<< HEAD
      className="max-w-7xl mx-auto px-6 py-10 relative z-10"
=======
      className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10"
>>>>>>> origin/development
    >
      {loadError ? (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {loadError}
        </div>
      ) : null}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-blue-400/80 mb-1">
            Studio
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900 dark:text-white">
            Design studio
          </h1>
          <p className="text-zinc-500 dark:text-white/40 mt-1 text-sm max-w-lg">
            {stats.total === 0
<<<<<<< HEAD
              ? 'Create feed posts, stories, and carousels with Canva-style tools — then use them in Generate.'
              : `${stats.total} template${stats.total === 1 ? '' : 's'} · ${stats.canvasDesigns} canvas design${stats.canvasDesigns === 1 ? '' : 's'} · ${stats.uploads} upload${stats.uploads === 1 ? '' : 's'}`}
=======
              ? 'Create feed posts, stories, and carousels — then use them in Generate.'
              : `${stats.total} template${stats.total === 1 ? '' : 's'} · ${stats.canvasDesigns} canvas design${stats.canvasDesigns === 1 ? '' : 's'}`}
>>>>>>> origin/development
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleNewDesign}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-[0_0_24px_-6px_rgba(59,130,246,0.5)]"
          >
            <Plus className="w-4 h-4" />
            New design
          </button>
          <Link
            href="/dashboard/generate"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-white/80 hover:bg-zinc-50 dark:hover:bg-white/5 font-medium text-sm transition-colors"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            Generate posts
          </Link>
        </div>
      </div>

<<<<<<< HEAD
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Uploads', value: stats.uploads },
          { label: 'Saved photos', value: stats.saved },
          { label: 'Canvas designs', value: stats.canvasDesigns },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/3 px-4 py-3"
          >
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-white/40">
              {s.label}
            </p>
            <p className="text-2xl font-mono font-bold text-zinc-900 dark:text-white mt-0.5">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 bg-white dark:bg-white/4 border border-zinc-200 dark:border-white/8 rounded-xl p-1 mb-6 w-fit">
=======
      {/* Tabs */}
      <div className="mb-6 flex w-fit flex-wrap items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-white/10 dark:bg-[#161b22]">
>>>>>>> origin/development
        {TABS.map((tab) => {
          const Icon = tab.icon
          const count =
            tab.id === 'uploads'
              ? stats.uploads
              : tab.id === 'saved'
                ? stats.saved
<<<<<<< HEAD
                : tab.id === 'all'
                  ? stats.uploads
=======
                :             tab.id === 'all'
                  ? stats.total
>>>>>>> origin/development
                  : undefined
          return (
            <button
              key={tab.id}
<<<<<<< HEAD
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
=======
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ui-transition ${
>>>>>>> origin/development
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-500 dark:text-white/40 hover:text-zinc-800 dark:hover:text-white/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {count !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-zinc-100 dark:bg-white/8'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab panels */}
      {activeTab === 'stock' ? (
        <StudioStockGrid
          savedIds={stockSavedIds}
          onSave={handleTemplateAdded}
          onOpenInEditor={handleOpenStockPhoto}
        />
      ) : activeTab === 'uploads' ? (
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Upload template</h2>
            </div>
            <StudioUploadZone onUploadSuccess={handleTemplateAdded} />
          </div>
<<<<<<< HEAD
          {filteredTemplates.length > 0 ? (
            <TemplateGrid
              templates={filteredTemplates}
              searchQuery={searchQuery}
              activeCategory={activeCategory}
              onSearchChange={setSearchQuery}
              onCategoryChange={setActiveCategory}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <EmptyState
              icon={FolderOpen}
              title="No uploads yet"
              description="Upload your first image template above — then edit it or use it in Generate."
            />
          )}
=======
          <TemplateGrid
            templates={filteredTemplates}
            categoryOptions={tabCategoryOptions}
            searchQuery={searchQuery}
            activeCategory={activeCategory}
            onSearchChange={setSearchQuery}
            onCategoryChange={setActiveCategory}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyTitle={
              activeCategory !== 'All'
                ? `No ${activeCategory.toLowerCase()} templates`
                : 'No uploads yet'
            }
            emptyDescription={
              activeCategory !== 'All'
                ? 'Nothing in this category yet. Choose All to see every template you have saved.'
                : 'Upload your first image template above — then edit it or use it in Generate.'
            }
            onClearCategory={
              activeCategory !== 'All' ? () => setActiveCategory('All') : undefined
            }
          />
>>>>>>> origin/development
        </div>
      ) : (
        <>
          {activeTab === 'all' && (
            <div className="mb-8">
              <StudioUploadZone onUploadSuccess={handleTemplateAdded} />
            </div>
          )}
<<<<<<< HEAD
          {activeTab === 'saved' && savedRecentItems.length > 0 && (
            <StudioRecentsSection items={savedRecentItems} onOpen={handleEdit} />
          )}
          {filteredTemplates.length > 0 ? (
            <TemplateGrid
              templates={filteredTemplates}
              searchQuery={searchQuery}
              activeCategory={activeCategory}
              onSearchChange={setSearchQuery}
              onCategoryChange={setActiveCategory}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <EmptyState
              icon={activeTab === 'saved' ? Bookmark : LayoutTemplate}
              title={activeTab === 'saved' ? 'No saved photos' : 'No templates yet'}
              description={
                activeTab === 'saved'
                  ? 'Browse Pexels and bookmark photos to build your library.'
                  : 'Upload an image, save from Pexels, or create a new canvas design.'
              }
              action={
                activeTab === 'saved' ? (
                  <button
                    onClick={() => setActiveTab('stock')}
                    className="text-sm font-semibold text-blue-400 hover:text-blue-300"
                  >
                    Browse Pexels →
                  </button>
                ) : (
                  <button
                    onClick={handleNewDesign}
                    className="text-sm font-semibold text-blue-400 hover:text-blue-300"
                  >
                    Create new design →
                  </button>
                )
              }
            />
          )}
=======
          {activeTab === 'all' && recentItems.length > 0 && (
            <StudioRecentsSection items={recentItems} onOpen={handleEdit} />
          )}
          {activeTab === 'saved' && savedRecentItems.length > 0 && (
            <StudioRecentsSection items={savedRecentItems} onOpen={handleEdit} />
          )}
          <TemplateGrid
            templates={filteredTemplates}
            categoryOptions={tabCategoryOptions}
            searchQuery={searchQuery}
            activeCategory={activeCategory}
            onSearchChange={setSearchQuery}
            onCategoryChange={setActiveCategory}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyTitle={
              activeCategory !== 'All'
                ? `No ${activeCategory.toLowerCase()} templates`
                : activeTab === 'saved'
                  ? 'No saved photos'
                  : templates.length > 0
                    ? 'No matching templates'
                    : 'No templates yet'
            }
            emptyDescription={
              activeCategory !== 'All'
                ? 'Nothing in this category yet. Choose All to see every template you have saved.'
                : activeTab === 'saved'
                  ? 'Browse Pexels and bookmark photos to build your library.'
                  : 'Upload an image, save from Pexels, or create a new canvas design.'
            }
            onClearCategory={
              activeCategory !== 'All' ? () => setActiveCategory('All') : undefined
            }
            action={
              activeCategory === 'All' && activeTab === 'saved' ? (
                <button
                  type="button"
                  onClick={() => setTab('stock')}
                  className="text-sm font-semibold text-blue-400 hover:text-blue-300"
                >
                  Browse Pexels →
                </button>
              ) : activeCategory === 'All' && templates.length === 0 ? (
                <button
                  type="button"
                  onClick={handleNewDesign}
                  className="text-sm font-semibold text-blue-400 hover:text-blue-300"
                >
                  Create new design →
                </button>
              ) : undefined
            }
          />
>>>>>>> origin/development
        </>
      )}
    </motion.div>
    </>
  )
}

function TemplateGrid({
  templates,
<<<<<<< HEAD
=======
  categoryOptions,
>>>>>>> origin/development
  searchQuery,
  activeCategory,
  onSearchChange,
  onCategoryChange,
  onEdit,
  onDelete,
<<<<<<< HEAD
}: {
  templates: StudioTemplate[]
=======
  emptyTitle,
  emptyDescription,
  onClearCategory,
  action,
}: {
  templates: StudioTemplate[]
  categoryOptions: readonly string[]
>>>>>>> origin/development
  searchQuery: string
  activeCategory: string
  onSearchChange: (v: string) => void
  onCategoryChange: (v: string) => void
  onEdit: (t: StudioTemplate) => void
  onDelete: (id: string) => void
<<<<<<< HEAD
=======
  emptyTitle: string
  emptyDescription: string
  onClearCategory?: () => void
  action?: React.ReactNode
>>>>>>> origin/development
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search templates…"
<<<<<<< HEAD
            className="pl-9 h-9 w-52 bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 rounded-xl text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {STUDIO_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
=======
            aria-label="Search templates"
            className="pl-9 h-9 w-52 bg-white dark:bg-[#161b22] border-zinc-200 dark:border-white/10 rounded-xl text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Template categories">
          {categoryOptions.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium ui-transition ${
>>>>>>> origin/development
                activeCategory === cat
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-white/60 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
<<<<<<< HEAD
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {templates.map((t) => (
          <StudioTemplateCard key={t.id} template={t} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
=======
      {templates.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {templates.map((t) => (
            <StudioTemplateCard key={t.id} template={t} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={LayoutTemplate}
          title={emptyTitle}
          description={emptyDescription}
          action={
            onClearCategory ? (
              <button
                type="button"
                onClick={onClearCategory}
                className="text-sm font-semibold text-blue-400 hover:text-blue-300"
              >
                Show all templates →
              </button>
            ) : (
              action
            )
          }
        />
      )}
>>>>>>> origin/development
    </div>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
<<<<<<< HEAD
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3 border border-dashed border-zinc-200 dark:border-white/10 rounded-2xl bg-white/50 dark:bg-white/2">
=======
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-200 bg-white py-16 text-center dark:border-white/10 dark:bg-[#161b22]">
>>>>>>> origin/development
      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-blue-400" />
      </div>
      <p className="text-sm font-medium text-zinc-700 dark:text-white/70">{title}</p>
      <p className="text-xs text-zinc-500 dark:text-white/30 max-w-xs">{description}</p>
      {action}
    </div>
  )
}
