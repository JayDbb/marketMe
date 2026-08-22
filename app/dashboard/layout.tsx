import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { AccountProvider } from "@/components/dashboard/account-provider"
import { DashboardProviders } from "@/components/dashboard/dashboard-providers"
import { SocialConnectionsProvider } from "@/components/dashboard/social-connections-provider"

import { createPageMetadata } from "@/lib/metadata"
import { getAccountContext } from "@/lib/services/account.service"
import { getBusinessProfile } from "@/lib/services/business.service"
import { getAuthenticatedUser } from "@/lib/supabase/server-auth"


export const metadata = createPageMetadata({
  title: "Dashboard",
  noIndex: true,
})


interface DashboardLayoutProps {
  children: ReactNode
}


export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/login")
  }

  const [account, businessProfileResult] =
    await Promise.all([
      getAccountContext(),
      getBusinessProfile(user.id),
    ])

  if (!account) {
    redirect("/login")
  }

  if (
    businessProfileResult.error ||
    !businessProfileResult.data?.id
  ) {
    redirect("/onboarding")
  }

  const businessProfileId = String(
    businessProfileResult.data.id
  )

  return (
    <DashboardProviders>
      <AccountProvider account={account}>
        <SocialConnectionsProvider
          businessProfileId={businessProfileId}
        >
          <div className="fixed inset-0 z-10 flex overflow-hidden bg-background dashboard-canvas font-sans">
            <SidebarProvider className="h-full min-h-0 w-full overflow-hidden">
              <AppSidebar account={account} />

              <SidebarInset className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-foreground md:m-0 md:rounded-none md:shadow-none">
                <div
                  className="pointer-events-none absolute inset-0 dashboard-grid-bg"
                  aria-hidden="true"
                />

                <div
                  className="pointer-events-none absolute inset-0 overflow-hidden"
                  aria-hidden="true"
                >
                  <div className="absolute right-0 top-0 -mr-20 -mt-20 h-[500px] w-[min(500px,45%)] rounded-full bg-primary/10 blur-[120px]" />

                  <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-[600px] w-[min(600px,55%)] rounded-full bg-muted/40 blur-[150px]" />
                </div>

                <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-xl sm:px-6">
                  <SidebarTrigger className="shrink-0 text-muted-foreground transition-colors hover:text-foreground" />

                  <div className="min-w-0 flex-1" />

                  <div
                    className="max-w-[min(240px,40vw)] shrink-0 truncate rounded-lg border border-border bg-muted/80 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
                    title={account.email}
                  >
                    {account.email}
                  </div>
                </header>

                <main
                  id="main-content"
                  className="custom-scrollbar relative z-10 min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
                >
                  {children}
                </main>
              </SidebarInset>
            </SidebarProvider>
          </div>
        </SocialConnectionsProvider>
      </AccountProvider>
    </DashboardProviders>
  )
}