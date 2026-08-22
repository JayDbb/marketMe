'use client'

<<<<<<< HEAD
import { useState, useTransition } from 'react'
=======
import { useEffect, useState, useTransition } from 'react'
>>>>>>> origin/development
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
<<<<<<< HEAD
import { Loader2, ExternalLink } from 'lucide-react'
import { updateWorkspaceAction } from '@/app/dashboard/settings/actions'
import { toast } from 'sonner'
import type { SettingsData } from '@/types/settings'
=======
import { Loader2, ExternalLink, Upload } from 'lucide-react'
import { updateWorkspaceAction } from '@/app/dashboard/settings/actions'
import { uploadBusinessLogoAction } from '@/app/onboarding/actions'
import { toast } from 'sonner'
import type { SettingsData } from '@/types/settings'
import { SMB_INDUSTRIES, OTHER_INDUSTRY, normalizeIndustry } from '@/lib/industries'
import { getIndustryPalette } from '@/lib/studio-brand-kit'
import { STUDIO_FONT_FAMILIES } from '@/lib/instagram-formats'
import { AppSelect } from '@/components/ui/app-select'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { useSettingsDirty } from '@/components/dashboard/settings/settings-dirty'
import { SettingsCard, SettingsHeading } from '@/components/dashboard/settings/settings-ui'
>>>>>>> origin/development

export function SettingsWorkspaceTab({
  settings,
  onSaved,
}: {
  settings: SettingsData
  onSaved: (business: SettingsData['business']) => void
}) {
<<<<<<< HEAD
  const [form, setForm] = useState(settings.business)
  const [isPending, startTransition] = useTransition()

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

=======
  const { setDirty } = useSettingsDirty()
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

  const isDirty = JSON.stringify(form) !== JSON.stringify({
    ...settings.business,
    industry: normalizeIndustry(settings.business.industry) || settings.business.industry,
    brandColors:
      settings.business.brandColors.length > 0
        ? settings.business.brandColors
        : getIndustryPalette(
            normalizeIndustry(settings.business.industry) || settings.business.industry
          ),
  })
  useUnsavedChanges(isDirty)

  useEffect(() => {
    setDirty(isDirty)
    return () => setDirty(false)
  }, [isDirty, setDirty])

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

>>>>>>> origin/development
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.set('businessName', form.businessName)
    fd.set('industry', form.industry)
<<<<<<< HEAD
    fd.set('location', form.location)
    fd.set('website', form.website)
    fd.set('primaryGoal', form.primaryGoal)
=======
    fd.set('industryDetail', form.industryDetail)
    fd.set('location', form.location)
    fd.set('website', form.website)
    fd.set('primaryGoal', form.primaryGoal)
    fd.set('competitors', form.competitors)
    fd.set('brandColors', form.brandColors.join(','))
    fd.set('primaryFont', form.primaryFont)
    fd.set('secondaryFont', form.secondaryFont)
>>>>>>> origin/development

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

<<<<<<< HEAD
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
=======
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
      onSaved({ ...form, logoUrl: result.logoUrl, hasProfile: true })
      toast.success('Logo updated')
    } finally {
      setLogoUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <SettingsHeading
        title="Workspace"
        description="Brand brief used for Generate and Studio. This is the business, not your login."
      />

      {!settings.business.hasProfile ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm text-amber-900 dark:text-amber-100/90">
          No workspace set up yet. Add a name below or{' '}
          <Link href="/onboarding?edit=1" className="font-medium underline">
>>>>>>> origin/development
            complete onboarding
          </Link>
          .
        </div>
<<<<<<< HEAD
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
          <Input
            value={form.industry}
            onChange={(e) => set('industry', e.target.value)}
            placeholder="e.g. Food & Beverage"
            className="h-11 rounded-xl bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10"
          />
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
=======
      ) : null}

      <SettingsCard className="max-w-lg">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Workspace name</Label>
            <Input
              value={form.businessName}
              onChange={(e) => set('businessName', e.target.value)}
              placeholder="Northside Coffee…"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Industry</Label>
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
                className="h-11 rounded-xl"
              />
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Location</Label>
            <Input
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="City, country"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="website" className="text-xs text-muted-foreground">
              Website
            </Label>
            <Input
              id="website"
              type="url"
              inputMode="url"
              autoComplete="url"
              value={form.website}
              onChange={(e) => set('website', e.target.value)}
              placeholder="https://…"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Primary marketing goal</Label>
            <Input
              value={form.primaryGoal}
              onChange={(e) => set('primaryGoal', e.target.value)}
              placeholder="Book more weekday appointments…"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Logo</Label>
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
                {form.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.logoUrl} alt="Business logo" className="size-full object-contain" />
                ) : (
                  <span className="text-[10px] text-muted-foreground">None</span>
                )}
              </div>
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-border px-3 text-xs font-medium text-foreground">
                {logoUploading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Upload className="size-3.5" />
                )}
                Upload
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  disabled={logoUploading}
                  onChange={(e) => void handleLogoUpload(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Brand colours</Label>
            <div className="flex flex-wrap gap-2">
              {form.brandColors.map((color, i) => (
                <input
                  key={i}
                  type="color"
                  value={color}
                  aria-label={`Brand colour ${i + 1}`}
                  onChange={(e) => {
                    const next = [...form.brandColors]
                    next[i] = e.target.value
                    set('brandColors', next)
                  }}
                  className="size-9 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">Primary font</Label>
              <AppSelect
                tone="surface"
                aria-label="Primary font"
                value={form.primaryFont}
                options={STUDIO_FONT_FAMILIES}
                onChange={(primaryFont) => set('primaryFont', primaryFont)}
                className="h-11 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">Secondary font</Label>
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
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              Competitors{' '}
              <span className="font-normal">(Instagram handles or websites)</span>
            </Label>
            <textarea
              value={form.competitors}
              onChange={(e) => set('competitors', e.target.value)}
              placeholder={'@rivalbarbershop\nhttps://competitor-salon.com'}
              rows={4}
              className="w-full resize-y rounded-xl border border-input bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <p className="text-[11px] text-muted-foreground">
              Optional — one per line. Used so Generate can differentiate your brand.
            </p>
          </div>
        </div>
      </SettingsCard>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/onboarding?edit=1"
          className="inline-flex items-center gap-1.5 text-sm text-accent-foreground hover:opacity-80"
        >
          Full business setup <ExternalLink className="size-3.5" />
        </Link>
        <Button
          type="submit"
          disabled={isPending || !form.businessName.trim() || !isDirty}
          className="h-11 rounded-xl px-8"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          {isPending ? 'Saving…' : 'Save workspace'}
>>>>>>> origin/development
        </Button>
      </div>
    </form>
  )
}
