'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, startTransition, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  Sparkles, CheckCircle2, Loader2, Wand2, Check,
  AlignLeft, Hash, Image as ImageIcon, Briefcase, Tag, Flag,
  ChevronRight, Send, Clock, Bot, FolderOpen, LayoutTemplate, Info, Coins,
  CalendarDays, FileText, ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'

import { CanvasData } from '@/types/canvas'
import { CanvasEditor } from '@/components/dashboard/studio/canvas-editor'
import { reviseCaptionAction, schedulePostsBatchAction, generatePostsAction } from '@/app/dashboard/generate/actions'
import type { GenerateContext, GeneratedPostDraft } from '@/lib/generate-utils'
import { generateCanvasFromTemplate, matchTemplateToGoal } from '@/lib/generate-utils'
import { formatScheduledPreview, getMinScheduleDatetime } from '@/lib/post-schedule-utils'
import { imageToCanvas } from '@/lib/studio-utils'
import type { StudioTemplate } from '@/app/dashboard/studio/actions'
import { AiContentNotice } from '@/components/legal/ai-content-notice'

// ─── Types ────────────────────────────────────────────────────────────────────
type FlowState = 'setup' | 'generating' | 'review' | 'scheduled'
type PostStatus = 'draft' | 'needs_review' | 'approved' | 'rejected' | 'scheduled' | 'published'
type TemplateSource = 'ai' | 'user'

interface GeneratedPost {
  id: string
  title: string
  caption: string
  hashtags: string
  canvasData: CanvasData
  scheduledDate: string
  status: PostStatus
  templateId?: string | null
}

// ─── Mock Canvas Data ─────────────────────────────────────────────────────────
const DUMMY_CANVAS_TEMPLATE: CanvasData = {
  version: "1.0",
  canvas: { width: 1080, height: 1080, backgroundColor: "#ffffff", aspectRatioName: "square" },
  layers: [
    {
      id: "bg-image", type: "image", x: 0, y: 0, width: 1080, height: 1080, zIndex: 0,
      src: "https://picsum.photos/seed/marketme-demo/1080/1080"
    },
    {
      id: "overlay", type: "rect", x: 0, y: 0, width: 1080, height: 1080, fill: "rgba(0,0,0,0.4)", zIndex: 1
    },
    {
      id: "main-text", type: "text", x: 100, y: 400, width: 880, zIndex: 2,
      content: "AUTOMATE YOUR MARKETING.", fontSize: 72, fontFamily: "Inter", fill: "#ffffff", align: "center"
    }
  ]
}

const DEFAULT_CONTEXT: GenerateContext = {
  businessName: 'My Business',
  industry: '',
  services: '',
  defaultTone: 'Professional',
  defaultGoal: 'Increase Brand Awareness',
  defaultPlatform: 'Instagram',
  hasOpenAI: false,
  templateCount: 0,
  creditsBalance: 50,
  creditsLimit: 50,
  creditCostPerGeneration: 2,
}

