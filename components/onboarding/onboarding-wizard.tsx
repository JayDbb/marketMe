'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  Globe,
  Briefcase,
  Users,
  Target,
  Megaphone,
  X,
  Loader2,
  CheckCircle2,
  Activity,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { completeOnboardingAction } from '@/app/onboarding/actions'
import { toast } from 'sonner'
import type { BusinessProfile } from '@/types/business-profile'

const steps = [
  {
    id: 'business',
    title: 'Your business',
    description: 'Four quick answers — enough for the AI to write relevant posts.',
  },
  {
    id: 'marketing',
    title: 'Marketing focus',
    description: 'Who you reach, how you sound, and where you publish.',
  },
]

const saveSteps = [
  'Saving your marketing profile…',
  'Tuning AI to your brand voice…',
  'Opening your dashboard…',
]

const primaryGoals = [
  'Lead Generation',
  'Brand Awareness',
  'Direct Sales',
  'Bookings / Consultations',
]

const toneOptions = [
  'Professional',
  'Friendly & warm',
  'Bold & confident',
  'Educational',
  'Luxury & refined',
]

const contentChannels = ['Instagram', 'LinkedIn', 'Twitter / X', 'Email Newsletter', 'TikTok']

const inputClass =
  'h-12 bg-white/5 border-white/10 focus-visible:border-blue-400/60 focus-visible:ring-0 text-white placeholder:text-white/25 rounded-xl transition-all text-base shadow-none'
const labelClass = 'text-white/45 font-medium text-xs uppercase tracking-wider flex items-center gap-2'

type OnboardingFormData = {
  businessName: string
  industry: string
  website: string
  services: string
  primaryGoal: string
  targetCustomers: string
  tone: string
  channels: string[]
}

function profileToFormData(profile: BusinessProfile | null | undefined): OnboardingFormData {
  if (!profile) {
    return {
      businessName: '',
      industry: '',
      website: '',
      services: '',
      primaryGoal: '',
      targetCustomers: '',
      tone: '',
      channels: [],
    }
  }

  return {
    businessName: profile.business_name ?? '',
    industry: profile.industry ?? '',
    website: profile.website ?? '',
    services: profile.services ?? '',
    primaryGoal: profile.primary_goal ?? '',
    targetCustomers: profile.target_customers ?? '',
    tone: profile.tone ?? '',
    channels: profile.channels ?? [],
  }
}

