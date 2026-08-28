'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Check, ChevronRight, Loader2, Sparkles } from 'lucide-react'
import { updateAiPreferencesAction } from '@/app/dashboard/settings/actions'
import {
  AI_PROVIDER_OPTIONS,
  CAPTION_MODEL_OPTIONS,
  IMAGE_MODEL_OPTIONS,
  type AiModelOption,
  type AiProviderPreference,
} from '@/lib/ai-models'
import { toast } from 'sonner'
import type { SettingsData } from '@/types/settings'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { useSettingsDirty } from '@/components/dashboard/settings/settings-dirty'
import { SettingsCard, SettingsHeading } from '@/components/dashboard/settings/settings-ui'
import { cn } from '@/lib/utils'

function formatModelLabel(m: AiModelOption): string {
  return `${m.label} · ${m.provider}${m.hint ? ` — ${m.hint}` : ''}`
}

function ModelPicker({
  label,
  description,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string
  description: string
  value: string
  options: AiModelOption[]
  onChange: (id: string) => void
  disabled?: boolean
}) {
  const selected = options.find((m) => m.id === value) ?? options[0]

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">{label}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          className="group flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="truncate text-left">
            {selected ? formatModelLabel(selected) : 'Select a model'}
          </span>
          <ChevronRight className="size-4 shrink-0 rotate-90 text-muted-foreground ui-transition group-data-popup-open:-rotate-90" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="max-h-72 w-(--anchor-width) overflow-y-auto rounded-xl border border-border bg-popover p-1.5 text-popover-foreground"
        >
          {options.map((m) => {
            const active = m.id === value
            return (
              <DropdownMenuItem
                key={m.id}
                onClick={() => onChange(m.id)}
                className={cn(
                  'flex cursor-pointer items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-sm outline-none',
                  active
                    ? 'bg-primary/10 text-accent-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-medium">
                    {m.label} · {m.provider}
                  </span>
                  {m.hint ? (
                    <span className="text-[11px] font-normal text-muted-foreground">
                      {m.hint}
                    </span>
                  ) : null}
                </span>
                {active ? <Check className="mt-0.5 size-4 shrink-0 text-accent-foreground" /> : null}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function SettingsAiTab({
  settings,
  onSaved,
}: {
  settings: SettingsData
  onSaved: (ai: SettingsData['ai']) => void
}) {
  const { setDirty } = useSettingsDirty()
  const [aiProvider, setAiProvider] = useState<AiProviderPreference>(
    settings.ai.aiProvider
  )
  const [captionModel, setCaptionModel] = useState(settings.ai.captionModel)
  const [imageModel, setImageModel] = useState(settings.ai.imageModel)
  const [isPending, startTransition] = useTransition()

  const isDirty =
    aiProvider !== settings.ai.aiProvider ||
    captionModel !== settings.ai.captionModel ||
    imageModel !== settings.ai.imageModel
  useUnsavedChanges(isDirty)

  useEffect(() => {
    setDirty(isDirty)
    return () => setDirty(false)
  }, [isDirty, setDirty])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.set('aiProvider', aiProvider)
    fd.set('captionModel', captionModel)
    fd.set('imageModel', imageModel)

    startTransition(async () => {
      const result = await updateAiPreferencesAction(fd)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success('AI preferences saved')
      onSaved(result.ai)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <SettingsHeading
        title="AI preferences"
        description="Optional. Most people can leave Auto selected — Generate still runs the same review loop."
      />

      <SettingsCard className="max-w-xl">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="size-4 text-accent-foreground" />
              Generation path
            </h3>
            <div className="flex flex-col gap-2">
              {AI_PROVIDER_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    'flex cursor-pointer flex-col gap-1 rounded-xl border p-4 ui-transition',
                    aiProvider === opt.value
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-border hover:border-muted-foreground/30'
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <input
                      type="radio"
                      name="aiProvider"
                      value={opt.value}
                      checked={aiProvider === opt.value}
                      onChange={() => setAiProvider(opt.value)}
                      className="accent-primary"
                    />
                    {opt.label}
                  </span>
                  <span className="pl-6 text-xs leading-relaxed text-muted-foreground">
                    {opt.description}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <ModelPicker
            label="Caption model"
            description="Used for Generate captions when the OpenAI / OpenRouter path runs."
            value={captionModel}
            options={CAPTION_MODEL_OPTIONS}
            onChange={setCaptionModel}
            disabled={aiProvider === 'marketme-api'}
          />
          {aiProvider === 'marketme-api' ? (
            <p className="-mt-5 text-xs text-amber-800 dark:text-amber-200/80">
              MarketMe AI pipeline models are configured on the API server, not here.
            </p>
          ) : null}

          <ModelPicker
            label="Image model"
            description="Used when Generate or Studio requests an AI image."
            value={imageModel}
            options={IMAGE_MODEL_OPTIONS}
            onChange={setImageModel}
          />

          <div className="flex items-center justify-between gap-3 pt-2">
            <Link
              href="/dashboard/generate"
              className="text-xs text-accent-foreground hover:underline"
            >
              Open Generate
            </Link>
            <Button type="submit" disabled={isPending || !isDirty} className="rounded-xl">
              {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {isPending ? 'Saving…' : 'Save AI settings'}
            </Button>
          </div>
        </div>
      </SettingsCard>
    </form>
  )
}
