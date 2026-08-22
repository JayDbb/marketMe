'use client'

<<<<<<< HEAD
import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
=======
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { Button, buttonVariants } from '@/components/ui/button'
>>>>>>> origin/development
import { Input } from '@/components/ui/input'
import {
  Search,
  Plus,
<<<<<<< HEAD
  Image as ImageIcon,
=======
>>>>>>> origin/development
  Clock,
  CalendarDays,
  CheckCircle2,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
<<<<<<< HEAD
} from 'lucide-react'
import type { Platform, Post } from '@/types/content'
=======
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { Platform } from '@/types/content'
>>>>>>> origin/development
import {
  CreatePostModal,
  type CreatePostPayload,
  type EditPostInitial,
} from '@/components/dashboard/calendar/create-post-modal'
<<<<<<< HEAD
import { approvePostAction, createPostAction, deletePostAction, schedulePostAction, updatePostAction } from '@/app/dashboard/posts/actions'
=======
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
>>>>>>> origin/development
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
<<<<<<< HEAD
import { toast } from 'sonner'
import { toDatetimeLocalValue } from '@/lib/calendar-utils'
import {
  filterPostsBySearch,
  filterPostsByTab,
=======
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
>>>>>>> origin/development
  formatPostDate,
  getPlannerDateParam,
  getStatusLabel,
  getStatusStyles,
<<<<<<< HEAD
  mapDbRowToPost,
  sortPostsForList,
  type PostFilterTab,
} from '@/lib/post-utils'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
}

const TABS: { id: PostFilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Draft' },
  { id: 'approved', label: 'Approved' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'published', label: 'Published' },
  { id: 'failed', label: 'Failed' },
]

type DbPostRow = Record<string, unknown>

type ListPost = Post & {
  scheduledAt: string | null
}

function mapRowsToListPosts(rows: DbPostRow[]): ListPost[] {
  return rows
    .map((row) => {
      const post = mapDbRowToPost(row)
      if (!post) return null
      return {
        ...post,
        scheduledAt: (row.scheduled_at as string | null) ?? null,
      }
    })
    .filter((p): p is ListPost => p !== null)
}

function formatPlatform(platform?: string): string {
  if (!platform) return 'Social'
  const p = platform.toLowerCase()
  if (p === 'twitter') return 'X / Twitter'
  if (p === 'linkedin') return 'LinkedIn'
  if (p === 'instagram') return 'Instagram'
  return platform.charAt(0).toUpperCase() + platform.slice(1)
}

interface PostsContentProps {
  initialPosts?: DbPostRow[]
  loadError?: string | null
}

