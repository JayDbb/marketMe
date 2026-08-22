import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import { checkIsAdmin } from '@/lib/admin-auth'
import { getAdminDashboardStats } from '@/lib/services/admin.service'
import { AdminContent } from '@/components/dashboard/admin/admin-content'
import { createPageMetadata } from '@/lib/metadata'
import { InlineNotice } from '@/components/ui/inline-notice'

export const dynamic = 'force-dynamic'

export const metadata = createPageMetadata({
  title: 'Admin Console',
  noIndex: true,
})

export default async function AdminPage() {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/login')

  if (!(await checkIsAdmin({ userId: user.id, email: user.email }))) {
    redirect('/dashboard')
  }

  let stats = null
  let loadError: string | null = null

  try {
    stats = await getAdminDashboardStats()
  } catch (err) {
    loadError =
      process.env.NODE_ENV === 'development'
        ? (err as Error).message
        : 'Failed to load admin data. Some tables may not exist yet.'
    console.error('[admin] getAdminDashboardStats error:', err)
  }

  if (!stats) {
    return (
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400/80">
          Administration
        </p>
        <h1 className="mb-6 font-sans text-3xl font-medium tracking-tight text-foreground">
          Admin Console
        </h1>
        <InlineNotice
          tone="warning"
          title="Admin data unavailable"
          description={loadError ?? 'Could not load system data. Check server logs.'}
        />
      </div>
    )
  }

  return <AdminContent stats={stats} />
}
