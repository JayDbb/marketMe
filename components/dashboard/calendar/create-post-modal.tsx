"use client";

import {
  getPostModalContextAction,
  type PostModalContext,
} from "@/app/dashboard/calendar/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatScheduledPreview,
  getDefaultScheduleDatetime,
  getMinScheduleDatetime,
  getPlatformCharLimit,
  getSchedulePresets,
} from "@/lib/post-schedule-utils";
import { Platform } from "@/types/content";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  CalendarIcon,
  Camera,
  Clock,
  Globe,
  Heart,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  MessageSquare,
  Repeat2,
  Send,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, startTransition } from "react";
import { toast } from "sonner";
import { ImageUpload } from "./image-upload";
import { PannablePreviewImage } from "./pannable-preview-image";
import { toDatetimeLocalValue } from "@/lib/calendar-utils";

export interface CreatePostPayload {
  caption: string;
  platform: Platform;
  scheduled_date: string;
  file?: File | null;
}

export interface EditPostInitial {
  postId: string;
  caption: string;
  platform: Platform;
  scheduled_date: string;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: CreatePostPayload) => void | Promise<void>;
  initialScheduledFor?: string;
  editPost?: EditPostInitial | null;
}

const PLATFORMS: Platform[] = ["twitter", "linkedin", "instagram"];

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  instagram: "Instagram",
};

function PreviewMedia({
  previewUrl,
  variant,
}: {
  previewUrl: string | null;
  variant: "square" | "wide" | "twitter";
}) {
  if (!previewUrl) {
    const emptyClass =
      variant === "square"
        ? "w-full aspect-square"
        : variant === "twitter"
          ? "w-full h-32 rounded-2xl"
          : "w-full h-48 rounded border border-gray-200";

    return (
      <div
        className={`${emptyClass} bg-gray-50 border-y border-gray-100 flex flex-col items-center justify-center text-gray-400 gap-2`}
      >
        <ImageIcon className="w-8 h-8 opacity-50" />
        <span className="text-xs">
          {variant === "square"
            ? "Square image recommended"
            : "No media attached"}
        </span>
      </div>
    );
  }

  if (variant === "square") {
    return (
      <PannablePreviewImage
        src={previewUrl}
        className="w-full aspect-square bg-gray-50"
      />
    );
  }

  if (variant === "twitter") {
    return (
      <div className="w-full border border-gray-200 rounded-2xl overflow-hidden mt-1 max-h-[300px]">
        <PannablePreviewImage src={previewUrl} className="w-full h-[220px]" />
      </div>
    );
  }

  return (
    <div className="w-full max-h-[400px] overflow-hidden bg-gray-50">
      <PannablePreviewImage src={previewUrl} className="w-full h-[280px]" />
    </div>
  );
}