export function PostsContent({ initialPosts = [], loadError = null }: PostsContentProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<ListPost | null>(null)
  const [activeTab, setActiveTab] = useState<PostFilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const posts = useMemo(() => mapRowsToListPosts(initialPosts), [initialPosts])

  const sortedPosts = useMemo(() => sortPostsForList(posts), [posts])

  const tabCounts = useMemo(() => {
    const counts: Record<PostFilterTab, number> = {
      all: posts.length,
      scheduled: 0,
      published: 0,
      draft: 0,
      approved: 0,
      failed: 0,
    }
    for (const post of posts) {
      if (post.status === 'scheduled') counts.scheduled++
      else if (post.status === 'published') counts.published++
      else if (post.status === 'draft') counts.draft++
      else if (post.status === 'approved') counts.approved++
      else if (post.status === 'failed') counts.failed++
    }
    return counts
  }, [posts])

  const filteredPosts = useMemo((): ListPost[] => {
    const byTab = filterPostsByTab(sortedPosts, activeTab)
    return filterPostsBySearch(byTab, searchQuery) as ListPost[]
  }, [sortedPosts, activeTab, searchQuery])
=======
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
>>>>>>> origin/development

  const handleCreatePost = useCallback(
    async (payload: CreatePostPayload) => {
      const result = await createPostAction({
        caption: payload.caption,
        platform: payload.platform,
        scheduledDate: payload.scheduled_date,
        imageFile: payload.file ?? null,
      })
<<<<<<< HEAD

      if (!result.success) {
        throw new Error(result.error ?? 'Failed to create post')
      }

=======
      if (!result.success) throw new Error(result.error ?? 'Failed to create post')
>>>>>>> origin/development
      router.refresh()
      setIsModalOpen(false)
      setEditingPost(null)
    },
    [router]
  )

  const handleUpdatePost = useCallback(
    async (payload: CreatePostPayload) => {
      if (!editingPost) return
<<<<<<< HEAD

=======
>>>>>>> origin/development
      const result = await updatePostAction({
        postId: String(editingPost.post_id),
        caption: payload.caption,
        platform: payload.platform,
        scheduledDate: payload.scheduled_date,
        imageFile: payload.file ?? null,
      })
<<<<<<< HEAD

      if (!result.success) {
        throw new Error(result.error ?? 'Failed to update post')
      }

      toast.success('Post updated')
      router.refresh()
      setIsModalOpen(false)
      setEditingPost(null)
=======
      if (!result.success) throw new Error(result.error ?? 'Failed to update post')
      router.refresh()
>>>>>>> origin/development
    },
    [editingPost, router]
  )

<<<<<<< HEAD
  const handleDeletePost = useCallback(
    async (post: ListPost) => {
      if (!window.confirm('Delete this post? This cannot be undone.')) return

      const result = await deletePostAction(String(post.post_id))
      if (!result.success) {
        toast.error(result.error ?? 'Failed to delete post')
        return
      }

      toast.success('Post deleted')
      router.refresh()
    },
    [router]
  )

  const handleApprovePost = useCallback(
    async (post: ListPost) => {
      const result = await approvePostAction(String(post.post_id))
      if (!result.success) {
        const msg = result.error ?? 'Approval failed'
        toast.error(msg, {
          description: msg.toLowerCase().includes('claim') || msg.toLowerCase().includes('moderation')
            ? 'Edit the caption to remove restricted claims, then try again.'
            : undefined,
        })
        return
      }
=======
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
>>>>>>> origin/development
      toast.success('Post approved')
      router.refresh()
    },
    [router]
  )

<<<<<<< HEAD
  const handleSchedulePost = useCallback(
    async (post: ListPost) => {
      const result = await schedulePostAction(String(post.post_id))
      if (!result.success) {
        toast.error(result.error ?? 'Failed to queue post')
        return
      }
=======
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
>>>>>>> origin/development
      toast.success('Post queued for publishing')
      router.refresh()
    },
    [router]
  )

<<<<<<< HEAD
=======
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

>>>>>>> origin/development
  const openCreateModal = () => {
    setEditingPost(null)
    setIsModalOpen(true)
  }

<<<<<<< HEAD
  const openEditModal = (post: ListPost) => {
=======
  const openEditModal = (post: InboxPost) => {
>>>>>>> origin/development
    setEditingPost(post)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPost(null)
  }

<<<<<<< HEAD
=======
  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

>>>>>>> origin/development
  const editPostInitial: EditPostInitial | null = editingPost
    ? {
        postId: String(editingPost.post_id),
        caption: editingPost.caption,
        platform: (editingPost.social_account?.platform ?? 'instagram') as Platform,
        scheduled_date: editingPost.scheduledAt ?? editingPost.scheduled_date,
      }
    : null
<<<<<<< HEAD

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-6 py-10 relative z-10"
    >
=======

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

>>>>>>> origin/development
      {loadError ? (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {loadError}
        </div>
      ) : null}

<<<<<<< HEAD
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900 dark:text-white">
            Posts
          </h1>
          <p className="text-zinc-500 dark:text-white/40 mt-2 text-base">
            {posts.length > 0
              ? `${posts.length} post${posts.length === 1 ? '' : 's'} in your workspace`
              : 'Schedule and manage content from one place.'}
          </p>
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          <Link
            href="/dashboard/calendar"
            className="inline-flex h-10 items-center px-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-transparent text-sm font-medium text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            Open Planner
          </Link>
          <Button
            onClick={openCreateModal}
            className="h-10 px-5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all gap-2"
=======
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
>>>>>>> origin/development
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

<<<<<<< HEAD
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
      >
        <div className="flex items-center gap-2 bg-white dark:bg-white/5 border-zinc-200 p-1 rounded-xl border dark:border-white/10 w-full sm:w-auto overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-white/10 border-zinc-200 text-zinc-900 dark:text-white shadow-sm border dark:border-white/5'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-60">({tabCounts[tab.id]})</span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-white/30" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="pl-10 h-10 bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/50 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-white/25 rounded-xl transition-all shadow-none"
          />
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/2 overflow-hidden"
      >
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-zinc-400 dark:text-white/30" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
              {posts.length === 0 ? 'No posts yet' : 'No posts match this filter'}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-white/40 max-w-sm mb-6">
              {posts.length === 0
                ? 'Create your first post here or schedule one from the Planner.'
                : 'Try a different tab or clear your search.'}
            </p>
            {posts.length === 0 && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button onClick={openCreateModal} className="rounded-xl gap-2">
                  <Plus className="w-4 h-4" />
                  Create Post
                </Button>
                <Link
                  href="/dashboard/calendar"
                  className="inline-flex h-10 items-center px-4 rounded-xl border border-zinc-200 dark:border-white/10 text-sm font-medium text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"
                >
                  Open Planner
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 text-xs font-bold text-zinc-500 dark:text-white/40 uppercase tracking-wider px-6 py-4 border-b border-zinc-200 dark:border-white/5 bg-white dark:bg-white/5">
              <div className="col-span-5 md:col-span-4">Content</div>
              <div className="hidden md:block col-span-2">Platform</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3 md:col-span-2">Schedule</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-white/5">
              {filteredPosts.map((post) => {
                const plannerDate = getPlannerDateParam(post.scheduledAt)
                const plannerHref = plannerDate
                  ? `/dashboard/calendar?date=${plannerDate}`
                  : '/dashboard/calendar'

                return (
                  <div
                    key={String(post.post_id)}
                    className="grid grid-cols-12 items-center px-6 py-5 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <div className="col-span-5 md:col-span-4 pr-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {post.media_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={post.media_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-zinc-500 dark:text-white/40" />
                          )}
                        </div>
                        <p className="text-sm text-zinc-900 dark:text-white font-medium line-clamp-2 leading-relaxed">
                          {post.caption || 'Untitled post'}
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:block col-span-2">
                      <span className="text-sm text-zinc-500 dark:text-white/70">
                        {formatPlatform(post.social_account?.platform)}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusStyles(post.status)}`}
                      >
                        {getStatusLabel(post.status)}
                      </span>
                    </div>

                    <div className="col-span-3 md:col-span-2">
                      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-white/60">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{formatPostDate(post.scheduledAt)}</span>
                      </div>
                    </div>

                    <div className="col-span-2 flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                          aria-label="Post actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => openEditModal(post)}>
                            <Pencil className="w-4 h-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(plannerHref)}>
                            <ExternalLink className="w-4 h-4" />
                            Open in planner
                          </DropdownMenuItem>
                          {post.status === 'draft' && (
                            <DropdownMenuItem onClick={() => void handleApprovePost(post)}>
                              <CheckCircle2 className="w-4 h-4" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          {post.status === 'approved' && (
                            <DropdownMenuItem onClick={() => void handleSchedulePost(post)}>
                              <Clock className="w-4 h-4" />
                              Queue for publish
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => void handleDeletePost(post)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </motion.div>

=======
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="Post views"
          className="flex w-full gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-1 dark:border-white/10 dark:bg-[#161b22] lg:w-auto"
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
              className="h-10 rounded-xl border-zinc-200 bg-white pl-10 shadow-none dark:border-white/10 dark:bg-[#161b22] dark:text-white"
            />
          </form>
        </div>
      </div>

      {showBulk && selectedIds.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm dark:border-white/10 dark:bg-[#161b22]">
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

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#161b22]">
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

>>>>>>> origin/development
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
        editPost={editPostInitial}
        initialScheduledFor={
          editingPost?.scheduledAt
<<<<<<< HEAD
            ? toDatetimeLocalValue(new Date(editingPost.scheduledAt))
=======
            ? toDatetimeLocalValue(new Date(editingPost.scheduledAt), timeZone)
>>>>>>> origin/development
            : toDatetimeLocalValue(
                (() => {
                  const d = new Date()
                  d.setDate(d.getDate() + 1)
                  d.setHours(10, 0, 0, 0)
                  return d
<<<<<<< HEAD
                })()
              )
        }
=======
                })(),
                timeZone
              )
        }
        timeZone={timeZone}
>>>>>>> origin/development
      />
    </motion.div>
  )
}
