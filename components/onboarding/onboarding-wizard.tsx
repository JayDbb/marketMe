'use client'

import { useState, useMemo, useEffect } from 'react'
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

const steps = [
  {
    id: 'business',
    title: 'Your business',
    description: 'Name, industry, and what you sell — enough for the AI to write relevant posts.',
  },
  {
    id: 'marketing',
    title: 'Marketing focus',
    description: 'Who you reach, how you sound, and where you publish.',
  },
  {
    id: 'brand',
    title: 'Brand assets',
    description: 'Optional — skip and add a logo, colours, and fonts later in Settings.',
  },
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
  website: string
  services: string
  primaryGoal: string
  targetCustomers: string
  tone: string
  channels: string[]
  competitors: string
  brandColors: string[]
  primaryFont: string
  secondaryFont: string
}

function profileToFormData(profile: BusinessProfile | null | undefined): OnboardingFormData {
  if (!profile) {
    return {
      businessName: '',
      industry: '',
      industryDetail: '',
      website: '',
      services: '',
      primaryGoal: '',
      targetCustomers: '',
      tone: '',
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
    website: profile.website ?? '',
    services: profile.services ?? '',
    primaryGoal: profile.primary_goal ?? '',
    targetCustomers: profile.target_customers ?? '',
    tone: profile.tone ?? '',
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

export function OnboardingWizard({
  initialProfile = null,
}: {
  initialProfile?: BusinessProfile | null
}) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const [isStepSaving, setIsStepSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [formData, setFormData] = useState<OnboardingFormData>(() =>
    profileToFormData(initialProfile)
  )
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
  }

  const toggleChannel = (channel: string) => {
    setFormData((prev) => ({
      ...prev,
      channels: [channel],
    }))
  }

  const onLogoChange = (file: File | null) => {
    if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
    setLogoFile(file)
    setLogoPreview(file ? URL.createObjectURL(file) : initialProfile?.logo_url ?? null)
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
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center px-4 py-12 font-sans">
      <button
        type="button"
        onClick={() => void handleSkip()}
        disabled={isBusy}
        className="absolute top-6 right-6 z-10 inline-flex min-h-11 items-center text-sm text-white/35 ui-transition hover:text-white/70 disabled:opacity-40"
      >
        {isSkipping ? 'Opening dashboard…' : 'Skip'}
      </button>

      <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500">
          <Activity className="size-5 text-white" aria-hidden="true" />
        </div>
        <span className="font-sans text-xl font-semibold tracking-tight text-white">
          Marketme
        </span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
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
              <h2 className="mb-1.5 font-sans text-2xl font-semibold tracking-tight text-white md:text-3xl">
                {steps[currentStep].title}
              </h2>
              <p className="text-sm text-white/40">{steps[currentStep].description}</p>
            </div>

            {currentStep === 0 && (
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label className={labelClass} htmlFor="onboarding-business-name">
                      <Briefcase className="size-3.5 text-blue-400" />
                      Business name
                    </Label>
                    <Input
                      id="onboarding-business-name"
                      value={formData.businessName}
                      onChange={(e) => updateFields({ businessName: e.target.value })}
                      placeholder="e.g. Vanguard Atelier"
                      required
                      className={inputClass}
                    />
                  </div>
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
                    value={formData.services}
                    onChange={(e) => updateFields({ services: e.target.value })}
                    placeholder="One sentence is fine — e.g. Custom suits and personal styling for professionals."
                    required
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
                    value={formData.website}
                    onChange={(e) => updateFields({ website: e.target.value })}
                    placeholder="https://"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <Label className={labelClass}>
                    <Target className="size-3.5 text-blue-400" />
                    Main marketing goal
                  </Label>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {primaryGoals.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        aria-pressed={formData.primaryGoal === goal}
                        onClick={() => updateFields({ primaryGoal: goal })}
                        className={cn(
                          'h-11 rounded-xl border px-3 text-left text-sm font-medium ui-transition',
                          formData.primaryGoal === goal
                            ? 'border-blue-500/50 bg-blue-500/12 text-blue-300'
                            : 'border-white/10 bg-white/8 text-white/50 hover:border-white/20'
                        )}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className={labelClass} htmlFor="onboarding-audience">
                    <Users className="size-3.5 text-blue-400" />
                    Target audience
                  </Label>
                  <Input
                    id="onboarding-audience"
                    value={formData.targetCustomers}
                    onChange={(e) => updateFields({ targetCustomers: e.target.value })}
                    placeholder="e.g. Busy founders aged 30–45 in the US"
                    required
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className={labelClass}>Brand voice</Label>
                  <div className="flex flex-wrap gap-2">
                    {toneOptions.map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        aria-pressed={formData.tone === tone}
                        onClick={() => updateFields({ tone })}
                        className={cn(
                          'h-9 rounded-xl border px-3 text-xs font-medium ui-transition',
                          formData.tone === tone
                            ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
                            : 'border-white/10 bg-white/8 text-white/45 hover:border-white/20'
                        )}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className={labelClass}>
                    <Megaphone className="size-3.5 text-blue-400" />
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
                          className={cn(
                            'h-9 rounded-xl border px-3 text-xs font-medium ui-transition',
                            isActive
                              ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
                              : 'border-white/10 bg-white/8 text-white/45 hover:border-white/20'
                          )}
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

        {saveError ? (
          <InlineNotice
            tone="error"
            title="Could not save onboarding"
            description={saveError}
            className="mt-6"
          />
        ) : null}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0 || isBusy}
            className="rounded-xl text-sm text-white/35 hover:bg-white/8 hover:text-white disabled:opacity-0"
          >
            <ArrowLeft data-icon="inline-start" />
            Back
          </Button>

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
        </div>
      </form>
    </div>
  )
}
