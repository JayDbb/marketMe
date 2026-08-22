'use client'

<<<<<<< HEAD
import { Activity, LayoutDashboard, Mail, Rocket, Calendar as CalendarIcon, Edit3, Link2, MonitorPlay, Workflow, Sparkles } from "lucide-react"
=======
import { useEffect } from 'react'
import { Activity, LayoutDashboard, Mail, Rocket, Calendar as CalendarIcon, Edit3, Link2, MonitorPlay, Workflow, Sparkles, ShieldCheck } from "lucide-react"
>>>>>>> origin/development
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
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import type { AccountContext } from '@/types/billing'

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard'
  }
  const base = href.split('#')[0]
  return pathname === base || pathname.startsWith(`${base}/`)
}

const navButtonClass =
<<<<<<< HEAD
  'hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-blue-400 focus:bg-zinc-100 dark:focus:bg-white/5 focus:text-blue-400 transition-colors h-10 px-3 rounded-xl data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-400 text-zinc-500 dark:text-white/55'

export function AppSidebar({ account }: { account: AccountContext }) {
  const pathname = usePathname()

  return (
    <Sidebar variant="sidebar" className="border-r border-border bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="border-b border-border p-5 h-18 flex flex-col justify-center bg-sidebar">
=======
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
  const { isMobile, setOpenMobile } = useSidebar()

  useEffect(() => {
    if (isMobile) setOpenMobile(false)
  }, [pathname, isMobile, setOpenMobile])

  return (
    <Sidebar variant="sidebar" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="flex h-18 flex-col justify-center border-b border-sidebar-border bg-sidebar p-5">
>>>>>>> origin/development
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
<<<<<<< HEAD
        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-400 dark:text-white/25 uppercase tracking-wider font-semibold text-[10px] mb-1 px-4">
            Publish
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard" />}
                  tooltip="Dashboard"
                  isActive={isNavActive(pathname, '/dashboard')}
                  className={`mt-0.5 ${navButtonClass}`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/posts" />}
                  tooltip="Posts"
                  isActive={isNavActive(pathname, '/dashboard/posts')}
                  className={`mt-0.5 ${navButtonClass}`}
                >
                  <Edit3 className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Posts</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/calendar" />}
                  tooltip="Planner"
                  isActive={isNavActive(pathname, '/dashboard/calendar')}
                  className={`mt-0.5 ${navButtonClass}`}
                >
                  <CalendarIcon className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Planner</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/inbox" />}
                  tooltip="Inbox"
                  isActive={isNavActive(pathname, '/dashboard/inbox')}
                  className={`mt-0.5 ${navButtonClass}`}
                >
                  <Mail className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Inbox</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/studio" />}
                  tooltip="Studio"
                  isActive={isNavActive(pathname, '/dashboard/studio')}
                  className={`mt-0.5 ${navButtonClass}`}
                >
                  <MonitorPlay className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Studio</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-3">
          <SidebarGroupLabel className="text-zinc-400 dark:text-white/25 uppercase tracking-wider font-semibold text-[10px] mb-1 px-4">
            Automate
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/workflows" />}
                  tooltip="Workflows"
                  isActive={isNavActive(pathname, '/dashboard/workflows')}
                  className={`mt-0.5 ${navButtonClass}`}
                >
                  <Workflow className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Workflows</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/generate" />}
                  tooltip="Generate AI Content"
                  isActive={isNavActive(pathname, '/dashboard/generate')}
                  className="hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-purple-400 focus:bg-zinc-100 dark:focus:bg-white/5 focus:text-purple-400 transition-colors h-10 px-3 rounded-xl mt-0.5 data-[active=true]:bg-purple-500/10 data-[active=true]:text-purple-400 text-zinc-500 dark:text-white/55"
                >
                  <Sparkles className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Generate</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-3">
          <SidebarGroupLabel className="text-zinc-400 dark:text-white/25 uppercase tracking-wider font-semibold text-[10px] mb-1 px-4">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/connections" />}
                  tooltip="Connections"
                  isActive={isNavActive(pathname, '/dashboard/connections')}
                  className={`mt-0.5 ${navButtonClass}`}
                >
                  <Link2 className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Connections</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/onboarding" />}
                  tooltip="Setup Profile"
                  isActive={isNavActive(pathname, '/onboarding')}
                  className={`mt-0.5 ${navButtonClass}`}
                >
                  <Rocket className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Setup Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-3 bg-sidebar">
=======
        <NavGroup label="Publish" items={publishItems} pathname={pathname} />
        <NavGroup label="Automate" items={automateItems} pathname={pathname} className="mt-3" />
        <NavGroup label="Workspace" items={workspaceItems} pathname={pathname} className="mt-3" />
        {account.isAdmin ? (
          <SidebarGroup className="mt-3">
            <SidebarGroupLabel className="mb-1 px-4 text-[10px] font-semibold uppercase tracking-wider text-sky-500/80">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/dashboard/admin" />}
                    tooltip="Admin Console"
                    isActive={isNavActive(pathname, '/dashboard/admin')}
                    className={`mt-0.5 ${navButtonClass}`}
                  >
                    <ShieldCheck className="mr-3 h-4 w-4 shrink-0 text-sky-500" />
                    <span className="text-[14px] font-medium">Admin Console</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border bg-sidebar p-3">
>>>>>>> origin/development
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
