'use client'

import { Activity, LayoutDashboard, Settings, User, MessageSquare, Rocket } from "lucide-react"
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
    <Sidebar variant="inset" className="border-r border-zinc-800/50 bg-zinc-950 text-zinc-300">
      <SidebarHeader className="border-b border-zinc-800/50 p-6 h-20 flex flex-col justify-center bg-zinc-950">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0">
            <Activity className="w-5 h-5 text-zinc-950" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white truncate">Marketme</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-zinc-950 pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-500 uppercase tracking-wider font-semibold text-xs mb-2 px-6">Overview</SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/dashboard" />} tooltip="Dashboard" className="hover:bg-zinc-900 hover:text-emerald-400 focus:bg-zinc-900 focus:text-emerald-400 transition-colors h-10 px-3 rounded-xl data-[active=true]:bg-zinc-900 data-[active=true]:text-emerald-400 text-zinc-300">
                  <LayoutDashboard className="w-5 h-5 mr-3 shrink-0" />
                  <span className="font-medium text-[15px]">Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/dashboard/leads" />} tooltip="Leads" className="hover:bg-zinc-900 hover:text-emerald-400 focus:bg-zinc-900 focus:text-emerald-400 transition-colors h-10 px-3 rounded-xl mt-1 text-zinc-300">
                  <User className="w-5 h-5 mr-3 shrink-0" />
                  <span className="font-medium text-[15px]">Leads</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-zinc-500 uppercase tracking-wider font-semibold text-xs mb-2 px-6">Workspace</SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/dashboard#feedback" />} tooltip="Feedback" className="hover:bg-zinc-900 hover:text-emerald-400 focus:bg-zinc-900 focus:text-emerald-400 transition-colors h-10 px-3 rounded-xl mt-1 text-zinc-300">
                  <MessageSquare className="w-5 h-5 mr-3 shrink-0" />
                  <span className="font-medium text-[15px]">Feedback</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/onboarding" />} tooltip="Setup Profile" className="hover:bg-zinc-900 hover:text-emerald-400 focus:bg-zinc-900 focus:text-emerald-400 transition-colors h-10 px-3 rounded-xl mt-1 text-zinc-300">
                  <Rocket className="w-5 h-5 mr-3 shrink-0" />
                  <span className="font-medium text-[15px]">Setup Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/dashboard/settings" />} tooltip="Settings" className="hover:bg-zinc-900 hover:text-emerald-400 focus:bg-zinc-900 focus:text-emerald-400 transition-colors h-10 px-3 rounded-xl mt-1 text-zinc-300">
                  <Settings className="w-5 h-5 mr-3 shrink-0" />
                  <span className="font-medium text-[15px]">Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-zinc-800/50 p-4 bg-zinc-950">
        <form action={logout}>
          <Button type="submit" variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl h-10 font-medium">
            Log out
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}