const PROGRESS_STEPS = [
  'Analyzing Strategy Goal',
  'Brainstorming Content Angles',
  'Drafting Captions & Copy',
  'Injecting text into Studio Canvas',
  'Finalizing Review Package',
]

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
          className={`relative flex flex-col items-start gap-2 p-4 rounded-xl border transition-all duration-200 text-left ${
            value === 'ai'
              ? 'bg-blue-500/10 border-blue-500/40 shadow-[inset_0_0_20px_rgba(59,130,246,0.08)]'
              : 'bg-zinc-50 dark:bg-black/30 border-black/5 dark:border-white/10 hover:border-blue-500/30'
          }`}
        >
          {value === 'ai' && (
            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
          )}
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            value === 'ai' ? 'bg-blue-500/20' : 'bg-zinc-100 dark:bg-white/5'
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
          className={`relative flex flex-col items-start gap-2 p-4 rounded-xl border transition-all duration-200 text-left ${
            value === 'user'
              ? 'bg-blue-500/10 border-blue-500/40 shadow-[inset_0_0_20px_rgba(59,130,246,0.08)]'
              : 'bg-zinc-50 dark:bg-black/30 border-black/5 dark:border-white/10 hover:border-blue-500/30'
          }`}
        >
          {value === 'user' && (
            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
          )}
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            value === 'user' ? 'bg-blue-500/20' : 'bg-zinc-100 dark:bg-white/5'
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
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      isSelected
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
  const [flowState, setFlowState] = useState<FlowState>('setup')
  const [posts, setPosts] = useState<GeneratedPost[]>([])
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [serverDrafts, setServerDrafts] = useState<GeneratedPostDraft[] | null>(null)
  const [scheduledCount, setScheduledCount] = useState(0)

  // Template selection state
  const [templateSource, setTemplateSource] = useState<TemplateSource>('ai')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  // Setup Form State — seeded from business profile
  const [setupData, setSetupData] = useState({
    business: ctx.businessName,
    goal: ctx.defaultGoal,
    platform: ctx.defaultPlatform,
    numPosts: 3,
    tone: ctx.defaultTone,
  })

  useEffect(() => {
    startTransition(() => {
      const prompt = searchParams.get('prompt')?.trim()
      const templateId = searchParams.get('templateId')
      if (prompt) {
        setSetupData((prev) => ({ ...prev, tone: prompt }))
      }
      if (templateId && initialTemplates.some((t) => t.id === templateId)) {
        setTemplateSource('user')
        setSelectedTemplateId(templateId)
      }
    })
  }, [searchParams, initialTemplates])

  // Generating State
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [progressPulse, setProgressPulse] = useState(0)
  const generationComplete =
    flowState === 'generating' &&
    currentStepIndex >= PROGRESS_STEPS.length &&
    Boolean(serverDrafts?.length)

  const handleStartGeneration = async () => {
    if (templateSource === 'user' && !selectedTemplateId) {
      toast.error('Select a Studio template or switch to AI template matching.')
      return
    }
    if (setupData.numPosts < 1 || setupData.numPosts > 14) {
      toast.error('Number of posts must be between 1 and 14.')
      return
    }

    setFlowState('generating')
    setCurrentStepIndex(0)
    setProgressPulse(0)
    setServerDrafts(null)

    const result = await generatePostsAction({
      businessName: setupData.business,
      goal: setupData.goal,
      platform: setupData.platform,
      numPosts: setupData.numPosts,
      tone: setupData.tone,
    })

    if (!result.success || !result.posts?.length) {
      const message = result.error ?? 'Failed to generate posts'
      if (message.toLowerCase().includes('insufficient credits')) {
        toast.error(message, {
          description: 'Upgrade your plan or wait for your monthly credit reset.',
        })
      } else {
        toast.error(message)
      }
      setFlowState('setup')
      setCurrentStepIndex(0)
      return
    }

    setServerDrafts(result.posts)
  }

  // Smooth progress: advance through early steps on a timer, hold the last step
  // until the server responds, then finish quickly.
  useEffect(() => {
    if (flowState !== 'generating') return

    const lastStep = PROGRESS_STEPS.length - 1
    const draftsReady = Boolean(serverDrafts?.length)

    // Continuous soft progress pulse (0→100 looping feel while waiting)
    const pulse = window.setInterval(() => {
      setProgressPulse((p) => (p >= 96 ? 72 : p + 1.5))
    }, 120)

    if (currentStepIndex >= PROGRESS_STEPS.length) {
      window.clearInterval(pulse)
      return () => window.clearInterval(pulse)
    }

    // Hold on the final labeled step until drafts arrive
    if (currentStepIndex === lastStep && !draftsReady) {
      return () => window.clearInterval(pulse)
    }

    // Once drafts are ready, finish remaining steps quickly
    const delay =
      draftsReady
        ? 280
        : currentStepIndex === lastStep - 1
          ? 900
          : 700 + currentStepIndex * 80

    const timer = window.setTimeout(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= PROGRESS_STEPS.length) return prev
        if (prev === lastStep && !draftsReady) return prev
        return prev + 1
      })
    }, delay)

    return () => {
      window.clearTimeout(timer)
      window.clearInterval(pulse)
    }
  }, [flowState, currentStepIndex, serverDrafts])

  const handleGoToReview = () => {
    if (!serverDrafts?.length) {
      toast.error('Generation is still in progress. Please wait.')
      return
    }

    let resolvedTemplate: StudioTemplate | null = null

    if (templateSource === 'user' && selectedTemplateId) {
      resolvedTemplate = initialTemplates.find((t) => t.id === selectedTemplateId) ?? null
    } else if (templateSource === 'ai') {
      const canvasTemplates = initialTemplates.filter((t) => t.canvas_data !== null)
      resolvedTemplate = matchTemplateToGoal(
        canvasTemplates.length ? canvasTemplates : initialTemplates,
        setupData.goal
      )
    }

    const generated: GeneratedPost[] = serverDrafts.map((p) => {
      let canvasData: CanvasData
      if (resolvedTemplate?.canvas_data) {
        canvasData = generateCanvasFromTemplate(resolvedTemplate.canvas_data, p.title, p.caption)
      } else if (resolvedTemplate) {
        canvasData = generateCanvasFromTemplate(
          imageToCanvas(resolvedTemplate.file_url, p.title),
          p.title,
          p.caption
        )
      } else {
        canvasData = generateCanvasFromTemplate(DUMMY_CANVAS_TEMPLATE, p.title, p.caption)
      }
      return {
        ...p,
        canvasData,
        templateId: resolvedTemplate?.id ?? null,
        status: 'needs_review' as PostStatus,
      }
    })

    setPosts(generated)
    setSelectedPostId(generated[0].id)
    setFlowState('review')
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
      // Call the API Contract Stub
      const newCaption = await reviseCaptionAction(editCaption, aiPrompt, setupData.platform)
      setEditCaption(newCaption)
      setAiPrompt('')
      toast.success("Caption revised successfully")
    } catch (error) {
      console.error("Failed to revise caption", error)
      toast.error("Failed to generate revision. Please try again.")
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
      toast.error('Approve at least one post before scheduling.')
      return
    }

    setIsScheduling(true)

    try {
      const res = await schedulePostsBatchAction({
        platform: setupData.platform,
        posts: toSchedule.map((p) => ({
          caption: p.caption,
          hashtags: p.hashtags,
          canvasData: p.canvasData,
          scheduledDate: p.scheduledDate,
          templateId: p.templateId ?? null,
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
        toast.success(
          res.scheduledCount === 1
            ? 'Post scheduled successfully'
            : `${res.scheduledCount} posts scheduled successfully`
        )
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
    } finally {
      setIsScheduling(false)
    }
  }

  const updatePostSchedule = (id: string, scheduledDate: string) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, scheduledDate } : p)))
  }

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

      <AnimatePresence mode="wait">
        
        {/* ────────────────────────────────────────────────────────────────────────
            STATE: SETUP
        ──────────────────────────────────────────────────────────────────────── */}
        {flowState === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-3xl px-6 relative z-10"
          >
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
                    AI providers are not connected yet — generation uses sample templates from your
                    business profile. Add <code className="text-xs">OPENAI_API_KEY</code> for live AI copy.
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
                    value={setupData.business} onChange={e => setSetupData({...setupData, business: e.target.value})}
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
                            onClick={() => setSetupData({...setupData, goal})}
                            className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm outline-none flex items-center justify-between transition-colors ${
                              setupData.goal === goal 
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
                            onClick={() => setSetupData({...setupData, platform})}
                            className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm outline-none flex items-center justify-between transition-colors ${
                              setupData.platform === platform 
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
                    value={setupData.numPosts} onChange={e => setSetupData({...setupData, numPosts: parseInt(e.target.value)})}
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
                    value={setupData.tone} onChange={e => setSetupData({...setupData, tone: e.target.value})}
                    className="h-12 bg-zinc-50 dark:bg-black/40 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/20 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500/50 transition-all shadow-inner" 
                  />
                </div>
              </div>

              <div className="mt-10">
                <Button 
                  onClick={handleStartGeneration}
                  className="w-full h-14 bg-white text-black hover:bg-zinc-100 dark:hover:bg-white/90 font-bold rounded-xl text-base transition-all gap-2 group shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)]"
                >
                  <Sparkles className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" /> 
                  Generate {setupData.numPosts} Posts
                </Button>
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl px-6 relative z-10 py-10"
          >
            <div className="text-center mb-10">
              <div className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center">
                <div
                  className={`absolute inset-0 bg-blue-500/20 blur-2xl rounded-full transition-opacity duration-700 ${
                    generationComplete ? 'opacity-0' : 'opacity-100'
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
                  : 'Hold tight while the AI builds your weekly strategy.'}
              </p>

              {!generationComplete && (
                <div className="mt-6 mx-auto max-w-sm h-1.5 rounded-full bg-zinc-200 dark:bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-linear-to-r from-blue-500 via-sky-400 to-blue-500"
                    animate={{
                      width: `${Math.min(
                        98,
                        (Math.min(currentStepIndex, PROGRESS_STEPS.length - 1) /
                          PROGRESS_STEPS.length) *
                          100 +
                          progressPulse * 0.18
                      )}%`,
                    }}
                    transition={{ type: 'spring', stiffness: 80, damping: 22 }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-3 mb-10">
              {PROGRESS_STEPS.map((step, index) => {
                const isPast = index < currentStepIndex
                const isCurrent =
                  index === currentStepIndex &&
                  currentStepIndex < PROGRESS_STEPS.length &&
                  !generationComplete
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
                    className={`flex items-center justify-between p-4 rounded-xl border transition-colors duration-500 ${
                      isCurrent
                        ? 'bg-white dark:bg-white/10 border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.08)]'
                        : isPast
                          ? 'dark:bg-white/5 border-black/5 dark:border-white/10'
                          : 'bg-transparent border-transparent'
                    }`}
                  >
                    <span
                      className={`text-sm font-medium transition-colors duration-300 ${
                        isPast || isCurrent
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
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              {generationComplete && serverDrafts && (
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
              {!generationComplete && currentStepIndex >= PROGRESS_STEPS.length - 1 && !serverDrafts && (
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
            className="w-full flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] px-6"
          >
            {/* Left Sidebar: Post List */}
            <div className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col bg-zinc-50/80 dark:bg-[#161b22]/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-zinc-200 dark:border-white/10 bg-white/2">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1 tracking-tight">Review Content</h2>
                <p className="text-zinc-500 dark:text-white/40 text-sm leading-relaxed">Approve or edit the AI-generated posts below before scheduling.</p>
                <AiContentNotice className="mt-4" />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {posts.map((post, idx) => {
                  const isActive = post.id === selectedPostId
                  return (
                    <div 
                      key={post.id}
                      onClick={() => setSelectedPostId(post.id)}
                      className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 group overflow-hidden ${
                        isActive 
                          ? 'bg-blue-500/10 border-blue-500/40 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' 
                          : 'bg-white dark:bg-white/4 border-zinc-200 dark:border-white/8 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/8'
                      }`}
                    >
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-2xl" />}
                      
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] font-mono font-bold tracking-[0.2em] uppercase ${isActive ? 'text-blue-400' : 'text-zinc-500 dark:text-white/30'}`}>
                          Post 0{idx + 1}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                          post.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
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
                        <Clock className="w-3 h-3 shrink-0" />
                        {formatScheduledPreview(post.scheduledDate)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Main Area: Selected Post Editor */}
            {selectedPost ? (
              <div className="flex-1 bg-zinc-50/80 dark:bg-[#161b22]/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-3xl flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="p-6 md:px-8 border-b border-zinc-200 dark:border-white/10 bg-white/2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{selectedPost.title}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-white/40 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 w-fit px-3 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5" />
                        {formatScheduledPreview(selectedPost.scheduledDate)}
                      </div>
                      <Input
                        type="datetime-local"
                        value={selectedPost.scheduledDate}
                        min={getMinScheduleDatetime()}
                        onChange={(e) => updatePostSchedule(selectedPost.id, e.target.value)}
                        className="h-9 w-full sm:w-auto text-sm bg-muted/40 border-border"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {selectedPost.status !== 'rejected' && selectedPost.status !== 'scheduled' && (
                      <Button onClick={() => updatePostStatus(selectedPost.id, 'rejected')} variant="outline" className="h-10 px-5 rounded-xl border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/60 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all">
                        Reject
                      </Button>
                    )}
                    {selectedPost.status !== 'approved' && selectedPost.status !== 'scheduled' && (
                      <Button onClick={() => updatePostStatus(selectedPost.id, 'approved')} className="h-10 px-6 rounded-xl bg-white text-black hover:bg-green-400 hover:text-black font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        <Check className="w-4 h-4 mr-2" /> Approve
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col xl:flex-row gap-10">
                  {/* Left Edit Column */}
                  <div className="flex-1 flex flex-col max-w-3xl">
                    <div className="space-y-6 flex-1">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                          <AlignLeft className="w-3.5 h-3.5" /> Post Caption
                        </label>
                        <Textarea 
                          value={editCaption} 
                          onChange={(e) => setEditCaption(e.target.value)}
                          className="min-h-[220px] bg-zinc-50 dark:bg-black/40 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-white/90 text-sm leading-relaxed p-4 rounded-2xl resize-y focus-visible:ring-1 focus-visible:ring-blue-500/50 shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                          <Hash className="w-3.5 h-3.5" /> Hashtags
                        </label>
                        <Input 
                          value={editHashtags} 
                          onChange={(e) => setEditHashtags(e.target.value)}
                          className="h-12 bg-zinc-50 dark:bg-black/40 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-white/80 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500/50 shadow-inner"
                        />
                      </div>
                    </div>

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
                          >
                            {isApplyingAi ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                          </Button>
                        </div>
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
                          href="/dashboard/studio"
                          className="mt-4 w-full text-center text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors"
                        >
                          Edit in Studio →
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
                          className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-zinc-900 dark:text-white font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] disabled:opacity-50 disabled:shadow-none"
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
              <div className="flex-1 flex flex-col items-center justify-center bg-white/2 border border-zinc-200 dark:border-white/10 rounded-3xl backdrop-blur-xl">
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
            </p>
            <p className="text-sm text-zinc-500 dark:text-white/30 mb-10">
              You can review them anytime in Calendar or Posts.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <Link
                href="/dashboard/calendar"
                className={buttonVariants({
                  className:
                    'h-12 px-6 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.25)]',
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
                setServerDrafts(null)
                setSelectedPostId(null)
                setCurrentStepIndex(0)
                setFlowState('setup')
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