export function OnboardingWizard({
  initialProfile = null,
}: {
  initialProfile?: BusinessProfile | null
}) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStep, setSaveStep] = useState(0)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [formData, setFormData] = useState<OnboardingFormData>(() =>
    profileToFormData(initialProfile)
  )
  const [direction, setDirection] = useState<1 | -1>(1)

  const canContinue = useMemo(() => {
    if (currentStep === 0) {
      return (
        formData.businessName.trim().length > 0 &&
        formData.industry.trim().length > 0 &&
        formData.services.trim().length > 0
      )
    }
    return (
      formData.primaryGoal.length > 0 &&
      formData.targetCustomers.trim().length > 0 &&
      formData.tone.length > 0 &&
      formData.channels.length > 0
    )
  }, [currentStep, formData])

  const finishOnboarding = async () => {
    setIsSaving(true)
    setSaveError(null)
    setSaveStep(0)

    try {
      const result = await completeOnboardingAction({
        business_name: formData.businessName.trim(),
        industry: formData.industry.trim(),
        website: formData.website.trim() || undefined,
        services: formData.services.trim(),
        primary_goal: formData.primaryGoal,
        target_customers: formData.targetCustomers.trim(),
        tone: formData.tone,
        channels: formData.channels,
      })

      if (result.error || !result.data?.business_name) {
        const message =
          result.error ?? 'Profile saved but could not be verified. Refresh the page or try again.'
        setSaveError(message)
        toast.error(message)
        setIsSaving(false)
        return
      }

      setSaveStep(1)
      await new Promise((resolve) => setTimeout(resolve, 500))
      setSaveStep(2)
      await new Promise((resolve) => setTimeout(resolve, 400))

      toast.success('Profile saved')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save profile'
      setSaveError(message)
      toast.error(message)
      setIsSaving(false)
    }
  }

  const handleNext = () => {
    if (!canContinue) return
    setDirection(1)
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      void finishOnboarding()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep((prev) => prev - 1)
    }
  }

  const updateFields = (fields: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...fields }))
  }

  const toggleChannel = (channel: string) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }))
  }

  if (isSaving) {
    return (
      <div className="flex flex-col min-h-dvh font-sans items-center justify-center py-12 px-4 relative w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white/4 border border-white/8 backdrop-blur-xl shadow-2xl z-10 p-10 rounded-2xl flex flex-col items-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/30 mb-6">
            <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
          </div>
          <h2 className="text-xl font-serif font-light text-white mb-6 text-center tracking-tight">
            Setting up your workspace
          </h2>
          <div className="w-full space-y-4">
            {saveSteps.map((step, idx) => {
              const isCompleted = idx < saveStep
              const isActive = idx === saveStep
              return (
                <div
                  key={step}
                  className={`flex items-center gap-3 transition-opacity ${idx > saveStep ? 'opacity-35' : 'opacity-100'}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-white/20 shrink-0" />
                  )}
                  <span className={`text-sm ${isActive ? 'text-white' : 'text-white/55'}`}>{step}</span>
                </div>
              )
            })}
          </div>
          {saveError ? (
            <div className="mt-6 w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 text-center">
              {saveError}
              <button
                type="button"
                onClick={() => {
                  setIsSaving(false)
                  setSaveError(null)
                }}
                className="block w-full mt-3 text-xs font-semibold text-red-200 hover:text-white"
              >
                Go back and try again
              </button>
            </div>
          ) : null}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh font-sans items-center justify-center py-12 px-4 relative w-full">
      <Link
        href="/dashboard"
        className="absolute top-6 right-6 text-white/35 hover:text-white/70 transition-colors flex items-center gap-1.5 text-sm z-10"
        aria-label="Skip and go to dashboard"
      >
        Skip <X className="w-4 h-4" aria-hidden="true" />
      </Link>

      <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
        <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <span className="font-serif font-light text-xl tracking-tighter text-white">Marketme</span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleNext()
        }}
        className="w-full max-w-2xl bg-white/4 border border-white/8 backdrop-blur-xl shadow-2xl z-10 p-8 md:p-10 rounded-2xl relative"
      >
        <div className="flex items-center gap-2 mb-8">
          {steps.map((step, i) => (
            <div key={step.id} className="flex-1 flex flex-col gap-1.5">
              <div
                className={`h-1 w-full rounded-full transition-colors duration-500 ${i <= currentStep ? 'bg-blue-500' : 'bg-white/8'}`}
              />
              <span
                className={`text-[9px] uppercase tracking-widest font-bold transition-colors ${i <= currentStep ? 'text-white/70' : 'text-white/20'}`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: direction * 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -16 }}
            transition={{ ease: [0.23, 1, 0.32, 1], duration: 0.24 }}
            className="min-h-[300px]"
          >
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-serif font-light tracking-tight text-white mb-1.5">
                {steps[currentStep].title}
              </h2>
              <p className="text-white/40 text-sm">{steps[currentStep].description}</p>
            </div>

            {currentStep === 0 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className={labelClass}>
                      <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                      Business name
                    </Label>
                    <Input
                      value={formData.businessName}
                      onChange={(e) => updateFields({ businessName: e.target.value })}
                      placeholder="e.g. Vanguard Atelier"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      Industry
                    </Label>
                    <Input
                      value={formData.industry}
                      onChange={(e) => updateFields({ industry: e.target.value })}
                      placeholder="e.g. Luxury retail"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>
                    <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                    What you sell or do
                  </Label>
                  <Textarea
                    value={formData.services}
                    onChange={(e) => updateFields({ services: e.target.value })}
                    placeholder="One sentence is fine — e.g. Custom suits and personal styling for professionals."
                    required
                    className="min-h-[88px] bg-white/5 border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/60 text-white placeholder:text-white/20 rounded-xl text-sm p-4 resize-y shadow-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    Website <span className="text-white/25 normal-case tracking-normal">(optional)</span>
                  </Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => updateFields({ website: e.target.value })}
                    placeholder="https://"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className={labelClass}>
                    <Target className="w-3.5 h-3.5 text-blue-400" />
                    Main marketing goal
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {primaryGoals.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        aria-pressed={formData.primaryGoal === goal}
                        onClick={() => updateFields({ primaryGoal: goal })}
                        className={`h-11 px-3 rounded-xl border text-sm font-medium transition-all text-left ${
                          formData.primaryGoal === goal
                            ? 'bg-blue-500/12 border-blue-500/50 text-blue-300'
                            : 'bg-white/4 border-white/10 text-white/50 hover:border-white/20'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    Target audience
                  </Label>
                  <Input
                    value={formData.targetCustomers}
                    onChange={(e) => updateFields({ targetCustomers: e.target.value })}
                    placeholder="e.g. Busy founders aged 30–45 in the US"
                    required
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>Brand voice</Label>
                  <div className="flex flex-wrap gap-2">
                    {toneOptions.map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        aria-pressed={formData.tone === tone}
                        onClick={() => updateFields({ tone })}
                        className={`h-9 px-3 rounded-xl border text-xs font-medium transition-all ${
                          formData.tone === tone
                            ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                            : 'bg-white/4 border-white/10 text-white/45 hover:border-white/20'
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>
                    <Megaphone className="w-3.5 h-3.5 text-blue-400" />
                    Where you post
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {contentChannels.map((channel) => {
                      const isActive = formData.channels.includes(channel)
                      return (
                        <button
                          key={channel}
                          type="button"
                          aria-pressed={isActive}
                          onClick={() => toggleChannel(channel)}
                          className={`h-9 px-3 rounded-xl border text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                              : 'bg-white/4 border-white/10 text-white/45 hover:border-white/20'
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

        {saveError && !isSaving ? (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {saveError}
          </div>
        ) : null}

        <div className="mt-10 flex items-center justify-between border-t border-white/8 pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="text-white/35 hover:text-white disabled:opacity-0 rounded-xl text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <button
            type="submit"
            disabled={!canContinue}
            className="h-11 px-8 bg-white hover:bg-white/90 disabled:opacity-40 disabled:pointer-events-none text-zinc-950 font-bold rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm border-0 active:scale-[0.97]"
          >
            {currentStep === steps.length - 1 ? 'Finish setup' : 'Continue'}
            {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-center text-[11px] text-white/25 mt-4">
          You can add competitors, USP, and more later in Settings → Workspace.
        </p>
      </form>
    </div>
  )
}
