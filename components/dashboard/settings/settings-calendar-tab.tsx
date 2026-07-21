'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { updateCalendarPreferencesAction } from '@/app/dashboard/settings/actions'
import { TIMEZONE_OPTIONS } from '@/lib/settings-utils'
import { toast } from 'sonner'
import type { SettingsData, WeekStartsOn } from '@/types/settings'

export function SettingsCalendarTab({
  settings,
  onSaved,
}: {
  settings: SettingsData
  onSaved: (preferences: SettingsData['preferences']) => void
}) {
  const [timezone, setTimezone] = useState(settings.preferences.timezone)
  const [weekStartsOn, setWeekStartsOn] = useState<WeekStartsOn>(
    settings.preferences.weekStartsOn
  )
  const [isPending, startTransition] = useTransition()

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
      toast.success('Calendar preferences saved')
      if (result.preferences) onSaved(result.preferences)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Calendar</h3>
        <p className="text-sm text-zinc-500 dark:text-white/40">
          Preferences apply to the content planner schedule views.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border space-y-8 max-w-xl">
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Default timezone</h4>
          <p className="text-xs text-zinc-500 dark:text-white/40">
            Used when scheduling posts in the planner.
          </p>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full h-11 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white px-4 outline-none focus:border-blue-500/50"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Start of the week</h4>
          <div className="flex gap-3">
            {(
              [
                { value: 'monday' as const, label: 'Monday' },
                { value: 'sunday' as const, label: 'Sunday' },
              ] as const
            ).map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer flex-1 transition-colors ${
                  weekStartsOn === opt.value
                    ? 'border-blue-500/40 bg-blue-500/10'
                    : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5'
                }`}
              >
                <input
                  type="radio"
                  name="weekStartsOn"
                  checked={weekStartsOn === opt.value}
                  onChange={() => setWeekStartsOn(opt.value)}
                  className="accent-blue-500"
                />
                <span className="text-sm font-medium text-zinc-900 dark:text-white">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="h-11 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Save preferences
        </Button>
      </div>
    </form>
  )
}
