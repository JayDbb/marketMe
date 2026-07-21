'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getInitials, PLANS } from '@/lib/billing-utils'
import type { AccountContext } from '@/types/billing'
import type { SettingsData } from '@/types/settings'
import { toast } from 'sonner'

export function SettingsTeamTab({
  settings,
  account,
  onGoToBilling,
}: {
  settings: SettingsData
  account: AccountContext
  onGoToBilling?: () => void
}) {
  const teamLimit = PLANS[account.plan].limits.teamMembers
  const initials = getInitials(settings.displayName || settings.email)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Team</h3>
          <p className="text-zinc-500 dark:text-white/40 text-sm">
            {account.usage.teamMembers.used} of {teamLimit} seat
            {teamLimit === 1 ? '' : 's'} on {account.planLabel}
          </p>
        </div>
        <Button
          type="button"
          disabled={account.usage.teamMembers.used >= teamLimit}
          onClick={() =>
            toast.info('Team invites coming soon — upgrade your plan when billing launches.')
          }
          className="h-10 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl disabled:opacity-50"
        >
          Invite member
        </Button>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-base font-bold text-zinc-900 dark:text-white">Active members</h4>
          <span className="text-xs text-zinc-500 dark:text-white/40">
            {account.usage.teamMembers.used} / {teamLimit} seats
          </span>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-700 text-white flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
            <div>
              <h5 className="font-semibold text-sm text-zinc-900 dark:text-white">
                {settings.displayName}{' '}
                <span className="text-xs bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-full ml-1">
                  You
                </span>
              </h5>
              <p className="text-xs text-zinc-500 dark:text-white/40">{settings.email}</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-lg text-xs font-medium border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/70">
            Owner
          </span>
        </div>
      </div>

      {teamLimit <= 1 && (
        <p className="text-sm text-zinc-500 dark:text-white/40">
          Need more seats?{' '}
          {onGoToBilling ? (
            <button
              type="button"
              onClick={onGoToBilling}
              className="text-blue-400 hover:text-blue-300"
            >
              View plans
            </button>
          ) : (
            <Link href="/dashboard/settings?tab=Billing" className="text-blue-400 hover:text-blue-300">
              View plans
            </Link>
          )}{' '}
          (payments launching soon).
        </p>
      )}
    </div>
  )
}
