'use client'

import Link from 'next/link'
import Image from 'next/image'
<<<<<<< HEAD
import { useState, useEffect, startTransition, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
=======
import { useState, useEffect, startTransition, useMemo, useRef, useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
>>>>>>> origin/development
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
<<<<<<< HEAD
  Sparkles, CheckCircle2, Loader2, Wand2, Check,
  AlignLeft, Hash, Image as ImageIcon, Briefcase, Tag, Flag,
  ChevronRight, Send, Clock, Bot, FolderOpen, LayoutTemplate, Info, Coins,
=======
  Sparkles, CheckCircle2, Loader2, Check,
  AlignLeft, Hash, Image as ImageIcon,
  ChevronRight, Send, Clock, LayoutTemplate, Info, Coins,
>>>>>>> origin/development
  CalendarDays, FileText, ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'

import type { CanvasData } from '@/types/canvas'
import { CanvasEditor } from '@/components/dashboard/studio/canvas-editor'
<<<<<<< HEAD
import { reviseCaptionAction, schedulePostsBatchAction, generatePostsAction } from '@/app/dashboard/generate/actions'
import type { GenerateContext, GenerateSetupInput } from '@/lib/generate-utils'
import { generateCanvasFromTemplate, matchTemplateToGoal } from '@/lib/generate-utils'
import { formatScheduledPreview, getMinScheduleDatetime } from '@/lib/post-schedule-utils'
import { imageToCanvas } from '@/lib/studio-utils'
=======
import { reviseCaptionAction, revisePostImageAction, schedulePostsBatchAction, generatePostsAction } from '@/app/dashboard/generate/actions'
import type { GenerateContext, GenerateSetupInput } from '@/lib/generate-utils'
import { generateCanvasFromTemplate, matchTemplateToGoal } from '@/lib/generate-utils'
import {
  formatScheduledPreview,
  getMinScheduleDatetime,
  toLocalGeneratedSchedule,
} from '@/lib/post-schedule-utils'
import { getTemplatePreviewUrl, imageToCanvas } from '@/lib/studio-utils'
import { CanvasMiniPreview } from '@/components/dashboard/studio/canvas-mini-preview'
>>>>>>> origin/development
import type { StudioTemplate } from '@/app/dashboard/studio/actions'
import { AiContentNotice } from '@/components/legal/ai-content-notice'
import {
  getContentGenerationStatus,
  getPostsForGeneration,
  type GeneratedPipelinePost,
  type GenerationRunStatus,
  type PipelineStage,
} from '@/lib/services/marketing-ai.service'
<<<<<<< HEAD
=======
import {
  calculateGenerationCreditCost,
  getGenerationCreditBreakdown,
} from '@/types/pipeline'
import { InlineNotice } from '@/components/ui/inline-notice'
>>>>>>> origin/development

// ─── Types ────────────────────────────────────────────────────────────────────
type FlowState = 'setup' | 'generating' | 'review' | 'scheduled'
type PostStatus = 'draft' | 'needs_review' | 'approved' | 'rejected' | 'scheduled' | 'published'
type TemplateSource = 'ai' | 'user'
<<<<<<< HEAD
=======
type NoticeTone = 'info' | 'success' | 'warning' | 'error'
>>>>>>> origin/development

interface GeneratedPost {
  id: string
  title: string
  caption: string
  hashtags: string
  canvasData: CanvasData
  scheduledDate: string
  status: PostStatus
  templateId?: string | null
<<<<<<< HEAD
=======
  imagePrompt?: string | null
  imageUrl?: string | null
>>>>>>> origin/development
}

type FlowNotice = {
  tone: NoticeTone
  title: string
  description: string
} | null

// ─── Mock Canvas Data ─────────────────────────────────────────────────────────
const FALLBACK_CANVAS: CanvasData = {
  version: '1.0',
  canvas: {
    width: 1080,
    height: 1080,
    backgroundColor: '#0d1117',
    aspectRatioName: 'square',
  },
  layers: [
    {
<<<<<<< HEAD
      id: "bg-image", type: "image", x: 0, y: 0, width: 1080, height: 1080, zIndex: 0,
      src: "https://picsum.photos/seed/marketme-demo/1080/1080"
=======
      id: 'bg',
      type: 'rect',
      x: 0,
      y: 0,
      width: 1080,
      height: 1080,
      fill: '#0d1117',
      zIndex: 0,
>>>>>>> origin/development
    },
    {
      id: 'bar',
      type: 'rect',
      x: 0,
      y: 0,
      width: 1080,
      height: 18,
      fill: '#38bdf8',
      zIndex: 1,
    },
    {
      id: 'main-text',
      type: 'text',
      x: 80,
      y: 420,
      width: 920,
      zIndex: 2,
      content: 'Draft ready for review',
      fontSize: 64,
      fontFamily: 'Geist',
      fill: '#f8fafc',
      align: 'left',
    },
  ],
}

<<<<<<< HEAD
=======
const POST_COUNT_PRESETS = [1, 3, 5, 7] as const
const PLATFORM_OPTIONS = ['Instagram'] as const
const GOAL_OPTIONS = [
  'Increase Brand Awareness',
  'Lead Generation',
  'Community Engagement',
  'Product Launch',
] as const

>>>>>>> origin/development
const DEFAULT_CONTEXT: GenerateContext = {
  businessName: 'My Business',
  industry: '',
  services: '',
  location: '',
  defaultTone: 'Professional',
  defaultGoal: 'Increase Brand Awareness',
  defaultPlatform: 'Instagram',
<<<<<<< HEAD
=======
  usesOnboardingBrandKit: false,
  learningLayers: {
    brandMemory: false,
    insights: false,
    insightsStatus: 'none',
  },
>>>>>>> origin/development
  hasLiveAi: false,
  hasOpenAI: false,
  aiProvider: 'none',
  preferredAiProvider: 'auto',
  captionModel: 'openai/gpt-4o-mini',
  captionModelLabel: 'GPT-4o mini',
  templateCount: 0,
  templateUsageCounts: {},
  creditsBalance: 50,
  creditsLimit: 50,
<<<<<<< HEAD
=======
  creditsResetAt: null,
>>>>>>> origin/development
  creditCostPerGeneration: 2,
}

const PROGRESS_STEPS = [
<<<<<<< HEAD
  'Analyzing Strategy Goal',
  'Brainstorming Content Angles',
  'Drafting Captions & Copy',
  'Injecting text into Studio Canvas',
  'Finalizing Review Package',
=======
  'Reading your brand kit',
  'Planning the week',
  'Writing captions',
  'Laying out visuals',
  'Packaging drafts',
>>>>>>> origin/development
]

const PIPELINE_STAGE_STEP_INDEX: Record<PipelineStage, number> = {
  business_profile_intake: 0,
  marketing_strategy_generation: 0,
  content_schedule_generation: 1,
  post_generation: 2,
  creative_brief_generation: 3,
  image_generation: 3,
  publishing: 4,
}

const COMPLETED_GENERATION_STATUSES =
  new Set<GenerationRunStatus>(['complete', 'completed'])

function isCanvasData(value: unknown): value is CanvasData {
  if (!value || typeof value !== 'object') return false

  const candidate = value as {
    canvas?: unknown
    layers?: unknown
  }

  return Boolean(
    candidate.canvas &&
    typeof candidate.canvas === 'object' &&
    Array.isArray(candidate.layers)
  )
}

function normalizePipelineHashtags(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .filter((tag): tag is string => typeof tag === 'string')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
      .join(' ')
  }

  if (typeof value === 'string') {
    return value.trim()
  }

  return ''
}

function normalizePipelinePostStatus(value: string): PostStatus {
  switch (value) {
    case 'approved':
    case 'rejected':
    case 'scheduled':
    case 'published':
      return value

    case 'draft':
    default:
      return 'needs_review'
  }
}

<<<<<<< HEAD
function toDatetimeLocalValue(
  value: string | null | undefined,
  fallbackIndex: number
): string {
  const fallback = new Date()
  fallback.setDate(fallback.getDate() + fallbackIndex + 1)
  fallback.setHours(9, 0, 0, 0)

  const parsed = value ? new Date(value) : fallback
  const date = Number.isNaN(parsed.getTime()) ? fallback : parsed

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000
  )

  return localDate.toISOString().slice(0, 16)
}

=======
>>>>>>> origin/development
function buildFallbackCanvas(
  post: GeneratedPipelinePost,
  title: string,
  caption: string,
  fallbackTemplate: StudioTemplate | null
): CanvasData {
  if (isCanvasData(post.canvas_data)) {
    return post.canvas_data
  }

  const generatedImageUrl =
    post.image_url ??
    post.generated_assets?.find((asset) => Boolean(asset.file_url))?.file_url ??
    null

  if (generatedImageUrl) {
    return generateCanvasFromTemplate(
      imageToCanvas(generatedImageUrl, title),
      title,
      caption
    )
  }

  if (fallbackTemplate?.canvas_data && isCanvasData(fallbackTemplate.canvas_data)) {
    return generateCanvasFromTemplate(
      fallbackTemplate.canvas_data,
      title,
      caption
    )
  }

  if (fallbackTemplate?.file_url) {
    return generateCanvasFromTemplate(
      imageToCanvas(fallbackTemplate.file_url, title),
      title,
      caption
    )
  }

<<<<<<< HEAD
  return generateCanvasFromTemplate(
    DUMMY_CANVAS_TEMPLATE,
    title,
    caption
  )
=======
  return generateCanvasFromTemplate(FALLBACK_CANVAS, title, caption)
>>>>>>> origin/development
}

