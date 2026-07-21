import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { AccountProvider } from "@/components/dashboard/account-provider"
import { SocialConnectionsProvider } from "@/components/dashboard/social-connections-provider"
import { DashboardProviders } from "@/components/dashboard/dashboard-providers"
import { redirect } from 'next/navigation'
import { getAccountContext } from '@/lib/services/account.service'
import { getAuthenticatedUser } from '@/lib/supabase/server-auth'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Dashboard',
  noIndex: true,
})

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser()

  if (!user) {
    return redirect('/login')
  }

  const account = await getAccountContext()
  if (!account) {
    return redirect('/login')
  }

  return (
    <DashboardProviders>
      <AccountProvider account={account}>
      <div className="fixed inset-0 z-10 flex overflow-hidden bg-background">
      <SidebarProvider className="h-full w-full min-h-0 overflow-hidden">
        <AppSidebar account={account} />
        <SidebarInset className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-foreground md:m-0 md:rounded-none md:shadow-none">
          <div className="pointer-events-none absolute inset-0 dashboard-grid-bg" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[min(500px,45%)] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[min(600px,55%)] h-[600px] bg-zinc-600/10 blur-[150px] rounded-full" />
          </div>

          <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 backdrop-blur-xl px-4 sm:px-6">
            <SidebarTrigger className="shrink-0 text-muted-foreground hover:text-foreground transition-colors" />
            <div className="min-w-0 flex-1" />
            <div
              className="shrink-0 max-w-[min(240px,40vw)] truncate text-[11px] font-mono tracking-widest uppercase text-muted-foreground bg-muted/80 border border-border px-3 py-1.5 rounded-lg"
              title={account.email}
            >
              {account.email}
            </div>
          </header>

          <main id="main-content" className="relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            <SocialConnectionsProvider>
              {children}
            </SocialConnectionsProvider>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
      </AccountProvider>
    </DashboardProviders>
  )
}
