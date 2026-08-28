'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { updateCalendarPreferencesAction } from '@/app/dashboard/settings/actions'
import {
  detectBrowserTimeZone,
  formatTimezoneLabel,
  listTimezonePickerOptions,
} from '@/lib/settings-utils'
import { toast } from 'sonner'
import type { SettingsData, WeekStartsOn } from '@/types/settings'
import { useIsClient } from '@/hooks/use-is-client'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { useSettingsDirty } from '@/components/dashboard/settings/settings-dirty'
import { SettingsCard, SettingsHeading } from '@/components/dashboard/settings/settings-ui'
import { cn } from '@/lib/utils'

const THEMES = [
  { value: 'system' as const, label: 'System' },
  { value: 'light' as const, label: 'Light' },
  { value: 'dark' as const, label: 'Dark' },
]

function TimezonePicker({
  value,
  detected,
  onChange,
}: {
  value: string
  detected: string | null
  onChange: (value: string) => void
}) {
  const [query, setQuery] = useState('')
  const zones = useMemo(
    () => listTimezonePickerOptions(query, value, detected),
    [detected, query, value]
  )

  return (
    <div className="flex flex-col gap-2">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a city or zone…"
        aria-label="Search timezones"
        autoComplete="off"
        spellCheck={false}
        className="h-11 rounded-xl"
      />
      <div
        role="listbox"
        aria-label="Timezones"
        className="max-h-56 overflow-y-auto rounded-xl border border-border"
      >
        {zones.length === 0 ? (
          <p className="px-3 py-3 text-sm text-muted-foreground">No matching timezone</p>
        ) : (
          zones.map((tz) => {
            const selected = tz === value
            return (
              <button
                key={tz}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(tz)
                  setQuery('')
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm ui-transition hover:bg-muted',
                  selected && 'bg-primary/10 text-accent-foreground'
                )}
              >
                <span className="min-w-0 truncate">{formatTimezoneLabel(tz)}</span>
                {detected === tz ? (
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Detected
                  </span>
                ) : null}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

export function SettingsPreferencesTab({
  settings,
  onSaved,
}: {
  settings: SettingsData
  onSaved: (preferences: SettingsData['preferences']) => void
}) {
  const { setDirty } = useSettingsDirty()
  const { theme, setTheme } = useTheme()
  const mounted = useIsClient()
  const detected = mounted ? detectBrowserTimeZone() : null
  const [timezone, setTimezone] = useState(settings.preferences.timezone)
  const [weekStartsOn, setWeekStartsOn] = useState<WeekStartsOn>(
    settings.preferences.weekStartsOn
  )
  const [isPending, startTransition] = useTransition()

  const isDirty =
    timezone !== settings.preferences.timezone ||
    weekStartsOn !== settings.preferences.weekStartsOn
  useUnsavedChanges(isDirty)

  useEffect(() => {
    setDirty(isDirty)
    return () => setDirty(false)
  }, [isDirty, setDirty])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.set('timezone', timezone)
    fd.set('weekStartsOn', weekStartsOn)

    startTransition(async () => {
      const result = await updateCalendarPreferencesAction(fd)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Preferences saved')
      if (result.preferences) onSaved(result.preferences)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <SettingsHeading
        title="Preferences"
        description="Theme is this device. Timezone and week start are used in Planner and on Home."
      />

      <SettingsCard title="Theme" className="max-w-xl">
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setTheme(mode.value)}
              className={cn(
                'rounded-xl border-2 p-1 ui-transition',
                mounted && theme === mode.value
                  ? 'border-primary'
                  : 'border-transparent hover:border-border'
              )}
            >
              <div
                className={cn(
                  'flex aspect-video items-center justify-center rounded-lg border border-border text-sm font-semibold',
                  mode.value === 'light' && 'bg-white text-zinc-950',
                  mode.value === 'dark' && 'bg-[#0d1117] text-white',
                  mode.value === 'system' && 'bg-muted text-foreground'
                )}
              >
                {mode.label}
              </div>
            </button>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Default timezone"
        description="Used when scheduling posts in Planner and for this-week counts on Home."
        className="max-w-xl"
      >
        <p className="text-sm text-foreground">
          {formatTimezoneLabel(timezone)}
        </p>
        {detected && detected !== timezone ? (
          <Button
            type="button"
            variant="outline"
            className="w-fit rounded-xl"
            onClick={() => setTimezone(detected)}
          >
            Use detected ({formatTimezoneLabel(detected)})
          </Button>
        ) : null}
        <TimezonePicker value={timezone} detected={detected} onChange={setTimezone} />
      </SettingsCard>

      <SettingsCard title="Start of the week" className="max-w-xl">
        <div className="flex gap-3">
          {(
            [
              { value: 'monday' as const, label: 'Monday' },
              { value: 'sunday' as const, label: 'Sunday' },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className={cn(
                'flex flex-1 cursor-pointer items-center gap-3 rounded-xl border p-4 ui-transition',
                weekStartsOn === opt.value
                  ? 'border-primary/40 bg-primary/10'
                  : 'border-border bg-background'
              )}
            >
              <input
                type="radio"
                name="weekStartsOn"
                checked={weekStartsOn === opt.value}
                onChange={() => setWeekStartsOn(opt.value)}
                className="accent-primary"
              />
              <span className="text-sm font-medium text-foreground">{opt.label}</span>
            </label>
          ))}
        </div>
      </SettingsCard>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || !isDirty} className="h-11 rounded-xl px-8">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          {isPending ? 'Saving…' : 'Save preferences'}
        </Button>
      </div>
    </form>
  )
}
