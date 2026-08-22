'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sparkles,
  CalendarDays,
  FileText,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import type { BusinessProfile } from '@/types/business-profile'
import { OnboardingChecklist, type OnboardingState } from '@/components/dashboard/onboarding-checklist'
import { useSocialConnections } from '@/components/dashboard/social-connections-provider'
import { normalizeInstagramHandle } from '@/lib/social/oauth'
import {
  dashboardGreetingName,
  formatUpcomingDate,
  getPlannerDateParam,
  type DashboardStats,
} from '@/lib/dashboard-utils'
import { isProfileReadyForAI } from '@/lib/marketing-profile-prompt'
import { getStatusLabel, getStatusStyles } from '@/lib/post-utils'
import type { PostStatus } from '@/types/content'
import {
  getInstagramHealth,
  instagramHealthLabel,
  type InstagramHealth,
} from '@/lib/connection-utils'
import { cn } from '@/lib/utils'
import { InlineNotice } from '@/components/ui/inline-notice'

interface DashboardContentProps {
  profile: BusinessProfile | null
  stats: DashboardStats
  loadError?: string | null
}

function InstagramHealthChip({
  health,
  handle,
}: {
  health: InstagramHealth
  handle?: string | null
}) {
  const label =
    health === 'connected' && handle
      ? `@${handle}`
      : instagramHealthLabel(health)
  return (
    <Link
      href="/dashboard/connections"
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ui-transition hover:opacity-80',
        health === 'connected'
          ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          : health === 'saved_locally' || health === 'needs_reconnect'
            ? 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300'
            : 'border-border bg-muted text-muted-foreground'
      )}
    >
      {label}
    </Link>
  )
}

