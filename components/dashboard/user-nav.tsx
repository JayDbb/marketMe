'use client'

import './_agent_debug_probe'
import Image from 'next/image'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PLANS } from '@/lib/billing-utils'
import { logout } from '@/app/login/actions'
import type { AccountContext } from '@/types/billing'
import { CreditCard, LogOut, Settings } from '@/components/dashboard/user-nav-icons'

// #region agent log
fetch('http://127.0.0.1:7751/ingest/39f00748-ada2-4c19-8c32-a6cb1b9e3c26',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5e9746'},body:JSON.stringify({sessionId:'5e9746',runId:'post-fix',hypothesisId:'B',location:'components/dashboard/user-nav.tsx:after-lucide',message:'user-nav resolved icons via local module, not lucide barrel',data:{icons:[CreditCard?.displayName,LogOut?.displayName,Settings?.displayName],importSource:'user-nav-icons'},timestamp:Date.now()})}).catch(()=>{});
// #endregion

export function UserNav({ account }: { account: AccountContext }) {
  const handleLogout = async () => {
    await logout()
  }

  const badgeClass = PLANS[account.plan]?.badgeClass ?? PLANS.free.badgeClass

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-xl p-2 text-left outline-none ui-transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
        <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary bg-primary text-sm font-bold tracking-widest text-primary-foreground">
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
        <div className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold text-foreground">
            {account.displayName}
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {account.email}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
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
        <DropdownMenuItem
          render={<Link href="/dashboard/settings?tab=Billing" />}
          nativeButton={false}
          className="cursor-pointer items-center justify-between rounded-lg px-3 py-2"
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
  )
}
