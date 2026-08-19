'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Plus,
  Clock,
  CalendarDays,
  CheckCircle2,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { Platform } from '@/types/content'
import {
  CreatePostModal,
  type CreatePostPayload,
  type EditPostInitial,
} from '@/components/dashboard/calendar/create-post-modal'
import { EventThumb } from '@/components/dashboard/calendar/calendar-post-event'
import {
  approvePostAction,
  bulkApprovePostsAction,
  bulkDeletePostsAction,
  createPostAction,
  deletePostAction,
  retryFailedPostAction,
  schedulePostAction,
  updatePostAction,
} from '@/app/dashboard/posts/actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { toDatetimeLocalValue } from '@/lib/calendar-utils'
import { getUserPreferencesAction } from '@/app/dashboard/settings/actions'
import { DEFAULT_PREFERENCES } from '@/lib/settings-utils'
import {
  POST_INBOX_TABS,
  POST_INBOX_PLATFORMS,
  emptyInboxCopy,
  formatPlatform,
  formatPostDate,
  getPlannerDateParam,
  getStatusLabel,
  getStatusStyles,
  type InboxPost,
  type PostInboxTab,
} from '@/lib/post-utils'
import type { PostsInboxCounts } from '@/lib/fetch-posts-inbox'
import { cn } from '@/lib/utils'
import { InlineNotice } from '@/components/ui/inline-notice'

const TAB_LABELS: Record<PostInboxTab, string> = {
  upcoming: 'Upcoming',
  drafts: 'Drafts',
  published: 'Published',
  failed: 'Failed',
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
}

interface PostsContentProps {
  posts: InboxPost[]
  counts: PostsInboxCounts
  total: number
  workspaceTotal: number
  page: number
  pageSize: number
  tab: PostInboxTab
  query: string
  platform: string
  loadError?: string | null
}

