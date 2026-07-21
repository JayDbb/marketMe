"use client";

import {
  approveCalendarPostAction,
  createCalendarPostAction,
  getPostsAction,
  scheduleCalendarPostAction,
} from "@/app/dashboard/calendar/actions";
import { Button } from "@/components/ui/button";
import { getHeaderTitle, toDatetimeLocalValue } from "@/lib/calendar-utils";
import { Post } from "@/types/content";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { getUserPreferencesAction } from "@/app/dashboard/settings/actions";
import { CalendarSidebar } from "@/components/dashboard/calendar/calendar-sidebar";
import {
  CreatePostModal,
  type CreatePostPayload,
} from "@/components/dashboard/calendar/create-post-modal";
import { DayView } from "@/components/dashboard/calendar/views/day-view";
import { MonthView } from "@/components/dashboard/calendar/views/month-view";
import { WeekView } from "@/components/dashboard/calendar/views/week-view";
import type { WeekStartsOn } from "@/types/settings";

type ViewMode = "Month" | "Week" | "Day";

function parseDateParam(value: string | null): Date | null {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("Week");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalScheduledFor, setModalScheduledFor] = useState<
    string | undefined
  >();
  const [weekStartsOn, setWeekStartsOn] = useState<WeekStartsOn>("monday");
  const [selectedPostId, setSelectedPostId] = useState<string | number | null>(
    null,
  );

  const loadPosts = useCallback(async () => {
    const { posts: data, error } = await getPostsAction();
    setPosts(data);
    setLoadError(error);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    startTransition(() => {
      void loadPosts();
      void getUserPreferencesAction().then((prefs) =>
        setWeekStartsOn(prefs.weekStartsOn),
      );
    });
  }, [loadPosts]);

  useEffect(() => {
    const fromUrl = parseDateParam(searchParams.get("date"));
    if (fromUrl) {
      startTransition(() => {
        setSelectedDate(fromUrl);
        setViewMode("Day");
      });
    }
  }, [searchParams]);

  const handlePrev = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "Month") d.setMonth(d.getMonth() - 1);
      else if (viewMode === "Week") d.setDate(d.getDate() - 7);
      else d.setDate(d.getDate() - 1);
      return d;
    });
  };

  const handleNext = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "Month") d.setMonth(d.getMonth() + 1);
      else if (viewMode === "Week") d.setDate(d.getDate() + 7);
      else d.setDate(d.getDate() + 1);
      return d;
    });
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedPostId((prev) => {
      if (prev == null) return null;
      const stillOnDay = posts.some(
        (p) =>
          p.post_id === prev &&
          new Date(p.scheduled_date).toDateString() === date.toDateString(),
      );
      return stillOnDay ? prev : null;
    });
  };

  const handlePostSelect = (post: Post) => {
    setSelectedPostId(post.post_id);
    setSelectedDate(new Date(post.scheduled_date));
  };

  const handleMonthDateSelect = (date: Date) => {
    handleDateSelect(date);
    setViewMode("Day");
  };

  const openCreateModal = (date?: Date) => {
    if (date) {
      setModalScheduledFor(toDatetimeLocalValue(date));
      setSelectedDate(date);
    } else {
      const defaultDate = new Date(selectedDate);
      defaultDate.setHours(10, 0, 0, 0);
      if (defaultDate < new Date()) {
        defaultDate.setDate(defaultDate.getDate() + 1);
      }
      setModalScheduledFor(toDatetimeLocalValue(defaultDate));
    }
    setIsModalOpen(true);
  };

  const handleCreatePost = async (post: CreatePostPayload) => {
    const result = await createCalendarPostAction({
      caption: post.caption,
      platform: post.platform,
      scheduledDate: post.scheduled_date,
      imageFile: post.file ?? null,
    });

    if (!result.success) {
      throw new Error(result.error ?? "Failed to schedule post");
    }

    toast.success("Draft post created — approve it before queuing for publish");

    const scheduledDay = new Date(post.scheduled_date);
    setSelectedDate(scheduledDay);
    await loadPosts();
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

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-[28rem] w-full gap-4 lg:gap-6 p-4 lg:p-6 overflow-hidden">
      <CalendarSidebar
        selectedDate={selectedDate}
        onDateChange={handleDateSelect}
        posts={posts}
        selectedPostId={selectedPostId}
        onPostSelect={handlePostSelect}
        onCreatePost={() => openCreateModal()}
        onApprovePost={handleApprovePost}
        onSchedulePost={handleSchedulePost}
        onClearSelection={() => setSelectedPostId(null)}
        onPostsUpdated={() => void loadPosts()}
        viewMode={viewMode}
        weekStartsOn={weekStartsOn}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-card/85 dark:bg-[#161b22]/80 backdrop-blur-2xl border border-border dark:border-white/10 rounded-[2rem] overflow-hidden shadow-xl relative">
        <div className="px-5 lg:px-8 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-zinc-200 dark:border-white/5 shrink-0">
          <div className="min-w-0 lg:flex-1 lg:pr-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-1">
              Planner
            </p>
            <h2 className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight truncate">
              {getHeaderTitle(selectedDate, viewMode, weekStartsOn)}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-nowrap overflow-x-auto">
            <div className="flex shrink-0 bg-white dark:bg-white/5 border-zinc-200 p-1 rounded-xl border dark:border-white/10">
              {(["Month", "Week", "Day"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    viewMode === mode
                      ? "bg-white dark:bg-white text-zinc-900 shadow-lg"
                      : "text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                aria-label="Previous"
                className="w-9 h-9 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors border border-zinc-200 dark:border-white/5"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 text-sm font-bold text-zinc-600 dark:text-white/90 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors border border-zinc-200 dark:border-white/5"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                aria-label="Next"
                className="w-9 h-9 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors border border-zinc-200 dark:border-white/5"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Button
              onClick={() => openCreateModal()}
              className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2 border-0 shadow-[0_0_20px_rgba(59,130,246,0.35)] shrink-0"
            >
              <Plus className="w-4 h-4" /> Schedule Post
            </Button>
          </div>
        </div>

        {loadError ? (
          <div
            role="alert"
            className="mx-5 lg:mx-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 shrink-0"
          >
            {loadError}
          </div>
        ) : null}

        <div className="flex-1 overflow-hidden p-4 lg:p-6 min-h-0">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-zinc-500 dark:text-white/40 text-sm">
              Loading schedule…
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="w-full h-full flex flex-col min-h-0"
              >
                {viewMode === "Week" && (
                  <WeekView
                    posts={posts}
                    selectedDate={selectedDate}
                    selectedPostId={selectedPostId}
                    onDateSelect={handleDateSelect}
                    onPostSelect={handlePostSelect}
                    onSlotClick={openCreateModal}
                    weekStartsOn={weekStartsOn}
                  />
                )}
                {viewMode === "Month" && (
                  <MonthView
                    posts={posts}
                    selectedDate={selectedDate}
                    selectedPostId={selectedPostId}
                    onDateSelect={handleMonthDateSelect}
                    onPostSelect={handlePostSelect}
                  />
                )}
                {viewMode === "Day" && (
                  <DayView
                    posts={posts}
                    selectedDate={selectedDate}
                    selectedPostId={selectedPostId}
                    onPostSelect={handlePostSelect}
                    onSlotClick={openCreateModal}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
        initialScheduledFor={modalScheduledFor}
      />
    </div>
  );
}
