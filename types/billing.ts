export type PlanId = 'free' | 'pro' | 'team'

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing'

export interface PlanLimits {
  workspaces: number
  teamMembers: number
  socialProfiles: number
  postsPerMonth: number | null
  aiCredits: number | null
}

export interface UsageMetric {
  used: number
  limit: number | null
  label: string
}

export interface AccountContext {
  displayName: string
  initials: string
  email: string
  avatarUrl: string | null
  plan: PlanId
  planLabel: string
  planBadge: string
  planDescription: string
  priceMonthly: number
  subscriptionStatus: SubscriptionStatus
  renewalText: string | null
  stripePortalAvailable: boolean
  usage: {
    workspaces: UsageMetric
    teamMembers: UsageMetric
    socialProfiles: UsageMetric
    posts: UsageMetric
    aiCredits: UsageMetric
  }
}

export interface UserSubscriptionRow {
  user_id: string
  plan: PlanId
  status: SubscriptionStatus
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_end: string | null
}
