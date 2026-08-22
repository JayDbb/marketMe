'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { PLANS } from '@/lib/billing-utils'
import type { PlanId } from '@/types/billing'
import { cn } from '@/lib/utils'
import { createBillingPortalSession } from '@/app/dashboard/account/actions'
import { useTransition } from 'react'

const PLAN_ORDER: PlanId[] = ['free', 'pro', 'team']

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlan: PlanId
  stripePortalAvailable?: boolean
}

export function UpgradeModal({
  open,
  onOpenChange,
  currentPlan,
  stripePortalAvailable,
}: UpgradeModalProps) {
  const [portalPending, startPortal] = useTransition()

  const handleSelect = (plan: PlanId) => {
    if (plan === currentPlan) return
    if (stripePortalAvailable) {
      startPortal(async () => {
        const result = await createBillingPortalSession()
        if (result.error) {
          toast.error(result.error)
          return
        }
        if (result.url) window.location.href = result.url
      })
      return
    }
    toast.info('Checkout is not live yet. Plan names and prices match Billing.')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto bg-card p-8 text-card-foreground sm:max-w-4xl">
        <DialogHeader className="mb-6 flex flex-col gap-2">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Plans
          </DialogTitle>
          <DialogDescription>
            Free, Pro, and Team — the same catalog as your Billing page. Checkout is not connected yet.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id]
            const current = id === currentPlan
            return (
              <div
                key={id}
                className={cn(
                  'flex flex-col rounded-2xl border border-border bg-background p-6',
                  current && 'border-primary'
                )}
              >
                <h3 className="text-xl font-semibold text-foreground">{plan.label}</h3>
                <p className="mt-1 min-h-10 text-xs text-muted-foreground">{plan.description}</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-semibold tabular-nums text-foreground">
                    ${plan.priceMonthly}
                  </span>
                  <span className="text-sm text-muted-foreground"> / month</span>
                </div>
                <Button
                  disabled={current || portalPending}
                  onClick={() => handleSelect(id)}
                  className="mb-6 h-11 w-full rounded-xl"
                  variant={current ? 'outline' : 'default'}
                >
                  {portalPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  {current ? 'Current plan' : stripePortalAvailable ? 'Manage in Stripe' : 'Not available yet'}
                </Button>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  What&apos;s included
                </p>
                <ul className="flex flex-col gap-3">
                  <li className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="size-4" />
                      Workspace
                    </span>
                    <span className="font-medium text-foreground">{plan.limits.workspaces}</span>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="size-4" />
                      Seats
                    </span>
                    <span className="font-medium text-foreground">{plan.limits.teamMembers}</span>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="size-4" />
                      Instagram
                    </span>
                    <span className="font-medium text-foreground">{plan.limits.socialProfiles}</span>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="size-4" />
                      Posts / month
                    </span>
                    <span className="font-medium text-foreground">
                      {plan.limits.postsPerMonth ?? 'Unlimited'}
                    </span>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="size-4" />
                      AI credits
                    </span>
                    <span className="font-medium text-foreground">
                      {plan.limits.aiCredits ?? 'Unlimited'}
                    </span>
                  </li>
                </ul>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
