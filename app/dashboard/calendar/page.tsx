"use client";

import {
  approveCalendarPostAction,
  createCalendarPostAction,
  getPostsAction,
  rescheduleCalendarPostAction,
  scheduleCalendarPostAction,
  updateCalendarPostAction,
} from "@/app/dashboard/calendar/actions";
import { publishPostNowAction } from "@/app/dashboard/posts/actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  canReschedulePost,
  formatDateParam,
  getHeaderTitle,
  parseDateParam,
  parsePlannerView,
  plannerViewToParam,
  toDatetimeLocalValue,
  type PlannerViewMode,
} from "@/lib/calendar-utils";
import { POST_INBOX_PLATFORMS, parsePostsPlatform } from "@/lib/post-utils";
import { Post, type Platform } from "@/types/content";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { getUserPreferencesAction } from "@/app/dashboard/settings/actions";
import { CalendarSidebar } from "@/components/dashboard/calendar/calendar-sidebar";
import {
  CreatePostModal,
  type CreatePostPayload,
  type EditPostInitial,
} from "@/components/dashboard/calendar/create-post-modal";
import { DayView } from "@/components/dashboard/calendar/views/day-view";
import { MonthView } from "@/components/dashboard/calendar/views/month-view";
import { WeekView } from "@/components/dashboard/calendar/views/week-view";
import { DEFAULT_PREFERENCES, formatTimezoneLabel, getZonedParts } from "@/lib/settings-utils";
import type { WeekStartsOn } from "@/types/settings";
import { cn } from "@/lib/utils";

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
};

function PlannerSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-4">
      <div className="flex gap-2 pl-[52px]">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-16 flex-1 rounded-xl" />
        ))}
      </div>
      <div className="min-h-0 flex-1 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function matchesPlatform(post: Post, platform: string) {
  if (platform === "all") return true;
  return (post.social_account?.platform ?? "").toLowerCase() === platform;
}

function CalendarPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const viewMode = parsePlannerView(
    searchParams.get("view"),
    searchParams.get("date"),
  );
  const selectedDate =
    parseDateParam(searchParams.get("date")) ??
    (() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    })();
  const platform = parsePostsPlatform(searchParams.get("platform"));

  // Phones default to Day when the URL has no explicit view (Week grids are cramped).
  useEffect(() => {
    if (searchParams.get("view") || searchParams.get("date")) return;
    if (typeof window === "undefined" || window.innerWidth >= 768) return;
    if (viewMode === "Day") return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "day");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams, viewMode]);

  const [posts, setPosts] = useState<Post[]>([]);
  const [undatedDrafts, setUndatedDrafts] = useState<Post[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalScheduledFor, setModalScheduledFor] = useState<
    string | undefined
  >();
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [weekStartsOn, setWeekStartsOn] = useState<WeekStartsOn>(
    DEFAULT_PREFERENCES.weekStartsOn,
  );
  const [timeZone, setTimeZone] = useState(DEFAULT_PREFERENCES.timezone);
  const [selectedPostId, setSelectedPostId] = useState<string | number | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);

  const setPlannerQuery = useCallback(
    (next: {
      view?: PlannerViewMode;
      date?: Date;
      platform?: string;
    }) => {
      const params = new URLSearchParams();
      const nextView = next.view ?? viewMode;
      const nextDate = next.date ?? selectedDate;
      const nextPlatform = next.platform ?? platform;
      params.set("view", plannerViewToParam(nextView));
      params.set("date", formatDateParam(nextDate));
      if (nextPlatform !== "all") params.set("platform", nextPlatform);
      const href = `${pathname}?${params.toString()}`;
      const current = searchParams.toString();
      if (href !== `${pathname}?${current}`) {
        router.replace(href, { scroll: false });
      }
    },
    [pathname, platform, router, searchParams, selectedDate, viewMode],
  );

  const loadPosts = useCallback(async () => {
    const { posts: data, undatedDrafts: drafts, error } = await getPostsAction();
    setPosts(data);
    setUndatedDrafts(drafts);
    setLoadError(error);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    startTransition(() => {
      void loadPosts();
      void getUserPreferencesAction().then((prefs) => {
        setWeekStartsOn(prefs.weekStartsOn);
        setTimeZone(prefs.timezone);
      });
    });
  }, [loadPosts]);

  const visiblePosts = useMemo(
    () => posts.filter((post) => matchesPlatform(post, platform)),
    [platform, posts],
  );
  const visibleDrafts = useMemo(
    () => undatedDrafts.filter((post) => matchesPlatform(post, platform)),
    [platform, undatedDrafts],
  );

  const handlePrev = () => {
    const d = new Date(selectedDate);
    if (viewMode === "Month") d.setMonth(d.getMonth() - 1);
    else if (viewMode === "Week") d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setPlannerQuery({ date: d });
  };

  const handleNext = () => {
    const d = new Date(selectedDate);
    if (viewMode === "Month") d.setMonth(d.getMonth() + 1);
    else if (viewMode === "Week") d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setPlannerQuery({ date: d });
  };

  const handleToday = () => {
    const p = getZonedParts(new Date(), timeZone);
    const d = new Date(p.year, p.month - 1, p.day);
    d.setHours(0, 0, 0, 0);
    setPlannerQuery({ date: d });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedPostId((prev) => {
      if (prev == null) return null;
      const stillOnDay = visiblePosts.some(
        (p) =>
          p.post_id === prev &&
          new Date(p.scheduled_date).toDateString() === date.toDateString(),
      );
      return stillOnDay ? prev : null;
    });
    setPlannerQuery({ date });
  };

  const handlePostSelect = (post: Post) => {
    setSelectedPostId(post.post_id);
    const scheduled = post.scheduled_date
      ? new Date(post.scheduled_date)
      : null;
    if (scheduled && !Number.isNaN(scheduled.getTime()) && post.scheduled_date) {
      setPlannerQuery({ date: scheduled });
    }
  };

  const openCreateModal = (date?: Date) => {
    setEditingPost(null);
    if (date) {
      setModalScheduledFor(toDatetimeLocalValue(date, timeZone));
      setPlannerQuery({ date });
    } else {
      const defaultDate = new Date(selectedDate);
      defaultDate.setHours(10, 0, 0, 0);
      if (defaultDate < new Date()) {
        defaultDate.setDate(defaultDate.getDate() + 1);
      }
      setModalScheduledFor(toDatetimeLocalValue(defaultDate, timeZone));
    }
    setIsModalOpen(true);
  };

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    const scheduled = post.scheduled_date
      ? new Date(post.scheduled_date)
      : new Date(selectedDate);
    if (Number.isNaN(scheduled.getTime())) {
      const fallback = new Date(selectedDate);
      fallback.setHours(10, 0, 0, 0);
      setModalScheduledFor(toDatetimeLocalValue(fallback, timeZone));
    } else {
      setModalScheduledFor(toDatetimeLocalValue(scheduled, timeZone));
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const handleCreatePost = async (post: CreatePostPayload) => {
    const result = await createCalendarPostAction({
      caption: post.caption,
      platform: post.platform,
      scheduledDate: post.scheduled_date,
      imageFile: post.file ?? null,
    });

    if (!result.success) {
      throw new Error(result.error ?? "Failed to create post");
    }

    if (result.postId) {
      const scheduleResult = await scheduleCalendarPostAction(result.postId);
      if (!scheduleResult.success) {
        throw new Error(
          scheduleResult.error ?? "Post saved but could not be queued for publish",
        );
      }
    }

    const scheduledDay = new Date(post.scheduled_date);
    setPlannerQuery({ date: scheduledDay });
    void loadPosts();
  };

  const handleUpdatePost = async (post: CreatePostPayload) => {
    if (!editingPost) return;

    const result = await updateCalendarPostAction({
      postId: String(editingPost.post_id),
      caption: post.caption,
      platform: post.platform,
      scheduledDate: post.scheduled_date,
      imageFile: post.file ?? null,
    });

    if (!result.success) {
      throw new Error(result.error ?? "Failed to update post");
    }

    const scheduledDay = new Date(post.scheduled_date);
    setPlannerQuery({ date: scheduledDay });
    void loadPosts();
  };

  const handleApprovePost = async (postId: string) => {
    const result = await approveCalendarPostAction(postId);
    if (result.success) {
      toast.success("Post approved");
      await loadPosts();
    }
    return result;
  };

  const handleSchedulePost = async (postId: string) => {
    const result = await scheduleCalendarPostAction(postId);
    if (result.success) {
      toast.success("Post queued for publishing");
      await loadPosts();
    }
    return result;
  };

  const handlePublishNow = async (postId: string) => {
    const result = await publishPostNowAction(postId);
    if (result.success) {
      toast.success("Published to Instagram");
      await loadPosts();
      setSelectedPostId(null);
    } else {
      toast.error(result.error ?? "Could not publish");
    }
    return result;
  };

  const handleReschedule = async (postId: string, next: Date) => {
    const source =
      posts.find((p) => String(p.post_id) === postId) ??
      undatedDrafts.find((p) => String(p.post_id) === postId);
    if (!source) return;
    if (!canReschedulePost(source)) {
      toast.error("Published posts cannot be moved");
      return;
    }

    const nextIso = next.toISOString();
    setPosts((prev) => {
      const exists = prev.some((p) => String(p.post_id) === postId);
      if (exists) {
        return prev.map((p) =>
          String(p.post_id) === postId ? { ...p, scheduled_date: nextIso } : p,
        );
      }
      return [...prev, { ...source, scheduled_date: nextIso }];
    });
    setUndatedDrafts((prev) =>
      prev.filter((p) => String(p.post_id) !== postId),
    );
    setPlannerQuery({ date: next });

    const result = await rescheduleCalendarPostAction({
      postId,
      scheduledDate: nextIso,
    });

    if (!result.success) {
      toast.error(result.error ?? "Could not reschedule");
      await loadPosts();
      return;
    }

    toast.success(
      `Moved to ${next.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone,
      })}`,
    );
  };

  const editPostInitial: EditPostInitial | null = editingPost
    ? {
        postId: String(editingPost.post_id),
        caption: editingPost.caption,
        platform: (editingPost.social_account?.platform ??
          "instagram") as Platform,
        scheduled_date: editingPost.scheduled_date,
      }
    : null;

  const sidebar = (
    <CalendarSidebar
      selectedDate={selectedDate}
      onDateChange={handleDateSelect}
      posts={visiblePosts}
      undatedDrafts={visibleDrafts}
      selectedPostId={selectedPostId}
      onPostSelect={handlePostSelect}
      onCreatePost={() => openCreateModal()}
      onEditPost={openEditModal}
      onApprovePost={handleApprovePost}
      onSchedulePost={handleSchedulePost}
      onPublishNow={handlePublishNow}
      onClearSelection={() => setSelectedPostId(null)}
      onPostsUpdated={() => void loadPosts()}
      viewMode={viewMode}
      weekStartsOn={weekStartsOn}
      timeZone={timeZone}
    />
  );

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 w-full gap-4 overflow-hidden p-2 sm:p-4 lg:gap-6 lg:p-6">
      <div className="hidden h-full lg:flex">{sidebar}</div>

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl sm:rounded-[2rem] dark:border-white/10 dark:bg-[#161b22]">
        <div className="flex shrink-0 flex-col gap-2 border-b border-zinc-200 px-3 py-3 sm:gap-3 sm:px-5 sm:py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-8 lg:py-5 dark:border-white/5">
          <div className="min-w-0 lg:flex-1 lg:pr-4">
            <p className="mb-0.5 hidden text-[10px] font-bold tracking-widest text-blue-500 uppercase sm:block dark:text-blue-400">
              Planner
            </p>
            <h2 className="truncate text-lg font-bold tracking-tight text-zinc-900 sm:text-2xl lg:text-3xl dark:text-white">
              {getHeaderTitle(selectedDate, viewMode, weekStartsOn)}
            </h2>
            <p className="mt-0.5 hidden truncate text-[11px] text-muted-foreground sm:mt-1 sm:block sm:text-xs">
              Times in {formatTimezoneLabel(timeZone)}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:gap-3">
            <div className="flex w-full flex-wrap items-center gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 min-h-11 flex-1 rounded-xl border-zinc-200 sm:flex-none lg:hidden dark:border-white/10"
                onClick={() => setDetailsOpen(true)}
              >
                <CalendarDays className="h-4 w-4" />
                <span className="sm:inline">Details</span>
              </Button>
              <Button
                onClick={() => openCreateModal()}
                className="h-11 min-h-11 flex-1 gap-2 rounded-xl border-0 bg-blue-600 px-4 font-bold text-white hover:bg-blue-500 sm:flex-none sm:px-5"
              >
                <Plus className="h-4 w-4" /> Create
              </Button>
            </div>

            <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
              <SheetContent
                side="left"
                className="w-[min(22rem,90vw)] border-border bg-[#161b22] p-0 sm:max-w-none"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>Planner details</SheetTitle>
                </SheetHeader>
                <CalendarSidebar
                  className="h-full w-full rounded-none border-0"
                  selectedDate={selectedDate}
                  onDateChange={(date) => {
                    handleDateSelect(date);
                  }}
                  posts={visiblePosts}
                  undatedDrafts={visibleDrafts}
                  selectedPostId={selectedPostId}
                  onPostSelect={handlePostSelect}
                  onCreatePost={() => {
                    setDetailsOpen(false);
                    openCreateModal();
                  }}
                  onEditPost={(post) => {
                    setDetailsOpen(false);
                    openEditModal(post);
                  }}
                  onApprovePost={handleApprovePost}
                  onSchedulePost={handleSchedulePost}
                  onPublishNow={handlePublishNow}
                  onClearSelection={() => setSelectedPostId(null)}
                  onPostsUpdated={() => void loadPosts()}
                  viewMode={viewMode}
                  weekStartsOn={weekStartsOn}
                  timeZone={timeZone}
                />
              </SheetContent>
            </Sheet>

            <div className="flex w-full flex-col gap-2 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between">
              <div className="grid w-full grid-cols-3 gap-1 rounded-xl border border-zinc-200 bg-white p-1 min-[480px]:w-auto dark:border-white/10 dark:bg-white/5">
                {(["Month", "Week", "Day"] as PlannerViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPlannerQuery({ view: mode })}
                    className={`min-h-11 rounded-lg px-3 text-sm font-bold ui-transition ${
                      viewMode === mode
                        ? "bg-white text-zinc-900 shadow-lg dark:bg-white"
                        : "text-zinc-500 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous"
                  className="flex size-11 min-h-11 min-w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/5 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleToday}
                  className="min-h-11 flex-1 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-100 min-[480px]:flex-none dark:border-white/5 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next"
                  className="flex size-11 min-h-11 min-w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/5 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex shrink-0 gap-1 overflow-x-auto px-3 py-2 sm:px-5 sm:py-3 lg:px-8"
          aria-label="Filter by channel"
        >
          {POST_INBOX_PLATFORMS.map((id) => {
            const active = platform === id || platform === "all";
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => setPlannerQuery({ platform: id })}
                className={cn(
                  "whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                    : "border-zinc-200 text-zinc-500 hover:border-blue-500/30 dark:border-white/10 dark:text-white/50",
                )}
              >
                {PLATFORM_LABELS[id]}
              </button>
            );
          })}
        </div>

        {loadError ? (
          <div
            role="alert"
            className="mx-5 shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 lg:mx-8 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          >
            {loadError}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-hidden p-2 sm:p-4 lg:p-6">
          {isLoading ? (
            <PlannerSkeleton />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="flex h-full min-h-0 w-full flex-col"
              >
                {viewMode === "Week" ? (
                  <WeekView
                    posts={visiblePosts}
                    selectedDate={selectedDate}
                    selectedPostId={selectedPostId}
                    onDateSelect={handleDateSelect}
                    onPostSelect={handlePostSelect}
                    onSlotClick={openCreateModal}
                    onReschedule={handleReschedule}
                    weekStartsOn={weekStartsOn}
                    timeZone={timeZone}
                  />
                ) : null}
                {viewMode === "Month" ? (
                  <MonthView
                    posts={visiblePosts}
                    selectedDate={selectedDate}
                    selectedPostId={selectedPostId}
                    onDateSelect={handleDateSelect}
                    onPostSelect={handlePostSelect}
                    onReschedule={handleReschedule}
                    weekStartsOn={weekStartsOn}
                    timeZone={timeZone}
                  />
                ) : null}
                {viewMode === "Day" ? (
                  <DayView
                    posts={visiblePosts}
                    selectedDate={selectedDate}
                    selectedPostId={selectedPostId}
                    onPostSelect={handlePostSelect}
                    onSlotClick={openCreateModal}
                    onReschedule={handleReschedule}
                    timeZone={timeZone}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
        onPublishNow={editingPost ? handlePublishNow : undefined}
        editPost={editPostInitial}
        initialScheduledFor={modalScheduledFor}
        timeZone={timeZone}
      />
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center p-6">
          <PlannerSkeleton />
        </div>
      }
    >
      <CalendarPageInner />
    </Suspense>
  );
}
