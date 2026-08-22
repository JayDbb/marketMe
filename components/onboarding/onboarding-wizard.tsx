'use client'

<<<<<<< HEAD
import { useState, useMemo } from 'react'
=======
import { useState, useMemo, useEffect } from 'react'
>>>>>>> origin/development
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
<<<<<<< HEAD
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
=======
  Loader2,
  Palette,
  Upload,
  Activity,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  completeOnboardingAction,
  uploadBusinessLogoAction,
} from '@/app/onboarding/actions'
import { toast } from 'sonner'
import type { BusinessProfile, BusinessProfileInput } from '@/types/business-profile'
import { SMB_INDUSTRIES, OTHER_INDUSTRY, normalizeIndustry } from '@/lib/industries'
import { getIndustryPalette } from '@/lib/studio-brand-kit'
import { STUDIO_FONT_FAMILIES } from '@/lib/instagram-formats'
import { AppSelect } from '@/components/ui/app-select'
import { cn } from '@/lib/utils'
import { InlineNotice } from '@/components/ui/inline-notice'

const AFTER_ONBOARDING_HREF = '/dashboard'
>>>>>>> origin/development

const steps = [
  {
    id: 'business',
    title: 'Your business',
<<<<<<< HEAD
    description: 'Four quick answers — enough for the AI to write relevant posts.',
=======
    description: 'Name, industry, and what you sell — enough for the AI to write relevant posts.',
>>>>>>> origin/development
  },
  {
    id: 'marketing',
    title: 'Marketing focus',
    description: 'Who you reach, how you sound, and where you publish.',
  },
<<<<<<< HEAD
]

const saveSteps = [
  'Saving your marketing profile…',
  'Tuning AI to your brand voice…',
  'Opening your dashboard…',
]

=======
  {
    id: 'brand',
    title: 'Brand assets',
    description: 'Optional — skip and add a logo, colours, and fonts later in Settings.',
  },
]

>>>>>>> origin/development
const primaryGoals = [
  'Lead Generation',
  'Brand Awareness',
  'Direct Sales',
  'Bookings / Consultations',
]
<<<<<<< HEAD

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
=======

const toneOptions = [
  'Professional',
  'Friendly & warm',
  'Bold & confident',
  'Educational',
  'Luxury & refined',
]

const contentChannels = ['Instagram']

const DEFAULT_PRIMARY_FONT = 'Geist'
const DEFAULT_SECONDARY_FONT = 'Georgia'

const inputClass =
  'h-12 bg-white/8 border-white/15 focus-visible:border-blue-400/60 focus-visible:ring-0 text-white placeholder:text-white/25 rounded-xl ui-transition text-base shadow-none'
const labelClass =
  'text-white/45 font-medium text-xs uppercase tracking-wider flex items-center gap-2'

type OnboardingFormData = {
  businessName: string
  industry: string
  industryDetail: string
>>>>>>> origin/development
  website: string
  services: string
  primaryGoal: string
  targetCustomers: string
  tone: string
  channels: string[]
<<<<<<< HEAD
=======
  competitors: string
  brandColors: string[]
  primaryFont: string
  secondaryFont: string
>>>>>>> origin/development
}

function profileToFormData(profile: BusinessProfile | null | undefined): OnboardingFormData {
  if (!profile) {
    return {
      businessName: '',
      industry: '',
<<<<<<< HEAD
=======
      industryDetail: '',
>>>>>>> origin/development
      website: '',
      services: '',
      primaryGoal: '',
      targetCustomers: '',
      tone: '',
<<<<<<< HEAD
      channels: [],
    }
  }

  return {
    businessName: profile.business_name ?? '',
    industry: profile.industry ?? '',
=======
      channels: ['Instagram'],
      competitors: '',
      brandColors: getIndustryPalette(null),
      primaryFont: DEFAULT_PRIMARY_FONT,
      secondaryFont: DEFAULT_SECONDARY_FONT,
    }
  }

  const industry = normalizeIndustry(profile.industry) || profile.industry || ''
  const colors =
    Array.isArray(profile.brand_colors) && profile.brand_colors.length > 0
      ? profile.brand_colors.slice(0, 5)
      : getIndustryPalette(industry)
  const fonts = Array.isArray(profile.brand_fonts) ? profile.brand_fonts : []

  return {
    businessName: profile.business_name ?? '',
    industry,
    industryDetail: profile.industry_detail ?? '',
>>>>>>> origin/development
    website: profile.website ?? '',
    services: profile.services ?? '',
    primaryGoal: profile.primary_goal ?? '',
    targetCustomers: profile.target_customers ?? '',
    tone: profile.tone ?? '',
<<<<<<< HEAD
    channels: profile.channels ?? [],
  }
}

