'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, UserPlus, CreditCard, LogOut } from "lucide-react"
import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"

export function UserNav({ user }: { user?: User | null }) {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 w-full hover:bg-black/5 dark:hover:bg-white/10 p-2 rounded-xl transition-colors text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50">
        <div className="w-9 h-9 rounded-lg bg-green-700 text-zinc-900 dark:text-white flex items-center justify-center font-bold text-sm tracking-widest shrink-0 border border-green-600 shadow-[0_0_15px_rgba(21,128,61,0.3)]">
          {initials}
        </div>
        <div className="flex-1 overflow-hidden">
          <span className="font-semibold text-[14px] text-zinc-900 dark:text-white block truncate">{displayName}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white dark:bg-[#0c0c18] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white shadow-xl rounded-xl p-1" align="end">
        <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="focus:bg-black/5 dark:focus:bg-white/10 focus:text-zinc-900 dark:focus:text-white rounded-lg cursor-pointer py-2 px-3">
          <Settings className="mr-2 h-4 w-4 text-zinc-500 dark:text-white/50" />
          <span className="text-[14px]">Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="focus:bg-black/5 dark:focus:bg-white/10 focus:text-zinc-900 dark:focus:text-white rounded-lg cursor-pointer py-2 px-3">
          <UserPlus className="mr-2 h-4 w-4 text-zinc-500 dark:text-white/50" />
          <span className="text-[14px]">Invite members</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="focus:bg-black/5 dark:focus:bg-white/10 focus:text-zinc-900 dark:focus:text-white rounded-lg cursor-pointer py-2 px-3 flex justify-between items-center">
          <div className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4 text-zinc-500 dark:text-white/50" />
            <span className="text-[14px]">Billing</span>
          </div>
          <span className="text-[10px] font-bold bg-blue-500 text-zinc-900 dark:text-white px-2 py-0.5 rounded-sm uppercase tracking-wider">FREE</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10 my-1" />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-400 text-red-600 dark:text-red-400/80 rounded-lg cursor-pointer py-2 px-3"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="text-[14px]">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
