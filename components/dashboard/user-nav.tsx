"use client";

import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PLANS } from "@/lib/billing-utils";
import { logout } from "@/app/login/actions";
import type { AccountContext } from "@/types/billing";
import { CreditCard, LogOut, Settings, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserNav({ account }: { account: AccountContext }) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  const handleBilling = () => {
    router.push("/dashboard/settings?tab=Billing");
  };

  const badgeClass = PLANS[account.plan]?.badgeClass ?? PLANS.free.badgeClass;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 w-full hover:bg-black/5 dark:hover:bg-white/10 p-2 rounded-xl transition-colors text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50">
        <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-blue-600 text-white flex items-center justify-center font-bold text-sm tracking-widest shrink-0 border border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.35)]">
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
        <div className="flex-1 overflow-hidden min-w-0">
          <span className="font-semibold text-[14px] text-zinc-900 dark:text-white block truncate">
            {account.displayName}
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-white/35 block truncate">
            {account.email}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
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
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="text-[14px]">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