=======
    channels: profile.channels?.length ? profile.channels : ['Instagram'],
    competitors: profile.competitors ?? '',
    brandColors: colors.length >= 3 ? colors : getIndustryPalette(industry),
    primaryFont: fonts[0] || DEFAULT_PRIMARY_FONT,
    secondaryFont: fonts[1] || DEFAULT_SECONDARY_FONT,
  }
}

function formToInput(
  form: OnboardingFormData,
  opts: { includeBrand: boolean }
): BusinessProfileInput {
  const input: BusinessProfileInput = {}
  if (form.businessName.trim()) input.business_name = form.businessName.trim()
  if (form.industry.trim()) input.industry = form.industry.trim()
  if (form.industry === OTHER_INDUSTRY) {
    input.industry_detail = form.industryDetail.trim() || null
  } else if (form.industry.trim()) {
    input.industry_detail = null
  }
  if (form.website.trim()) input.website = form.website.trim()
  if (form.services.trim()) input.services = form.services.trim()
  if (form.primaryGoal) input.primary_goal = form.primaryGoal
  if (form.targetCustomers.trim()) input.target_customers = form.targetCustomers.trim()
  if (form.tone) input.tone = form.tone
  if (form.channels.length) input.channels = form.channels
  if (form.competitors.trim()) input.competitors = form.competitors.trim()
  if (opts.includeBrand) {
    input.brand_colors = form.brandColors.slice(0, 5)
    input.brand_fonts = [form.primaryFont, form.secondaryFont].filter(Boolean)
  }
  return input
}

>>>>>>> origin/development
export function OnboardingWizard({
  initialProfile = null,
}: {
  initialProfile?: BusinessProfile | null
}) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
<<<<<<< HEAD
  const [saveStep, setSaveStep] = useState(0)
=======
  const [isSkipping, setIsSkipping] = useState(false)
  const [isStepSaving, setIsStepSaving] = useState(false)
>>>>>>> origin/development
  const [saveError, setSaveError] = useState<string | null>(null)
  const [formData, setFormData] = useState<OnboardingFormData>(() =>
    profileToFormData(initialProfile)
  )
