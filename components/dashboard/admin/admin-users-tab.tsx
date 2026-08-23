'use client'

import { useEffect, useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ChevronDown,
  Coins,
  Loader2,
  Search,
  ShieldAlert,
  User,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  grantCreditsAction,
  searchUsersAction,
  updatePlanAction,
} from '@/app/dashboard/admin/actions'
import type {
  AdminDashboardStats,
  AdminPlanId,
  AdminUserRow,
} from '@/types/admin'
import { AdminConfirmDialog } from './admin-confirm-dialog'
import { useAdminUrlState } from './use-admin-url-state'
import { cn } from '@/lib/utils'

const PLAN_STYLES: Record<AdminPlanId, { label: string; className: string }> = {
  free: {
    label: 'Free',
    className: 'border-border bg-muted text-muted-foreground',
  },
  pro: {
    label: 'Pro',
    className: 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  },
  team: {
    label: 'Team',
    className: 'border-sky-500/20 bg-sky-500/5 text-sky-800 dark:text-sky-200',
  },
}

function PlanChangeControl({ user }: { user: AdminUserRow }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [confirmPlan, setConfirmPlan] = useState<AdminPlanId | null>(null)

  const apply = () => {
    if (!confirmPlan) return
    start(async () => {
      const result = await updatePlanAction(user.id, confirmPlan)
      if (result.error) toast.error(`Failed to update plan: ${result.error}`)
      else {
        toast.success(`Plan updated to ${PLAN_STYLES[confirmPlan].label}`)
        router.refresh()
      }
      setConfirmPlan(null)
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={pending}
          className="inline-flex h-7 items-center gap-1 rounded-lg border border-border bg-background px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 disabled:opacity-50"
          aria-label={`Change plan for ${user.displayName}`}
        >
          {pending ? <Loader2 className="size-3 animate-spin" aria-hidden /> : null}
          {PLAN_STYLES[user.plan]?.label ?? user.plan}
          <ChevronDown className="size-3" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[120px]">
          {(['free', 'pro', 'team'] as const).map((p) => (
            <DropdownMenuItem
              key={p}
              disabled={p === user.plan}
              onClick={() => setConfirmPlan(p)}
            >
              {PLAN_STYLES[p].label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AdminConfirmDialog
        open={confirmPlan != null}
        onOpenChange={(open) => {
          if (!open) setConfirmPlan(null)
        }}
        title={`Change plan to ${confirmPlan ? PLAN_STYLES[confirmPlan].label : ''}?`}
        description={`This resets ${user.email}'s credit balance to the new plan allowance. This cannot be undone from here.`}
        confirmLabel="Change plan"
        tone="destructive"
        pending={pending}
        onConfirm={apply}
      />
    </>
  )
}

function CreditGrantControl({ user }: { user: AdminUserRow }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [amount, setAmount] = useState(50)

  const apply = () => {
    start(async () => {
      const result = await grantCreditsAction(user.id, amount)
      if (result.error) toast.error(`Failed to grant credits: ${result.error}`)
      else {
        toast.success(`Granted ${amount} credits to ${user.email}`)
        setOpen(false)
        setConfirmOpen(false)
        router.refresh()
      }
    })
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="xs"
        className="gap-1"
        onClick={() => setOpen(true)}
        aria-label={`Grant credits to ${user.displayName}`}
      >
        <Coins className="size-3" aria-hidden />
        Grant
      </Button>
    )
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Label htmlFor={`credit-${user.id}`} className="sr-only">
          Credit amount
        </Label>
        <Input
          id={`credit-${user.id}`}
          type="number"
          inputMode="numeric"
          name="credit-amount"
          autoComplete="off"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="h-7 w-16 rounded-lg text-xs"
          min={1}
          max={10000}
        />
        <Button
          type="button"
          size="xs"
          className="bg-sky-500 text-white hover:bg-sky-400"
          onClick={() => setConfirmOpen(true)}
          disabled={pending || !Number.isFinite(amount) || amount < 1}
        >
          Apply
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[11px] text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      <AdminConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Grant ${amount} credits?`}
        description={`Add ${amount} credits to ${user.email}. This is logged as an admin action.`}
        confirmLabel="Grant credits"
        pending={pending}
        onConfirm={apply}
      />
    </>
  )
}

function UserDetailSheet({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUserRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!user) return null
  const plan = PLAN_STYLES[user.plan]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{user.displayName}</SheetTitle>
          <SheetDescription>{user.email}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt=""
                width={48}
                height={48}
                className="size-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <User className="size-5 text-muted-foreground" aria-hidden />
              </div>
            )}
            <div>
              <span
                className={cn(
                  'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  plan.className
                )}
              >
                {plan.label}
              </span>
              <p className="mt-1 text-xs text-muted-foreground">
                Status: {user.status} · Subscription: {user.subscriptionStatus}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-border p-3">
              <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Credits
              </dt>
              <dd className="mt-1 font-mono font-semibold tabular-nums">
                {user.creditsRemaining} / {user.creditsTotal}
              </dd>
            </div>
            <div className="rounded-xl border border-border p-3">
              <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Posts
              </dt>
              <dd className="mt-1 font-mono font-semibold tabular-nums">
                {user.postsCount}
              </dd>
            </div>
            <div className="rounded-xl border border-border p-3">
              <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Joined
              </dt>
              <dd className="mt-1 text-xs">
                {new Date(user.joinedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </dd>
            </div>
            <div className="rounded-xl border border-border p-3">
              <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Last active
              </dt>
              <dd className="mt-1 text-xs">
                {user.lastActiveAt
                  ? new Date(user.lastActiveAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                  : 'Never'}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-2">
            <CreditGrantControl user={user} />
            <PlanChangeControl user={user} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function AdminUsersTab({ stats }: { stats: AdminDashboardStats }) {
  const { q, plan, userId, setParams } = useAdminUrlState()

  // Safely derive props to state without triggering setState inside useEffect
  const [prevQ, setPrevQ] = useState(q)
  const [localQuery, setLocalQuery] = useState(q)
  if (q !== prevQ) {
    setPrevQ(q)
    setLocalQuery(q)
  }

  const [prevStatsUsers, setPrevStatsUsers] = useState(stats.users)
  const [rows, setRows] = useState<AdminUserRow[]>(stats.users)
  const [total, setTotal] = useState(stats.users.length)
  if (stats.users !== prevStatsUsers) {
    setPrevStatsUsers(stats.users)
    setRows(stats.users)
    setTotal(stats.users.length)
  }

  const [page, setPage] = useState(1)
  const [searching, startSearch] = useTransition()

  // Pure initial state calculation for pure rendering rules
  const [thirtyMinsAgo] = useState(() =>
    new Date(Date.now() - 30 * 60 * 1000).toISOString()
  )

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (localQuery !== q) setParams({ q: localQuery })
    }, 300)
    return () => window.clearTimeout(handle)
  }, [localQuery, q, setParams])

  useEffect(() => {
    startSearch(async () => {
      const result = await searchUsersAction({
        query: q,
        plan,
        page,
        pageSize: 25,
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      if (result.data) {
        setRows(result.data.users)
        setTotal(result.data.total)
      }
    })
  }, [q, plan, page])

  const onlineCount = rows.filter(
    (u) => u.lastActiveAt && u.lastActiveAt > thirtyMinsAgo
  ).length

  const selected =
    rows.find((u) => u.id === userId) ??
    stats.users.find((u) => u.id === userId) ??
    null

  const pageCount = Math.max(1, Math.ceil(total / 25))

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" aria-hidden />
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Users — {rows.length} shown · {total} matched
            </p>
            {onlineCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {onlineCount} active
              </span>
            ) : null}
            {searching ? (
              <Loader2
                className="size-3.5 animate-spin text-muted-foreground"
                aria-label="Searching"
              />
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1" role="group" aria-label="Filter by plan">
              {(['all', 'free', 'pro', 'team'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPage(1)
                    setParams({ plan: p })
                  }}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-colors',
                    plan === p
                      ? 'bg-sky-500 text-white'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Label htmlFor="admin-user-search" className="sr-only">
                Search users
              </Label>
              <input
                id="admin-user-search"
                type="search"
                name="admin-user-search"
                autoComplete="off"
                spellCheck={false}
                placeholder="Search email or name…"
                value={localQuery}
                onChange={(e) => {
                  setPage(1)
                  setLocalQuery(e.target.value)
                }}
                className="h-8 w-[200px] rounded-xl border border-border bg-background py-1 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
              />
            </div>
          </div>
        </div>

        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b border-border text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2.5 font-semibold">User</th>
                <th className="px-3 py-2.5 font-semibold">Plan</th>
                <th className="px-3 py-2.5 font-semibold">Credits</th>
                <th className="px-3 py-2.5 text-right font-semibold">Posts</th>
                <th className="px-3 py-2.5 text-right font-semibold">Last active</th>
                <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <ShieldAlert className="mx-auto mb-3 size-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No users match your filters.
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map((u) => {
                  const planCfg = PLAN_STYLES[u.plan] ?? PLAN_STYLES.free
                  const creditPct =
                    u.creditsTotal > 0
                      ? (u.creditsRemaining / u.creditsTotal) * 100
                      : 0
                  const isOnline = Boolean(
                    u.lastActiveAt && u.lastActiveAt > thirtyMinsAgo
                  )
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-border/70 transition-colors hover:bg-sky-500/[0.03]"
                    >
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setParams({ user: u.id })}
                          className="flex min-w-0 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
                        >
                          {u.avatarUrl ? (
                            <Image
                              src={u.avatarUrl}
                              alt=""
                              width={32}
                              height={32}
                              className="size-8 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                              <User
                                className="size-4 text-muted-foreground"
                                aria-hidden
                              />
                            </div>
                          )}
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-foreground">
                              {u.displayName}
                            </span>
                            <span className="block truncate text-[11px] text-muted-foreground">
                              {u.email}
                            </span>
                          </span>
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                            planCfg.className
                          )}
                        >
                          {planCfg.label}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="mb-1 flex justify-between font-mono text-[11px] tabular-nums text-muted-foreground">
                          <span>{u.creditsRemaining}</span>
                          <span>{u.creditsTotal}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              'h-full rounded-full transition-[width] duration-150',
                              creditPct > 60
                                ? 'bg-emerald-500'
                                : creditPct > 25
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                            )}
                            style={{ width: `${Math.max(1, creditPct)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-foreground">
                        {u.postsCount}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="inline-flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
                          {isOnline ? (
                            <span
                              className="size-1.5 rounded-full bg-emerald-500"
                              title="Active session"
                            />
                          ) : null}
                          {u.lastActiveAt
                            ? new Date(u.lastActiveAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })
                            : 'Never'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <CreditGrantControl user={u} />
                          <PlanChangeControl user={u} />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {pageCount > 1 ? (
          <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            <span>
              Page {page} of {pageCount}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="xs"
                disabled={page <= 1 || searching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                disabled={page >= pageCount || searching}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <UserDetailSheet
        user={selected}
        open={Boolean(userId)}
        onOpenChange={(open) => {
          if (!open) setParams({ user: null })
        }}
      />
    </div>
  )
}