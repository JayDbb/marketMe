'use client'

import { Activity, LayoutDashboard, Mail, Rocket, Calendar as CalendarIcon, Edit3, Link2, MonitorPlay, Workflow, Sparkles } from "lucide-react"
import { usePathname } from 'next/navigation'
import { UserNav } from "@/components/dashboard/user-nav"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import Link from "next/link"
import type { AccountContext } from '@/types/billing'

// #region agent log
fetch('http://127.0.0.1:7751/ingest/39f00748-ada2-4c19-8c32-a6cb1b9e3c26',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5e9746'},body:JSON.stringify({sessionId:'5e9746',runId:'pre-fix',hypothesisId:'B',location:'components/dashboard/app-sidebar.tsx:module',message:'app-sidebar module evaluated; UserNav factory available',data:{hasUserNav:typeof UserNav==='function'},timestamp:Date.now()})}).catch(()=>{});
// #endregion

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard'
  }
  const base = href.split('#')[0]
  return pathname === base || pathname.startsWith(`${base}/`)
}

const navButtonClass =
  'h-10 rounded-xl px-3 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground data-[active=true]:bg-primary/10 data-[active=true]:text-accent-foreground'

const publishItems = [
  { href: '/dashboard', label: 'Dashboard', tooltip: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/posts', label: 'Posts', tooltip: 'Posts', icon: Edit3 },
  { href: '/dashboard/calendar', label: 'Planner', tooltip: 'Planner', icon: CalendarIcon },
  { href: '/dashboard/inbox', label: 'Inbox', tooltip: 'Instagram DMs', icon: Mail },
  { href: '/dashboard/studio', label: 'Studio', tooltip: 'Studio', icon: MonitorPlay },
] as const

const automateItems = [
  { href: '/dashboard/workflows', label: 'Workflows', tooltip: 'Workflows', icon: Workflow },
  { href: '/dashboard/generate', label: 'Generate', tooltip: 'Generate AI Content', icon: Sparkles },
] as const

const workspaceItems = [
  { href: '/dashboard/connections', label: 'Connections', tooltip: 'Connections', icon: Link2 },
  { href: '/onboarding', label: 'Setup Profile', tooltip: 'Setup Profile', icon: Rocket },
] as const

export function AppSidebar({ account }: { account: AccountContext }) {
  const pathname = usePathname()

  return (
    <Sidebar variant="sidebar" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="flex h-18 flex-col justify-center border-b border-sidebar-border bg-sidebar p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary">
            <Activity className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
          </div>
          <span className="truncate font-sans text-lg font-semibold tracking-tight text-sidebar-foreground">
            Marketme
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar pt-4">
        <NavGroup label="Publish" items={publishItems} pathname={pathname} />
        <NavGroup label="Automate" items={automateItems} pathname={pathname} className="mt-3" />
        <NavGroup label="Workspace" items={workspaceItems} pathname={pathname} className="mt-3" />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border bg-sidebar p-3">
        <UserNav account={account} />
      </SidebarFooter>
    </Sidebar>
  )
}

function NavGroup({
  label,
  items,
  pathname,
  className,
}: {
  label: string
  items: readonly { href: string; label: string; tooltip: string; icon: typeof LayoutDashboard }[]
  pathname: string
  className?: string
}) {
  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel className="mb-1 px-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent className="px-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                render={<Link href={item.href} />}
                tooltip={item.tooltip}
                isActive={isNavActive(pathname, item.href)}
                className={`mt-0.5 ${navButtonClass}`}
              >
                <item.icon className="mr-3 h-4 w-4 shrink-0" />
                <span className="text-[14px] font-medium">{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