function PostPreview({
  platform,
  content,
  previewUrl,
  ctx,
}: {
  platform: Platform;
  content: string;
  previewUrl: string | null;
  ctx: PostModalContext;
}) {
  const name = ctx.displayName;
  const handle = ctx.handle;

  if (platform === "instagram") {
    return (
      <div className="w-full max-w-[360px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl flex flex-col transition-all">
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-yellow-400 via-red-500 to-pink-500 p-[2px] shrink-0">
              <div className="w-full h-full bg-white rounded-full border-2 border-white flex items-center justify-center overflow-hidden">
                <span className="font-bold text-gray-900 text-[10px]">
                  {ctx.initials}
                </span>
              </div>
            </div>
            <span className="text-[13px] font-semibold text-gray-900 truncate">
              {handle}
            </span>
          </div>
          <Camera className="w-5 h-5 text-gray-400 shrink-0" />
        </div>

        <PreviewMedia previewUrl={previewUrl} variant="square" />

        <div className="px-3 pt-3 pb-1 flex justify-between">
          <div className="flex gap-4">
            <Heart className="w-6 h-6 text-gray-900" />
            <MessageCircle className="w-6 h-6 text-gray-900" />
            <Send className="w-6 h-6 text-gray-900 -rotate-45 -mt-1" />
          </div>
          <div className="w-6 h-6 border-2 border-gray-900 rounded-sm" />
        </div>

        <div className="px-3 pb-4 pt-1 text-[13px] text-gray-900 leading-snug">
          <span className="font-semibold mr-1.5">{handle}</span>
          {content ? (
            <span className="whitespace-pre-wrap">{content}</span>
          ) : (
            <span className="text-gray-400 italic">Write a caption...</span>
          )}
        </div>
      </div>
    );
  }

  if (platform === "linkedin") {
    return (
      <div className="w-full max-w-[400px] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xl flex flex-col transition-all">
        <div className="p-4 flex items-start gap-3">
          <div className="w-12 h-12 rounded bg-blue-100 flex items-center justify-center shrink-0">
            <span className="font-bold text-blue-700 text-sm">
              {ctx.initials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-semibold text-gray-900 leading-tight truncate">
                  {name}
                </span>
                <span className="text-[12px] text-gray-500 leading-tight">
                  Scheduled post
                </span>
                <span className="text-[12px] text-gray-500 flex items-center gap-1 mt-0.5">
                  Just now &middot; <Globe className="w-3 h-3" />
                </span>
              </div>
              <Briefcase className="w-5 h-5 text-blue-700 shrink-0" />
            </div>
          </div>
        </div>

        <div className="px-4 pb-3 text-[14px] text-gray-900 whitespace-pre-wrap leading-relaxed">
          {content || (
            <span className="text-gray-400 italic">
              What do you want to talk about?
            </span>
          )}
        </div>

        {previewUrl ? (
          <PreviewMedia previewUrl={previewUrl} variant="wide" />
        ) : (
          <div className="px-4 pb-4">
            <PreviewMedia previewUrl={null} variant="wide" />
          </div>
        )}

        <div className="px-2 py-1 border-t border-gray-200 flex justify-between text-gray-500">
          {["Like", "Comment", "Repost", "Send"].map((label) => (
            <div
              key={label}
              className="flex-1 flex justify-center py-2 hover:bg-gray-100 rounded transition-colors cursor-default gap-1.5 items-center"
            >
              {label === "Like" && <Heart className="w-4 h-4" />}
              {label === "Comment" && <MessageCircle className="w-4 h-4" />}
              {label === "Repost" && <Repeat2 className="w-4 h-4" />}
              {label === "Send" && <Send className="w-4 h-4" />}
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl flex flex-col transition-all">
      <div className="p-4 pb-2 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
          <div className="w-full h-full bg-blue-500/10 flex items-center justify-center">
            <span className="font-bold text-gray-900 text-xs">
              {ctx.initials}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 truncate min-w-0">
              <span className="text-[15px] font-bold text-gray-900 truncate">
                {name}
              </span>
              <span className="text-[15px] text-gray-500 truncate">
                @{handle}
              </span>
            </div>
            <MessageSquare className="w-5 h-5 text-gray-400 shrink-0" />
          </div>
        </div>
      </div>

      <div className="pl-[68px] pr-4 flex flex-col pb-3">
        <div className="text-[15px] text-gray-900 whitespace-pre-wrap leading-snug mb-3">
          {content || (
            <span className="text-gray-400 italic">What is happening?!</span>
          )}
        </div>

        <PreviewMedia previewUrl={previewUrl} variant="twitter" />

        <div className="pt-3 flex justify-between text-gray-500 pr-8">
          {[MessageCircle, Repeat2, Heart].map((Icon, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="p-1.5 rounded-full">
                <Icon className="w-[18px] h-[18px]" />
              </div>
              <span className="text-xs">0</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const FALLBACK_CTX: PostModalContext = {
  displayName: "Your Brand",
  handle: "yourbrand",
  initials: "YB",
};

export function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
  initialScheduledFor,
  editPost = null,
}: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [scheduledFor, setScheduledFor] = useState(
    getDefaultScheduleDatetime(),
  );
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ctx, setCtx] = useState<PostModalContext>(FALLBACK_CTX);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!isOpen) return;
    startTransition(() => {
      if (editPost) {
        setContent(editPost.caption);
        setPlatform(editPost.platform);
        setScheduledFor(
          initialScheduledFor ??
            (() => {
              const d = new Date(editPost.scheduled_date);
              return Number.isNaN(d.getTime())
                ? getDefaultScheduleDatetime()
                : toDatetimeLocalValue(d);
            })(),
        );
        setFile(null);
        return;
      }
      setContent("");
      setPlatform("instagram");
      setScheduledFor(initialScheduledFor ?? getDefaultScheduleDatetime());
      setFile(null);
    });
  }, [isOpen, initialScheduledFor, editPost]);

  const charLimit = getPlatformCharLimit(platform);
  const charCount = content.length;
  const schedulePresets = getSchedulePresets();
  const minSchedule = getMinScheduleDatetime();
  const isEditMode = Boolean(editPost);

  useEffect(() => {
    if (!isOpen) return;
    getPostModalContextAction().then((data) => {
      if (data) setCtx(data);
    });
  }, [isOpen]);

  const resetForm = useCallback(() => {
    setContent("");
    setPlatform("instagram");
    setFile(null);
    setScheduledFor(getDefaultScheduleDatetime());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error("Post content cannot be empty");
      return;
    }
    if (charCount > charLimit) {
      toast.error(
        `Caption exceeds ${charLimit} characters for ${PLATFORM_LABELS[platform] ?? platform}`,
      );
      return;
    }

    const scheduledDate = new Date(scheduledFor);
    if (Number.isNaN(scheduledDate.getTime())) {
      toast.error("Please pick a valid date and time");
      return;
    }
    if (scheduledDate < new Date()) {
      toast.error("Scheduled time must be in the future");
      return;
    }

    setIsSubmitting(true);
    try {
      await Promise.resolve(
        onSubmit({
          caption: trimmed,
          platform,
          scheduled_date: scheduledDate.toISOString(),
          file,
        }),
      );
      toast.success("Post scheduled successfully!");
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to schedule post:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to schedule post. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: "spring", bounce: 0, duration: 0.32 }}
              className="w-full max-w-5xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[min(90vh,820px)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {isEditMode ? 'Edit Post' : 'Schedule Post'}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isEditMode
                      ? 'Update caption, platform, or schedule'
                      : 'Compose, preview, and add to your calendar'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-1 min-h-0 overflow-hidden flex-col md:flex-row">
                {/* Form */}
                <div className="w-full md:w-[52%] flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-border">
                  <div className="overflow-y-auto p-6 flex-1 space-y-5">
                    <form
                      id="create-post-form"
                      onSubmit={handleSubmit}
                      className="space-y-5"
                    >
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                          Platform
                        </Label>
                        <div className="flex gap-2">
                          {PLATFORMS.map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPlatform(p)}
                              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                                platform === p
                                  ? "bg-blue-500/15 border-blue-500/40 text-blue-700 dark:text-blue-300"
                                  : "bg-muted/60 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                            >
                              {PLATFORM_LABELS[p] ?? p}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                            Post Content
                          </Label>
                          <span
                            className={`text-xs tabular-nums ${
                              charCount > charLimit
                                ? "text-red-500 font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            {charCount}/{charLimit}
                          </span>
                        </div>
                        <Textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="What do you want to share?"
                          className="min-h-[110px] bg-muted/40 border-border text-foreground resize-y"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                          Media (optional)
                        </Label>
                        <ImageUpload value={file} onChange={setFile} />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                          Schedule For
                        </Label>
                        <div className="relative">
                          <Input
                            type="datetime-local"
                            value={scheduledFor}
                            min={minSchedule}
                            onChange={(e) => setScheduledFor(e.target.value)}
                            className="bg-muted/40 border-border text-foreground pl-10"
                            required
                          />
                          <CalendarIcon className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          {formatScheduledPreview(scheduledFor)}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {schedulePresets.map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setScheduledFor(preset.value)}
                              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                scheduledFor === preset.value
                                  ? "bg-blue-500/15 border-blue-500/40 text-blue-700 dark:text-blue-300"
                                  : "bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </form>
                  </div>

                  <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="text-foreground"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      form="create-post-form"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-500 text-white gap-2 border-0 min-w-[140px]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {isEditMode ? 'Saving…' : 'Scheduling…'}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {isEditMode ? 'Save changes' : 'Schedule Post'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Preview */}
                <div className="hidden md:flex md:w-[48%] flex-col min-h-0 bg-muted/20">
                  <div className="px-5 py-3 border-b border-border shrink-0">
                    <h3 className="text-sm font-medium text-foreground">
                      Live Preview
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Drag image to peek at crop · releases back on mouse up
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 flex items-start justify-center dashboard-grid-bg">
                    <PostPreview
                      platform={platform}
                      content={content}
                      previewUrl={previewUrl}
                      ctx={ctx}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