function mapPipelinePostToReviewPost(
  post: GeneratedPipelinePost,
  index: number,
  fallbackTemplate: StudioTemplate | null
): GeneratedPost {
  const title =
    post.title?.trim() ||
    post.post_type?.trim() ||
    `Post ${index + 1}`

  const caption =
    post.caption?.trim() ||
    post.content?.trim() ||
    ''

<<<<<<< HEAD
=======
  const generatedImageUrl =
    post.image_url ??
    post.generated_assets?.find((asset) => Boolean(asset.file_url))?.file_url ??
    null

>>>>>>> origin/development
  return {
    id: post.id,
    title,
    caption,
    hashtags: normalizePipelineHashtags(post.hashtags),
    canvasData: buildFallbackCanvas(
      post,
      title,
      caption,
      fallbackTemplate
    ),
<<<<<<< HEAD
    scheduledDate: toDatetimeLocalValue(
      post.scheduled_at,
      index
    ),
=======
    scheduledDate: toLocalGeneratedSchedule(post.scheduled_at, index),
>>>>>>> origin/development
    status: normalizePipelinePostStatus(post.status),
    templateId:
      post.template_id ??
      fallbackTemplate?.id ??
      null,
<<<<<<< HEAD
=======
    imagePrompt: post.image_prompt ?? null,
    imageUrl: generatedImageUrl,
>>>>>>> origin/development
  }
}

