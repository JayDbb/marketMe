'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ChevronDown,
  Coins,
  Loader2,
  Search,
  ShieldAlert,
  User,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import type { AdminDashboardStats, AdminUserRow } from '@/types/admin'
import { cn } from '@/lib/utils'
import { grantCreditsAction, updatePlanAction } from '@/app/dashboard/admin/actions'

const PLAN_BADGE: Record<string, { label: string; cls: string }> = {
  free: { label: 'Free', cls: 'bg-muted text-muted-foreground border-border' },
  pro: { label: 'Pro', cls: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' },
  team: { label: 'Team', cls: 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20' },
}

function PlanSelector({
  userId,
  currentPlan,
}: {
  userId: string
  currentPlan: string
}) {
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()

  const changePlan = (plan: 'free' | 'pro' | 'team') => {
    setOpen(false)
    start(async () => {
      const result = await updatePlanAction(userId, plan)
      if (result.error) {
        toast.error(`Failed to update plan: ${result.error}`)
      } else {
        toast.success(`Plan updated to ${plan}`)
      }
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted transition-colors"
        disabled={pending}
      >
        {pending ? <Loader2 className="size-3 animate-spin" /> : null}
        {PLAN_BADGE[currentPlan]?.label ?? currentPlan}
        <ChevronDown className="size-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 rounded-xl border border-border bg-card shadow-lg p-1 min-w-[100px]">
          {(['free', 'pro', 'team'] as const).map((p) => (
            <button
              key={p}
              onClick={() => changePlan(p)}
              className={cn(
                'w-full rounded-lg px-3 py-1.5 text-[12px] font-medium text-left transition-colors hover:bg-muted',
                currentPlan === p && 'text-primary'
              )}
            >
              {PLAN_BADGE[p].label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function CreditGrantButton({ userId, email }: { userId: string; email: string }) {
  const [pending, start] = useTransition()
  const [amount, setAmount] = useState(50)
  const [open, setOpen] = useState(false)

  const grant = () => {
    start(async () => {
      const result = await grantCreditsAction(userId, amount)
      if (result.error) {
        toast.error(`Failed to grant credits: ${result.error}`)
      } else {
        toast.success(`Granted ${amount} credits to ${email}`)
        setOpen(false)
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted transition-colors"
      >
        <Coins className="size-3" />
        Grant
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="h-7 w-16 rounded-lg text-xs"
        min={1}
        max={10000}
      />
      <Button
        size="sm"
        className="h-7 rounded-lg text-[11px] px-2"
        onClick={grant}
        disabled={pending}
      >
        {pending ? <Loader2 className="size-3 animate-spin" /> : 'Apply'}
      </Button>
      <button
        onClick={() => setOpen(false)}
        className="text-[11px] text-muted-foreground hover:text-foreground"
      >
        Cancel
      </button>
    </div>
  )
}

function UserRow({ user, isOnline }: { user: AdminUserRow; isOnline: boolean }) {
  const planCfg = PLAN_BADGE[user.plan] ?? PLAN_BADGE.free
  const creditPct = user.creditsTotal > 0 ? (user.creditsRemaining / user.creditsTotal) * 100 : 0

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/50 px-4 py-3 sm:flex-row sm:items-center">
      {/* Avatar + name */}
      <div className="flex items-center gap-3 min-w-0 sm:w-[220px] shrink-0">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.displayName}
            width={32}
            height={32}
            className="size-8 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <User className="size-4 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{user.displayName}</p>
          <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>

      {/* Plan badge */}
      <div className="sm:w-[80px] shrink-0">
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            planCfg.cls
          )}
        >
          {planCfg.label}
        </span>
      </div>

      {/* Credits meter */}
      <div className="flex-1 min-w-0">
        <div className="mb-1 flex justify-between text-[11px] tabular-nums text-muted-foreground">
          <span>{user.creditsRemaining} remaining</span>
          <span>{user.creditsTotal} total</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              creditPct > 60
                ? 'bg-emerald-500'
                : creditPct > 25
                  ? 'bg-amber-500'
                  : 'bg-red-500'
            )}
            style={{ width: `${Math.max(1, creditPct)}%` }}
          />
        </div>
      </div>

      {/* Posts */}
      <div className="sm:w-[70px] shrink-0 text-center">
        <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
          {user.postsCount}
        </p>
        <p className="text-[10px] text-muted-foreground">posts</p>
      </div>

      {/* Last active */}
      <div className="sm:w-[110px] shrink-0 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {isOnline && (
            <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" title="Active session" />
          )}
          <p className="text-[11px] text-muted-foreground">
            {user.lastActiveAt
              ? new Date(user.lastActiveAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })
              : 'Never'}
          </p>
        </div>
        <p className="text-[10px] text-muted-foreground/60">
          joined {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <CreditGrantButton userId={user.id} email={user.email} />
        <PlanSelector userId={user.id} currentPlan={user.plan} />
      </div>
    </div>
  )
}

export function AdminUsersTab({ stats }: { stats: AdminDashboardStats }) {
  const [query, setQuery] = useState('')
  const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'pro' | 'team'>('all')

  // A user is "online" if their last active session was updated within the past 30 minutes
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()

  const filtered = stats.users.filter((u) => {
    const matchesQuery =
      !query ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.displayName.toLowerCase().includes(query.toLowerCase())
    const matchesPlan = planFilter === 'all' || u.plan === planFilter
    return matchesQuery && matchesPlan
  })

  const onlineCount = stats.users.filter(
    (u) => u.lastActiveAt && u.lastActiveAt > thirtyMinsAgo
  ).length

  return (
    <div className="flex flex-col gap-4">
      {/* Header + filters */}
      <Card className="overflow-hidden rounded-2xl border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Users — {filtered.length} of {stats.users.length}
              </CardTitle>
              {onlineCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  {onlineCount} active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Plan filter chips */}
              <div className="flex gap-1">
                {(['all', 'free', 'pro', 'team'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlanFilter(p)}
                    className={cn(
                      'rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-colors',
                      planFilter === p
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search users…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-8 rounded-xl border border-border bg-background pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-[180px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 max-h-[600px] overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-12 text-center">
              <ShieldAlert className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No users match your filters.</p>
            </div>
          ) : (
            filtered.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                isOnline={Boolean(u.lastActiveAt && u.lastActiveAt > thirtyMinsAgo)}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
