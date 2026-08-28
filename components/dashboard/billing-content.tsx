'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  LayoutDashboard,
  Users,
  Link2,
  Sparkles,
  Info,
  Loader2,
  Coins,
  ReceiptText,
} from 'lucide-react'
import { UpgradeModal } from './upgrade-modal'
import { InvoicesDrawer } from './invoices-drawer'
import type { AccountContext } from '@/types/billing'
import {
  formatLimitLabel,
  formatUsageLabel,
  usagePercent,
} from '@/lib/billing-utils'
import { createBillingPortalSession } from '@/app/dashboard/account/actions'
import { toast } from 'sonner'
import { SettingsHeading } from '@/components/dashboard/settings/settings-ui'

const USAGE_ICONS = {
  workspaces: LayoutDashboard,
  teamMembers: Users,
  socialProfiles: Link2,
  posts: LayoutDashboard,
  aiCredits: Sparkles,
} as const

const CREDIT_STAGE_LABEL: Record<string, string> = {
  marketing_strategy_generation: 'Strategy generation',
  content_schedule_generation: 'Schedule generation',
  post_generation: 'Draft generation',
  creative_brief_generation: 'Creative brief',
  image_generation: 'Image generation',
  publishing: 'Publishing',
}

export function BillingContent({ account }: { account: AccountContext }) {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const [isInvoicesDrawerOpen, setIsInvoicesDrawerOpen] = useState(false)
  const [portalPending, startPortal] = useTransition()

  const usageRows = [
    {
      key: 'workspaces' as const,
      description: 'This account is a single workspace.',
    },
    {
      key: 'teamMembers' as const,
      description: 'Seats on this plan. Invites are not available yet.',
    },
    {
      key: 'socialProfiles' as const,
      description: 'Instagram accounts you can connect.',
    },
    {
      key: 'posts' as const,
      description: 'Posts created or scheduled this month.',
    },
    {
      key: 'aiCredits' as const,
      description: 'AI credits used this billing period.',
    },
  ]

  const openPortalOrPlans = () => {
    if (!account.stripePortalAvailable) {
      setIsUpgradeModalOpen(true)
      return
    }
    startPortal(async () => {
      const result = await createBillingPortalSession()
      if (result.error) {
        toast.error(result.error)
        return
      }
      if (result.url) window.location.href = result.url
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-3 rounded-xl border border-border bg-primary/8 px-4 py-3">
        <Info className="mt-0.5 size-5 shrink-0 text-accent-foreground" />
        <div>
          <p className="text-sm font-medium text-foreground">Payments preview</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Plan and usage below are live from your account. Checkout is not
            connected yet — upgrade shows planned Free, Pro, and Team pricing only.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <SettingsHeading
          title="Billing"
          description={account.planDescription}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsUpgradeModalOpen(true)}
            className="h-10 rounded-xl"
          >
            View all plans
          </Button>
          <Button
            onClick={openPortalOrPlans}
            disabled={portalPending}
            className="h-10 rounded-xl"
          >
            {portalPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {account.stripePortalAvailable ? 'Manage plan' : 'See plans'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsInvoicesDrawerOpen(true)}
            className="h-10 rounded-xl"
          >
            View invoices
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-border bg-card">
        <CardContent className="flex flex-col justify-between gap-6 p-8 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                {account.planLabel}
              </h3>
              <span className="rounded-sm bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                {account.planBadge}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{account.planDescription}</p>
          </div>
          <div className="text-left sm:text-right">
            <div className="mb-1 text-2xl font-semibold tabular-nums text-foreground">
              ${account.priceMonthly}{' '}
              <span className="text-sm font-normal text-muted-foreground">/ month</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {account.renewalText ?? 'No payment method on file'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden rounded-2xl border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Coins className="size-4 text-muted-foreground" />
              AI credits
            </div>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold tabular-nums text-foreground">
                  {account.creditsRemaining}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  remaining this billing period
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {account.usage.aiCredits.limit ?? 'Unlimited'} included
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {account.creditsResetAt ?? 'Resets with your next cycle'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ReceiptText className="size-4 text-muted-foreground" />
              Recent AI usage
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {account.recentCreditUsage.length > 0 ? (
                account.recentCreditUsage.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {CREDIT_STAGE_LABEL[item.stage] ?? item.stage.replaceAll('_', ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-sm font-semibold tabular-nums text-foreground">
                      -{item.creditsSpent}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No AI credit activity yet. Generate a run to start the ledger.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-base font-semibold text-foreground">Usage</h3>
        <Card className="overflow-hidden rounded-2xl border-border bg-card">
          <CardContent className="divide-y divide-border p-0">
            {usageRows.map(({ key, description }) => {
              const metric = account.usage[key]
              const Icon = USAGE_ICONS[key]
              return (
                <div
                  key={key}
                  className="flex flex-col justify-between gap-6 p-6 md:flex-row md:items-center"
                >
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Icon className="size-4 text-muted-foreground" />
                      {metric.label}
                    </div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <div className="w-full md:w-75">
                    <div className="mb-2 flex justify-between text-xs tabular-nums text-muted-foreground">
                      <span>{formatUsageLabel(metric.used, metric.limit)}</span>
                      <span>{formatLimitLabel(metric.limit)}</span>
                    </div>
                    <Progress
                      value={usagePercent(metric.used, metric.limit)}
                      className="h-3"
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <UpgradeModal
        open={isUpgradeModalOpen}
        onOpenChange={setIsUpgradeModalOpen}
        currentPlan={account.plan}
        stripePortalAvailable={account.stripePortalAvailable}
      />
      <InvoicesDrawer open={isInvoicesDrawerOpen} onOpenChange={setIsInvoicesDrawerOpen} />
    </div>
  )
}
