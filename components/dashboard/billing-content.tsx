'use client'

import { useState } from 'react'
import { motion, Variants } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { LayoutDashboard, Users, Link2, Sparkles, Info } from 'lucide-react'
import { UpgradeModal } from './upgrade-modal'
import { InvoicesDrawer } from './invoices-drawer'
import type { AccountContext } from '@/types/billing'
import {
  formatLimitLabel,
  formatUsageLabel,
  usagePercent,
  PLANS,
} from '@/lib/billing-utils'

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
}

const USAGE_ICONS = {
  workspaces: LayoutDashboard,
  teamMembers: Users,
  socialProfiles: Link2,
  posts: LayoutDashboard,
  aiCredits: Sparkles,
} as const

export function BillingContent({ account }: { account: AccountContext }) {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const [isInvoicesDrawerOpen, setIsInvoicesDrawerOpen] = useState(false)

  const planConfig = PLANS[account.plan]

  const usageRows = [
    { key: 'workspaces' as const, description: 'Workspaces let you split work by client or channel.' },
    { key: 'teamMembers' as const, description: 'Team members with access to this workspace.' },
    { key: 'socialProfiles' as const, description: 'Connected social accounts across workspaces.' },
    { key: 'posts' as const, description: 'Posts created or scheduled this month.' },
    { key: 'aiCredits' as const, description: 'AI content plans generated on your account.' },
  ]

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/8 px-4 py-3 flex gap-3">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-white">Payments preview</p>
          <p className="text-xs text-zinc-500 dark:text-white/45 mt-0.5">
            Plan and usage below are live from your account. Checkout (Stripe or other) is not connected
            yet — upgrade buttons show planned pricing only.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Billing</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setIsUpgradeModalOpen(true)}
            className="h-10 border-zinc-200 dark:border-white/10 rounded-xl"
          >
            View all plans
          </Button>
          <Button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="h-10 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
          >
            Manage plan
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsInvoicesDrawerOpen(true)}
            className="h-10 border-zinc-200 dark:border-white/10 rounded-xl"
          >
            View invoices
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{account.planLabel}</h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${planConfig.badgeClass}`}
              >
                {account.planBadge}
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-white/40">{account.planDescription}</p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
              ${account.priceMonthly}{' '}
              <span className="text-sm font-normal text-zinc-500 dark:text-white/40">/ month</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-white/30">
              {account.renewalText ?? 'No payment method on file'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h4 className="text-base font-bold text-zinc-900 dark:text-white mb-4">Usage</h4>
        <Card className="bg-card border-border shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-0 divide-y divide-zinc-100 dark:divide-white/5">
            {usageRows.map(({ key, description }) => {
              const metric = account.usage[key]
              const Icon = USAGE_ICONS[key]
              return (
                <div
                  key={key}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white mb-1">
                      <Icon className="w-4 h-4 text-zinc-500 dark:text-white/50" />
                      {metric.label}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-white/40">{description}</p>
                  </div>
                  <div className="w-full md:w-[300px]">
                    <div className="flex justify-between text-xs text-zinc-500 dark:text-white/50 mb-2">
                      <span>{formatUsageLabel(metric.used, metric.limit)}</span>
                      <span>{formatLimitLabel(metric.limit)}</span>
                    </div>
                    <Progress
                      value={usagePercent(metric.used, metric.limit)}
                      className="h-3 bg-zinc-100 dark:bg-white/10 [&>div]:bg-blue-500"
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <UpgradeModal open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen} />
      <InvoicesDrawer open={isInvoicesDrawerOpen} onOpenChange={setIsInvoicesDrawerOpen} />
    </motion.div>
  )
}
