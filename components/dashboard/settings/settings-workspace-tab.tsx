'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ExternalLink } from 'lucide-react'
import { updateWorkspaceAction } from '@/app/dashboard/settings/actions'
import { toast } from 'sonner'
import type { SettingsData } from '@/types/settings'

export function SettingsWorkspaceTab({
  settings,
  onSaved,
}: {
  settings: SettingsData
  onSaved: (business: SettingsData['business']) => void
}) {
  const [form, setForm] = useState(settings.business)
  const [isPending, startTransition] = useTransition()

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.set('businessName', form.businessName)
    fd.set('industry', form.industry)
    fd.set('location', form.location)
    fd.set('website', form.website)
    fd.set('primaryGoal', form.primaryGoal)

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
        </Button>
      </div>
    </form>
  )
}
