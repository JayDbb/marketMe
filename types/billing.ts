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

<<<<<<< HEAD
=======
export interface RecentCreditUsage {
  id: string
  stage: string
  creditsSpent: number
  createdAt: string
  generationId: string | null
}

>>>>>>> origin/development
export interface AccountContext {
  displayName: string
  initials: string
  email: string
  avatarUrl: string | null
<<<<<<< HEAD
=======
  isAdmin: boolean
>>>>>>> origin/development
  plan: PlanId
  planLabel: string
  planBadge: string
  planDescription: string
  priceMonthly: number
  subscriptionStatus: SubscriptionStatus
  renewalText: string | null
<<<<<<< HEAD
=======
  creditsRemaining: number
  creditsResetAt: string | null
>>>>>>> origin/development
  stripePortalAvailable: boolean
  usage: {
    workspaces: UsageMetric
    teamMembers: UsageMetric
    socialProfiles: UsageMetric
    posts: UsageMetric
    aiCredits: UsageMetric
  }
<<<<<<< HEAD
=======
  recentCreditUsage: RecentCreditUsage[]
>>>>>>> origin/development
}

export interface UserSubscriptionRow {
  user_id: string
  plan: PlanId
  status: SubscriptionStatus
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_end: string | null
  credits_balance: number
  credits_reset_at: string
}
