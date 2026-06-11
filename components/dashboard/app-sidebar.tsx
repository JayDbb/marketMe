import { Activity, LayoutDashboard, Settings, User, MessageSquare, Rocket, Calendar as CalendarIcon } from "lucide-react"
import { logout } from "@/app/login/actions"
import { Button } from "@/components/ui/button"

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
    <Sidebar variant="inset" className="border-r border-white/6 bg-[#0c0c18] text-white/70">
      <SidebarHeader className="border-b border-white/6 p-5 h-18 flex flex-col justify-center bg-[#0c0c18]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)] shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-white truncate">Marketme</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#0c0c18] pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/25 uppercase tracking-wider font-semibold text-[10px] mb-1 px-4">
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard" />}
                  tooltip="Dashboard"
                  className="hover:bg-white/5 hover:text-blue-400 focus:bg-white/5 focus:text-blue-400 transition-colors h-10 px-3 rounded-xl data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-400 text-white/55"
                >
                  <LayoutDashboard className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/leads" />}
                  tooltip="Leads"
                  className="hover:bg-white/5 hover:text-blue-400 focus:bg-white/5 focus:text-blue-400 transition-colors h-10 px-3 rounded-xl mt-0.5 text-white/55"
                >
                  <User className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Leads</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-3">
          <SidebarGroupLabel className="text-white/25 uppercase tracking-wider font-semibold text-[10px] mb-1 px-4">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard#feedback" />}
                  tooltip="Feedback"
                  className="hover:bg-white/5 hover:text-blue-400 focus:bg-white/5 focus:text-blue-400 transition-colors h-10 px-3 rounded-xl mt-0.5 text-white/55"
                >
                  <MessageSquare className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Feedback</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/calendar" />}
                  tooltip="Calendar"
                  className="hover:bg-white/5 hover:text-blue-400 focus:bg-white/5 focus:text-blue-400 transition-colors h-10 px-3 rounded-xl mt-0.5 text-white/55"
                >
                  <CalendarIcon className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Calendar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/onboarding" />}
                  tooltip="Setup Profile"
                  className="hover:bg-white/5 hover:text-blue-400 focus:bg-white/5 focus:text-blue-400 transition-colors h-10 px-3 rounded-xl mt-0.5 text-white/55"
                >
                  <Rocket className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Setup Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/settings" />}
                  tooltip="Settings"
                  className="hover:bg-white/5 hover:text-blue-400 focus:bg-white/5 focus:text-blue-400 transition-colors h-10 px-3 rounded-xl mt-0.5 text-white/55"
                >
                  <Settings className="w-4 h-4 mr-3 shrink-0" />
                  <span className="font-medium text-[14px]">Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/6 p-3 bg-[#0c0c18]">
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-white/35 hover:text-white hover:bg-white/5 rounded-xl h-10 font-medium text-sm"
          >
            Log out
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}
