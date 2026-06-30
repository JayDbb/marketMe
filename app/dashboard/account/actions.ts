'use server'

import { getBusinessProfile } from '@/app/api/business-profile/_actions'
import {
  PLANS,
  resolveDisplayName,
  getInitials,
  formatRenewalText,
} from '@/lib/billing-utils'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import { getSession } from '@/lib/services/auth.service'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type {
  AccountContext,
  PlanId,
  SubscriptionStatus,
  UserSubscriptionRow,
  UsageMetric,
} from '@/types/billing'
import { revalidatePath } from 'next/cache'

async function ensureUserSubscription(userId: string): Promise<UserSubscriptionRow> {
  const { data: existing } = await supabaseAdmin
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) return existing as UserSubscriptionRow

  const { data: created, error } = await supabaseAdmin
    .from('user_subscriptions')
    .insert({ user_id: userId, plan: 'free', status: 'active' })
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
    }
  }

  return created as UserSubscriptionRow
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

export async function getAccountContext(): Promise<AccountContext | null> {
  const user = await getAuthenticatedUser()
  if (!user) return null

  const [profileResult, subscription, usage] = await Promise.all([
    getBusinessProfile(),
    ensureUserSubscription(user.id),
    getUsageCounts(user.id),
  ])

  const plan = (subscription.plan ?? 'free') as PlanId
  const planConfig = PLANS[plan] ?? PLANS.free
  const displayName = resolveDisplayName(user, profileResult.data)
  const session = await getSession()
  const avatarUrl = session?.user?.image ?? null

  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY)

  return {
    displayName,
    initials: getInitials(displayName),
    email: user.email ?? '',
    avatarUrl,
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
        usage.contentPlans,
        planConfig.limits.aiCredits,
        'AI content plans'
      ),
    },
  }
}

export async function createBillingPortalSession(): Promise<{
  url?: string
  error?: string
}> {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return { error: 'Billing portal is not configured yet.' }
  }

  const subscription = await ensureUserSubscription(user.id)
  if (!subscription.stripe_customer_id) {
    return { error: 'No billing account linked. Upgrade to a paid plan first.' }
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(secretKey)

    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${origin}/dashboard/settings?tab=Billing`,
    })

    return { url: session.url }
  } catch (e) {
    console.error('Stripe portal error:', e)
    return { error: 'Could not open billing portal.' }
  }
}

export async function refreshAccountContext() {
  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/settings')
}