// ─── Template Source Toggle ───────────────────────────────────────────────────
function TemplateSourcePicker({
  value,
  onChange,
  templates,
  selectedTemplateId,
  onSelectTemplate,
}: {
  value: TemplateSource
  onChange: (v: TemplateSource) => void
  templates: StudioTemplate[]
  selectedTemplateId: string | null
  onSelectTemplate: (id: string) => void
}) {
<<<<<<< HEAD
  return (
    <div className="col-span-1 md:col-span-2 space-y-4">
      <label className="text-[11px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
        <LayoutTemplate className="w-3.5 h-3.5" /> Template Source
      </label>

      {/* Toggle cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* AI Selects */}
        <button
          type="button"
          onClick={() => onChange('ai')}
          className={`relative flex flex-col items-start gap-2 p-4 rounded-xl border transition-all duration-200 text-left ${value === 'ai'
            ? 'bg-blue-500/10 border-blue-500/40 shadow-[inset_0_0_20px_rgba(59,130,246,0.08)]'
            : 'bg-zinc-50 dark:bg-black/30 border-black/5 dark:border-white/10 hover:border-blue-500/30'
            }`}
        >
          {value === 'ai' && (
            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
          )}
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${value === 'ai' ? 'bg-blue-500/20' : 'bg-zinc-100 dark:bg-white/5'
            }`}>
            <Bot className={`w-4.5 h-4.5 ${value === 'ai' ? 'text-blue-400' : 'text-zinc-400 dark:text-white/40'}`} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${value === 'ai' ? 'text-blue-300' : 'text-zinc-900 dark:text-white/80'}`}>
              AI Selects Best
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-white/30 leading-tight mt-0.5">
              Matches your goal to the best template automatically
            </p>
          </div>
        </button>

        {/* User Picks */}
        <button
          type="button"
          onClick={() => onChange('user')}
          className={`relative flex flex-col items-start gap-2 p-4 rounded-xl border transition-all duration-200 text-left ${value === 'user'
            ? 'bg-blue-500/10 border-blue-500/40 shadow-[inset_0_0_20px_rgba(59,130,246,0.08)]'
            : 'bg-zinc-50 dark:bg-black/30 border-black/5 dark:border-white/10 hover:border-blue-500/30'
            }`}
        >
          {value === 'user' && (
            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
          )}
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${value === 'user' ? 'bg-blue-500/20' : 'bg-zinc-100 dark:bg-white/5'
            }`}>
            <FolderOpen className={`w-4.5 h-4.5 ${value === 'user' ? 'text-blue-400' : 'text-zinc-400 dark:text-white/40'}`} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${value === 'user' ? 'text-blue-300' : 'text-zinc-900 dark:text-white/80'}`}>
              I&apos;ll Choose
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-white/30 leading-tight mt-0.5">
              Pick from your Studio library
            </p>
          </div>
        </button>
      </div>

      {/* AI mode indicator */}
      {value === 'ai' && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/8 border border-blue-500/20"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          </div>
          <p className="text-xs text-blue-300 leading-relaxed">
            The AI will analyze your goal and select the best matching template from your Studio library. If you have no templates, a built-in design will be used.
          </p>
        </motion.div>
      )}

      {/* User pick grid */}
      {value === 'user' && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          {templates.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 rounded-xl border border-dashed border-black/10 dark:border-white/10 text-center">
              <FolderOpen className="w-8 h-8 text-zinc-400 dark:text-white/20" />
              <p className="text-sm text-zinc-500 dark:text-white/40">No templates yet.</p>
              <p className="text-xs text-zinc-400 dark:text-white/25">Upload or save templates in the Studio first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {templates.map((tmpl) => {
                const isSelected = selectedTemplateId === tmpl.id
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => onSelectTemplate(tmpl.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${isSelected
                      ? 'border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.25)]'
                      : 'border-transparent hover:border-white/20'
                      }`}
                  >
                    <Image
                      src={tmpl.file_url}
                      alt={tmpl.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1 pt-3 opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-[9px] text-white font-medium truncate">{tmpl.name}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
          {selectedTemplateId && (
            <p className="text-[11px] text-blue-400 mt-2 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Template selected — AI will inject your copy into this design
            </p>
          )}
        </motion.div>
=======
  const selected = templates.find((template) => template.id === selectedTemplateId)

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-white/40">
        Studio layout
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          aria-pressed={value === 'ai'}
          onClick={() => onChange('ai')}
          className={`rounded-xl border px-3 py-3 text-left transition-colors ${
            value === 'ai'
              ? 'border-blue-500/40 bg-blue-500/10'
              : 'border-zinc-200 bg-zinc-50 hover:border-blue-500/30 dark:border-white/10 dark:bg-[#0f1419]'
          }`}
        >
          <p className={`text-sm font-semibold ${value === 'ai' ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-900 dark:text-white/80'}`}>
            Match for me
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-zinc-500 dark:text-white/40">
            Pick the best saved canvas for this goal
          </p>
        </button>
        <button
          type="button"
          aria-pressed={value === 'user'}
          onClick={() => onChange('user')}
          className={`rounded-xl border px-3 py-3 text-left transition-colors ${
            value === 'user'
              ? 'border-blue-500/40 bg-blue-500/10'
              : 'border-zinc-200 bg-zinc-50 hover:border-blue-500/30 dark:border-white/10 dark:bg-[#0f1419]'
          }`}
        >
          <p className={`text-sm font-semibold ${value === 'user' ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-900 dark:text-white/80'}`}>
            Choose a template
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-zinc-500 dark:text-white/40">
            Use a layout from Studio
          </p>
        </button>
      </div>

      {value === 'ai' ? (
        <p className="text-xs text-zinc-500 dark:text-white/40">
          {templates.length === 0
            ? 'No Studio templates yet — drafts use a built-in layout. '
            : 'Copy is injected into the closest matching Studio canvas. '}
          <Link href="/dashboard/studio" className="font-medium text-blue-500 hover:text-blue-400">
            Open Studio
          </Link>
        </p>
      ) : templates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-6 text-center dark:border-white/10">
          <p className="text-sm text-zinc-600 dark:text-white/50">No templates in your library yet.</p>
          <Link
            href="/dashboard/studio"
            className="mt-2 inline-flex h-9 items-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-500"
          >
            Create in Studio
          </Link>
        </div>
      ) : (
        <div>
          <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 md:grid-cols-5">
            {templates.map((tmpl) => {
              const isSelected = selectedTemplateId === tmpl.id
              const previewUrl = getTemplatePreviewUrl(tmpl)
              const canvasData = tmpl.canvas_data
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`Use ${tmpl.name}`}
                  onClick={() => onSelectTemplate(tmpl.id)}
                  className={`overflow-hidden rounded-lg border text-left transition-colors ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/30'
                      : 'border-zinc-200 hover:border-blue-500/40 dark:border-white/10'
                  }`}
                >
                  <div className="relative aspect-square bg-zinc-100 dark:bg-white/5">
                    {canvasData ? (
                      <CanvasMiniPreview canvasData={canvasData} className="rounded-none border-0" />
                    ) : previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <p className="truncate px-1.5 py-1 text-[11px] text-zinc-600 dark:text-white/60">
                    {tmpl.name}
                  </p>
                </button>
              )
            })}
          </div>
          {selected ? (
            <p className="mt-2 text-[11px] text-blue-500">
              {selected.name} — copy will be injected into this design
            </p>
          ) : (
            <p className="mt-2 text-[11px] text-zinc-500 dark:text-white/40">
              Select a layout to continue
            </p>
          )}
        </div>
>>>>>>> origin/development
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function GenerateContent({
  initialTemplates = [],
  initialContext = null,
}: {
  initialTemplates?: StudioTemplate[]
  initialContext?: GenerateContext | null
}) {
  const ctx = initialContext ?? DEFAULT_CONTEXT
  const searchParams = useSearchParams()
<<<<<<< HEAD
=======
  const router = useRouter()
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const resumedRun = useRef(false)
>>>>>>> origin/development
  const [flowState, setFlowState] = useState<FlowState>('setup')
  const [posts, setPosts] = useState<GeneratedPost[]>([])
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [scheduledCount, setScheduledCount] = useState(0)

  // Template selection state
  const [templateSource, setTemplateSource] = useState<TemplateSource>('ai')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  // Setup Form State — seeded from business profile
  const [setupData, setSetupData] = useState({
    business: ctx.businessName,
<<<<<<< HEAD
    goal: ctx.defaultGoal,
    platform: ctx.defaultPlatform,
    numPosts: 3,
    tone: ctx.defaultTone,
=======
    goal:
      GOAL_OPTIONS.find((goal) => goal.toLowerCase() === ctx.defaultGoal.toLowerCase()) ??
      ctx.defaultGoal,
    platform:
      PLATFORM_OPTIONS.find(
        (platform) => platform.toLowerCase() === ctx.defaultPlatform.toLowerCase()
      ) ?? 'Instagram',
    numPosts: 3,
    tone: ctx.defaultTone,
    topic: '',
>>>>>>> origin/development
  })

  useEffect(() => {
    startTransition(() => {
<<<<<<< HEAD
      const prompt = searchParams.get('prompt')?.trim()
      const templateId = searchParams.get('templateId')

      if (prompt) {
        setSetupData((prev) => ({ ...prev, tone: prompt }))
=======
      const prompt =
        searchParams.get('prompt')?.trim() || searchParams.get('topic')?.trim()
      const templateId = searchParams.get('templateId')

      if (prompt) {
        setSetupData((prev) => ({ ...prev, topic: prompt }))
>>>>>>> origin/development
      }

      if (templateId && initialTemplates.some((template) => template.id === templateId)) {
        setTemplateSource('user')
        setSelectedTemplateId(templateId)
      }
    })
  }, [searchParams, initialTemplates])

<<<<<<< HEAD
=======
  const persistGenerateUrl = useCallback(
    (step: FlowState, runId?: string | null) => {
      const params = new URLSearchParams()
      const topic = setupData.topic.trim()
      if (topic) params.set('prompt', topic)
      if (selectedTemplateId) params.set('templateId', selectedTemplateId)
      if (step !== 'setup') params.set('step', step)
      if (runId) params.set('run', runId)
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, selectedTemplateId, setupData.topic]
  )

  const creditsNeeded = calculateGenerationCreditCost(setupData.numPosts)
  const creditBreakdown = getGenerationCreditBreakdown(setupData.numPosts)
  const canAfford = ctx.creditsBalance >= creditsNeeded

>>>>>>> origin/development
  const fallbackTemplate = useMemo<StudioTemplate | null>(() => {
    if (templateSource === 'user' && selectedTemplateId) {
      return initialTemplates.find((template) => template.id === selectedTemplateId) ?? null
    }

    if (templateSource === 'ai') {
      const editableTemplates = initialTemplates.filter(
        (template) => template.canvas_data !== null
      )

      return matchTemplateToGoal(
        editableTemplates.length > 0 ? editableTemplates : initialTemplates,
        setupData.goal
      )
    }

    return null
  }, [initialTemplates, selectedTemplateId, setupData.goal, templateSource])

  // Real pipeline generation state
  const [generationId, setGenerationId] = useState<string | null>(null)
  const [generationStatus, setGenerationStatus] =
    useState<GenerationRunStatus | null>(null)
  const [generationStage, setGenerationStage] =
    useState<PipelineStage>('business_profile_intake')
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationMessage, setGenerationMessage] = useState<string | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
<<<<<<< HEAD
=======
  const [setupNotice, setSetupNotice] = useState<FlowNotice>(null)
  const [flowNotice, setFlowNotice] = useState<FlowNotice>(null)

  useEffect(() => {
    if (resumedRun.current) return
    const step = searchParams.get('step')
    const run = searchParams.get('run')
    if (run && (step === 'generating' || step === 'review')) {
      resumedRun.current = true
      queueMicrotask(() => {
        setGenerationId(run)
        setGenerationStatus('queued')
        setGenerationMessage('Resuming your generation…')
        setFlowState('generating')
      })
    }
  }, [searchParams])

  useEffect(() => {
    if (flowState === 'setup') {
      queueMicrotask(() => setSetupNotice(null))
    }
  }, [flowState, setupData.numPosts, setupData.goal, setupData.topic, selectedTemplateId, templateSource])

  useEffect(() => {
    if (flowState !== 'generating') return
    const onLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onLeave)
    return () => window.removeEventListener('beforeunload', onLeave)
  }, [flowState])
>>>>>>> origin/development

  const generationComplete =
    flowState === 'generating' &&
    generationStatus !== null &&
    COMPLETED_GENERATION_STATUSES.has(generationStatus) &&
    posts.length > 0

  const handleStartGeneration = async () => {
    if (templateSource === 'user' && !selectedTemplateId) {
<<<<<<< HEAD
      toast.error('Select a Studio template or switch to AI template matching.')
=======
      setSetupNotice({
        tone: 'error',
        title: 'Select a template first',
        description: 'Choose a Studio template or switch back to AI template matching before generating.',
      })
>>>>>>> origin/development
      return
    }

    if (setupData.numPosts < 1 || setupData.numPosts > 14) {
<<<<<<< HEAD
      toast.error('Number of posts must be between 1 and 14.')
      return
    }

=======
      setSetupNotice({
        tone: 'error',
        title: 'Draft count is out of range',
        description: 'Pick between 1 and 14 drafts for a single generation run.',
      })
      return
    }

    if (!canAfford) {
      setSetupNotice({
        tone: 'warning',
        title: 'Not enough credits for this run',
        description: `This run needs ${creditsNeeded} credits, but only ${ctx.creditsBalance} remain. Upgrade your plan or wait for your monthly reset.`,
      })
      return
    }

    setSetupNotice(null)
    setFlowNotice(null)

>>>>>>> origin/development
    setPosts([])
    setSelectedPostId(null)
    setGenerationId(null)
    setGenerationStatus('queued')
    setGenerationStage('business_profile_intake')
    setGenerationProgress(0)
    setGenerationMessage('Preparing your business context…')
    setCurrentStepIndex(0)
    setFlowState('generating')

    const actionInput: GenerateSetupInput & {
      templateSource: TemplateSource
      templateId?: string | null
    } = {
      businessName: setupData.business,
      goal: setupData.goal,
      platform: setupData.platform,
      numPosts: setupData.numPosts,
      tone: setupData.tone,
<<<<<<< HEAD
=======
      topic: setupData.topic.trim() || undefined,
>>>>>>> origin/development
      templateSource,
      templateId: templateSource === 'user' ? selectedTemplateId : null,
    }

    const result = await generatePostsAction(actionInput)

    if (!result.success || !result.generationId) {
      const message = result.error ?? 'Failed to start content generation'
<<<<<<< HEAD

      if (message.toLowerCase().includes('insufficient credits')) {
        toast.error(message, {
          description: 'Upgrade your plan or wait for your monthly credit reset.',
        })
      } else {
        toast.error(message)
      }
=======
      setSetupNotice({
        tone: message.toLowerCase().includes('insufficient credits') ? 'warning' : 'error',
        title: 'Could not start generation',
        description: message.toLowerCase().includes('insufficient credits')
          ? `${message} Upgrade your plan or wait for your monthly credit reset.`
          : `${message}. Check your setup and try again.`,
      })
>>>>>>> origin/development

      setGenerationStatus(null)
      setGenerationMessage(null)
      setFlowState('setup')
<<<<<<< HEAD
=======
      persistGenerateUrl('setup')
>>>>>>> origin/development
      return
    }

    setGenerationId(result.generationId)
    setGenerationStatus(result.status ?? 'queued')
    setGenerationStage(result.stage ?? 'business_profile_intake')
    setGenerationMessage(result.message ?? 'Content generation started.')
<<<<<<< HEAD
=======
    persistGenerateUrl('generating', result.generationId)
>>>>>>> origin/development
  }

  useEffect(() => {
    if (flowState !== 'generating' || !generationId) return

    let cancelled = false
    let timer: number | undefined
    let consecutiveErrors = 0
    const startedAt = Date.now()
    const timeoutMs = 15 * 60_000

    const scheduleNextPoll = () => {
      if (cancelled) return
      timer = window.setTimeout(() => {
        void pollGeneration()
      }, 2_000)
    }

    const failGeneration = (message: string) => {
      if (cancelled) return

      console.error('Generation UI failed:', {
        generationId,
        consecutiveErrors,
        message,
      })

<<<<<<< HEAD
      toast.error(message)
=======
      setFlowNotice({
        tone: 'error',
        title: 'Generation stopped',
        description: `${message} You can go back to setup and try again.`,
      })
>>>>>>> origin/development
      setGenerationStatus('failed')
      setGenerationMessage(message)
    }

    const pollGeneration = async (): Promise<void> => {
      if (cancelled) return

      if (Date.now() - startedAt > timeoutMs) {
        failGeneration(
          'Content generation timed out. Check the generation record and backend logs.'
        )
        return
      }

      try {
        const status = await getContentGenerationStatus(generationId)
<<<<<<< HEAD
        console.log('Generation status response:', status)
=======
>>>>>>> origin/development

        if (cancelled) return

        consecutiveErrors = 0

        setGenerationStatus(status.status)
        setGenerationStage(status.stage)
        setGenerationProgress(status.progress)
        setGenerationMessage(
          status.status_message ??
          status.message ??
          'MarketMe is generating your content…'
        )

        if (status.status === 'failed') {
          failGeneration(
            status.error_message ??
            status.error ??
            'The content generation pipeline failed.'
          )
          return
        }

        if (COMPLETED_GENERATION_STATUSES.has(status.status)) {
          const generatedPosts = await getPostsForGeneration(generationId)
<<<<<<< HEAD
          console.log('Generated posts response:', generatedPosts)
=======
>>>>>>> origin/development

          if (cancelled) return

          if (generatedPosts.length === 0) {
            throw new Error(
              'The pipeline completed, but no generated posts were returned.'
            )
          }

          const reviewPosts = generatedPosts.map((post, index) =>
            mapPipelinePostToReviewPost(
              post,
              index,
              fallbackTemplate
            )
          )
<<<<<<< HEAD
          console.log('Mapped review posts:', reviewPosts)

          setPosts(reviewPosts)
          setGenerationProgress(100)
          setGenerationMessage('Your review package is ready.')
          setCurrentStepIndex(PROGRESS_STEPS.length)
=======

          setPosts(reviewPosts)
          setSelectedPostId(reviewPosts[0]?.id ?? null)
          setGenerationProgress(100)
          setGenerationMessage('Your review package is ready.')
          setCurrentStepIndex(PROGRESS_STEPS.length)
          setFlowState('review')
          persistGenerateUrl('review', generationId)
>>>>>>> origin/development
          return
        }

        setCurrentStepIndex(
          PIPELINE_STAGE_STEP_INDEX[status.stage] ?? 0
        )

        scheduleNextPoll()
      } catch (error) {
        consecutiveErrors += 1

        console.error(
          'Failed to poll content generation:',
          error
        )

        if (consecutiveErrors >= 5) {
          const message =
            error instanceof Error
              ? error.message
              : 'Unable to read generation status.'

          console.error('Generation polling stopped after 5 errors:', {
            generationId,
            consecutiveErrors,
            message,
            error,
          })

<<<<<<< HEAD
          toast.error(message)
=======
          setFlowNotice({
            tone: 'error',
            title: 'Live updates stopped',
            description: `${message} Refresh the page or restart the generation if it does not recover.`,
          })
>>>>>>> origin/development
          setGenerationStatus('failed')
          setGenerationMessage(message)

          return
        }

        scheduleNextPoll()
      }
    }

    void pollGeneration()

    return () => {
      cancelled = true

      if (timer !== undefined) {
        window.clearTimeout(timer)
      }
    }
<<<<<<< HEAD
  }, [fallbackTemplate, flowState, generationId])

  const handleGoToReview = () => {
    if (!generationComplete || posts.length === 0) {
      toast.error('Generation is still in progress. Please wait.')
=======
  }, [fallbackTemplate, flowState, generationId, persistGenerateUrl])

  const handleGoToReview = () => {
    if (!generationComplete || posts.length === 0) {
      setFlowNotice({
        tone: 'info',
        title: 'Generation is still running',
        description: 'Wait for the review package to finish loading before opening it.',
      })
>>>>>>> origin/development
      return
    }

    setSelectedPostId(posts[0].id)
    setFlowState('review')
    persistGenerateUrl('review', generationId)
  }

  // Edit State
  const selectedPost = posts.find(p => p.id === selectedPostId)
  const approvedPosts = useMemo(
    () => posts.filter((p) => p.status === 'approved'),
    [posts]
  )
  const approvedCount = approvedPosts.length
  const [editCaption, setEditCaption] = useState('')
  const [editHashtags, setEditHashtags] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [reviseTarget, setReviseTarget] = useState<'caption' | 'image'>('caption')
  const [isApplyingAi, setIsApplyingAi] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)

  useEffect(() => {
    if (!selectedPost) return
    startTransition(() => {
      setEditCaption(selectedPost.caption)
      setEditHashtags(selectedPost.hashtags)
      setAiPrompt('')
    })
  }, [selectedPost])

  const updatePostStatus = (id: string, status: PostStatus) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status } : p))
  }

  const handleApplyAiEdit = async () => {
    if (!aiPrompt.trim() || !selectedPost) return
    setIsApplyingAi(true)

    try {
      if (reviseTarget === 'image') {
        const result = await revisePostImageAction({
          postId: selectedPost.id,
          instruction: aiPrompt,
          currentPrompt: selectedPost.imagePrompt,
          caption: editCaption,
          title: selectedPost.title,
        })
        if (!result.success) {
          setFlowNotice({
            tone: 'error',
            title: 'Image revision failed',
            description: result.error ?? 'Try a simpler instruction or regenerate the image again.',
          })
          return
        }
        const nextCanvas = generateCanvasFromTemplate(
          imageToCanvas(result.imageUrl, selectedPost.title),
          selectedPost.title,
          editCaption
        )
        setPosts((prev) =>
          prev.map((p) =>
            p.id === selectedPost.id
              ? {
                  ...p,
                  imagePrompt: result.imagePrompt,
                  imageUrl: result.imageUrl,
                  canvasData: nextCanvas,
                }
              : p
          )
        )
        setAiPrompt('')
        toast.success('Image revised and regenerated')
        return
      }

      const newCaption = await reviseCaptionAction(editCaption, aiPrompt, setupData.platform)
      setEditCaption(newCaption)
      setAiPrompt('')
<<<<<<< HEAD
      toast.success("Caption revised successfully")
    } catch (error) {
      console.error("Failed to revise caption", error)
      toast.error("Failed to generate revision. Please try again.")
=======
      toast.success('Caption revised successfully')
    } catch (error) {
      console.error('Failed to revise with AI', error)
      setFlowNotice({
        tone: 'error',
        title: reviseTarget === 'image' ? 'Image revision failed' : 'Caption revision failed',
        description:
          reviseTarget === 'image'
            ? 'Please try again with a clearer image instruction.'
            : 'Please try again with a more specific caption instruction.',
      })
>>>>>>> origin/development
    } finally {
      setIsApplyingAi(false)
    }
  }

  const handleSchedulePost = async () => {
    if (!selectedPost) return

    const postsWithEdits = posts.map((p) =>
      p.id === selectedPost.id
        ? { ...p, caption: editCaption, hashtags: editHashtags }
        : p
    )
    setPosts(postsWithEdits)

    const toSchedule = postsWithEdits.filter((p) => p.status === 'approved')
    if (toSchedule.length === 0) {
<<<<<<< HEAD
      toast.error('Approve at least one post before scheduling.')
=======
      setFlowNotice({
        tone: 'warning',
        title: 'Nothing is approved yet',
        description: 'Approve at least one draft before sending posts to the calendar.',
      })
>>>>>>> origin/development
      return
    }

    setIsScheduling(true)

    try {
      const res = await schedulePostsBatchAction({
        platform: setupData.platform,
        posts: toSchedule.map((p) => ({
<<<<<<< HEAD
=======
          postId: p.id,
>>>>>>> origin/development
          caption: p.caption,
          hashtags: p.hashtags,
          canvasData: p.canvasData,
          scheduledDate: p.scheduledDate,
          templateId: p.templateId ?? null,
<<<<<<< HEAD
=======
          imageUrl: p.imageUrl ?? null,
>>>>>>> origin/development
        })),
      })

      if (res.success && res.scheduledCount > 0) {
        const scheduledIds = new Set(toSchedule.map((p) => p.id))
        setPosts((prev) =>
          prev.map((p) =>
            scheduledIds.has(p.id) ? { ...p, status: 'scheduled' as PostStatus } : p
          )
        )
        setScheduledCount(res.scheduledCount)
        setFlowState('scheduled')
<<<<<<< HEAD
=======
        persistGenerateUrl('scheduled')
        setFlowNotice(
          res.error
            ? {
                tone: 'warning',
                title: 'Scheduled with warnings',
                description: res.error,
              }
            : null
        )
>>>>>>> origin/development
        toast.success(
          res.scheduledCount === 1
            ? 'Post scheduled successfully'
            : `${res.scheduledCount} posts scheduled successfully`
        )
<<<<<<< HEAD
        if (res.error) {
          toast.warning(res.error)
        }
      } else {
        toast.error(res.error ?? 'Failed to schedule posts')
      }
    } catch (error) {
      console.error('Failed to schedule posts', error)
      toast.error(
        error instanceof Error ? error.message : 'An unexpected error occurred while scheduling'
      )
=======
      } else {
        setFlowNotice({
          tone: 'error',
          title: 'Scheduling failed',
          description: res.error ?? 'Review the approved posts and try scheduling again.',
        })
      }
    } catch (error) {
      console.error('Failed to schedule posts', error)
      setFlowNotice({
        tone: 'error',
        title: 'Scheduling failed',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred while scheduling. Please try again.',
      })
>>>>>>> origin/development
    } finally {
      setIsScheduling(false)
    }
  }

  const updatePostSchedule = (id: string, scheduledDate: string) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, scheduledDate } : p)))
  }
