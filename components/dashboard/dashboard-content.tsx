'use client'

<<<<<<< HEAD
import { motion, Variants } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  LayoutDashboard,
  Sparkles,
  Target,
  Briefcase,
  TrendingUp,
  CalendarDays,
  FileText,
  Link2,
  ArrowRight,
  Clock,
} from 'lucide-react'
import type { BusinessProfile } from '@/types/business-profile'
import { useState } from 'react'
import { OnboardingChecklist, type OnboardingState } from '@/components/dashboard/onboarding-checklist'
import { DashboardQuickLinks } from '@/components/dashboard/dashboard-quick-links'
import { useSocialConnections } from '@/components/dashboard/social-connections-provider'
import {
  getProfileCompleteness,
=======
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
>>>>>>> origin/development
  formatUpcomingDate,
  getPlannerDateParam,
  type DashboardStats,
} from '@/lib/dashboard-utils'
<<<<<<< HEAD
import { getStatusLabel, getStatusStyles } from '@/lib/post-utils'
import type { PostStatus } from '@/types/content'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 20 } },
}
=======
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
>>>>>>> origin/development

interface DashboardContentProps {
  profile: BusinessProfile | null
  stats: DashboardStats
<<<<<<< HEAD
}

export function DashboardContent({ profile, stats }: DashboardContentProps) {
  const router = useRouter()
  const { hasInstagram, isLoading: connectionsLoading } = useSocialConnections()
  const [prompt, setPrompt] = useState('')

  const businessName = profile?.business_name || 'Welcome'
  const industry = profile?.industry || null
  const targetAudience = profile?.target_customers || 'Not set'
  const currentStrategy = profile?.primary_goal || 'Not set'
  const activeChannels =
    profile?.channels?.length ? profile.channels.join(', ') : 'Not set'
  const profileCompleteness = getProfileCompleteness(profile)
  const isProfileComplete = profileCompleteness >= 80
=======
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
>>>>>>> origin/development

  const onboardingState: OnboardingState = {
    profileComplete: isProfileComplete,
    socialConnected: hasInstagram,
    contentGenerated: stats.plansCount > 0,
<<<<<<< HEAD
    firstPostCreated: stats.postsCount > 0,
    firstPostScheduled: stats.scheduledCount > 0,
  }

  const handleGenerateNavigate = () => {
    const q = prompt.trim()
    if (q) {
      router.push(`/dashboard/generate?prompt=${encodeURIComponent(q)}`)
    } else {
      router.push('/dashboard/generate')
    }
  }

  const connectedLabel = connectionsLoading
    ? 'Checking...'
    : hasInstagram
      ? 'Instagram linked'
      : 'Not connected'

  const metrics = [
    {
      label: 'Total Posts',
      value: stats.postsCount.toString(),
      badge:
        stats.postsCount === 0
          ? 'Create your first post'
          : `${stats.draftCount} draft${stats.draftCount === 1 ? '' : 's'}`,
      icon: FileText,
      href: '/dashboard/posts',
    },
    {
      label: 'Scheduled',
      value: stats.scheduledCount.toString(),
      badge:
        stats.scheduledThisWeek === 0
          ? 'Nothing this week'
          : `${stats.scheduledThisWeek} this week`,
      icon: CalendarDays,
      href: '/dashboard/calendar',
    },
    {
      label: 'Content Plans',
      value: stats.plansCount.toString(),
      badge: stats.plansCount > 0 ? 'Active plans' : 'Generate a plan',
      icon: LayoutDashboard,
      href: '/dashboard/generate',
    },
    {
      label: 'Instagram',
      value: hasInstagram ? 'Connected' : 'Setup',
      badge: connectedLabel,
      icon: Link2,
      href: '/dashboard/connections',
      valueClass: hasInstagram ? 'text-emerald-400' : 'text-zinc-900 dark:text-white',
=======
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
>>>>>>> origin/development
    },
  ]

  return (
<<<<<<< HEAD
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto px-6 py-10 relative z-10"
    >
      <motion.div variants={itemVariants}>
        <OnboardingChecklist state={onboardingState} />
      </motion.div>

      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-blue-400/80 mb-1">
              Dashboard
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900 dark:text-white">
              Hi, {businessName}
            </h1>
            <p className="text-zinc-500 dark:text-white/40 mt-1 text-sm">
              {stats.scheduledCount > 0
                ? `${stats.scheduledCount} post${stats.scheduledCount === 1 ? '' : 's'} scheduled Â· ${stats.publishedCount} published`
                : 'Plan, generate, and schedule your next posts.'}
            </p>
          </div>
          <Link
            href="/dashboard/generate"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-[0_0_24px_-6px_rgba(59,130,246,0.5)]"
          >
            <Sparkles className="w-4 h-4" />
            Generate content
          </Link>
        </div>

        <DashboardQuickLinks />
      </motion.div>

      <motion.div variants={itemVariants} className="mb-8">
        <Card className="bg-white dark:bg-white/4 border-zinc-200 backdrop-blur-2xl dark:border-white/8 text-zinc-900 dark:text-white shadow-2xl rounded-2xl overflow-hidden relative max-w-3xl group">
          <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 ml-1">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateNavigate()}
              placeholder="Describe what you want to post aboutâ€¦"
              className="flex-1 h-12 bg-transparent border-0 focus-visible:ring-0 text-zinc-900 placeholder:text-zinc-500 dark:text-white text-base shadow-none"
            />
            <Button
              onClick={handleGenerateNavigate}
              className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all font-bold tracking-wide shrink-0 gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Start
            </Button>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric) => (
          <motion.div variants={itemVariants} key={metric.label}>
            <Link href={metric.href} className="block h-full group">
              <Card className="h-full bg-white dark:bg-white/2 dark:hover:bg-white/4 border-zinc-200 backdrop-blur-xl dark:border-white/8 text-zinc-900 dark:text-white hover:bg-zinc-50 transition-colors shadow-xl rounded-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-[10px] font-medium text-zinc-500 dark:text-white/40 uppercase tracking-widest">
                    {metric.label}
                  </CardTitle>
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/6 border-zinc-200 flex items-center justify-center border dark:border-white/8">
                    <metric.icon className="h-4 w-4 text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 mt-1">
                  <div
                    className={`text-2xl font-mono font-bold tracking-tight ${metric.valueClass ?? 'text-zinc-900 dark:text-white'}`}
                  >
                    {metric.value}
                  </div>
                  <p className="text-[11px] inline-flex px-2 py-1 rounded-lg mt-2 font-medium border bg-blue-500/10 text-blue-400 border-blue-500/20">
                    {metric.badge}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full bg-white dark:bg-white/4 border-zinc-200 backdrop-blur-xl dark:border-white/8 text-zinc-900 dark:text-white shadow-xl rounded-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-medium text-zinc-500 dark:text-white/40 tracking-widest uppercase">
                    Upcoming in planner
                  </CardTitle>
                  <p className="text-sm text-zinc-500 dark:text-white/40 mt-1">
                    Next posts on your schedule
                  </p>
                </div>
                <Link
                  href="/dashboard/calendar"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  Open planner
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 space-y-2">
              {stats.upcomingPosts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-200 dark:border-white/10 px-5 py-8 text-center">
                  <Clock className="w-8 h-8 text-zinc-400 dark:text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500 dark:text-white/40">No upcoming posts scheduled</p>
                  <Link
                    href="/dashboard/calendar"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    Schedule in planner
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                stats.upcomingPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/dashboard/calendar?date=${getPlannerDateParam(post.scheduled_at)}`}
                    className="flex items-start gap-3 rounded-xl border border-zinc-200 dark:border-white/8 bg-white/50 dark:bg-white/2 px-4 py-3 hover:bg-blue-500/5 hover:border-blue-500/20 transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CalendarDays className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-2 group-hover/item:text-blue-100 transition-colors">
                        {post.content?.trim() || 'Untitled post'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="text-[11px] text-zinc-500 dark:text-white/40">
                          {formatUpcomingDate(post.scheduled_at)}
                        </span>
                        {post.platform && (
                          <span className="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-white/30">
                            {post.platform}
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getStatusStyles(post.status as PostStatus)}`}
                        >
                          {getStatusLabel(post.status as PostStatus)}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400 dark:text-white/20 shrink-0 mt-1 opacity-0 group-hover/item:opacity-60 transition-opacity" />
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full bg-white dark:bg-white/4 border-zinc-200 backdrop-blur-xl dark:border-white/8 text-zinc-900 dark:text-white shadow-xl rounded-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <CardHeader className="pb-4 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-medium text-zinc-500 dark:text-white/40 tracking-widest uppercase">
                    Business profile
                  </CardTitle>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-1 truncate">
                    {businessName}
                  </h2>
                </div>
                <div className="w-11 h-11 rounded-xl bg-white dark:bg-white/6 border-zinc-200 flex items-center justify-center border dark:border-white/8">
                  <Briefcase className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                {industry ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-white/40 text-xs">
                      <Briefcase className="w-3.5 h-3.5" />
                      Industry
                    </div>
                    <p className="font-medium text-zinc-900 dark:text-white text-sm line-clamp-2">
                      {industry}
                    </p>
                  </div>
                ) : null}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-white/40 text-xs">
                    <Target className="w-3.5 h-3.5" />
                    Target audience
                  </div>
                  <p className="font-medium text-zinc-900 dark:text-white text-sm line-clamp-2">
                    {targetAudience}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-white/40 text-xs">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Primary goal
                  </div>
                  <p className="font-medium text-blue-400 text-sm line-clamp-2">{currentStrategy}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-white/40 text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    Channels
                  </div>
                  <p className="font-medium text-zinc-900 dark:text-white text-sm line-clamp-2">
                    {activeChannels}
                  </p>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-white/6">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-zinc-500 dark:text-white/40">Profile completeness</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                    {profileCompleteness}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-white/8 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-blue-500 to-sky-400 transition-all"
                    style={{ width: `${profileCompleteness}%` }}
                  />
                </div>
                {profileCompleteness < 100 && (
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    Complete profile
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

    </motion.div>
=======
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
>>>>>>> origin/development
  )
}
