'use client'

import { DashboardContent } from '@/components/dashboard/dashboard-content'
import type { BusinessProfile } from '@/types/business-profile'
import type { DashboardStats } from '@/lib/dashboard-utils'

interface DashboardShellProps {
  submitFeedbackAction: (formData: FormData) => void
  profile: BusinessProfile | null
  stats: DashboardStats
}

export function DashboardShell({
  submitFeedbackAction,
  profile,
  stats,
}: DashboardShellProps) {
  return (
    <DashboardContent
      submitFeedbackAction={submitFeedbackAction}
      profile={profile}
      stats={stats}
    />
  )
}
