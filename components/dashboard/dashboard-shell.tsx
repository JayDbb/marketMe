'use client'

import { DashboardContent } from '@/components/dashboard/dashboard-content'
import type { BusinessProfile } from '@/types/business-profile'
import type { DashboardStats } from '@/lib/dashboard-utils'

interface DashboardShellProps {
  profile: BusinessProfile | null
  stats: DashboardStats
  loadError?: string | null
}

export function DashboardShell({
  profile,
  stats,
  loadError = null,
}: DashboardShellProps) {
  return (
    <DashboardContent
      profile={profile}
      stats={stats}
      loadError={loadError}
    />
  )
}
