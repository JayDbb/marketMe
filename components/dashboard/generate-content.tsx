'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { 
  Sparkles, CheckCircle2, Loader2, Wand2, X, Check,
  CalendarDays, AlignLeft, Hash, Image as ImageIcon, Briefcase, Tag, Flag, ChevronRight, Send, Clock
} from 'lucide-react'

// --- New Imports for Canvas & Actions ---
import { CanvasData } from '@/types/canvas'
import { CanvasEditor } from '@/components/dashboard/studio/canvas-editor'
import { reviseCaptionAction, schedulePostAction } from '@/app/dashboard/generate/actions'

// ─── Types ────────────────────────────────────────────────────────────────────
type FlowState = 'setup' | 'generating' | 'review'
type PostStatus = 'draft' | 'needs_review' | 'approved' | 'rejected' | 'scheduled' | 'published'

interface GeneratedPost {
  id: string
  title: string
  caption: string
  hashtags: string
  canvasData: CanvasData // Replaced `image: string` with CanvasData
  scheduledDate: string
  status: PostStatus
}

// ─── Mock Canvas Data ─────────────────────────────────────────────────────────
const DUMMY_CANVAS_TEMPLATE: CanvasData = {
  version: "1.0",
  canvas: { width: 1080, height: 1080, backgroundColor: "#ffffff", aspectRatioName: "square" },
  layers: [
    {
      id: "bg-image", type: "image", x: 0, y: 0, width: 1080, height: 1080, zIndex: 0,
      src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1080&q=80"
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

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_GENERATED_POSTS: GeneratedPost[] = [
  {
    id: 'post-1',
    title: 'Product Launch Teaser',
    caption: 'Big things are coming. We have been working hard behind the scenes to bring you something that will change the way you market forever. Stay tuned! 🚀',
    hashtags: '#Marketing #Innovation #ProductLaunch #ComingSoon',
    canvasData: JSON.parse(JSON.stringify(DUMMY_CANVAS_TEMPLATE)),
    scheduledDate: '2026-06-25T10:00',
    status: 'needs_review'
  },
  {
    id: 'post-2',
    title: 'Customer Success Story',
    caption: 'How did Company X increase their ROI by 300%? It was all about automating the boring stuff. Read our latest case study at the link in bio.',
    hashtags: '#CaseStudy #Growth #Automation #ROI',
    canvasData: JSON.parse(JSON.stringify({
      ...DUMMY_CANVAS_TEMPLATE,
      layers: [
        { ...DUMMY_CANVAS_TEMPLATE.layers[0], src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1080&q=80" },
        DUMMY_CANVAS_TEMPLATE.layers[1],
        { ...DUMMY_CANVAS_TEMPLATE.layers[2], content: "300% ROI GROWTH" }
      ]
    })),
    scheduledDate: '2026-06-27T14:30',
    status: 'needs_review'
  },
  {
    id: 'post-3',
    title: 'Weekend Motivation',
    caption: 'Take a break, disconnect, and recharge. The best ideas come when you are not forcing them. Have a great weekend!',
    hashtags: '#WeekendVibes #Mindfulness #Hustle #Rest',
    canvasData: JSON.parse(JSON.stringify({
      ...DUMMY_CANVAS_TEMPLATE,
      layers: [
        { ...DUMMY_CANVAS_TEMPLATE.layers[0], src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80" },
        DUMMY_CANVAS_TEMPLATE.layers[1],
        { ...DUMMY_CANVAS_TEMPLATE.layers[2], content: "RECHARGE & RESET." }
      ]
    })),
    scheduledDate: '2026-06-29T09:00',
    status: 'needs_review'
  }
]

const PROGRESS_STEPS = [
  'Analyzing Strategy Goal',
  'Brainstorming Content Angles',
  'Drafting Captions & Copy',
  'Injecting text into Studio Canvas',
  'Finalizing Review Package'
]

// ─── Main Component ───────────────────────────────────────────────────────────
export function GenerateContent() {
  const [flowState, setFlowState] = useState<FlowState>('setup')
  const [posts, setPosts] = useState<GeneratedPost[]>([])
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  // Setup Form State
  const [setupData, setSetupData] = useState({
    business: 'My Small Business',
    goal: 'Increase Brand Awareness',
    platform: 'Instagram',
    numPosts: 3,
    tone: 'Professional & Authoritative'
  })

  // Generating State
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [generationComplete, setGenerationComplete] = useState(false)

  const handleStartGeneration = () => {
    setFlowState('generating')
    setCurrentStepIndex(0)
    setGenerationComplete(false)
  }

  // Simulate Generation Progress
  useEffect(() => {
    if (flowState === 'generating' && !generationComplete) {
      const stepDuration = 1200 
      if (currentStepIndex < PROGRESS_STEPS.length) {
        const timer = setTimeout(() => {
          setCurrentStepIndex(prev => prev + 1)
        }, stepDuration + Math.random() * 600)
        return () => clearTimeout(timer)
      } else {
        setGenerationComplete(true)
      }
    }
  }, [flowState, currentStepIndex, generationComplete])

  const handleGoToReview = () => {
    setPosts(MOCK_GENERATED_POSTS) 
    setSelectedPostId(MOCK_GENERATED_POSTS[0].id)
    setFlowState('review')
  }

  // Edit State
  const selectedPost = posts.find(p => p.id === selectedPostId)
  const [editCaption, setEditCaption] = useState('')
  const [editHashtags, setEditHashtags] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [isApplyingAi, setIsApplyingAi] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)

  useEffect(() => {
    if (selectedPost) {
      setEditCaption(selectedPost.caption)
      setEditHashtags(selectedPost.hashtags)
      setAiPrompt('')
    }
  }, [selectedPost])

  const updatePostStatus = (id: string, status: PostStatus) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status } : p))
  }

  const handleSaveManual = () => {
    if (!selectedPost) return
    setPosts(prev => prev.map(p => 
      p.id === selectedPost.id ? { ...p, caption: editCaption, hashtags: editHashtags } : p
    ))
  }

  const handleApplyAiEdit = async () => {
    if (!aiPrompt.trim() || !selectedPost) return
    setIsApplyingAi(true)
    
    try {
      // Call the API Contract Stub
      const newCaption = await reviseCaptionAction(editCaption, aiPrompt, setupData.platform)
      setEditCaption(newCaption)
      setAiPrompt('')
    } catch (error) {
      console.error("Failed to revise caption", error)
    } finally {
      setIsApplyingAi(false)
    }
  }

  const handleSchedulePost = async () => {
    if (!selectedPost) return
    setIsScheduling(true)

    try {
      // Call the Scheduling API Contract Stub
      const res = await schedulePostAction({
        postId: selectedPost.id,
        caption: editCaption,
        hashtags: editHashtags,
        canvasData: selectedPost.canvasData,
        scheduledDate: selectedPost.scheduledDate
      });

      if (res.success) {
        updatePostStatus(selectedPost.id, 'scheduled');
      } else {
        alert("Failed to schedule post: " + res.error);
      }
    } catch (error) {
      console.error("Failed to schedule post", error)
    } finally {
      setIsScheduling(false)
    }
  }

  return (
    <div className="relative w-full min-h-[calc(100vh-2rem)] flex flex-col items-center pt-8 pb-12 overflow-hidden">
      
      {/* Ambient Backgrounds for Setup/Generating */}
      {flowState !== 'review' && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
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
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.2)] mb-6">
                <Sparkles className="w-6 h-6 text-purple-300" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-900 dark:text-white mb-4">
                Generate <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-400">Weekly Content</span>
              </h1>
              <p className="text-lg text-zinc-500 dark:text-white/50 max-w-lg mx-auto leading-relaxed">
                Configure your AI engine to craft a week's worth of high-converting social posts in seconds.
              </p>
            </div>

            <div className="bg-white dark:bg-[#0a0a14]/60 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-purple-500/30 to-transparent" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Group */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" /> Business Profile
                  </label>
                  <Input 
                    value={setupData.business} onChange={e => setSetupData({...setupData, business: e.target.value})}
                    className="h-12 bg-zinc-50 dark:bg-black/40 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/20 rounded-xl focus-visible:ring-1 focus-visible:ring-purple-500/50 transition-all shadow-inner" 
                  />
                </div>

                {/* Form Group */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Flag className="w-3.5 h-3.5" /> Strategy Goal
                  </label>
                  <div className="relative">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-full h-12 px-4 flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-black/40 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-white text-sm outline-none focus-visible:ring-1 focus-visible:ring-purple-500/50 shadow-inner group">
                        <span className="truncate">{setupData.goal}</span>
                        <ChevronRight className="w-4 h-4 text-zinc-500 dark:text-white/30 rotate-90 group-data-[state=open]:-rotate-90 transition-transform shrink-0 ml-2" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[--anchor-width] bg-[#0c0c18] border border-zinc-200 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-xl p-1.5 z-50">
                        {['Increase Brand Awareness', 'Lead Generation', 'Community Engagement', 'Product Launch'].map((goal) => (
                          <DropdownMenuItem
                            key={goal}
                            onClick={() => setSetupData({...setupData, goal})}
                            className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm outline-none flex items-center justify-between transition-colors ${
                              setupData.goal === goal 
                                ? 'bg-purple-500/10 text-purple-300' 
                                : 'text-zinc-500 dark:hover:text-white/70 hover:text- dark:hover:text-$3$3 hover:bg-white dark:bg-white/5 border-zinc-200 focus:bg-white '
                            }`}
                          >
                            {goal}
                            {setupData.goal === goal && <Check className="w-4 h-4 text-purple-400" />}
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
                      <DropdownMenuTrigger className="w-full h-12 px-4 flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-black/40 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-white text-sm outline-none focus-visible:ring-1 focus-visible:ring-purple-500/50 shadow-inner group">
                        <span className="truncate">{setupData.platform}</span>
                        <ChevronRight className="w-4 h-4 text-zinc-500 dark:text-white/30 rotate-90 group-data-[state=open]:-rotate-90 transition-transform shrink-0 ml-2" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[--anchor-width] bg-[#0c0c18] border border-zinc-200 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-xl p-1.5 z-50">
                        {['Instagram', 'LinkedIn', 'Twitter', 'Facebook'].map((platform) => (
                          <DropdownMenuItem
                            key={platform}
                            onClick={() => setSetupData({...setupData, platform})}
                            className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm outline-none flex items-center justify-between transition-colors ${
                              setupData.platform === platform 
                                ? 'bg-purple-500/10 text-purple-300' 
                                : 'text-zinc-500 dark:hover:text-white/70 hover:text- dark:hover:text-$3$3 hover:bg-white dark:bg-white/5 border-zinc-200 focus:bg-white '
                            }`}
                          >
                            {platform}
                            {setupData.platform === platform && <Check className="w-4 h-4 text-purple-400" />}
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
                    className="h-12 bg-zinc-50 dark:bg-black/40 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-white rounded-xl focus-visible:ring-1 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 transition-all shadow-inner" 
                  />
                </div>

                {/* Form Group (Full Width) */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" /> Tone (Optional)
                  </label>
                  <Input 
                    placeholder="e.g. Professional, Witty, Casual, Urgent..."
                    value={setupData.tone} onChange={e => setSetupData({...setupData, tone: e.target.value})}
                    className="h-12 bg-zinc-50 dark:bg-black/40 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/20 rounded-xl focus-visible:ring-1 focus-visible:ring-purple-500/50 transition-all shadow-inner" 
                  />
                </div>
              </div>

              <div className="mt-10">
                <Button 
                  onClick={handleStartGeneration}
                  className="w-full h-14 bg-white text-black hover:bg-zinc-100 dark:hover:bg-white/90 font-bold rounded-xl text-base transition-all gap-2 group shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)]"
                >
                  <Sparkles className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" /> 
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
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl px-6 relative z-10 py-10"
          >
            <div className="text-center mb-16">
              <div className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center">
                <div className={`absolute inset-0 bg-purple-500/20 blur-2xl rounded-full transition-opacity duration-1000 ${generationComplete ? 'opacity-0' : 'opacity-100'}`} />
                <motion.div 
                  animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className={`absolute inset-0 border-[3px] border-dashed border-purple-500/30 rounded-full ${generationComplete ? 'opacity-0' : 'opacity-100'}`} 
                />
                <motion.div 
                  animate={{ rotate: -360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className={`absolute inset-2 border-2 border-blue-500/40 rounded-full border-t-transparent ${generationComplete ? 'opacity-0' : 'opacity-100'}`} 
                />
                
                <div className="relative z-10 w-16 h-16 bg-white dark:bg-[#0a0a14] rounded-full border border-black/5 dark:border-white/10 flex items-center justify-center shadow-2xl">
                  {generationComplete ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </motion.div>
                  ) : (
                    <Sparkles className="w-7 h-7 text-purple-600 dark:text-white animate-pulse" />
                  )}
                </div>
              </div>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight">
                {generationComplete ? 'Content Generation Complete' : 'Synthesizing Content...'}
              </h2>
              <p className="text-zinc-500 dark:text-white/40 text-lg">
                {generationComplete ? 'Your strategy has been executed successfully.' : 'Hold tight while the AI builds your weekly strategy.'}
              </p>
            </div>

            <div className="space-y-3 mb-10">
              {PROGRESS_STEPS.map((step, index) => {
                const isPast = index < currentStepIndex
                const isCurrent = index === currentStepIndex && !generationComplete

                return (
                  <motion.div 
                    key={step} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-500 ${
                      isCurrent ? 'bg-white dark:bg-white/10   shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]' : 
                      isPast ? 'dark:bg-white/5   dark:border-white/10' : 'bg-transparent border-transparent'
                    }`}
                  >
                    <span className={`text-sm font-medium ${isPast ? 'text-zinc-900 dark:text-white' : isCurrent ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-white/20'}`}>
                      {step}
                    </span>
                    <div className="flex items-center">
                      {isPast ? (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-400 flex items-center gap-1.5 text-[11px] font-mono tracking-widest uppercase">
                          <Check className="w-3.5 h-3.5" /> Done
                        </motion.span>
                      ) : isCurrent ? (
                        <span className="text-purple-400 flex items-center gap-1.5 text-[11px] font-mono tracking-widest uppercase">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> In progress
                        </span>
                      ) : (
                        <span className="text-zinc-500 dark:text-white/10 text-[11px] font-mono tracking-widest uppercase">Waiting</span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <AnimatePresence>
              {generationComplete && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
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
            <div className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col bg-zinc-50/80 dark:bg-[#0c0c18]/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-zinc-200 dark:border-white/10 bg-white/2">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1 tracking-tight">Review Content</h2>
                <p className="text-zinc-500 dark:text-white/40 text-sm leading-relaxed">Approve or edit the AI-generated posts below before scheduling.</p>
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
                      <p className="text-xs text-zinc-500 dark:text-white/40 line-clamp-2 leading-relaxed">{post.caption}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Main Area: Selected Post Editor */}
            {selectedPost ? (
              <div className="flex-1 bg-zinc-50/80 dark:bg-[#0c0c18]/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-3xl flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="p-6 md:px-8 border-b border-zinc-200 dark:border-white/10 bg-white/2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{selectedPost.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-sm font-medium text-zinc-500 dark:text-white/40 bg-white dark:bg-white/5 border-zinc-200 w-fit px-3 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5" /> Scheduled: {new Date(selectedPost.scheduledDate).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
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
                    <div className="mt-10 p-1 rounded-2xl bg-linear-to-r from-purple-500/30 via-blue-500/30 to-purple-500/30 relative">
                      <div className="absolute inset-0 bg-linear-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-md" />
                      
                      <div className="relative bg-white dark:bg-[#0c0c18] p-6 rounded-xl overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none"><Wand2 className="w-32 h-32" /></div>
                        <label className="text-[11px] font-bold text-purple-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5" /> AI Revision Engine
                        </label>
                        <p className="text-sm text-zinc-500 dark:text-white/40 mb-4 leading-relaxed">Describe how you want to tweak the caption above. The AI will instantly rewrite it.</p>
                        <div className="flex gap-3">
                          <Input 
                            placeholder='e.g. "Make it punchier and add a call to action at the end"'
                            value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                            className="h-12 bg-zinc-50 dark:bg-black/60 border border-purple-500/20 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-purple-500 rounded-xl"
                          />
                          <Button 
                            onClick={handleApplyAiEdit} disabled={!aiPrompt.trim() || isApplyingAi}
                            className="h-12 px-6 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)] disabled:shadow-none"
                          >
                            {isApplyingAi ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Visuals / Post Actions */}
                  <div className="w-full xl:w-96 shrink-0 flex flex-col gap-6">
                    <div className="bg-white/2 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 flex flex-col items-center">
                      <label className="text-[11px] w-full font-bold text-zinc-500 dark:text-white/40 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5" /> Generated Graphic
                      </label>
                      <div className="w-full max-w-[320px] relative flex flex-col items-center">
                        {/* 
                          Canvas-first integration: Rendering the JSON data via React-Konva instead of a flat image.
                        */}
                        <CanvasEditor canvasData={selectedPost.canvasData} maxWidth={320} />
                        
                        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] rounded-2xl pointer-events-none">
                          <span className="text-white font-bold tracking-wider uppercase text-sm drop-shadow-md">Editable in Studio</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-white/30 text-center mt-4 tracking-wider uppercase">
                        Rendered via Canvas Template
                      </p>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Ready to queue?</h4>
                      <p className="text-xs text-zinc-500 dark:text-white/50 mb-5">Approve the post to unlock publishing actions.</p>
                      <div className="space-y-3">
                        <Button 
                          onClick={handleSchedulePost}
                          disabled={selectedPost.status !== 'approved' || isScheduling} 
                          className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-zinc-900 dark:text-white font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] disabled:opacity-50 disabled:shadow-none"
                        >
                          {isScheduling ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Schedule to Queue'}
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
      </AnimatePresence>
    </div>
  )
}
