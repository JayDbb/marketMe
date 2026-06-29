'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRight, ArrowLeft, Building2, Globe, MapPin, AtSign, Users, Target, MessageSquare, Briefcase, Rocket, Sparkles, Megaphone, X, Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Activity } from 'lucide-react'
import { upsertBusinessProfileAction } from '@/app/api/business-profile/_actions'

const steps = [
  { id: 'basics', title: 'The Basics', description: 'Tell us who you are and where you operate.' },
  { id: 'offering', title: 'Offering & Goals', description: 'What do you do and what are you trying to achieve?' },
  { id: 'strategy', title: 'Brand & Strategy', description: 'Help us dial in the AI to match your exact voice.' },
]

const analysisSteps = [
  "Crawling website & extracting business context...",
  "Analyzing Instagram content & audience...",
  "Identifying core services & brand tone...",
  "Generating content pillars...",
  "Building Business Profile..."
];

const primaryGoals = ['Lead Generation', 'Brand Awareness', 'Direct Sales', 'Bookings / Consultations']
const contentChannels = ['Instagram', 'LinkedIn', 'Twitter / X', 'Email Newsletter', 'TikTok']

const inputClass = "h-12 bg-white/5 border-white/10 focus-visible:border-blue-400/60 focus-visible:ring-0 text-white placeholder:text-white/25 rounded-xl transition-all text-base shadow-none"
const labelClass = "text-white/45 font-medium text-xs uppercase tracking-wider flex items-center gap-2"