<<<<<<< HEAD
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
=======
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialProfile?.logo_url ?? null
  )
  const [direction, setDirection] = useState<1 | -1>(1)

  const isBusy = isSaving || isSkipping || isStepSaving

  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
    }
  }, [logoPreview])

  const canContinue = useMemo(() => {
    if (currentStep === 0) {
      const industryOk =
        formData.industry.trim().length > 0 &&
        (formData.industry !== OTHER_INDUSTRY || formData.industryDetail.trim().length > 0)
      return (
        formData.businessName.trim().length > 0 &&
        industryOk &&
        formData.services.trim().length > 0
      )
    }
    if (currentStep === 1) {
      return (
        formData.primaryGoal.length > 0 &&
        formData.targetCustomers.trim().length > 0 &&
        formData.tone.length > 0 &&
        formData.channels.length > 0
      )
    }
    return true
  }, [currentStep, formData])

  const goToDashboard = () => {
    router.push(AFTER_ONBOARDING_HREF)
    router.refresh()
  }

  const persistProfile = async (includeBrand: boolean) => {
    const result = await completeOnboardingAction(formToInput(formData, { includeBrand }))
    if (result.error || !result.data?.id) {
      throw new Error(result.error ?? 'Could not save profile. Try again.')
    }
    if (logoFile) {
      const fd = new FormData()
      fd.set('logo', logoFile)
      const upload = await uploadBusinessLogoAction(fd)
      if ('error' in upload) {
        toast.message('Profile saved', { description: upload.error })
      }
    }
  }

  const finishOnboarding = async (includeBrand: boolean) => {
    setIsSaving(true)
    setSaveError(null)
    try {
      await persistProfile(includeBrand)
      toast.success('Profile saved')
      goToDashboard()
    } catch (err) {
      const message = formatOnboardingError(
        err instanceof Error ? err.message : 'Failed to save profile',
        'finish'
      )
      setSaveError(message)
      setIsSaving(false)
    }
  }

  const handleSkip = async () => {
    setIsSkipping(true)
    setSaveError(null)
    try {
      await persistProfile(currentStep === 2)
      goToDashboard()
    } catch (err) {
      const message = formatOnboardingError(
        err instanceof Error ? err.message : 'Could not skip setup',
        'skip'
      )
      setSaveError(message)
      setIsSkipping(false)
    }
  }

  const handleNext = async () => {
    if (!canContinue || isBusy) return
    if (currentStep < steps.length - 1) {
      setIsStepSaving(true)
      setSaveError(null)
      try {
        await persistProfile(false)
        setDirection(1)
        setCurrentStep((prev) => prev + 1)
      } catch (err) {
        const message = formatOnboardingError(
          err instanceof Error ? err.message : 'Failed to save progress',
          'progress'
        )
        setSaveError(message)
      } finally {
        setIsStepSaving(false)
      }
      return
>>>>>>> origin/development
    }
    void finishOnboarding(true)
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep((prev) => prev - 1)
    }
  }

  const jumpToStep = (index: number) => {
    if (index >= currentStep || isBusy) return
    setDirection(-1)
    setCurrentStep(index)
  }

  const updateFields = (fields: Partial<typeof formData>) => {
<<<<<<< HEAD
    setFormData((prev) => ({ ...prev, ...fields }))
=======
    setFormData((prev) => {
      const next = { ...prev, ...fields }
      if (fields.industry && fields.industry !== prev.industry) {
        next.brandColors = getIndustryPalette(fields.industry)
        if (fields.industry !== OTHER_INDUSTRY) next.industryDetail = ''
      }
      return next
    })
  }

  const setBrandColor = (index: number, value: string) => {
    setFormData((prev) => {
      const colors = [...prev.brandColors]
      colors[index] = value
      return { ...prev, brandColors: colors }
    })
>>>>>>> origin/development
  }

  const toggleChannel = (channel: string) => {
    setFormData((prev) => ({
      ...prev,
<<<<<<< HEAD
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
=======
      channels: [channel],
    }))
  }

  const onLogoChange = (file: File | null) => {
    if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
    setLogoFile(file)
    setLogoPreview(file ? URL.createObjectURL(file) : initialProfile?.logo_url ?? null)
>>>>>>> origin/development
  }

  const formatOnboardingError = (
    fallback: string,
    action: 'finish' | 'skip' | 'progress'
  ) => {
    if (action === 'skip') {
      return `${fallback}. Your answers are still here, so try Skip again or continue to the next step.`
    }
    if (action === 'progress') {
      return `${fallback}. Review the current step and try Next again.`
    }
    return `${fallback}. Your changes are still on this page, so try again when ready.`
  }

  const continueLabel =
    currentStep === steps.length - 1
      ? isSaving
        ? logoFile
          ? 'Uploading logo…'
          : 'Saving…'
        : 'Open dashboard'
      : isStepSaving
        ? 'Saving…'
        : 'Continue'

  return (
<<<<<<< HEAD
    <div className="flex flex-col min-h-dvh font-sans items-center justify-center py-12 px-4 relative w-full">
      <Link
        href="/dashboard"
        className="absolute top-6 right-6 text-white/35 hover:text-white/70 transition-colors flex items-center gap-1.5 text-sm z-10"
        aria-label="Skip and go to dashboard"
=======
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center px-4 py-12 font-sans">
      <button
        type="button"
        onClick={() => void handleSkip()}
        disabled={isBusy}
        className="absolute top-6 right-6 z-10 inline-flex min-h-11 items-center text-sm text-white/35 ui-transition hover:text-white/70 disabled:opacity-40"
>>>>>>> origin/development
      >
        {isSkipping ? 'Opening dashboard…' : 'Skip'}
      </button>

<<<<<<< HEAD
      <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
        <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
          <Activity className="w-5 h-5 text-white" />
=======
      <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500">
          <Activity className="size-5 text-white" aria-hidden="true" />
>>>>>>> origin/development
        </div>
        <span className="font-sans text-xl font-semibold tracking-tight text-white">
          Marketme
        </span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
<<<<<<< HEAD
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
=======
          void handleNext()
        }}
        className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0d1117] p-8 md:p-10"
      >
        <div className="mb-2 text-xs font-medium uppercase tracking-widest text-white/40">
          Step {currentStep + 1} of {steps.length}
          <span className="normal-case tracking-normal text-white/30"> · about 2 minutes</span>
        </div>

        <div className="mb-8 flex items-center gap-2" role="navigation" aria-label="Onboarding steps">
          {steps.map((step, i) => {
            const isReached = i <= currentStep
            const isClickable = i < currentStep && !isBusy
            return (
              <button
                key={step.id}
                type="button"
                disabled={!isClickable}
                onClick={() => jumpToStep(i)}
                aria-current={i === currentStep ? 'step' : undefined}
                aria-label={`${step.title}${i < currentStep ? ', completed, go back' : i === currentStep ? ', current step' : ''}`}
                className={cn(
                  'flex min-h-11 flex-1 flex-col justify-center gap-1.5 text-left',
                  isClickable && 'cursor-pointer'
                )}
              >
                <span
                  className={cn(
                    'h-1 w-full rounded-full ui-transition',
                    isReached ? 'bg-blue-500' : 'bg-white/8',
                    isClickable && 'hover:bg-blue-400'
                  )}
                />
                <span
                  className={cn(
                    'text-[9px] font-bold uppercase tracking-widest',
                    isReached ? 'text-white/70' : 'text-white/20'
                  )}
                >
                  {step.title}
                </span>
              </button>
            )
          })}
