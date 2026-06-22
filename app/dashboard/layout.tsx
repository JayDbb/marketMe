import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { getUserAndProfile } from '@/lib/user'
import { redirect } from 'next/navigation'

// Must be force-dynamic: layout calls getUserAndProfile() which reads headers()
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getUserAndProfile()

  if (!user) {
    return redirect('/login')
  }

  return (
    <SidebarProvider className="dark">
      <AppSidebar />
      <div className="flex-1 min-h-screen bg-[#0a0a14] text-white relative flex flex-col overflow-hidden">
        {/* Ambient glow */}
        <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-700/8 blur-[150px] rounded-full pointer-events-none" aria-hidden="true" />

        {/* Sticky Header */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-white/6 bg-[#0a0a14]/80 backdrop-blur-2xl px-6">
          <SidebarTrigger className="text-white/30 hover:text-white transition-colors" />
          <div className="flex-1" />
          <div className="text-[11px] font-mono tracking-widest uppercase text-white/30 bg-white/5 px-3 py-1.5 border border-white/8 rounded-lg max-w-[240px] truncate" title={user.email ?? ''}>{user.email}</div>
        </header>

        {/* Page Content */}
        <main className="flex-1 relative z-10 w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
