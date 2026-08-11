'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ExternalLink, Upload } from 'lucide-react'
import { updateWorkspaceAction } from '@/app/dashboard/settings/actions'
import { uploadBusinessLogoAction } from '@/app/onboarding/actions'
import { toast } from 'sonner'
import type { SettingsData } from '@/types/settings'
import { SMB_INDUSTRIES, OTHER_INDUSTRY, normalizeIndustry } from '@/lib/industries'
import { getIndustryPalette } from '@/lib/studio-brand-kit'
import { STUDIO_FONT_FAMILIES } from '@/lib/instagram-formats'
import { AppSelect } from '@/components/ui/app-select'

export function SettingsWorkspaceTab({
  settings,
  onSaved,
}: {
  settings: SettingsData
  onSaved: (business: SettingsData['business']) => void
}) {
  const [form, setForm] = useState(() => {
    const industry = normalizeIndustry(settings.business.industry) || settings.business.industry
    const colors =
      settings.business.brandColors.length > 0
        ? settings.business.brandColors
        : getIndustryPalette(industry)
    return {
      ...settings.business,
      industry,
      brandColors: colors,
    }
  })
  const [isPending, startTransition] = useTransition()
  const [logoUploading, setLogoUploading] = useState(false)

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleIndustryChange = (industry: string) => {
    setForm((prev) => ({
      ...prev,
      industry,
      industryDetail: industry === OTHER_INDUSTRY ? prev.industryDetail : '',
      brandColors:
        prev.brandColors.length > 0 && prev.industry === industry
          ? prev.brandColors
          : getIndustryPalette(industry),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.set('businessName', form.businessName)
    fd.set('industry', form.industry)
    fd.set('industryDetail', form.industryDetail)
    fd.set('location', form.location)
    fd.set('website', form.website)
    fd.set('primaryGoal', form.primaryGoal)
    fd.set('competitors', form.competitors)
    fd.set('brandColors', form.brandColors.join(','))
    fd.set('primaryFont', form.primaryFont)
    fd.set('secondaryFont', form.secondaryFont)

    startTransition(async () => {
      const result = await updateWorkspaceAction(fd)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Workspace saved')
      onSaved({ ...form, hasProfile: true })
    })
  }

  const handleLogoUpload = async (file: File | null) => {
    if (!file) return
    setLogoUploading(true)
    try {
      const fd = new FormData()
      fd.set('logo', file)
      const result = await uploadBusinessLogoAction(fd)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      set('logoUrl', result.logoUrl)
      toast.success('Logo updated')
    } finally {
      setLogoUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Workspace</h3>
        <p className="text-sm text-zinc-500 dark:text-white/40">
          Linked to your business profile — used for AI content and dashboard display.
        </p>
      </div>

      {!settings.business.hasProfile && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm text-amber-200/90">
          No workspace set up yet. Add a name below or{' '}
          <Link href="/onboarding" className="underline font-medium">
            complete onboarding
          </Link>
          .
        </div>
      )}

      <div className="p-6 rounded-2xl bg-card border border-border space-y-5 max-w-lg">
        <div className="space-y-2">
          <Label className="text-xs text-zinc-500">Workspace name</Label>
          <Input
            value={form.businessName}
            onChange={(e) => set('businessName', e.target.value)}
            placeholder="e.g. Acme Coffee Co."
            className="h-11 rounded-xl bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-zinc-500">Industry</Label>
          <AppSelect
            tone="surface"
            aria-label="Industry"
            value={form.industry}
            placeholder="Select industry…"
            options={SMB_INDUSTRIES}
            onChange={handleIndustryChange}
            className="h-11 text-sm"
          />
          {form.industry === OTHER_INDUSTRY ? (
            <Input
              value={form.industryDetail}
              onChange={(e) => set('industryDetail', e.target.value)}
              placeholder="Describe your industry"
              className="h-11 rounded-xl bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10"
            />
          ) : null}
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-zinc-500">Location</Label>
          <Input
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="City, country"
            className="h-11 rounded-xl bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-zinc-500">Website</Label>
          <Input
            value={form.website}
            onChange={(e) => set('website', e.target.value)}
            placeholder="https://"
            className="h-11 rounded-xl bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-zinc-500">Primary marketing goal</Label>
          <Input
            value={form.primaryGoal}
            onChange={(e) => set('primaryGoal', e.target.value)}
            placeholder="e.g. Increase brand awareness"
            className="h-11 rounded-xl bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-zinc-500">Logo</Label>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl border border-zinc-200 dark:border-white/10 overflow-hidden bg-zinc-50 dark:bg-white/5 flex items-center justify-center">
              {form.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logoUrl} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <span className="text-[10px] text-zinc-400">None</span>
              )}
            </div>
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 dark:border-white/10 px-3 text-xs font-medium text-zinc-700 dark:text-white/70">
              {logoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Upload
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={logoUploading}
                onChange={(e) => void handleLogoUpload(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-zinc-500">Brand colours</Label>
          <div className="flex flex-wrap gap-2">
            {form.brandColors.map((color, i) => (
              <input
                key={i}
                type="color"
                value={color}
                onChange={(e) => {
                  const next = [...form.brandColors]
                  next[i] = e.target.value
                  set('brandColors', next)
                }}
                className="h-9 w-9 cursor-pointer rounded-lg border border-zinc-200 dark:border-white/10 bg-transparent p-0.5"
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs text-zinc-500">Primary font</Label>
            <AppSelect
              tone="surface"
              aria-label="Primary font"
              value={form.primaryFont}
              options={STUDIO_FONT_FAMILIES}
              onChange={(primaryFont) => set('primaryFont', primaryFont)}
              className="h-11 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-zinc-500">Secondary font</Label>
            <AppSelect
              tone="surface"
              aria-label="Secondary font"
              value={form.secondaryFont}
              options={STUDIO_FONT_FAMILIES}
              onChange={(secondaryFont) => set('secondaryFont', secondaryFont)}
              className="h-11 text-sm"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-zinc-500">
            Competitors{' '}
            <span className="font-normal text-zinc-400">(Instagram handles or websites)</span>
          </Label>
          <textarea
            value={form.competitors}
            onChange={(e) => set('competitors', e.target.value)}
            placeholder={'@rivalbarbershop\nhttps://competitor-salon.com'}
            rows={4}
            className="w-full rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 resize-y"
          />
          <p className="text-[11px] text-zinc-500">
            Optional — one per line. Used as context so AI can differentiate your brand.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300"
        >
          Full business setup <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <Button
          type="submit"
          disabled={isPending || !form.businessName.trim()}
          className="h-11 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Save workspace
        </Button>
      </div>
    </form>
  )
}