<<<<<<< HEAD

  return (
    <div className="relative w-full min-h-[calc(100vh-2rem)] flex flex-col items-center pt-8 pb-12 overflow-hidden">

      {/* Ambient Backgrounds for Setup/Generating/Scheduled */}
      {flowState !== 'review' && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
        </>
      )}
=======
>>>>>>> origin/development

  return (
    <div className="relative w-full min-h-[calc(100dvh-2rem)] flex flex-col items-center pt-8 pb-12">
      {(flowState === 'setup' ? setupNotice : flowNotice) ? (
        <div className="w-full max-w-3xl px-4 pb-4 sm:px-6">
          <InlineNotice
            tone={(flowState === 'setup' ? setupNotice : flowNotice)?.tone}
            title={(flowState === 'setup' ? setupNotice : flowNotice)?.title}
            description={(flowState === 'setup' ? setupNotice : flowNotice)?.description ?? ''}
          />
        </div>
      ) : null}
      <AnimatePresence mode="wait">

        {/* ────────────────────────────────────────────────────────────────────────
            STATE: SETUP
        ──────────────────────────────────────────────────────────────────────── */}
        {flowState === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="relative z-10 w-full max-w-3xl px-4 sm:px-6"
          >
<<<<<<< HEAD
            <div className="mb-12 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500/20 to-blue-500/20 border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.2)] mb-6">
                <Sparkles className="w-6 h-6 text-blue-300" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-900 dark:text-white mb-4">
                Generate <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-sky-300">Weekly Content</span>
              </h1>
              <p className="text-lg text-zinc-500 dark:text-white/50 max-w-lg mx-auto leading-relaxed">
                Configure your AI engine to craft a week&apos;s worth of high-converting social posts in seconds.
              </p>
            </div>

            <div className="mb-8 flex flex-col gap-3">
              <div className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/8 px-4 py-2.5 text-sm text-zinc-700 dark:text-white/80">
                <Coins className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  <strong className="text-zinc-900 dark:text-white">{ctx.creditsBalance}</strong>
                  {ctx.creditsLimit != null ? ` / ${ctx.creditsLimit}` : ''} credits remaining
                  <span className="text-zinc-500 dark:text-white/40">
                    {' '}· {ctx.creditCostPerGeneration} per generation run
                  </span>
                </span>
              </div>
              {!ctx.hasOpenAI && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-sm text-amber-900 dark:text-amber-100/90">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    The MarketMe AI pipeline is currently unavailable. Confirm that the FastAPI
                    backend is online and that its AI providers are configured.
                    {ctx.templateCount > 0
                      ? ` ${ctx.templateCount} Studio template${ctx.templateCount === 1 ? '' : 's'} available.`
                      : ''}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-[#0a0a14]/60 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-blue-500/30 to-transparent" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Group */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" /> Business Profile
                  </label>
                  <Input
                    value={setupData.business} onChange={e => setSetupData({ ...setupData, business: e.target.value })}
                    className="h-12 bg-zinc-50 dark:bg-black/40 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/20 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500/50 transition-all shadow-inner"
                  />
                </div>

                {/* Form Group */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Flag className="w-3.5 h-3.5" /> Strategy Goal
                  </label>
                  <div className="relative">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-full h-12 px-4 flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-black/40 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-white text-sm outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 shadow-inner group">
                        <span className="truncate">{setupData.goal}</span>
                        <ChevronRight className="w-4 h-4 text-zinc-500 dark:text-white/30 rotate-90 group-data-[state=open]:-rotate-90 transition-transform shrink-0 ml-2" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[--anchor-width] bg-popover text-popover-foreground border border-border shadow-lg rounded-xl p-1.5 z-50">
                        {['Increase Brand Awareness', 'Lead Generation', 'Community Engagement', 'Product Launch'].map((goal) => (
                          <DropdownMenuItem
                            key={goal}
                            onClick={() => setSetupData({ ...setupData, goal })}
                            className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm outline-none flex items-center justify-between transition-colors ${setupData.goal === goal
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-300'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              }`}
                          >
                            {goal}
                            {setupData.goal === goal && <Check className="w-4 h-4 text-blue-400" />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Form Group */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    Platform
                  </label>
                  <div className="relative">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-full h-12 px-4 flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-black/40 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-white text-sm outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 shadow-inner group">
                        <span className="truncate">{setupData.platform}</span>
                        <ChevronRight className="w-4 h-4 text-zinc-500 dark:text-white/30 rotate-90 group-data-[state=open]:-rotate-90 transition-transform shrink-0 ml-2" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[--anchor-width] bg-popover text-popover-foreground border border-border shadow-lg rounded-xl p-1.5 z-50">
                        {['Instagram', 'LinkedIn', 'Twitter', 'Facebook'].map((platform) => (
                          <DropdownMenuItem
                            key={platform}
                            onClick={() => setSetupData({ ...setupData, platform })}
                            className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm outline-none flex items-center justify-between transition-colors ${setupData.platform === platform
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-300'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              }`}
                          >
                            {platform}
                            {setupData.platform === platform && <Check className="w-4 h-4 text-blue-400" />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Form Group */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    Number of Posts
                  </label>
                  <Input
                    type="number" min={1} max={14}
                    value={setupData.numPosts} onChange={e => setSetupData({ ...setupData, numPosts: parseInt(e.target.value) })}
                    className="h-12 bg-zinc-50 dark:bg-black/40 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-white rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all shadow-inner"
                  />
                </div>

                {/* Template Source Picker */}
                <TemplateSourcePicker
                  value={templateSource}
                  onChange={(v) => {
                    setTemplateSource(v)
                    if (v === 'ai') setSelectedTemplateId(null)
                  }}
                  templates={initialTemplates}
                  selectedTemplateId={selectedTemplateId}
                  onSelectTemplate={setSelectedTemplateId}
                />

                {/* Form Group (Full Width) */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" /> Tone (Optional)
                  </label>
                  <Input
                    placeholder="e.g. Professional, Witty, Casual, Urgent..."
                    value={setupData.tone} onChange={e => setSetupData({ ...setupData, tone: e.target.value })}
                    className="h-12 bg-zinc-50 dark:bg-black/40 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/20 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500/50 transition-all shadow-inner"
=======
            <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-blue-400/80 mb-1">
                  Generate
                </p>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900 dark:text-white text-pretty">
                  Draft this week&apos;s posts
                </h1>
                <p className="text-zinc-500 dark:text-white/40 mt-1 text-sm max-w-lg">
                  AI drafts from your brand kit. You review before anything goes live.
                </p>
              </div>
              <Link
                href="/dashboard/studio"
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/5"
              >
                <LayoutTemplate className="h-4 w-4 text-blue-400" aria-hidden="true" />
                Open Studio
              </Link>
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600 dark:border-white/10 dark:bg-[#0f1419] dark:text-white/70">
                <Coins className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
                {ctx.creditsBalance}
                {ctx.creditsLimit != null ? ` / ${ctx.creditsLimit}` : ''} credits
                <span className="text-zinc-400 dark:text-white/35">
                  · {creditsNeeded} this run
                </span>
              </span>
              {ctx.creditsResetAt ? (
                <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600 dark:border-white/10 dark:bg-[#0f1419] dark:text-white/70">
                  {new Date(ctx.creditsResetAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  reset
                </span>
              ) : null}
              {ctx.businessName ? (
                <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600 dark:border-white/10 dark:bg-[#0f1419] dark:text-white/70">
                  {ctx.businessName}
                </span>
              ) : null}
              {ctx.industry ? (
                <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600 dark:border-white/10 dark:bg-[#0f1419] dark:text-white/70">
                  {ctx.industry}
                </span>
              ) : null}
              {ctx.learningLayers?.brandMemory ? (
                <span className="inline-flex items-center rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1 text-xs text-sky-800 dark:text-sky-200">
                  Brand memory on
                </span>
              ) : null}
              {ctx.learningLayers?.insights ? (
                <span className="inline-flex items-center rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1 text-xs text-sky-800 dark:text-sky-200">
                  Insights on
                </span>
              ) : null}
              {!ctx.usesOnboardingBrandKit ? (
                <Link
                  href="/dashboard/settings?tab=Workspace"
                  className="inline-flex items-center rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs text-amber-800 hover:border-amber-500/50 dark:text-amber-200"
                >
                  Complete brand profile
                </Link>
              ) : null}
            </div>

            {!ctx.hasOpenAI && (
              <div
                role="status"
                className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-sm text-amber-900 dark:text-amber-100/90"
              >
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                <p>
                  The MarketMe AI pipeline is currently unavailable. Confirm the FastAPI
                  backend is online and AI providers are configured.
                  {ctx.templateCount > 0
                    ? ` ${ctx.templateCount} Studio template${ctx.templateCount === 1 ? '' : 's'} available.`
                    : ''}
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-[#161b22] md:p-8">
              <div className="space-y-2">
                <label
                  htmlFor="generate-topic"
                  className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-white/40"
                >
                  What should this batch cover?
                </label>
                <Textarea
                  id="generate-topic"
                  name="topic"
                  autoComplete="off"
                  rows={4}
                  placeholder="3 Instagram posts for a Kingston café launch…"
                  value={setupData.topic}
                  onChange={(e) => setSetupData({ ...setupData, topic: e.target.value })}
                  className="min-h-28 resize-y rounded-xl border-zinc-200 bg-zinc-50 px-3.5 py-3 text-sm dark:border-white/10 dark:bg-black/30"
                />
                <p className="text-[11px] text-zinc-500 dark:text-white/35">
                  Optional. Leave blank to draft from your profile, goal, and Studio template.
                </p>
              </div>

              <fieldset className="mt-6 space-y-2">
                <legend className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-white/40">
                  Platform
                </legend>
                <div className="flex flex-wrap gap-2">
                  {PLATFORM_OPTIONS.map((platform) => {
                    const selected = setupData.platform === platform
                    return (
                      <button
                        key={platform}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setSetupData({ ...setupData, platform })}
                        className={`h-9 rounded-lg px-3 text-sm font-medium transition-colors ${
                          selected
                            ? 'bg-blue-600 text-white'
                            : 'border border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-blue-500/40 dark:border-white/10 dark:bg-[#0f1419] dark:text-white/70'
                        }`}
                      >
                        {platform}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-white/35">
                  Instagram is the only live publishing channel right now.
                </p>
              </fieldset>

              <fieldset className="mt-6 space-y-2">
                <legend className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-white/40">
                  Number of drafts
                </legend>
                <div className="flex flex-wrap gap-2">
                  {POST_COUNT_PRESETS.map((count) => {
                    const selected = setupData.numPosts === count
                    return (
                      <button
                        key={count}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setSetupData({ ...setupData, numPosts: count })}
                        className={`h-9 min-w-10 rounded-lg px-3 text-sm font-medium tabular-nums transition-colors ${
                          selected
                            ? 'bg-blue-600 text-white'
                            : 'border border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-blue-500/40 dark:border-white/10 dark:bg-[#0f1419] dark:text-white/70'
                        }`}
                      >
                        {count}
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="generate-goal"
                    className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-white/40"
                  >
                    Goal
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      id="generate-goal"
                      className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 dark:border-white/10 dark:bg-black/30 dark:text-white"
                    >
                      <span className="truncate">{setupData.goal}</span>
                      <ChevronRight className="ml-2 h-4 w-4 shrink-0 rotate-90 text-zinc-400" aria-hidden="true" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-(--anchor-width) rounded-xl border border-border bg-popover p-1.5 text-popover-foreground z-50">
                      {GOAL_OPTIONS.map((goal) => (
                        <DropdownMenuItem
                          key={goal}
                          onClick={() => setSetupData({ ...setupData, goal })}
                          className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm outline-none ${
                            setupData.goal === goal
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-300'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          {goal}
                          {setupData.goal === goal && <Check className="h-4 w-4 text-blue-400" aria-hidden="true" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="generate-tone"
                    className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-white/40"
                  >
                    Tone
                  </label>
                  <Input
                    id="generate-tone"
                    name="tone"
                    autoComplete="off"
                    placeholder="Professional, witty, urgent…"
                    value={setupData.tone}
                    onChange={(e) => setSetupData({ ...setupData, tone: e.target.value })}
                    className="h-10 rounded-xl border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black/30"
>>>>>>> origin/development
                  />
                </div>
              </div>

<<<<<<< HEAD
              <div className="mt-10">
=======
              <div className="mt-6">
                <TemplateSourcePicker
                  value={templateSource}
                  onChange={(v) => {
                    setTemplateSource(v)
                    if (v === 'ai') setSelectedTemplateId(null)
                  }}
                  templates={initialTemplates}
                  selectedTemplateId={selectedTemplateId}
                  onSelectTemplate={setSelectedTemplateId}
                />
              </div>

              <div className="mt-8 space-y-2">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-[#161b22]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-white/40">
                      Credit estimate
                    </p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {creditsNeeded} credits
                    </p>
                  </div>
                  <div className="mt-3 space-y-2">
                    {creditBreakdown.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between text-sm text-zinc-600 dark:text-white/65"
                      >
                        <span>{item.label}</span>
                        <span className="tabular-nums">{item.credits}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-white/40">
                    Image generation is charged separately when you request AI visuals.
                  </p>
                </div>
>>>>>>> origin/development
                <Button
                  onClick={handleStartGeneration}
                  disabled={!canAfford || (templateSource === 'user' && !selectedTemplateId)}
                  className="h-11 w-full gap-2 rounded-xl bg-blue-600 text-base font-semibold text-white transition-colors hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50"
                >
<<<<<<< HEAD
                  <Sparkles className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  Generate {setupData.numPosts} Posts
=======
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Generate {setupData.numPosts} draft{setupData.numPosts === 1 ? '' : 's'}
                  <span className="font-normal text-white/80">
                    · {creditsNeeded} credit{creditsNeeded === 1 ? '' : 's'}
                  </span>
>>>>>>> origin/development
                </Button>
                {!canAfford ? (
                  <p className="text-center text-xs text-zinc-500 dark:text-white/45">
                    Not enough credits.{' '}
                    <Link
                      href="/dashboard/settings?tab=Billing"
                      className="font-medium text-blue-500 hover:text-blue-400"
                    >
                      Upgrade plan
                    </Link>
                  </p>
                ) : templateSource === 'user' && !selectedTemplateId ? (
                  <p className="text-center text-xs text-zinc-500 dark:text-white/45">
                    Select a Studio template to generate.
                  </p>
                ) : (
                  <p className="text-center text-xs text-zinc-500 dark:text-white/40">
                    {ctx.creditsBalance} now · {Math.max(0, ctx.creditsBalance - creditsNeeded)} after
                    this run
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ────────────────────────────────────────────────────────────────────────
            STATE: GENERATING
        ──────────────────────────────────────────────────────────────────────── */}
        {flowState === 'generating' && (
          <motion.div
            key="generating"
<<<<<<< HEAD
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl px-6 relative z-10 py-10"
          >
            <div className="text-center mb-10">
              <div className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center">
                <div
                  className={`absolute inset-0 bg-blue-500/20 blur-2xl rounded-full transition-opacity duration-700 ${generationComplete ? 'opacity-0' : 'opacity-100'
                    }`}
                />
                {!generationComplete && (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 border-[3px] border-dashed border-blue-500/30 rounded-full"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-2 border-2 border-blue-500/50 rounded-full border-t-transparent border-l-transparent"
                    />
                  </>
                )}

                <div className="relative z-10 w-16 h-16 bg-white dark:bg-[#0a0a14] rounded-full border border-black/5 dark:border-white/10 flex items-center justify-center shadow-2xl">
                  {generationComplete ? (
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    >
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Sparkles className="w-7 h-7 text-blue-600 dark:text-white" />
                    </motion.div>
                  )}
                </div>
              </div>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight">
                {generationComplete
                  ? 'Content Generation Complete'
                  : 'Synthesizing Content...'}
              </h2>
              <p className="text-zinc-500 dark:text-white/40 text-lg">
                {generationComplete
                  ? 'Your strategy has been executed successfully.'
                  : generationMessage ?? 'Hold tight while the AI builds your weekly strategy.'}
              </p>
              {!generationComplete && (
                <p className="mt-2 text-[11px] font-mono uppercase tracking-[0.18em] text-blue-500/80">
                  {generationStage.replaceAll('_', ' ')}
                </p>
              )}

              {!generationComplete && (
                <div className="mt-6 mx-auto max-w-sm h-1.5 rounded-full bg-zinc-200 dark:bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-linear-to-r from-blue-500 via-sky-400 to-blue-500"
                    animate={{
                      width: `${generationComplete
                        ? 100
                        : Math.min(
                          98,
                          Math.max(
                            generationProgress,
                            (Math.min(currentStepIndex, PROGRESS_STEPS.length - 1) /
                              PROGRESS_STEPS.length) *
                            100
                          )
                        )}%`,
                    }}
                    transition={{ type: 'spring', stiffness: 80, damping: 22 }}
                  />
                </div>
              )}
=======
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="relative z-10 w-full max-w-xl px-4 py-10 sm:px-6"
          >
            <p className="text-xs font-medium uppercase tracking-widest text-blue-400/80 mb-1">
              Generate
            </p>
            <h2 className="text-3xl font-bold tracking-tighter text-zinc-900 dark:text-white text-pretty">
              Drafting your posts
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-white/40" aria-live="polite">
              {generationMessage ?? 'This usually takes under a minute. Stay on this page.'}
            </p>
            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-blue-600 transition-[width] duration-300 ease-out"
                style={{
                  width: `${Math.min(
                    98,
                    Math.max(
                      generationProgress,
                      (Math.min(currentStepIndex, PROGRESS_STEPS.length - 1) /
                        PROGRESS_STEPS.length) *
                        100
                    )
                  )}%`,
                }}
              />
>>>>>>> origin/development
            </div>

            <ol className="mt-8 space-y-2">
              {PROGRESS_STEPS.map((step, index) => {
                const isPast = index < currentStepIndex
                const isCurrent =
                  index === currentStepIndex &&
                  currentStepIndex < PROGRESS_STEPS.length &&
                  !generationComplete
<<<<<<< HEAD
                const isWaiting = !isPast && !isCurrent

                return (
                  <motion.div
                    key={step}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{
                      opacity: isWaiting ? 0.45 : 1,
                      y: 0,
                      scale: isCurrent ? 1.01 : 1,
                    }}
                    transition={{
                      layout: { type: 'spring', stiffness: 320, damping: 28 },
                      opacity: { duration: 0.35 },
                      delay: index * 0.04,
                    }}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-colors duration-500 ${isCurrent
                      ? 'bg-white dark:bg-white/10 border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.08)]'
                      : isPast
                        ? 'dark:bg-white/5 border-black/5 dark:border-white/10'
                        : 'bg-transparent border-transparent'
                      }`}
                  >
                    <span
                      className={`text-sm font-medium transition-colors duration-300 ${isPast || isCurrent
                        ? 'text-zinc-900 dark:text-white'
                        : 'text-zinc-500 dark:text-white/25'
                        }`}
                    >
                      {step}
                    </span>
                    <div className="flex items-center min-w-[7.5rem] justify-end">
                      <AnimatePresence mode="wait" initial={false}>
                        {isPast ? (
                          <motion.span
                            key="done"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="text-green-400 flex items-center gap-1.5 text-[11px] font-mono tracking-widest uppercase"
                          >
                            <Check className="w-3.5 h-3.5" /> Done
                          </motion.span>
                        ) : isCurrent ? (
                          <motion.span
                            key="progress"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="text-blue-400 flex items-center gap-1.5 text-[11px] font-mono tracking-widest uppercase"
                          >
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Working
                          </motion.span>
                        ) : (
                          <motion.span
                            key="wait"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-zinc-500 dark:text-white/15 text-[11px] font-mono tracking-widest uppercase"
                          >
                            Waiting
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
=======
                return (
                  <li
                    key={step}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                      isCurrent
                        ? 'border-blue-500/30 bg-blue-500/8 text-zinc-900 dark:text-white'
                        : isPast
                          ? 'border-zinc-200 text-zinc-700 dark:border-white/10 dark:text-white/70'
                          : 'border-transparent text-zinc-400 dark:text-white/30'
                    }`}
                  >
                    <span>{step}</span>
                    <span className="text-[11px] uppercase tracking-wider tabular-nums">
                      {isPast ? 'Done' : isCurrent ? 'Working' : 'Waiting'}
                    </span>
                  </li>
>>>>>>> origin/development
                )
              })}
            </ol>

<<<<<<< HEAD
            <AnimatePresence mode="wait">
              {generationComplete && (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                  className="flex justify-center"
                >
                  <Button
                    onClick={handleGoToReview}
                    className="h-14 px-10 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl text-base shadow-[0_0_40px_rgba(34,197,94,0.3)] transition-all"
                  >
                    Review & Publish Content <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              )}
              {!generationComplete && currentStepIndex >= PROGRESS_STEPS.length - 1 && (
                <motion.p
                  key="finalizing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Still generating — this can take a moment…
                </motion.p>
              )}
            </AnimatePresence>
=======
            {generationComplete ? (
              <Button
                onClick={handleGoToReview}
                className="mt-8 h-11 w-full rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-500"
              >
                Review drafts
                <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Button>
            ) : (
              <p className="mt-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-white/40">
                <Loader2
                  className={reduceMotion ? 'h-4 w-4' : 'h-4 w-4 animate-spin'}
                  aria-hidden="true"
                />
                Generating…
              </p>
            )}
>>>>>>> origin/development
          </motion.div>
        )}

        {/* ────────────────────────────────────────────────────────────────────────
            STATE: REVIEW
        ──────────────────────────────────────────────────────────────────────── */}
        {flowState === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex min-h-[calc(100dvh-8rem)] w-full min-w-0 flex-col gap-6 px-4 sm:px-6 lg:flex-row"
          >
            {/* Left Sidebar: Post List */}
<<<<<<< HEAD
            <div className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col bg-zinc-50/80 dark:bg-[#161b22]/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-zinc-200 dark:border-white/10 bg-white/2">
=======
            <div className="flex w-full min-w-0 shrink-0 flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 lg:w-80 xl:w-96 dark:border-white/10 dark:bg-[#161b22]">
              <div className="p-6 border-b border-zinc-200 dark:border-white/10 bg-[#0f1419]">
>>>>>>> origin/development
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1 tracking-tight">Review Content</h2>
                <p className="text-zinc-500 dark:text-white/40 text-sm leading-relaxed">Approve or edit the AI-generated posts below before scheduling.</p>
                <AiContentNotice className="mt-4" />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {posts.map((post, idx) => {
                  const isActive = post.id === selectedPostId
                  return (
<<<<<<< HEAD
                    <div
=======
                    <button
>>>>>>> origin/development
                      key={post.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setSelectedPostId(post.id)}
<<<<<<< HEAD
                      className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 group overflow-hidden ${isActive
                        ? 'bg-blue-500/10 border-blue-500/40 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]'
                        : 'bg-white dark:bg-white/4 border-zinc-200 dark:border-white/8 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/8'
=======
                      className={`relative w-full overflow-hidden rounded-2xl border p-5 text-left ui-transition duration-300 group ${isActive
                        ? 'border-blue-500/40 bg-blue-500/10'
                        : 'border-zinc-200 bg-white hover:bg-white dark:border-white/8 dark:bg-[#0f1419] dark:hover:border-white/20 dark:hover:bg-[#1a222d]'
>>>>>>> origin/development
                        }`}
                    >
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-2xl" />}

                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] font-mono font-bold tracking-[0.2em] uppercase ${isActive ? 'text-blue-400' : 'text-zinc-500 dark:text-white/30'}`}>
                          Post 0{idx + 1}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${post.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          post.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            post.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              post.status === 'draft' ? 'bg-white dark:bg-white/5 border-zinc-200 text-zinc-500 dark:text-white/40  dark:border-white/10' :
                                'bg-orange-500/10 text-orange-400 border-orange-500/20'
                          }`}>
                          {post.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-zinc-900 dark:text-white mb-1.5 truncate group-hover:text-blue-300 transition-colors">{post.title}</h4>
                      <p className="text-xs text-zinc-500 dark:text-white/40 line-clamp-2 leading-relaxed mb-2">{post.caption}</p>
                      <p className="text-[10px] text-zinc-400 dark:text-white/30 flex items-center gap-1">
<<<<<<< HEAD
                        <Clock className="w-3 h-3 shrink-0" />
                        {formatScheduledPreview(post.scheduledDate)}
                      </p>
                    </div>
=======
                        <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                        {formatScheduledPreview(post.scheduledDate)}
                      </p>
                    </button>
>>>>>>> origin/development
                  )
                })}
              </div>
            </div>

            {/* Main Area: Selected Post Editor */}
            {selectedPost ? (
<<<<<<< HEAD
              <div className="flex-1 bg-zinc-50/80 dark:bg-[#161b22]/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-3xl flex flex-col overflow-hidden relative">
=======
              <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-[#161b22]">
>>>>>>> origin/development
                {/* Header */}
                <div className="p-6 md:px-8 border-b border-zinc-200 dark:border-white/10 bg-[#0f1419] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{selectedPost.title}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-white/40 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 w-fit px-3 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5" />
                        {formatScheduledPreview(selectedPost.scheduledDate)}
                      </div>
<<<<<<< HEAD
                      <Input
=======
                      <label htmlFor="review-schedule" className="sr-only">
                        Schedule date and time
                      </label>
                      <Input
                        id="review-schedule"
>>>>>>> origin/development
                        type="datetime-local"
                        value={selectedPost.scheduledDate}
                        min={getMinScheduleDatetime()}
                        onChange={(e) => updatePostSchedule(selectedPost.id, e.target.value)}
                        className="h-9 w-full sm:w-auto text-sm bg-muted/40 border-border"
                      />
                    </div>
                  </div>

<<<<<<< HEAD
                  <div className="flex items-center gap-3">
=======
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
>>>>>>> origin/development
                    {selectedPost.status !== 'rejected' && selectedPost.status !== 'scheduled' && (
                      <Button onClick={() => updatePostStatus(selectedPost.id, 'rejected')} variant="outline" className="h-11 w-full rounded-xl border-zinc-200 px-5 text-zinc-500 ui-transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 sm:w-auto dark:border-white/10 dark:text-white/60">
                        Reject
                      </Button>
                    )}
                    {selectedPost.status !== 'approved' && selectedPost.status !== 'scheduled' && (
                      <Button onClick={() => updatePostStatus(selectedPost.id, 'approved')} className="h-11 w-full rounded-xl bg-blue-600 px-6 font-semibold text-white ui-transition hover:bg-blue-500 sm:w-auto">
                        <Check className="mr-2 w-4 h-4" aria-hidden="true" /> Approve
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col xl:flex-row gap-10">
                  {/* Left Edit Column */}
                  <div className="flex-1 flex flex-col max-w-3xl">
                    <div className="space-y-6 flex-1">
                      <div>
                        <label
                          htmlFor="review-caption"
                          className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-white/40"
                        >
                          <AlignLeft className="h-3.5 w-3.5" aria-hidden="true" /> Post caption
                        </label>
                        <Textarea
<<<<<<< HEAD
=======
                          id="review-caption"
>>>>>>> origin/development
                          value={editCaption}
                          onChange={(e) => setEditCaption(e.target.value)}
                          className="min-h-[220px] resize-y rounded-2xl border border-black/5 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-900 shadow-inner focus-visible:ring-1 focus-visible:ring-blue-500/50 dark:border-white/10 dark:bg-black/40 dark:text-white/90"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="review-hashtags"
                          className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-white/40"
                        >
                          <Hash className="h-3.5 w-3.5" aria-hidden="true" /> Hashtags
                        </label>
                        <Input
<<<<<<< HEAD
=======
                          id="review-hashtags"
>>>>>>> origin/development
                          value={editHashtags}
                          onChange={(e) => setEditHashtags(e.target.value)}
                          className="h-12 rounded-xl border border-black/5 bg-zinc-50 text-zinc-900 shadow-inner focus-visible:ring-1 focus-visible:ring-blue-500/50 dark:border-white/10 dark:bg-black/40 dark:text-white/80"
                        />
                      </div>
                    </div>

<<<<<<< HEAD
                    {/* AI Revisions Box */}
                    <div className="mt-10 p-1 rounded-2xl bg-linear-to-r from-blue-500/30 via-blue-500/30 to-blue-500/30 relative">
                      <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 via-blue-500/20 to-blue-500/20 rounded-2xl blur-md" />

                      <div className="relative bg-white dark:bg-[#161b22] p-6 rounded-xl overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none"><Wand2 className="w-32 h-32" /></div>
                        <label className="text-[11px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5" /> AI Revision Engine
                        </label>
                        <p className="text-sm text-zinc-500 dark:text-white/40 mb-4 leading-relaxed">Describe how you want to tweak the caption above. The AI will instantly rewrite it.</p>
                        <div className="flex gap-3">
                          <Input
                            placeholder='e.g. "Make it punchier and add a call to action at the end"'
                            value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                            className="h-12 bg-zinc-50 dark:bg-black/60 border border-blue-500/20 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl"
                          />
                          <Button
                            onClick={handleApplyAiEdit} disabled={!aiPrompt.trim() || isApplyingAi}
                            className="h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] disabled:shadow-none"
=======
                    <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-[#161b22]">
                        <label
                          htmlFor="revise-prompt"
                          className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400"
                        >
                          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Revise
                        </label>

                        <div className="mb-4 flex gap-2">
                          <button
                            type="button"
                            aria-pressed={reviseTarget === 'caption'}
                            onClick={() => setReviseTarget('caption')}
                            className={`h-8 rounded-lg px-3 text-xs font-semibold transition-colors ${
                              reviseTarget === 'caption'
                                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30'
                                : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-white/45 border border-transparent hover:border-zinc-200 dark:hover:border-white/10'
                            }`}
>>>>>>> origin/development
                          >
                            Caption
                          </button>
                          <button
                            type="button"
                            aria-pressed={reviseTarget === 'image'}
                            onClick={() => setReviseTarget('image')}
                            className={`h-8 rounded-lg px-3 text-xs font-semibold transition-colors ${
                              reviseTarget === 'image'
                                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30'
                                : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-white/45 border border-transparent hover:border-zinc-200 dark:hover:border-white/10'
                            }`}
                          >
                            Image
                          </button>
                        </div>

                        <p className="text-sm text-zinc-500 dark:text-white/40 mb-4 leading-relaxed">
                          {reviseTarget === 'image'
                            ? 'Describe how to change the graphic. Your note updates the image prompt and regenerates the visual.'
                            : 'Describe how you want to tweak the caption above. The AI will rewrite it.'}
                        </p>
                        {reviseTarget === 'image' && selectedPost.imagePrompt ? (
                          <p className="mb-3 line-clamp-2 text-[11px] text-zinc-400 dark:text-white/30">
                            Current prompt: {selectedPost.imagePrompt}
                          </p>
                        ) : null}
                        <div className="flex gap-3">
                          <Input
                            id="revise-prompt"
                            placeholder={
                              reviseTarget === 'image'
                                ? 'e.g. "Darker background, product on a wooden table, no people"'
                                : 'e.g. "Make it punchier and add a call to action at the end"'
                            }
                            value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                void handleApplyAiEdit()
                              }
                            }}
                            className="h-12 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-blue-500 dark:border-white/10 dark:bg-black/60 dark:text-white dark:placeholder:text-white/40"
                          />
                          <Button
                            type="button"
                            aria-label={reviseTarget === 'image' ? 'Revise image' : 'Revise caption'}
                            onClick={handleApplyAiEdit} disabled={!aiPrompt.trim() || isApplyingAi}
                            className="h-12 rounded-xl bg-blue-600 px-6 font-semibold text-white ui-transition hover:bg-blue-500 disabled:opacity-50"
                          >
                            {isApplyingAi ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="h-5 w-5" aria-hidden="true" />}
                          </Button>
                        </div>
                    </div>
                  </div>

                  {/* Right Column: Visuals / Post Actions */}
                  <div className="w-full xl:w-[420px] shrink-0 flex flex-col gap-6">
                    <div className="bg-white dark:bg-card border border-zinc-200 dark:border-white/10 rounded-2xl p-5 flex flex-col">
                      <label className="text-[11px] w-full font-bold text-zinc-500 dark:text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5" /> Generated Graphic
                      </label>
                      <div className="w-full flex flex-col items-center">
                        <CanvasEditor
                          canvasData={selectedPost.canvasData}
                          maxWidth={380}
                          variant="preview"
                        />
                      </div>
                      {selectedPost.templateId && (
                        <Link
<<<<<<< HEAD
                          href="/dashboard/studio"
                          className="mt-4 w-full text-center text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors"
                        >
                          Edit in Studio →
=======
                          href={`/dashboard/studio?templateId=${selectedPost.templateId}`}
                          className="mt-4 w-full text-center text-xs font-medium text-blue-500 transition-colors hover:text-blue-400"
                        >
                          Edit in Studio
>>>>>>> origin/development
                        </Link>
                      )}
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Ready to queue?</h4>
                      <p className="text-xs text-zinc-500 dark:text-white/50 mb-5">
                        {approvedCount === 0
                          ? 'Approve posts to unlock scheduling. Each post keeps its own date and time.'
                          : approvedCount === 1
                            ? '1 approved post will be added to Calendar and Posts.'
                            : `${approvedCount} approved posts will be scheduled with their individual dates.`}
                      </p>
                      <div className="space-y-3">
                        <Button
                          onClick={handleSchedulePost}
                          disabled={approvedCount === 0 || isScheduling}
<<<<<<< HEAD
                          className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-zinc-900 dark:text-white font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] disabled:opacity-50 disabled:shadow-none"
=======
                          className="h-12 w-full rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
>>>>>>> origin/development
                        >
                          {isScheduling ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : approvedCount <= 1 ? (
                            'Schedule to Queue'
                          ) : (
                            `Schedule ${approvedCount} posts to Queue`
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50 border border-zinc-200 dark:border-white/10 dark:bg-[#161b22] rounded-3xl">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-white/5 border-zinc-200 border dark:border-white/10 flex items-center justify-center mb-4">
                  <AlignLeft className="w-8 h-8 text-zinc-500 dark:text-white/20" />
                </div>
                <p className="text-zinc-500 dark:text-white/40 text-sm font-medium">Select a post from the sidebar to review.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ────────────────────────────────────────────────────────────────────────
            STATE: SCHEDULED (success)
        ──────────────────────────────────────────────────────────────────────── */}
        {flowState === 'scheduled' && (
          <motion.div
            key="scheduled"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
<<<<<<< HEAD
            className="w-full max-w-lg px-6 relative z-10 py-16 text-center"
          >
            <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                className="relative z-10 w-20 h-20 rounded-full bg-white dark:bg-[#0a0a14] border border-green-500/30 flex items-center justify-center shadow-2xl"
              >
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </motion.div>
            </div>

            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight">
              Queue finished
            </h2>
            <p className="text-zinc-500 dark:text-white/45 text-base mb-2">
              {scheduledCount === 1
                ? 'Your post is scheduled and ready on the calendar.'
                : `${scheduledCount} posts are scheduled and ready on the calendar.`}
=======
            className="relative z-10 w-full max-w-lg px-4 py-16 text-center sm:px-6"
          >
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10">
              <CheckCircle2 className="h-10 w-10 text-blue-400" aria-hidden="true" />
            </div>

            <h2 className="mb-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Posts scheduled
            </h2>
            <p className="mb-2 text-base text-zinc-500 dark:text-white/45">
              {scheduledCount === 1
                ? 'Your post is on the calendar.'
                : `${scheduledCount} posts are on the calendar.`}
>>>>>>> origin/development
            </p>
            <p className="text-sm text-zinc-500 dark:text-white/30 mb-10">
              You can review them anytime in Calendar or Posts.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <Link
                href="/dashboard/calendar"
                className={buttonVariants({
                  className:
<<<<<<< HEAD
                    'h-12 px-6 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.25)]',
=======
                    'h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl',
>>>>>>> origin/development
                })}
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                Open Calendar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href="/dashboard/posts"
                className={buttonVariants({
                  variant: 'outline',
                  className: 'h-12 px-6 rounded-xl border-zinc-200 dark:border-white/15',
                })}
              >
                <FileText className="w-4 h-4 mr-2" />
                View Posts
              </Link>
            </div>

            <Button
              variant="ghost"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              onClick={() => {
                setScheduledCount(0)
                setPosts([])
                setSelectedPostId(null)
                setGenerationId(null)
                setGenerationStatus(null)
                setGenerationStage('business_profile_intake')
                setGenerationProgress(0)
                setGenerationMessage(null)
                setCurrentStepIndex(0)
                setFlowState('setup')
<<<<<<< HEAD
=======
                persistGenerateUrl('setup')
>>>>>>> origin/development
              }}
            >
              Generate more content
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
