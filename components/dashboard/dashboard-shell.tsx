'use client'

import { DashboardContent } from '@/components/dashboard/dashboard-content'
import type { BusinessProfile } from '@/types/business-profile'
import type { DashboardStats } from '@/lib/dashboard-utils'

interface DashboardShellProps {
  profile: BusinessProfile | null
  stats: DashboardStats
<<<<<<< HEAD
=======
  loadError?: string | null
>>>>>>> origin/development
}

export function DashboardShell({
  profile,
  stats,
<<<<<<< HEAD
=======
  loadError = null,
>>>>>>> origin/development
}: DashboardShellProps) {
  return (
    <DashboardContent
      profile={profile}
      stats={stats}
<<<<<<< HEAD
=======
      loadError={loadError}
>>>>>>> origin/development
    />
  )
}
