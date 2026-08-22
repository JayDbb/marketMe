import type { BusinessProfile } from '@/types/business-profile'
import type { PlanId, PlanLimits } from '@/types/billing'

export const PLANS: Record<
  PlanId,
  {
    label: string
    badge: string
    description: string
    priceMonthly: number
    limits: PlanLimits
    badgeClass: string
  }
> = {
  free: {
    label: 'Free',
    badge: 'FREE',
    description: 'For those starting out on socials.',
    priceMonthly: 0,
    limits: {
      workspaces: 1,
      teamMembers: 1,
      socialProfiles: 1,
      postsPerMonth: 10,
      aiCredits: 50,
    },
    badgeClass: 'bg-blue-500 text-white',
  },
  pro: {
    label: 'Pro',
    badge: 'PRO',
    description: 'For growing brands publishing every week.',
    priceMonthly: 29,
    limits: {
      workspaces: 3,
      teamMembers: 3,
      socialProfiles: 5,
      postsPerMonth: 100,
      aiCredits: 500,
    },
    badgeClass: 'bg-purple-600 text-white',
  },
  team: {
    label: 'Team',
    badge: 'TEAM',
    description: 'For agencies and teams managing multiple clients.',
    priceMonthly: 79,
    limits: {
      workspaces: 10,
      teamMembers: 10,
      socialProfiles: 25,
      postsPerMonth: null,
      aiCredits: null,
    },
    badgeClass: 'bg-amber-500 text-zinc-900',
  },
}

type NameUser = {
  email?: string | null
  name?: string | null
  user_metadata?: {
    full_name?: string
    name?: string
  }
}

export function resolveDisplayName(
  user: NameUser,
  businessProfile?: BusinessProfile | null
): string {
  if (typeof user.name === 'string' && user.name.trim()) {
    return user.name.trim()
  }

  const meta = user.user_metadata ?? {}
  const fromMeta =
    (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta.name === 'string' && meta.name.trim()) ||
    ''
  if (fromMeta) return fromMeta

  const fromProfile =
    businessProfile?.business_name?.trim() ||
    ''
  if (fromProfile) return fromProfile

  const emailPrefix = user.email?.split('@')[0]?.trim()
  if (emailPrefix) return emailPrefix

  return 'User'
}

export function getInitials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U'
}

export function usagePercent(used: number, limit: number | null): number {
  if (limit === null || limit === 0) return used > 0 ? 8 : 0
  return Math.min(100, Math.round((used / limit) * 100))
}

export function formatRenewalText(
  plan: PlanId,
  status: string,
  currentPeriodEnd: string | null
): string | null {
  if (plan === 'free') return 'No renewal on this plan'
  if (status === 'canceled') return 'Subscription canceled'
  if (!currentPeriodEnd) return null
  const d = new Date(currentPeriodEnd)
  if (Number.isNaN(d.getTime())) return null
  return `Renews ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

export function formatUsageLabel(used: number, limit: number | null): string {
  if (limit === null) return `${used} · Unlimited`
  return `${used} (${usagePercent(used, limit)}%)`
}

export function formatLimitLabel(limit: number | null): string {
  if (limit === null) return 'Unlimited'
  return String(limit)
}
