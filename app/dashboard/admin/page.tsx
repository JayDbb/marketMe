import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
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

  // Admin gate: restrict by email list (set ADMIN_EMAILS in .env.local)
  const allowedEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  const userEmail = (user.email ?? '').trim().toLowerCase()
  const isAuthorizedAdmin = allowedEmails.length > 0 && allowedEmails.includes(userEmail)

  if (!isAuthorizedAdmin) {
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
    // Return a degraded shell with error message
    return (
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <div className="mb-2 flex items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-widest text-accent-foreground">
            Administration
          </p>
        </div>
        <h1 className="mb-6 text-3xl font-semibold tracking-tight text-foreground">
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
