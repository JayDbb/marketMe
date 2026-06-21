import { Activity, LayoutDashboard, Mail, MessageSquare, Rocket, Calendar as CalendarIcon, Edit3, Link2, MonitorPlay, Workflow, Sparkles } from "lucide-react"
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

export function AppSidebar() {
  return (
    <Sidebar variant="inset" className="border-r border-zinc-200 dark:border-white/6 bg-zinc-50 dark:bg-[#0c0c18] text-zinc-500 dark:text-white/70">
      <SidebarHeader className="border-b border-zinc-200 dark:border-white/6 p-5 h-18 flex flex-col justify-center bg-zinc-50 dark:bg-[#0c0c18]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)] shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-zinc-900 dark:text-white truncate">Marketme</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-zinc-50 dark:bg-[#0c0c18] pt-4">
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
                  className="hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-blue-400 focus:bg-zinc-100 dark:focus:bg-white/5 focus:text-blue-400 transition-colors h-10 px-3 rounded-xl data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-400 text-zinc-500 dark:text-white/55"
                >
                  <LayoutDashboard className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/posts" />}
                  tooltip="Posts"
                  className="hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-blue-400 focus:bg-zinc-100 dark:focus:bg-white/5 focus:text-blue-400 transition-colors h-10 px-3 rounded-xl mt-0.5 text-zinc-500 dark:text-white/55"
                >
                  <Edit3 className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Posts</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/calendar" />}
                  tooltip="Planner"
                  className="hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-blue-400 focus:bg-zinc-100 dark:focus:bg-white/5 focus:text-blue-400 transition-colors h-10 px-3 rounded-xl mt-0.5 text-zinc-500 dark:text-white/55"
                >
                  <CalendarIcon className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Planner</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/inbox" />}
                  tooltip="Inbox"
                  className="hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-blue-400 focus:bg-zinc-100 dark:focus:bg-white/5 focus:text-blue-400 transition-colors h-10 px-3 rounded-xl mt-0.5 text-zinc-500 dark:text-white/55"
                >
                  <Mail className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Inbox</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/studio" />}
                  tooltip="Studio"
                  className="hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-blue-400 focus:bg-zinc-100 dark:focus:bg-white/5 focus:text-blue-400 transition-colors h-10 px-3 rounded-xl mt-0.5 text-zinc-500 dark:text-white/55"
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
                  className="hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-blue-400 focus:bg-zinc-100 dark:focus:bg-white/5 focus:text-blue-400 transition-colors h-10 px-3 rounded-xl mt-0.5 text-zinc-500 dark:text-white/55"
                >
                  <Workflow className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Workflows</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/generate" />}
                  tooltip="Generate AI Content"
                  className="hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-purple-400 focus:bg-zinc-100 dark:focus:bg-white/5 focus:text-purple-400 transition-colors h-10 px-3 rounded-xl mt-0.5 text-zinc-500 dark:text-white/55"
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
                  render={<Link href="/dashboard#feedback" />}
                  tooltip="Feedback"
                  className="hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-blue-400 focus:bg-zinc-100 dark:focus:bg-white/5 focus:text-blue-400 transition-colors h-10 px-3 rounded-xl mt-0.5 text-zinc-500 dark:text-white/55"
                >
                  <MessageSquare className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Feedback</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/connections" />}
                  tooltip="Connections"
                  className="hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-blue-400 focus:bg-zinc-100 dark:focus:bg-white/5 focus:text-blue-400 transition-colors h-10 px-3 rounded-xl mt-0.5 text-zinc-500 dark:text-white/55"
                >
                  <Link2 className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Connections</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/onboarding" />}
                  tooltip="Setup Profile"
                  className="hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-blue-400 focus:bg-zinc-100 dark:focus:bg-white/5 focus:text-blue-400 transition-colors h-10 px-3 rounded-xl mt-0.5 text-zinc-500 dark:text-white/55"
                >
                  <Rocket className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Setup Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-zinc-200 dark:border-white/6 p-3 bg-zinc-50 dark:bg-[#0c0c18]">
        <UserNav />
      </SidebarFooter>
    </Sidebar>
  )
}