export function DashboardContent({
  profile,
  stats,
  loadError = null,
}: DashboardContentProps) {
  const {
    hasInstagram,
    isLoading: connectionsLoading,
    getConnection,
    source,
    warning,
    error,
  } = useSocialConnections()

  const greetingName = dashboardGreetingName(profile?.business_name)
  const isProfileComplete = isProfileReadyForAI(profile)
  const instagramConnection = getConnection('instagram')
  const instagramHandle = normalizeInstagramHandle(instagramConnection?.handle)
  const instagramHealth = getInstagramHealth({
    connection: instagramConnection ?? null,
    source,
    warning,
    error,
  })

  const onboardingState: OnboardingState = {
    profileComplete: isProfileComplete,
    socialConnected: hasInstagram,
    contentGenerated: stats.plansCount > 0,
    firstPostScheduled: stats.upcomingPosts.length > 0 || stats.scheduledThisWeek > 0,
  }

  const nextAction = connectionsLoading
    ? null
    : !hasInstagram
      ? {
          title: 'Connect Instagram',
          body: 'Link a Business or Creator account so you can publish and inbox.',
          href: '/dashboard/connections',
          cta: 'Connect Instagram',
        }
      : stats.upcomingPosts.length === 0
        ? {
            title: 'Generate your next posts',
            body: 'Create a plan, then schedule from Planner.',
            href: '/dashboard/generate',
            cta: 'Generate',
          }
        : null

  const showHeaderGenerate = !connectionsLoading && Boolean(hasInstagram) && stats.upcomingPosts.length > 0

  const subtitle =
    stats.upcomingPosts[0]
      ? `Next up ${formatUpcomingDate(stats.upcomingPosts[0].scheduled_at)}`
      : stats.draftCount > 0
        ? `${stats.draftCount} draft${stats.draftCount === 1 ? '' : 's'} ready to finish`
        : 'Connect Instagram, then generate your first posts.'

  const metrics = [
    {
      label: 'Scheduled this week',
      value: stats.scheduledThisWeek.toString(),
      href: '/dashboard/calendar',
      hero: true,
    },
    {
      label: 'Published this week',
      value: stats.publishedThisWeek.toString(),
      href: '/dashboard/posts?tab=published',
      hero: false,
    },
    {
      label: 'Drafts',
      value: stats.draftCount.toString(),
      href: '/dashboard/posts?tab=drafts',
      hero: false,
    },
  ]

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-widest text-accent-foreground">
                Home
              </p>
              {!connectionsLoading ? (
                <InstagramHealthChip health={instagramHealth} handle={instagramHandle} />
              ) : null}
            </div>
            <h1 className="text-pretty font-sans text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Hi, {greetingName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {showHeaderGenerate ? (
            <Link
              href="/dashboard/generate"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground ui-transition hover:bg-primary/80 active:scale-[0.97]"
            >
              <Sparkles className="size-4" />
              Generate
            </Link>
          ) : null}
        </div>
      </div>

      {loadError ? (
        <InlineNotice
          tone="warning"
          title="Dashboard data is partially unavailable"
          description={loadError}
          className="mb-6"
        />
      ) : null}

      {connectionsLoading ? (
        <div className="mb-6 h-18 rounded-2xl border border-border bg-card" aria-hidden />
      ) : nextAction ? (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{nextAction.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{nextAction.body}</p>
          </div>
          <Link
            href={nextAction.href}
            className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground ui-transition hover:bg-primary/80 active:scale-[0.97]"
          >
            {nextAction.cta}
          </Link>
        </div>
      ) : null}

      <OnboardingChecklist state={onboardingState} />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Link
            key={metric.label}
            href={metric.href}
            className={cn('group block h-full', metric.hero && 'sm:col-span-2')}
          >
            <Card className="relative h-full overflow-hidden rounded-2xl border-border bg-card text-card-foreground ui-transition hover:bg-muted/60">
              <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  {metric.label}
                </CardTitle>
                {metric.hero ? (
                  <CalendarDays className="size-4 text-accent-foreground" aria-hidden />
                ) : metric.label === 'Drafts' ? (
                  <FileText className="size-4 text-accent-foreground" aria-hidden />
                ) : (
                  <CheckCircle2 className="size-4 text-accent-foreground" aria-hidden />
                )}
              </CardHeader>
              <CardContent className="relative z-10 mt-1">
                <div
                  className={cn(
                    'font-mono font-bold tracking-tight text-foreground tabular-nums',
                    metric.hero ? 'text-3xl md:text-4xl' : 'text-2xl'
                  )}
                >
                  {metric.value}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div
        className={cn(
          'mb-10 grid grid-cols-1 gap-5',
          stats.recentDrafts.length > 0 ? 'lg:grid-cols-3' : 'lg:grid-cols-1'
        )}
      >
        <Card
          className={cn(
            'relative h-full overflow-hidden rounded-2xl border-border bg-card text-card-foreground',
            stats.recentDrafts.length > 0 && 'lg:col-span-2'
          )}
        >
          <CardHeader className="relative z-10 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Upcoming
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Next three scheduled posts</p>
              </div>
              <Link
                href="/dashboard/calendar"
                className="flex items-center gap-1 text-xs font-semibold text-accent-foreground hover:opacity-80"
              >
                Open planner
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 flex flex-col gap-2">
            {stats.upcomingPosts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-5 py-8 text-center">
                <Clock className="mx-auto mb-3 size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Nothing scheduled yet</p>
                <Link
                  href="/dashboard/generate"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-foreground hover:opacity-80"
                >
                  Generate posts
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            ) : (
              stats.upcomingPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/dashboard/calendar?date=${getPlannerDateParam(post.scheduled_at)}`}
                  className="group/item flex items-start gap-3 rounded-xl border border-border bg-background/50 px-4 py-3 ui-transition hover:border-primary/20 hover:bg-primary/5"
                >
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                    <CalendarDays className="size-4 text-accent-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-foreground">
                      {post.content?.trim() || 'Untitled post'}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        {formatUpcomingDate(post.scheduled_at)}
                      </span>
                      {post.platform ? (
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {post.platform}
                        </span>
                      ) : null}
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${getStatusStyles(post.status as PostStatus)}`}
                      >
                        {getStatusLabel(post.status as PostStatus)}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground opacity-0 ui-transition group-hover/item:opacity-60" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {stats.recentDrafts.length > 0 ? (
          <Card className="relative h-full overflow-hidden rounded-2xl border-border bg-card text-card-foreground">
            <CardHeader className="relative z-10 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Drafts
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">Pick one back up</p>
                </div>
                <Link
                  href="/dashboard/posts?tab=drafts"
                  className="flex items-center gap-1 text-xs font-semibold text-accent-foreground hover:opacity-80"
                >
                  View all
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 flex flex-col gap-2">
              {stats.recentDrafts.map((draft) => (
                <Link
                  key={draft.id}
                  href="/dashboard/posts?tab=drafts"
                  className="flex items-start gap-3 rounded-xl border border-border bg-background/50 px-4 py-3 ui-transition hover:border-primary/20 hover:bg-primary/5"
                >
                  <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-foreground">
                      {draft.content?.trim() || 'Untitled draft'}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {draft.platform ? (
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {draft.platform}
                        </span>
                      ) : null}
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${getStatusStyles(draft.status as PostStatus)}`}
                      >
                        {getStatusLabel(draft.status as PostStatus)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