>>>>>>> origin/development
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
<<<<<<< HEAD
              <h2 className="text-2xl md:text-3xl font-serif font-light tracking-tight text-white mb-1.5">
=======
              <h2 className="mb-1.5 font-sans text-2xl font-semibold tracking-tight text-white md:text-3xl">
>>>>>>> origin/development
                {steps[currentStep].title}
              </h2>
              <p className="text-sm text-white/40">{steps[currentStep].description}</p>
            </div>

            {currentStep === 0 && (
<<<<<<< HEAD
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className={labelClass}>
                      <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                      Business name
                    </Label>
                    <Input
=======
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label className={labelClass} htmlFor="onboarding-business-name">
                      <Briefcase className="size-3.5 text-blue-400" />
                      Business name
                    </Label>
                    <Input
                      id="onboarding-business-name"
>>>>>>> origin/development
                      value={formData.businessName}
                      onChange={(e) => updateFields({ businessName: e.target.value })}
                      placeholder="e.g. Vanguard Atelier"
                      required
                      className={inputClass}
                    />
                  </div>
<<<<<<< HEAD
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
=======
                  <div className="flex flex-col gap-2">
                    <Label className={labelClass}>
                      <Building2 className="size-3.5 text-blue-400" />
                      Industry
                    </Label>
                    <AppSelect
                      tone="onboarding"
                      aria-label="Industry"
                      value={formData.industry}
                      placeholder="Select industry…"
                      options={SMB_INDUSTRIES}
                      onChange={(industry) => updateFields({ industry })}
                    />
                    {formData.industry === OTHER_INDUSTRY ? (
                      <Input
                        value={formData.industryDetail}
                        onChange={(e) => updateFields({ industryDetail: e.target.value })}
                        placeholder="Describe your industry"
                        required
                        className={inputClass}
                      />
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className={labelClass} htmlFor="onboarding-services">
                    <Briefcase className="size-3.5 text-blue-400" />
                    What you sell or do
                  </Label>
                  <Textarea
                    id="onboarding-services"
>>>>>>> origin/development
                    value={formData.services}
                    onChange={(e) => updateFields({ services: e.target.value })}
                    placeholder="One sentence is fine — e.g. Custom suits and personal styling for professionals."
                    required
<<<<<<< HEAD
                    className="min-h-[88px] bg-white/5 border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/60 text-white placeholder:text-white/20 rounded-xl text-sm p-4 resize-y shadow-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    Website <span className="text-white/25 normal-case tracking-normal">(optional)</span>
                  </Label>
                  <Input
=======
                    className="min-h-[88px] resize-y rounded-xl border-white/15 bg-white/8 p-4 text-sm text-white shadow-none placeholder:text-white/20 focus-visible:border-blue-400/60 focus-visible:ring-0"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className={labelClass} htmlFor="onboarding-website">
                    <Globe className="size-3.5 text-blue-400" />
                    Website{' '}
                    <span className="normal-case tracking-normal text-white/25">(optional)</span>
                  </Label>
                  <Input
                    id="onboarding-website"
>>>>>>> origin/development
                    value={formData.website}
                    onChange={(e) => updateFields({ website: e.target.value })}
                    placeholder="https://"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
<<<<<<< HEAD
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className={labelClass}>
                    <Target className="w-3.5 h-3.5 text-blue-400" />
                    Main marketing goal
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
=======
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <Label className={labelClass}>
                    <Target className="size-3.5 text-blue-400" />
                    Main marketing goal
                  </Label>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
>>>>>>> origin/development
                    {primaryGoals.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        aria-pressed={formData.primaryGoal === goal}
                        onClick={() => updateFields({ primaryGoal: goal })}
<<<<<<< HEAD
                        className={`h-11 px-3 rounded-xl border text-sm font-medium transition-all text-left ${
                          formData.primaryGoal === goal
                            ? 'bg-blue-500/12 border-blue-500/50 text-blue-300'
                            : 'bg-white/4 border-white/10 text-white/50 hover:border-white/20'
                        }`}
=======
                        className={cn(
                          'h-11 rounded-xl border px-3 text-left text-sm font-medium ui-transition',
                          formData.primaryGoal === goal
                            ? 'border-blue-500/50 bg-blue-500/12 text-blue-300'
                            : 'border-white/10 bg-white/8 text-white/50 hover:border-white/20'
                        )}
>>>>>>> origin/development
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

<<<<<<< HEAD
                <div className="space-y-2">
                  <Label className={labelClass}>
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    Target audience
                  </Label>
                  <Input
=======
                <div className="flex flex-col gap-2">
                  <Label className={labelClass} htmlFor="onboarding-audience">
                    <Users className="size-3.5 text-blue-400" />
                    Target audience
                  </Label>
                  <Input
                    id="onboarding-audience"
>>>>>>> origin/development
                    value={formData.targetCustomers}
                    onChange={(e) => updateFields({ targetCustomers: e.target.value })}
                    placeholder="e.g. Busy founders aged 30–45 in the US"
                    required
                    className={inputClass}
                  />
                </div>

<<<<<<< HEAD
                <div className="space-y-2">
=======
                <div className="flex flex-col gap-2">
>>>>>>> origin/development
                  <Label className={labelClass}>Brand voice</Label>
                  <div className="flex flex-wrap gap-2">
                    {toneOptions.map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        aria-pressed={formData.tone === tone}
                        onClick={() => updateFields({ tone })}
<<<<<<< HEAD
                        className={`h-9 px-3 rounded-xl border text-xs font-medium transition-all ${
                          formData.tone === tone
                            ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                            : 'bg-white/4 border-white/10 text-white/45 hover:border-white/20'
                        }`}
=======
                        className={cn(
                          'h-9 rounded-xl border px-3 text-xs font-medium ui-transition',
                          formData.tone === tone
                            ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
                            : 'border-white/10 bg-white/8 text-white/45 hover:border-white/20'
                        )}
>>>>>>> origin/development
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

<<<<<<< HEAD
                <div className="space-y-2">
                  <Label className={labelClass}>
                    <Megaphone className="w-3.5 h-3.5 text-blue-400" />
=======
                <div className="flex flex-col gap-2">
                  <Label className={labelClass}>
                    <Megaphone className="size-3.5 text-blue-400" />
>>>>>>> origin/development
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
<<<<<<< HEAD
                          className={`h-9 px-3 rounded-xl border text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                              : 'bg-white/4 border-white/10 text-white/45 hover:border-white/20'
                          }`}
=======
                          className={cn(
                            'h-9 rounded-xl border px-3 text-xs font-medium ui-transition',
                            isActive
                              ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
                              : 'border-white/10 bg-white/8 text-white/45 hover:border-white/20'
                          )}
>>>>>>> origin/development
                        >
                          {channel}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-[11px] text-white/30">
                    Instagram is the live channel today. More publishing channels will appear here
                    after they ship.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className={labelClass} htmlFor="onboarding-competitors">
                    Competitors{' '}
                    <span className="normal-case tracking-normal text-white/25">
                      (optional — up to 5)
                    </span>
                  </Label>
                  <Textarea
                    id="onboarding-competitors"
                    value={formData.competitors}
                    onChange={(e) => updateFields({ competitors: e.target.value })}
                    placeholder={'@rivalbarbershop\nhttps://competitor-salon.com\n@anotherfade'}
                    className="min-h-[88px] resize-y rounded-xl border-white/15 bg-white/8 p-4 text-sm text-white shadow-none placeholder:text-white/20 focus-visible:border-blue-400/60 focus-visible:ring-0"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="flex flex-col gap-6">
                <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/55">
                  Next on the dashboard: connect Instagram, then generate your first posts.
                </p>
                <div className="flex flex-col gap-2">
                  <Label className={labelClass}>
                    <Upload className="size-3.5 text-blue-400" />
                    Logo{' '}
                    <span className="normal-case tracking-normal text-white/25">(optional)</span>
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="flex size-16 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/8">
                      {logoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="size-full object-contain"
                        />
                      ) : (
                        <Palette className="size-6 text-white/30" />
                      )}
                    </div>
                    <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-4 text-sm text-white/80 hover:border-white/30">
                      <Upload className="size-4" />
                      Upload
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => onLogoChange(e.target.files?.[0] ?? null)}
                      />
                    </label>
                    {logoPreview ? (
                      <button
                        type="button"
                        className="text-xs text-white/40 hover:text-white"
                        onClick={() => onLogoChange(null)}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className={labelClass}>
                    <Palette className="size-3.5 text-blue-400" />
                    Brand colours
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {formData.brandColors.slice(0, 5).map((color, i) => (
                      <label key={i} className="flex flex-col items-center gap-1.5">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setBrandColor(i, e.target.value)}
                          className="size-10 cursor-pointer rounded-lg border border-white/15 bg-transparent p-0.5"
                        />
                        <span className="font-mono text-[10px] text-white/35">{color}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-[11px] text-white/30">
                    Prefills from your industry — tweak to match your brand.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label className={labelClass}>Primary font</Label>
                    <AppSelect
                      tone="onboarding"
                      aria-label="Primary font"
                      value={formData.primaryFont}
                      options={STUDIO_FONT_FAMILIES}
                      onChange={(primaryFont) => updateFields({ primaryFont })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className={labelClass}>Secondary font</Label>
                    <AppSelect
                      tone="onboarding"
                      aria-label="Secondary font"
                      value={formData.secondaryFont}
                      options={STUDIO_FONT_FAMILIES}
                      onChange={(secondaryFont) => updateFields({ secondaryFont })}
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

<<<<<<< HEAD
        {saveError && !isSaving ? (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {saveError}
          </div>
        ) : null}

        <div className="mt-10 flex items-center justify-between border-t border-white/8 pt-6">
=======
        {saveError ? (
          <InlineNotice
            tone="error"
            title="Could not save onboarding"
            description={saveError}
            className="mt-6"
          />
        ) : null}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
>>>>>>> origin/development
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
<<<<<<< HEAD
            disabled={currentStep === 0}
            className="text-white/35 hover:text-white disabled:opacity-0 rounded-xl text-sm"
=======
            disabled={currentStep === 0 || isBusy}
            className="rounded-xl text-sm text-white/35 hover:bg-white/8 hover:text-white disabled:opacity-0"
>>>>>>> origin/development
          >
            <ArrowLeft data-icon="inline-start" />
            Back
          </Button>

<<<<<<< HEAD
          <button
            type="submit"
            disabled={!canContinue}
            className="h-11 px-8 bg-white hover:bg-white/90 disabled:opacity-40 disabled:pointer-events-none text-zinc-950 font-bold rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm border-0 active:scale-[0.97]"
          >
            {currentStep === steps.length - 1 ? 'Finish setup' : 'Continue'}
            {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
          </button>
=======
          <div className="flex flex-wrap items-center justify-end gap-2">
            {currentStep === steps.length - 1 ? (
              <Button
                type="button"
                variant="ghost"
                disabled={isBusy}
                onClick={() => void finishOnboarding(false)}
                className="rounded-xl text-sm text-white/45 hover:bg-white/8 hover:text-white"
              >
                Skip brand
              </Button>
            ) : null}
            <button
              type="submit"
              disabled={!canContinue || isBusy}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-500 px-8 text-sm font-semibold text-white ui-transition hover:bg-blue-400 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]"
            >
              {isBusy && currentStep === steps.length - 1 ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {isStepSaving ? <Loader2 className="size-4 animate-spin" /> : null}
              {continueLabel}
              {currentStep < steps.length - 1 && !isStepSaving ? (
                <ArrowRight className="size-4" />
              ) : null}
            </button>
          </div>
>>>>>>> origin/development
        </div>

        <p className="text-center text-[11px] text-white/25 mt-4">
          You can add competitors, USP, and more later in Settings → Workspace.
        </p>
      </form>
    </div>
  )
}
