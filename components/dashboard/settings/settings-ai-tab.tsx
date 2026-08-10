'use client'

import { useState, useTransition } from 'react'
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
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{label}</h4>
      <p className="text-xs text-zinc-500 dark:text-white/40">{description}</p>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          className="w-full h-11 px-4 flex items-center justify-between gap-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-white text-sm outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 shadow-inner group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="truncate text-left">
            {selected ? formatModelLabel(selected) : 'Select a model'}
          </span>
          <ChevronRight className="w-4 h-4 text-zinc-500 dark:text-white/30 rotate-90 group-data-popup-open:-rotate-90 transition-transform shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-(--anchor-width) max-h-72 overflow-y-auto bg-popover text-popover-foreground border border-border shadow-lg rounded-xl p-1.5 z-50"
        >
          {options.map((m) => {
            const active = m.id === value
            return (
              <DropdownMenuItem
                key={m.id}
                onClick={() => onChange(m.id)}
                className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm outline-none flex items-start justify-between gap-3 transition-colors focus:bg-muted ${
                  active
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-300 focus:bg-blue-500/10 focus:text-blue-600 dark:focus:text-blue-300'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <span className="min-w-0 flex flex-col gap-0.5">
                  <span className="font-medium truncate">
                    {m.label} · {m.provider}
                  </span>
                  {m.hint ? (
                    <span className="text-[11px] text-muted-foreground/80 font-normal">
                      {m.hint}
                    </span>
                  ) : null}
                </span>
                {active ? <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /> : null}
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
  const [aiProvider, setAiProvider] = useState<AiProviderPreference>(
    settings.ai.aiProvider
  )
  const [captionModel, setCaptionModel] = useState(settings.ai.captionModel)
  const [imageModel, setImageModel] = useState(settings.ai.imageModel)
  const [isPending, startTransition] = useTransition()

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">AI preferences</h3>
        <p className="text-sm text-zinc-500 dark:text-white/40">
          Optional controls for how Generate writes captions and images. Most people can leave Auto
          selected — the main workflow is still Generate → Review → Calendar.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border space-y-8 max-w-xl">
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Generation path
          </h4>
          <div className="space-y-2">
            {AI_PROVIDER_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex flex-col gap-1 p-4 rounded-xl border cursor-pointer transition-colors ${
                  aiProvider === opt.value
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white">
                  <input
                    type="radio"
                    name="aiProvider"
                    value={opt.value}
                    checked={aiProvider === opt.value}
                    onChange={() => setAiProvider(opt.value)}
                    className="accent-blue-500"
                  />
                  {opt.label}
                </span>
                <span className="text-xs text-zinc-500 dark:text-white/40 pl-6 leading-relaxed">
                  {opt.description}
                </span>
              </label>
            ))}
          </div>
        </div>

        <ModelPicker
          label="Caption model"
          description="Used for Generate captions and caption revise when the OpenAI/OpenRouter path runs. Anthropic/Google models need an OpenRouter key (sk-or-…)."
          value={captionModel}
          options={CAPTION_MODEL_OPTIONS}
          onChange={setCaptionModel}
          disabled={aiProvider === 'marketme-api'}
        />
        {aiProvider === 'marketme-api' ? (
          <p className="-mt-5 text-xs text-amber-700 dark:text-amber-200/80">
            MarketMe AI pipeline models are configured on the API server (Render env), not here.
          </p>
        ) : null}

        <ModelPicker
          label="Image model"
          description="Used when generating images via OpenAI (Trigger / Studio flows that call DALL·E)."
          value={imageModel}
          options={IMAGE_MODEL_OPTIONS}
          onChange={setImageModel}
        />

        <div className="flex items-center justify-between gap-3 pt-2">
          <Link
            href="/dashboard/generate"
            className="text-xs text-blue-500 hover:underline"
          >
            Open Generate
          </Link>
          <Button type="submit" disabled={isPending} className="rounded-xl">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save AI settings
          </Button>
        </div>
      </div>
    </form>
  )
}
