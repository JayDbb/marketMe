"use client";

<<<<<<< HEAD
import Image from "next/image";
=======
import Image from 'next/image'
import Link from 'next/link'
>>>>>>> origin/development
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
<<<<<<< HEAD
} from "@/components/ui/dropdown-menu";
import { PLANS } from "@/lib/billing-utils";
import { logout } from "@/app/login/actions";
import type { AccountContext } from "@/types/billing";
import { CreditCard, LogOut, Settings, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserNav({ account }: { account: AccountContext }) {
  const router = useRouter();
=======
} from '@/components/ui/dropdown-menu'
import { PLANS } from '@/lib/billing-utils'
import { logout } from '@/app/login/actions'
import type { AccountContext } from '@/types/billing'
import { CreditCard, LogOut, Settings, ShieldCheck } from '@/components/dashboard/user-nav-icons'
>>>>>>> origin/development

export function UserNav({ account }: { account: AccountContext }) {
  const handleLogout = async () => {
<<<<<<< HEAD
    await logout();
  };

  const handleBilling = () => {
    router.push("/dashboard/settings?tab=Billing");
  };

  const badgeClass = PLANS[account.plan]?.badgeClass ?? PLANS.free.badgeClass;
=======
    await logout()
  }
>>>>>>> origin/development

  const badgeClass = PLANS[account.plan]?.badgeClass ?? PLANS.free.badgeClass

  return (
    <DropdownMenu>
<<<<<<< HEAD
      <DropdownMenuTrigger className="flex items-center gap-3 w-full hover:bg-black/5 dark:hover:bg-white/10 p-2 rounded-xl transition-colors text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50">
        <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-blue-600 text-white flex items-center justify-center font-bold text-sm tracking-widest shrink-0 border border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.35)]">
=======
      <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-xl p-2 text-left outline-none ui-transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
        <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary bg-primary text-sm font-bold tracking-widest text-primary-foreground">
>>>>>>> origin/development
          {account.avatarUrl ? (
            <Image
              src={account.avatarUrl}
              alt=""
              fill
              className="object-cover"
              sizes="36px"
              unoptimized
            />
          ) : (
            account.initials
          )}
        </div>
<<<<<<< HEAD
        <div className="flex-1 overflow-hidden min-w-0">
          <span className="font-semibold text-[14px] text-zinc-900 dark:text-white block truncate">
            {account.displayName}
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-white/35 block truncate">
=======
        <div className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold text-foreground">
            {account.displayName}
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
>>>>>>> origin/development
            {account.email}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
<<<<<<< HEAD
        className="w-56 bg-white dark:bg-[#161b22] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white shadow-xl rounded-xl p-1"
        align="end"
      >
        <DropdownMenuItem
          onClick={() => router.push("/dashboard/settings")}
          className="focus:bg-black/5 dark:focus:bg-white/10 focus:text-zinc-900 dark:focus:text-white rounded-lg cursor-pointer py-2 px-3"
        >
          <Settings className="mr-2 h-4 w-4 text-zinc-500 dark:text-white/50" />
          <span className="text-[14px]">Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/dashboard/settings?tab=Team")}
          className="focus:bg-black/5 dark:focus:bg-white/10 focus:text-zinc-900 dark:focus:text-white rounded-lg cursor-pointer py-2 px-3"
        >
          <UserPlus className="mr-2 h-4 w-4 text-zinc-500 dark:text-white/50" />
          <span className="text-[14px]">Invite members</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleBilling}
          className="focus:bg-black/5 dark:focus:bg-white/10 focus:text-zinc-900 dark:focus:text-white rounded-lg cursor-pointer py-2 px-3 flex justify-between items-center"
        >
          <div className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4 text-zinc-500 dark:text-white/50" />
            <span className="text-[14px]">Billing</span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${badgeClass}`}
          >
            {account.planBadge}
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10 my-1" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-400 text-red-600 dark:text-red-400/80 rounded-lg cursor-pointer py-2 px-3"
=======
        className="w-56 rounded-xl border border-border bg-popover p-1 text-popover-foreground"
        align="end"
      >
        <DropdownMenuItem
          render={<Link href="/dashboard/settings" />}
          nativeButton={false}
          className="cursor-pointer rounded-lg px-3 py-2"
        >
          <Settings className="mr-2 size-4 text-muted-foreground" />
          <span className="text-[14px]">Settings</span>
        </DropdownMenuItem>
        {account.isAdmin ? (
          <DropdownMenuItem
            render={<Link href="/dashboard/admin" />}
            nativeButton={false}
            className="cursor-pointer rounded-lg px-3 py-2"
          >
            <ShieldCheck className="mr-2 size-4 text-sky-500" />
            <span className="text-[14px]">Admin Console</span>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          render={<Link href="/dashboard/settings?tab=Billing" />}
          nativeButton={false}
          className="cursor-pointer items-center justify-between rounded-lg px-3 py-2"
>>>>>>> origin/development
        >
          <span className="flex items-center">
            <CreditCard className="mr-2 size-4 text-muted-foreground" />
            <span className="text-[14px]">Billing</span>
          </span>
          <span
            className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
          >
            {account.planBadge}
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1 bg-border" />
        <DropdownMenuItem
          onClick={handleLogout}
          variant="destructive"
          className="cursor-pointer rounded-lg px-3 py-2"
        >
          <LogOut className="mr-2 size-4" />
          <span className="text-[14px]">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
