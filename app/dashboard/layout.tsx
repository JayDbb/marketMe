import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <SidebarProvider className="dark">
      <AppSidebar />
      <div className="flex-1 min-h-screen bg-zinc-950 text-zinc-50 relative flex flex-col overflow-hidden">
        {/* Sticky Header with Sidebar Trigger */}
        <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-4 border-b border-zinc-800/60 bg-zinc-950/60 backdrop-blur-2xl px-6">
          <SidebarTrigger className="text-zinc-400 hover:text-white hover:bg-zinc-800 -ml-2 transition-colors" />
          <div className="flex-1" />
          <div className="text-sm font-medium text-zinc-400 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800/50">{user.email}</div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 relative z-10 w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