export function PostsContent({
  posts,
  counts,
  total,
  workspaceTotal,
  page,
  pageSize,
  tab,
  query,
  platform,
  loadError = null,
}: PostsContentProps) {
  const router = useRouter()
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<InboxPost | null>(null)
  const [searchValue, setSearchValue] = useState(query)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[] | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [timeZone, setTimeZone] = useState(DEFAULT_PREFERENCES.timezone)
  const [notice, setNotice] = useState<{
    tone: 'info' | 'success' | 'warning' | 'error'
    title: string
    description: string
  } | null>(null)

  useEffect(() => {
    const frame = setTimeout(() => setSearchValue(query), 0)
    return () => clearTimeout(frame)
  }, [query])

  useEffect(() => {
    void getUserPreferencesAction().then((prefs) => setTimeZone(prefs.timezone))
  }, [])

  useEffect(() => {
    const frame = setTimeout(() => setSelectedIds([]), 0)
    return () => clearTimeout(frame)
  }, [tab, platform, query, page])

  useEffect(() => {
    const frame = setTimeout(() => setNotice(null), 0)
    return () => clearTimeout(frame)
  }, [tab, platform, query, page])

  const hrefFor = useCallback(
    (next: {
      tab?: PostInboxTab
      q?: string
      platform?: string
      page?: number
    }) => {
      const params = new URLSearchParams()
      const nextTab = next.tab ?? tab
      const nextQ = (next.q ?? searchValue).trim()
      const nextPlatform = next.platform ?? platform
      const nextPage = next.page ?? 1
      if (nextTab !== 'upcoming') params.set('tab', nextTab)
      if (nextQ) params.set('q', nextQ)
      if (nextPlatform !== 'all') params.set('platform', nextPlatform)
      if (nextPage > 1) params.set('page', String(nextPage))
      const qs = params.toString()
      return qs ? `${pathname}?${qs}` : pathname
    },
    [pathname, platform, searchValue, tab]
  )

  useEffect(() => {
    const trimmed = searchValue.trim()
    if (trimmed === query) return
    const timer = window.setTimeout(() => {
      router.replace(hrefFor({ q: trimmed, page: 1 }), { scroll: false })
    }, 400)
    return () => window.clearTimeout(timer)
  }, [hrefFor, query, router, searchValue])

  const handleCreatePost = useCallback(
    async (payload: CreatePostPayload) => {
      const result = await createPostAction({
        caption: payload.caption,
        platform: payload.platform,
        scheduledDate: payload.scheduled_date,
        imageFile: payload.file ?? null,
      })
      if (!result.success) throw new Error(result.error ?? 'Failed to create post')
      router.refresh()
      setIsModalOpen(false)
      setEditingPost(null)
    },
    [router]
  )

  const handleUpdatePost = useCallback(
    async (payload: CreatePostPayload) => {
      if (!editingPost) return
      const result = await updatePostAction({
        postId: String(editingPost.post_id),
        caption: payload.caption,
        platform: payload.platform,
        scheduledDate: payload.scheduled_date,
        imageFile: payload.file ?? null,
      })
      if (!result.success) throw new Error(result.error ?? 'Failed to update post')
      router.refresh()
    },
    [editingPost, router]
  )

  const confirmDelete = useCallback(async () => {
    if (!pendingDeleteIds?.length) return
    setBulkBusy(true)
    const result = await bulkDeletePostsAction(pendingDeleteIds)
    setBulkBusy(false)
    setPendingDeleteIds(null)
    setSelectedIds([])
    if (!result.success && result.deleted === 0) {
      setNotice({
        tone: 'error',
        title: 'Delete failed',
        description: result.error ?? 'Try deleting again in a few moments.',
      })
      return
    }
    setNotice(null)
    toast.success(
      result.deleted === 1 ? 'Post deleted' : `${result.deleted} posts deleted`
    )
    router.refresh()
  }, [pendingDeleteIds, router])

  const handleApprove = useCallback(
    async (post: InboxPost) => {
      setBusyId(String(post.post_id))
      const result = await approvePostAction(String(post.post_id))
      setBusyId(null)
      if (!result.success) {
        const msg = result.error ?? 'Approval failed'
        setNotice({
          tone: 'error',
          title: 'Approval failed',
          description:
            msg.toLowerCase().includes('claim') || msg.toLowerCase().includes('moderation')
              ? `${msg} Edit the caption to remove restricted claims, then try again.`
              : msg,
        })
        return
      }
      setNotice(null)
      toast.success('Post approved')
      router.refresh()
    },
    [router]
  )

  const handleSchedule = useCallback(
    async (post: InboxPost) => {
      setBusyId(String(post.post_id))
      const result = await schedulePostAction(String(post.post_id))
      setBusyId(null)
      if (!result.success) {
        setNotice({
          tone: 'error',
          title: 'Could not queue post',
          description:
            result.error ?? 'Check the scheduled time and Instagram connection, then try again.',
        })
        return
      }
      setNotice(null)
      toast.success('Post queued for publishing')
      router.refresh()
    },
    [router]
  )

  const handleRetry = useCallback(
    async (post: InboxPost) => {
      setBusyId(String(post.post_id))
      const result = await retryFailedPostAction(String(post.post_id))
      setBusyId(null)
      if (!result.success) {
        setNotice({
          tone: 'error',
          title: 'Retry failed',
          description: result.error ?? 'Refresh the page and try the retry action again.',
        })
        return
      }
      setNotice({
        tone: 'info',
        title: 'Post moved',
        description: 'Retry only if this post is not already live on Instagram.',
      })
      toast.success(result.nextStatus === 'scheduled' ? 'Queued again' : 'Moved back to drafts')
      router.refresh()
    },
    [router]
  )

  const handleBulkApprove = useCallback(async () => {
    if (selectedIds.length === 0) return
    setBulkBusy(true)
    const result = await bulkApprovePostsAction(selectedIds)
    setBulkBusy(false)
    setSelectedIds([])
    if (result.approved === 0) {
      setNotice({
        tone: 'error',
        title: 'Bulk approval failed',
        description: result.error ?? 'Review the selected drafts and try again.',
      })
      return
    }
    setNotice(null)
    toast.success(
      result.approved === 1 ? 'Post approved' : `${result.approved} posts approved`
    )
    router.refresh()
  }, [router, selectedIds])

  const openCreateModal = () => {
    setEditingPost(null)
    setIsModalOpen(true)
  }

  const openEditModal = (post: InboxPost) => {
    setEditingPost(post)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPost(null)
  }

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const editPostInitial: EditPostInitial | null = editingPost
    ? {
        postId: String(editingPost.post_id),
        caption: editingPost.caption,
        platform: (editingPost.social_account?.platform ?? 'instagram') as Platform,
        scheduled_date: editingPost.scheduledAt ?? editingPost.scheduled_date,
      }
    : null

  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const empty = emptyInboxCopy(tab, workspaceTotal > 0, Boolean(query.trim()) || platform !== 'all')
  const showBulk = (tab === 'drafts' || tab === 'failed') && posts.length > 0
  const motionOff = Boolean(reduceMotion)

  return (
    <motion.div
      initial={motionOff ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative z-10 mx-auto w-full min-w-0 max-w-7xl px-6 py-10"
    >
      {notice ? (
        <InlineNotice
          tone={notice.tone}
          title={notice.title}
          description={notice.description}
          className="mb-6"
        />
      ) : null}

      {loadError ? (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {loadError}
        </div>
      ) : null}

      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-blue-400/80">
            Posts
          </p>
          <h1 className="text-pretty text-3xl font-bold tracking-tighter text-zinc-900 md:text-4xl dark:text-white">
            Work queue
          </h1>
          <p className="mt-1 max-w-lg text-sm text-zinc-500 dark:text-white/40">
            Drafts, failed publishes, and history. Timed placement stays on Calendar.
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <Link
            href="/dashboard/calendar"
            className="inline-flex h-10 items-center rounded-xl border border-zinc-200 px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
          >
            <CalendarDays className="mr-2 h-4 w-4" aria-hidden="true" />
            Open Calendar
          </Link>
          <Button
            onClick={openCreateModal}
            className="h-10 gap-2 rounded-xl bg-blue-600 px-5 font-semibold text-white hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create post
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="Post views"
          className="flex w-full gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-1 dark:border-white/10 dark:bg-white/5 lg:w-auto"
        >
          {POST_INBOX_TABS.map((id) => {
            const active = tab === id
            return (
              <Link
                key={id}
                role="tab"
                aria-selected={active}
                href={hrefFor({ tab: id, page: 1 })}
                className={cn(
                  'whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'border border-zinc-200 bg-white text-zinc-900 dark:border-white/5 dark:bg-white/10 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                )}
              >
                {TAB_LABELS[id]}
                <span className="ml-1.5 text-xs tabular-nums opacity-60">
                  ({counts[id]})
                </span>
              </Link>
            )
          })}
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
          <div className="flex gap-1 overflow-x-auto">
            {POST_INBOX_PLATFORMS.map((id) => {
              const active = platform === id || platform === 'all'
              return (
                <Link
                  key={id}
                  href={hrefFor({ platform: id, page: 1 })}
                  aria-pressed={active}
                  className={cn(
                    'whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                    active
                      ? 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                      : 'border-zinc-200 text-zinc-500 hover:border-blue-500/30 dark:border-white/10 dark:text-white/50'
                  )}
                >
                  {PLATFORM_LABELS[id]}
                </Link>
              )
            })}
          </div>
          <form
            className="relative w-full sm:w-72"
            onSubmit={(e) => {
              e.preventDefault()
              router.replace(hrefFor({ q: searchValue, page: 1 }), { scroll: false })
            }}
          >
            <label htmlFor="posts-search" className="sr-only">
              Search posts
            </label>
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-white/30"
              aria-hidden="true"
            />
            <Input
              id="posts-search"
              name="q"
              autoComplete="off"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search captions…"
              className="h-10 rounded-xl border-zinc-200 bg-white pl-10 shadow-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </form>
        </div>
      </div>

      {showBulk && selectedIds.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm dark:border-white/10 dark:bg-white/5">
          <span className="text-zinc-600 dark:text-white/60">
            {selectedIds.length} selected
          </span>
          {tab === 'drafts' ? (
            <Button
              type="button"
              size="sm"
              disabled={bulkBusy}
              onClick={() => void handleBulkApprove()}
              className="rounded-lg bg-blue-600 text-white hover:bg-blue-500"
            >
              Approve selected
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={bulkBusy}
            onClick={() => setPendingDeleteIds(selectedIds)}
          >
            Delete selected
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-white/2">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-white/5">
              <FileText className="h-7 w-7 text-zinc-400 dark:text-white/30" aria-hidden="true" />
            </div>
            <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-white">
              {empty.title}
            </h2>
            <p className="mb-6 max-w-sm text-sm text-zinc-500 dark:text-white/40">
              {empty.body}
            </p>
            {workspaceTotal === 0 ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/dashboard/generate"
                  className={buttonVariants({
                    className:
                      'h-10 gap-2 rounded-xl bg-blue-600 px-4 font-semibold text-white hover:bg-blue-500',
                  })}
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Generate this week
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  onClick={openCreateModal}
                  className="h-10 gap-2 rounded-xl"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Create post
                </Button>
              </div>
            ) : tab === 'drafts' || tab === 'upcoming' ? (
              <Link
                href="/dashboard/generate"
                className="text-sm font-medium text-blue-500 hover:text-blue-400"
              >
                Generate this week
              </Link>
            ) : null}
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-white/5">
            {posts.map((post) => {
              const id = String(post.post_id)
              const plannerDate = getPlannerDateParam(post.scheduledAt)
              const plannerHref = plannerDate
                ? `/dashboard/calendar?date=${plannerDate}`
                : '/dashboard/calendar'
              const selected = selectedIds.includes(id)
              const busy = busyId === id

              return (
                <li
                  key={id}
                  className="flex items-stretch gap-3 px-4 py-4 hover:bg-zinc-50 sm:px-6 dark:hover:bg-white/5"
                >
                  {showBulk ? (
                    <label className="flex items-center self-center">
                      <span className="sr-only">Select post</span>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleSelected(id)}
                        className="size-4 rounded border-zinc-300 accent-blue-600"
                      />
                    </label>
                  ) : null}

                  <button
                    type="button"
                    onClick={() =>
                      post.status === 'published'
                        ? router.push(plannerHref)
                        : openEditModal(post)
                    }
                    className="flex min-w-0 flex-1 items-start gap-4 rounded-xl text-left focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none"
                  >
                    <EventThumb
                      url={post.media_url}
                      className="size-20 rounded-xl border border-zinc-200 dark:border-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm leading-relaxed font-medium text-zinc-900 dark:text-white">
                        {post.caption || 'Untitled post'}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-white/45">
                        <span>{formatPlatform(post.social_account?.platform)}</span>
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 font-medium ${getStatusStyles(post.status)}`}
                        >
                          {getStatusLabel(post.status)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {formatPostDate(post.scheduledAt)}
                        </span>
                      </div>
                      {post.status === 'failed' ? (
                        <p className="mt-2 text-xs text-red-600 dark:text-red-300" role="status">
                          {post.errorMessage ||
                            'Publishing failed. Retry only if this post is not already live.'}
                        </p>
                      ) : null}
                    </div>
                  </button>

                  <div className="flex shrink-0 flex-col items-end justify-center gap-2 sm:flex-row sm:items-center">
                    {post.status === 'draft' ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={busy}
                        onClick={() => void handleApprove(post)}
                        className="h-9 rounded-lg bg-blue-600 px-3 text-white hover:bg-blue-500"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Approve
                      </Button>
                    ) : null}
                    {post.status === 'approved' ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={busy}
                        onClick={() => void handleSchedule(post)}
                        className="h-9 rounded-lg bg-blue-600 px-3 text-white hover:bg-blue-500"
                      >
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        Queue
                      </Button>
                    ) : null}
                    {post.status === 'failed' ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={busy}
                        onClick={() => void handleRetry(post)}
                        className="h-9 rounded-lg bg-blue-600 px-3 text-white hover:bg-blue-500"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        Retry
                      </Button>
                    ) : null}

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none dark:hover:bg-white/10 dark:hover:text-white"
                        aria-label="More post actions"
                      >
                        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {post.status !== 'published' ? (
                          <DropdownMenuItem onClick={() => openEditModal(post)}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem onClick={() => router.push(plannerHref)}>
                          <ExternalLink className="h-4 w-4" />
                          Open in calendar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setPendingDeleteIds([id])}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {total > pageSize ? (
        <div className="mt-4 flex items-center justify-between text-sm text-zinc-500 dark:text-white/45">
          <p className="tabular-nums">
            Page {page} of {pageCount}
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={hrefFor({ page: page - 1 })}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-200 px-3 font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/5"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </Link>
            ) : null}
            {page < pageCount ? (
              <Link
                href={hrefFor({ page: page + 1 })}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-200 px-3 font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/5"
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <Dialog
        open={pendingDeleteIds !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteIds(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingDeleteIds && pendingDeleteIds.length > 1
                ? `Delete ${pendingDeleteIds.length} posts?`
                : 'Delete this post?'}
            </DialogTitle>
            <DialogDescription>
              This cannot be undone. The post is removed from Calendar as well.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDeleteIds(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={bulkBusy}
              onClick={() => void confirmDelete()}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
        editPost={editPostInitial}
        initialScheduledFor={
          editingPost?.scheduledAt
            ? toDatetimeLocalValue(new Date(editingPost.scheduledAt), timeZone)
            : toDatetimeLocalValue(
                (() => {
                  const d = new Date()
                  d.setDate(d.getDate() + 1)
                  d.setHours(10, 0, 0, 0)
                  return d
                })(),
                timeZone
              )
        }
        timeZone={timeZone}
      />
    </motion.div>
  )
}