export function OnboardingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    location: '',
    website: '',
    services: '',
    usp: '',
    primaryGoal: '',
    socialHandle: '',
    tone: '',
    targetCustomers: '',
    competitors: '',
    channels: [] as string[]
  })
  const [direction, setDirection] = useState<1 | -1>(1)

  useEffect(() => {
    if (isAnalyzing) {
      let current = 0;
      let hasSaved = false;
      
      const interval = setInterval(async () => {
        // Trigger the backend save on the first tick in the background
        if (current === 0 && !hasSaved) {
          hasSaved = true;
          upsertBusinessProfileAction({
            business_name: formData.businessName,
            industry: formData.industry,
            location: formData.location,
            website: formData.website,
            services: formData.services,
            usp: formData.usp,
            primary_goal: formData.primaryGoal,
            social_handle: formData.socialHandle,
            tone: formData.tone,
            target_customers: formData.targetCustomers,
            competitors: formData.competitors,
            channels: formData.channels,
          }).catch(err => console.error("Failed to save profile:", err));
        }

        if (current < analysisSteps.length - 1) {
          current++;
          setAnalysisStep(current);
        } else {
          clearInterval(interval);
          setTimeout(() => router.push('/dashboard'), 1500);
        }
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [isAnalyzing, router, formData]);

  const handleNext = () => {
    setDirection(1)
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      setIsAnalyzing(true)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep(prev => prev - 1)
    }
  }

  const updateFields = (fields: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...fields }))
  }

  const toggleChannel = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }))
  }

  if (isAnalyzing) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0a0a14] font-sans items-center justify-center py-12 px-4 relative overflow-hidden w-full">
        {/* Pulsing ambient orb for analysis mode */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none animate-pulse" aria-hidden="true" />
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none" aria-hidden="true" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white/4 border border-white/8 backdrop-blur-xl shadow-2xl z-10 p-10 rounded-2xl relative flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/30 mb-8 relative">
            <Activity className="w-8 h-8 text-blue-400 absolute animate-ping opacity-20" />
            <Activity className="w-8 h-8 text-blue-400 relative z-10" />
          </div>
          
          <h2 className="text-2xl font-serif font-light text-white mb-8 text-center tracking-tight">
            AI Analysis in Progress
          </h2>
          
          <div className="w-full space-y-5">
            {analysisSteps.map((step, idx) => {
              const isCompleted = idx < analysisStep;
              const isActive = idx === analysisStep;
              const isPending = idx > analysisStep;
              
              return (
                <div key={idx} className={`flex items-center gap-4 transition-all duration-500 ${isPending ? 'opacity-30' : 'opacity-100'}`}>
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : isActive ? (
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                    )}
                  </div>
                  <span className={`text-[15px] font-medium transition-colors duration-500 ${isActive ? 'text-white' : 'text-white/60'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a14] font-sans items-center justify-center py-12 px-4 relative overflow-hidden w-full">

      {/* Ambient orb */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/12 blur-[150px] rounded-full pointer-events-none" aria-hidden="true" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none" aria-hidden="true" />

      {/* Skip */}
      <Link
        href="/dashboard"
        className="absolute top-6 right-6 text-white/35 hover:text-white/70 transition-colors flex items-center gap-1.5 text-sm z-10"
        aria-label="Skip and go to dashboard"
      >
        Skip <X className="w-4 h-4" aria-hidden="true" />
      </Link>

      {/* Logo */}
      <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
        <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <span className="font-serif font-light text-xl tracking-tighter text-white">Marketme</span>
      </div>

      {/* Card */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleNext(); }} 
        className="w-full max-w-2xl bg-white/4 border border-white/8 backdrop-blur-xl shadow-2xl z-10 p-8 md:p-12 rounded-2xl relative"
      >

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((step, i) => (
            <div key={i} className="flex-1 flex flex-col gap-1.5">
              <div className={`h-1 w-full rounded-full transition-colors duration-500 ${i <= currentStep ? 'bg-blue-500' : 'bg-white/8'}`} />
              <span className={`text-[9px] uppercase tracking-widest font-bold transition-colors duration-500 ${i <= currentStep ? 'text-white/70' : 'text-white/20'}`}>
                Step {i + 1}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: direction * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -20 }}
            transition={{ ease: [0.23, 1, 0.32, 1], duration: 0.28 }}
            className="min-h-[380px]"
          >
            <div className="mb-10">
              <h2 className="text-3xl font-serif font-light tracking-tight text-white mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-white/40 text-sm">{steps[currentStep].description}</p>
            </div>

            {/* Step 1: Basics */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className={labelClass}>
                    <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                    Business Name
                  </Label>
                  <Input
                    name="businessName"
                    value={formData.businessName}
                    onChange={e => updateFields({ businessName: e.target.value })}
                    placeholder="e.g. Vanguard Atelier…"
                    required
                    aria-required="true"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    Industry
                  </Label>
                  <Input
                    name="industry"
                    value={formData.industry}
                    onChange={e => updateFields({ industry: e.target.value })}
                    placeholder="e.g. Luxury Retail…"
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className={labelClass}>
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      Location
                    </Label>
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={e => updateFields({ location: e.target.value })}
                      placeholder="e.g. New York, NY"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      Website
                    </Label>
                    <Input
                      name="website"
                      value={formData.website}
                      onChange={e => updateFields({ website: e.target.value })}
                      placeholder="https://"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Offering */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <Label className={labelClass}>
                    <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                    Core Services / Products
                  </Label>
                  <Textarea
                    name="services"
                    value={formData.services}
                    onChange={e => updateFields({ services: e.target.value })}
                    placeholder="List your primary services or products. E.g. Bespoke tailoring, personal styling..."
                    className="min-h-[110px] bg-white/5 border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/60 text-white placeholder:text-white/20 rounded-xl transition-all shadow-none text-sm p-4 resize-y"
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    Unique Value Proposition (USP)
                  </Label>
                  <Textarea
                    name="usp"
                    value={formData.usp}
                    onChange={e => updateFields({ usp: e.target.value })}
                    placeholder="Why do customers choose you over competitors?"
                    className="min-h-[110px] bg-white/5 border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/60 text-white placeholder:text-white/20 rounded-xl transition-all shadow-none text-sm p-4 resize-y"
                  />
                </div>
                <div className="space-y-3">
                  <Label className={labelClass}>
                    <Target className="w-3.5 h-3.5 text-blue-400" />
                    Primary Marketing Goal
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {primaryGoals.map(goal => (
                      <button
                        key={goal}
                        type="button"
                        aria-pressed={formData.primaryGoal === goal}
                        onClick={() => updateFields({ primaryGoal: goal })}
                        className={`h-12 px-4 rounded-xl border text-sm font-medium transition-all text-left flex items-center ${
                          formData.primaryGoal === goal
                            ? 'bg-blue-500/12 border-blue-500/50 text-blue-300'
                            : 'bg-white/4 border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border shrink-0 mr-3 transition-colors flex items-center justify-center ${
                          formData.primaryGoal === goal ? 'border-blue-400' : 'border-white/20'
                        }`}>
                          {formData.primaryGoal === goal && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                        </div>
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Strategy */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className={labelClass}>
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      Target Customers
                    </Label>
                    <Input
                      value={formData.targetCustomers}
                      onChange={e => updateFields({ targetCustomers: e.target.value })}
                      placeholder="e.g. High-net-worth"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                      Brand Tone of Voice
                    </Label>
                    <Input
                      value={formData.tone}
                      onChange={e => updateFields({ tone: e.target.value })}
                      placeholder="e.g. Authoritative, Elegant"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className={labelClass}>
                      <AtSign className="w-3.5 h-3.5 text-blue-400" />
                      Primary Social Handle
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 font-medium text-base">@</span>
                      <Input
                        value={formData.socialHandle}
                        onChange={e => updateFields({ socialHandle: e.target.value })}
                        placeholder="vanguardatelier"
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>
                      <Target className="w-3.5 h-3.5 text-blue-400" />
                      Key Competitors
                    </Label>
                    <Input
                      value={formData.competitors}
                      onChange={e => updateFields({ competitors: e.target.value })}
                      placeholder="List 2-3 main competitors."
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className={labelClass}>
                    <Megaphone className="w-3.5 h-3.5 text-blue-400" />
                    Content Channels
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {contentChannels.map(channel => {
                      const isActive = formData.channels.includes(channel)
                      return (
                        <button
                          key={channel}
                          onClick={() => toggleChannel(channel)}
                          className={`h-9 px-4 rounded-xl border text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                              : 'bg-white/4 border-white/10 text-white/45 hover:border-white/20 hover:text-white/65'
                          }`}
                        >
                          {channel}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-12 flex items-center justify-between border-t border-white/8 pt-7">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="text-white/35 hover:text-white disabled:opacity-0 transition-opacity rounded-xl text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            className="h-11 px-8 bg-white hover:bg-white/90 text-zinc-950 font-bold rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm border-0 active:scale-[0.97]"
          >
            {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
            {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
          </motion.button>
        </div>
      </form>
    </div>
  )
}
