import { cache } from 'react'
import { getBusinessProfile } from '@/lib/services/business.service'
import {
  PLANS,
  resolveDisplayName,
  getInitials,
  formatRenewalText,
} from '@/lib/billing-utils'
import { getSession } from '@/lib/services/auth.service'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { PLAN_CREDIT_ALLOWANCES } from '@/types/pipeline'
import type {
  AccountContext,
  PlanId,
  SubscriptionStatus,
  UserSubscriptionRow,
  UsageMetric,
} from '@/types/billing'

export async function ensureUserSubscription(userId: string): Promise<UserSubscriptionRow> {
  const { data: existing } = await supabaseAdmin
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) return existing as UserSubscriptionRow

  const { data: created, error } = await supabaseAdmin
    .from('user_subscriptions')
    .insert({
      user_id: userId,
      plan: 'free',
      status: 'active',
      credits_balance: PLAN_CREDIT_ALLOWANCES.free,
      credits_reset_at: nextMonthStart().toISOString(),
    })
    .select('*')
    .single()

  if (error || !created) {
    return {
      user_id: userId,
      plan: 'free',
      status: 'active',
      stripe_customer_id: null,
      stripe_subscription_id: null,
      current_period_end: null,
      credits_balance: PLAN_CREDIT_ALLOWANCES.free,
      credits_reset_at: nextMonthStart().toISOString(),
    }
  }

  return created as UserSubscriptionRow
}

function nextMonthStart(): Date {
  const d = new Date()
  d.setMonth(d.getMonth() + 1, 1)
  d.setHours(0, 0, 0, 0)
  return d
}

async function getUsageCounts(userId: string) {
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [postsRes, postsMonthRes, plansRes, templatesRes] = await Promise.all([
    supabaseAdmin.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabaseAdmin
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', monthStart.toISOString()),
    supabaseAdmin.from('content_plans').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabaseAdmin.from('studio_templates').select('*', { count: 'exact', head: true }).eq('user_id', userId),
  ])

  return {
    postsTotal: postsRes.count ?? 0,
    postsThisMonth: postsMonthRes.count ?? 0,
    contentPlans: plansRes.count ?? 0,
    templates: templatesRes.count ?? 0,
    teamMembers: 1,
    workspaces: 1,
    socialProfiles: 0,
  }
}

function buildUsageMetric(used: number, limit: number | null, label: string): UsageMetric {
  return { used, limit, label }
}

/** Account context for the dashboard shell — deduped once per request. */
export const getAccountContext = cache(async (): Promise<AccountContext | null> => {
  const session = await getSession()
  if (!session?.user) return null

  const user = session.user
  const authUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    user_metadata: {
      full_name: user.name ?? undefined,
      name: user.name ?? undefined,
    },
  }

  const [profileResult, subscription, usage] = await Promise.all([
    getBusinessProfile(user.id),
    ensureUserSubscription(user.id),
    getUsageCounts(user.id),
  ])

  const plan = (subscription.plan ?? 'free') as PlanId
  const planConfig = PLANS[plan] ?? PLANS.free
  const displayName = resolveDisplayName(authUser, profileResult.data)

  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY)

  return {
    displayName,
    initials: getInitials(displayName),
    email: user.email ?? '',
    avatarUrl: user.image ?? null,
    plan,
    planLabel: planConfig.label,
    planBadge: planConfig.badge,
    planDescription: planConfig.description,
    priceMonthly: planConfig.priceMonthly,
    subscriptionStatus: (subscription.status ?? 'active') as SubscriptionStatus,
    renewalText: formatRenewalText(plan, subscription.status, subscription.current_period_end),
    stripePortalAvailable: stripeConfigured && Boolean(subscription.stripe_customer_id),
    usage: {
      workspaces: buildUsageMetric(
        usage.workspaces,
        planConfig.limits.workspaces,
        'Workspaces'
      ),
      teamMembers: buildUsageMetric(
        usage.teamMembers,
        planConfig.limits.teamMembers,
        'Users'
      ),
      socialProfiles: buildUsageMetric(
        usage.socialProfiles,
        planConfig.limits.socialProfiles,
        'Social profiles'
      ),
      posts: buildUsageMetric(
        usage.postsThisMonth,
        planConfig.limits.postsPerMonth,
        'Posts this month'
      ),
      aiCredits: buildUsageMetric(
        Math.max(
          0,
          (planConfig.limits.aiCredits ?? 0) - (subscription.credits_balance ?? 0)
        ),
        planConfig.limits.aiCredits,
        'AI credits used'
      ),
    },
  }
})
