'use client'

import { useState } from 'react';
import { Post, Platform } from '@/types/content';
import { MessageCircle, Briefcase, Camera, Clock, CheckCircle2, Send, AlertCircle, Clock3, CalendarClock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PostCardProps {
  post: Post;
  onApprove?: () => void;
}

// ── Platform icon inside a small circle, matching the reference ────────────
function PlatformIcon({ platform }: { platform: Platform }) {
  const icons = {
    twitter:   <MessageCircle className="w-3.5 h-3.5" />,
    linkedin:  <Briefcase     className="w-3.5 h-3.5" />,
    instagram: <Camera        className="w-3.5 h-3.5" />,
  };
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-white/8 border-zinc-200 border dark:border-white/10 text-zinc-500 dark:text-white/50 shrink-0">
      {icons[platform as keyof typeof icons]}
    </span>
  );
}

// ── Status badge — exactly replicates the reference pill styles ────────────
function StatusBadge({ status }: { status: Post['status'] }) {
  if (status === 'published') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-white/12 bg-white dark:bg-white/6 text-zinc-500 dark:text-white/55 text-[10px] font-bold uppercase tracking-widest">
        <Send className="w-3 h-3" />
        Published
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-400/35 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest">
        <AlertCircle className="w-3 h-3" />
        Failed
      </span>
    );
  }
  if (status === 'scheduled') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-400/35 bg-orange-500/10 text-orange-300 text-[10px] font-bold uppercase tracking-widest">
        <CalendarClock className="w-3 h-3" />
        Queued
      </span>
    );
  }
  if (status === 'pending_approval') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-400/35 bg-blue-500/10 text-blue-300 text-[10px] font-bold uppercase tracking-widest">
        <Clock3 className="w-3 h-3" />
        Pending
      </span>
    );
  }
  if (status === 'approved') {
    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-400/40 bg-blue-500/12 text-blue-300 text-[10px] font-bold uppercase tracking-widest"
      >
        <CheckCircle2 className="w-3 h-3" />
        Approved
      </motion.span>
    );
  }
  // draft
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 text-zinc-500 dark:text-white/35 text-[10px] font-bold uppercase tracking-widest">
      <Clock className="w-3 h-3" />
      Draft
    </span>
  );
}

export function PostCard({ post, onApprove }: PostCardProps) {
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = () => {
    if (!onApprove || isApproving) return;
    setIsApproving(true);
    setTimeout(() => {
      onApprove();
      setIsApproving(false);
    }, 300);
  };

  const timeString = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(post.scheduled_date));

  return (
    <div
      className="group flex flex-col gap-3 p-4 rounded-xl transition-all duration-200 hover:brightness-110 cursor-default"
      style={{
        background: 'rgba(255,255,255,0.055)',
        border: '1px solid rgba(255,255,255,0.09)',
      }}
    >
      {/* Top row: platform icon + time */}
      <div className="flex items-center gap-2.5">
        <PlatformIcon platform={post.social_account?.platform || 'twitter'} />
        <span className="text-[11px] font-mono text-zinc-500 dark:text-white/40 tracking-wide">
          {timeString}
        </span>
      </div>

      {/* Asset Image */}
      {post.media_url && (
        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-zinc-200 dark:border-white/5 mt-1">
          <img 
            src={post.media_url} 
            alt="Post media" 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Post content */}
      <p className="text-sm text-zinc-500 dark:text-white/80 leading-relaxed line-clamp-4 font-light mt-1">
        {post.caption}
      </p>

      {/* Status badge row */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={post.status}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.18 }}
          >
            <StatusBadge status={post.status} />
          </motion.div>
        </AnimatePresence>

        {/* Approve action — only on draft posts, fades in on hover */}
        {onApprove && (
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-400/40 bg-transparent text-blue-400 hover:bg-blue-500 hover:text-zinc-900 dark:hover:text-white hover:border-blue-500 text-[10px] font-bold uppercase tracking-widest transition-all duration-200 disabled:cursor-wait"
          >
            <CheckCircle2 className="w-3 h-3" />
            {isApproving ? '…' : 'Approve'}
          </button>
        )}
      </div>
    </div>
  );
}
