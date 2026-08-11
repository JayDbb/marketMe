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
  X,
  Loader2,
  CheckCircle2,
  Activity,
  Palette,
  Upload,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  completeOnboardingAction,
  uploadBusinessLogoAction,
} from '@/app/onboarding/actions'
import { toast } from 'sonner'
import type { BusinessProfile } from '@/types/business-profile'
import { SMB_INDUSTRIES, OTHER_INDUSTRY, normalizeIndustry } from '@/lib/industries'
import { getIndustryPalette } from '@/lib/studio-brand-kit'
import { STUDIO_FONT_FAMILIES } from '@/lib/instagram-formats'
import { AppSelect } from '@/components/ui/app-select'

const steps = [
  {
    id: 'business',
    title: 'Your business',
    description: 'Four quick answers — enough for the AI to write relevant posts.',
  },
  {
    id: 'marketing',
    title: 'Marketing focus',
    description: 'Who you reach, how you sound, where you publish, and who you compete with.',
  },
  {
    id: 'brand',
    title: 'Brand assets',
    description: 'Logo, colours, and fonts so Studio and AI stay on-brand.',
  },
]

const saveSteps = [
  'Saving your marketing profile…',
  'Uploading brand assets…',
  'Tuning AI to your brand…',
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
  'h-12 bg-white/8 border-white/15 focus-visible:border-blue-400/60 focus-visible:ring-0 text-white placeholder:text-white/25 rounded-xl transition-all text-base shadow-none'
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
      channels: [],
      competitors: '',
      brandColors: getIndustryPalette(null),
      primaryFont: 'Inter',
      secondaryFont: 'Georgia',
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
    channels: profile.channels ?? [],
    competitors: profile.competitors ?? '',
    brandColors: colors.length >= 3 ? colors : getIndustryPalette(industry),
    primaryFont: fonts[0] || 'Inter',
    secondaryFont: fonts[1] || 'Georgia',
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
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialProfile?.logo_url ?? null
  )
  const [direction, setDirection] = useState<1 | -1>(1)

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
    // Brand step is optional beyond colours (prefilled)
    return formData.brandColors.length >= 1 && formData.primaryFont.length > 0
  }, [currentStep, formData])

  const finishOnboarding = async () => {
    setIsSaving(true)
    setSaveError(null)
    setSaveStep(0)

    try {
      const result = await completeOnboardingAction({
        business_name: formData.businessName.trim(),
        industry: formData.industry.trim(),
        industry_detail:
          formData.industry === OTHER_INDUSTRY
            ? formData.industryDetail.trim()
            : null,
        website: formData.website.trim() || undefined,
        services: formData.services.trim(),
        primary_goal: formData.primaryGoal,
        target_customers: formData.targetCustomers.trim(),
        tone: formData.tone,
        channels: formData.channels,
        competitors: formData.competitors.trim() || undefined,
        brand_colors: formData.brandColors.slice(0, 5),
        brand_fonts: [formData.primaryFont, formData.secondaryFont].filter(Boolean),
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
      if (logoFile) {
        const fd = new FormData()
        fd.set('logo', logoFile)
        const upload = await uploadBusinessLogoAction(fd)
        if ('error' in upload) {
          toast.message('Profile saved', { description: upload.error })
        }
      }

      setSaveStep(2)
      await new Promise((resolve) => setTimeout(resolve, 400))
      setSaveStep(3)
      await new Promise((resolve) => setTimeout(resolve, 350))

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
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }))
  }

  const onLogoChange = (file: File | null) => {
    if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
    setLogoFile(file)
    setLogoPreview(file ? URL.createObjectURL(file) : initialProfile?.logo_url ?? null)
  }

  const cardClass =
    'w-full max-w-2xl bg-[#0d1117]/95 border border-white/15 shadow-2xl z-10 p-8 md:p-10 rounded-2xl relative'

  if (isSaving) {
    return (
      <div className="flex flex-col min-h-dvh font-sans items-center justify-center py-12 px-4 relative w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-[#0d1117]/95 border border-white/15 shadow-2xl z-10 p-10 rounded-2xl flex flex-col items-center"
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
                  <span className={`text-sm ${isActive ? 'text-white' : 'text-white/55'}`}>
                    {step}
                  </span>
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
        className={cardClass}
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
                    className="min-h-[88px] bg-white/8 border-white/15 focus-visible:ring-0 focus-visible:border-blue-400/60 text-white placeholder:text-white/20 rounded-xl text-sm p-4 resize-y shadow-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    Website{' '}
                    <span className="text-white/25 normal-case tracking-normal">(optional)</span>
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
                            : 'bg-white/8 border-white/10 text-white/50 hover:border-white/20'
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
                            : 'bg-white/8 border-white/10 text-white/45 hover:border-white/20'
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
                              : 'bg-white/8 border-white/10 text-white/45 hover:border-white/20'
                          }`}
                        >
                          {channel}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-[11px] text-white/30">
                    Instagram is live for connect &amp; publish today. Other channels inform
                    planning copy.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>
                    Competitors{' '}
                    <span className="text-white/25 normal-case tracking-normal">
                      (optional — up to 5)
                    </span>
                  </Label>
                  <Textarea
                    value={formData.competitors}
                    onChange={(e) => updateFields({ competitors: e.target.value })}
                    placeholder={'@rivalbarbershop\nhttps://competitor-salon.com\n@anotherfade'}
                    className="min-h-[88px] bg-white/8 border-white/15 focus-visible:ring-0 focus-visible:border-blue-400/60 text-white placeholder:text-white/20 rounded-xl text-sm p-4 resize-y shadow-none"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className={labelClass}>
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    Logo{' '}
                    <span className="text-white/25 normal-case tracking-normal">(optional)</span>
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl border border-white/15 bg-white/8 overflow-hidden flex items-center justify-center">
                      {logoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Palette className="w-6 h-6 text-white/30" />
                      )}
                    </div>
                    <label className="cursor-pointer h-10 px-4 rounded-xl border border-white/15 bg-white/8 text-sm text-white/80 hover:border-white/30 inline-flex items-center gap-2">
                      <Upload className="w-4 h-4" />
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

                <div className="space-y-2">
                  <Label className={labelClass}>
                    <Palette className="w-3.5 h-3.5 text-blue-400" />
                    Brand colours
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {formData.brandColors.slice(0, 5).map((color, i) => (
                      <label key={i} className="flex flex-col items-center gap-1.5">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setBrandColor(i, e.target.value)}
                          className="h-10 w-10 cursor-pointer rounded-lg border border-white/15 bg-transparent p-0.5"
                        />
                        <span className="text-[10px] text-white/35 font-mono">{color}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-[11px] text-white/30">
                    Prefills from your industry — tweak to match your brand.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className={labelClass}>Primary font</Label>
                    <AppSelect
                      tone="onboarding"
                      aria-label="Primary font"
                      value={formData.primaryFont}
                      options={STUDIO_FONT_FAMILIES}
                      onChange={(primaryFont) => updateFields({ primaryFont })}
                    />
                  </div>
                  <div className="space-y-2">
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

        {saveError && !isSaving ? (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {saveError}
          </div>
        ) : null}

        <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6">
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
          Built for all small businesses — barbers & salons get smarter defaults first.
        </p>
      </form>
    </div>
  )
}
