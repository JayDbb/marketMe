'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Plus,
  Image as ImageIcon,
  Clock,
  CalendarDays,
  CheckCircle2,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import type { Platform, Post } from '@/types/content'
import {
  CreatePostModal,
  type CreatePostPayload,
  type EditPostInitial,
} from '@/components/dashboard/calendar/create-post-modal'
import { approvePostAction, createPostAction, deletePostAction, schedulePostAction, updatePostAction } from '@/app/dashboard/posts/actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { toDatetimeLocalValue } from '@/lib/calendar-utils'
import {
  filterPostsBySearch,
  filterPostsByTab,
  formatPostDate,
  getPlannerDateParam,
  getStatusLabel,
  getStatusStyles,
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

  const handleCreatePost = useCallback(
    async (payload: CreatePostPayload) => {
      const result = await createPostAction({
        caption: payload.caption,
        platform: payload.platform,
        scheduledDate: payload.scheduled_date,
        imageFile: payload.file ?? null,
      })

      if (!result.success) {
        throw new Error(result.error ?? 'Failed to create post')
      }

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

      if (!result.success) {
        throw new Error(result.error ?? 'Failed to update post')
      }

      toast.success('Post updated')
      router.refresh()
      setIsModalOpen(false)
      setEditingPost(null)
    },
    [editingPost, router]
  )

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
      toast.success('Post approved')
      router.refresh()
    },
    [router]
  )

  const handleSchedulePost = useCallback(
    async (post: ListPost) => {
      const result = await schedulePostAction(String(post.post_id))
      if (!result.success) {
        toast.error(result.error ?? 'Failed to queue post')
        return
      }
      toast.success('Post queued for publishing')
      router.refresh()
    },
    [router]
  )

  const openCreateModal = () => {
    setEditingPost(null)
    setIsModalOpen(true)
  }

  const openEditModal = (post: ListPost) => {
    setEditingPost(post)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPost(null)
  }

  const editPostInitial: EditPostInitial | null = editingPost
    ? {
        postId: String(editingPost.post_id),
        caption: editingPost.caption,
        platform: (editingPost.social_account?.platform ?? 'instagram') as Platform,
        scheduled_date: editingPost.scheduledAt ?? editingPost.scheduled_date,
      }
    : null

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-6 py-10 relative z-10"
    >
      {loadError ? (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          {loadError}
        </div>
      ) : null}

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
          >
            <Plus className="w-4 h-4" />
            Create Post
          </Button>
        </div>
      </motion.div>

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

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
        editPost={editPostInitial}
        initialScheduledFor={
          editingPost?.scheduledAt
            ? toDatetimeLocalValue(new Date(editingPost.scheduledAt))
            : toDatetimeLocalValue(
                (() => {
                  const d = new Date()
                  d.setDate(d.getDate() + 1)
                  d.setHours(10, 0, 0, 0)
                  return d
                })()
              )
        }
      />
    </motion.div>
  )
}
