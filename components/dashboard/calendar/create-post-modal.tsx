'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Clock, CalendarIcon, Heart, MessageCircle, Repeat2, Briefcase, Camera, MessageSquare, Image as ImageIcon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ImageUpload } from './image-upload';
import { Post, Platform } from '@/types/content';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: Omit<Post, 'post_id' | 'status'>) => void;
}

function PostPreview({ platform, content, previewUrl }: { platform: Platform, content: string, previewUrl: string | null }) {
  if (platform === 'instagram') {
    return (
      <div className="w-full max-w-[360px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl flex flex-col transition-all">
        {/* Instagram Header */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
              <div className="w-full h-full bg-white rounded-full border-2 border-white flex items-center justify-center overflow-hidden">
                <span className="font-bold text-gray-900 text-[10px]">MM</span>
              </div>
            </div>
            <span className="text-[13px] font-semibold text-gray-900">marketmeapp</span>
          </div>
          <Camera className="w-5 h-5 text-gray-400" />
        </div>

        {/* Instagram Image (Edge to Edge) */}
        {previewUrl ? (
          <div className="w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
            <img src={previewUrl} alt="Post media preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full aspect-square bg-gray-50 border-y border-gray-100 flex flex-col items-center justify-center text-gray-400 gap-2">
            <ImageIcon className="w-8 h-8 opacity-50" />
            <span className="text-xs">Square image recommended</span>
          </div>
        )}

        {/* Instagram Footer Actions */}
        <div className="px-3 pt-3 pb-1 flex justify-between">
          <div className="flex gap-4">
            <Heart className="w-6 h-6 text-gray-900" />
            <MessageCircle className="w-6 h-6 text-gray-900" />
            <Send className="w-6 h-6 text-gray-900 -rotate-45 -mt-1" />
          </div>
          <div className="w-6 h-6 border-2 border-gray-900 rounded-sm" /> {/* Mock Save icon */}
        </div>

        {/* Instagram Text */}
        <div className="px-3 pb-4 pt-1 text-[13px] text-gray-900 leading-snug">
          <span className="font-semibold mr-1.5">marketmeapp</span>
          {content ? (
            <span className="whitespace-pre-wrap">{content}</span>
          ) : (
            <span className="text-gray-400 italic">Write a caption...</span>
          )}
        </div>
      </div>
    );
  }

  if (platform === 'linkedin') {
    return (
      <div className="w-full max-w-[400px] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xl flex flex-col transition-all">
        {/* LinkedIn Header */}
        <div className="p-4 flex items-start gap-3">
          <div className="w-12 h-12 rounded bg-blue-100 flex items-center justify-center shrink-0">
            <span className="font-bold text-blue-700 text-sm">MM</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-gray-900 leading-tight">Marketme</span>
                <span className="text-[12px] text-gray-500 leading-tight">4,200 followers</span>
                <span className="text-[12px] text-gray-500 flex items-center gap-1 mt-0.5">
                  Just now &middot; <Globe className="w-3 h-3" />
                </span>
              </div>
              <Briefcase className="w-5 h-5 text-blue-700" />
            </div>
          </div>
        </div>
        
        {/* LinkedIn Text */}
        <div className="px-4 pb-3 text-[14px] text-gray-900 whitespace-pre-wrap leading-relaxed">
          {content || <span className="text-gray-400 italic">What do you want to talk about?</span>}
        </div>

        {/* LinkedIn Image (Edge to Edge) */}
        {previewUrl ? (
          <div className="w-full bg-gray-50 max-h-[400px] overflow-hidden flex items-center justify-center">
            <img src={previewUrl} alt="Post media preview" className="w-full h-auto object-cover" />
          </div>
        ) : (
          <div className="px-4 pb-4">
            <div className="w-full h-48 bg-gray-50 rounded border border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2">
              <ImageIcon className="w-6 h-6 opacity-50" />
              <span className="text-xs">No media attached</span>
            </div>
          </div>
        )}

        {/* LinkedIn Footer */}
        <div className="px-2 py-1 border-t border-gray-200 flex justify-between text-gray-500">
          <div className="flex-1 flex justify-center py-2 hover:bg-gray-100 rounded transition-colors cursor-pointer gap-1.5 items-center">
            <Heart className="w-4 h-4" /> <span className="text-sm font-medium">Like</span>
          </div>
          <div className="flex-1 flex justify-center py-2 hover:bg-gray-100 rounded transition-colors cursor-pointer gap-1.5 items-center">
            <MessageCircle className="w-4 h-4" /> <span className="text-sm font-medium">Comment</span>
          </div>
          <div className="flex-1 flex justify-center py-2 hover:bg-gray-100 rounded transition-colors cursor-pointer gap-1.5 items-center">
            <Repeat2 className="w-4 h-4" /> <span className="text-sm font-medium">Repost</span>
          </div>
          <div className="flex-1 flex justify-center py-2 hover:bg-gray-100 rounded transition-colors cursor-pointer gap-1.5 items-center">
            <Send className="w-4 h-4" /> <span className="text-sm font-medium">Send</span>
          </div>
        </div>
      </div>
    );
  }

  // Default to Twitter
  return (
    <div className="w-full max-w-[400px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl flex flex-col transition-all">
      {/* Twitter Header */}
      <div className="p-4 pb-2 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
          <div className="w-full h-full bg-blue-500/10 flex items-center justify-center">
            <span className="font-bold text-gray-900 text-xs">MM</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-[15px] font-bold text-gray-900 truncate hover:underline cursor-pointer">Marketme</span>
              <span className="text-[15px] text-gray-500 truncate">@marketmeapp</span>
              <span className="text-gray-500">&middot;</span>
              <span className="text-[15px] text-gray-500 hover:underline cursor-pointer">Just now</span>
            </div>
            <MessageSquare className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
      
      <div className="pl-[68px] pr-4 flex flex-col pb-3">
        {/* Twitter Text Content */}
        <div className="text-[15px] text-gray-900 whitespace-pre-wrap leading-snug mb-3">
          {content || <span className="text-gray-400 italic">What is happening?!</span>}
        </div>

        {/* Twitter Image Area */}
        {previewUrl ? (
          <div className="w-full border border-gray-200 rounded-2xl overflow-hidden mt-1">
            <img src={previewUrl} alt="Post media preview" className="w-full h-auto object-cover max-h-[300px]" />
          </div>
        ) : (
          <div className="w-full h-32 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2 mt-1">
            <ImageIcon className="w-6 h-6 opacity-50" />
            <span className="text-xs font-medium">No media</span>
          </div>
        )}

        {/* Twitter Action Footer Mockup */}
        <div className="pt-3 flex justify-between text-gray-500 pr-8">
          <div className="flex items-center gap-2 cursor-pointer hover:text-blue-500 transition-colors group">
            <div className="p-1.5 rounded-full group-hover:bg-blue-50 transition-colors"><MessageCircle className="w-[18px] h-[18px]"/></div>
            <span className="text-xs">0</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-green-500 transition-colors group">
            <div className="p-1.5 rounded-full group-hover:bg-green-50 transition-colors"><Repeat2 className="w-[18px] h-[18px]"/></div>
            <span className="text-xs">0</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-red-500 transition-colors group">
            <div className="p-1.5 rounded-full group-hover:bg-red-50 transition-colors"><Heart className="w-[18px] h-[18px]"/></div>
            <span className="text-xs">0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState<Platform>('twitter');
  
  // Default scheduled for tomorrow at 10 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  
  const [scheduledFor, setScheduledFor] = useState(tomorrow.toISOString().slice(0, 16));
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmit({
      caption: content,
      business_id: 1, // Mock business ID
      account_id: platform === 'twitter' ? 101 : 102, // Mock account ID
      social_account: { platform },
      scheduled_date: new Date(scheduledFor).toISOString(),
      media_url: previewUrl || undefined,
      file,
    });
    
    // Reset form
    setContent('');
    setPlatform('twitter');
    setFile(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="w-full max-w-4xl bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-white/10">
                <h2 className="text-lg font-medium text-zinc-900 dark:text-white">Create New Post</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-zinc-500 dark:hover:text-white/50 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 border-zinc-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Left Side: Form */}
                <div className="w-full md:w-1/2 flex flex-col border-r border-zinc-200 dark:border-white/10">
                  <div className="overflow-y-auto p-6 flex-1 space-y-6 custom-scrollbar">
                    <form id="create-post-form" onSubmit={handleSubmit} className="space-y-6">
                      
                      {/* Platform Selection */}
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-wider text-zinc-500 dark:text-white/50">Platform</Label>
                        <div className="flex gap-2">
                          {(['twitter', 'linkedin', 'instagram'] as Platform[]).map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPlatform(p)}
                              className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize border transition-colors ${
                                platform === p 
                                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                                  : 'bg-white dark:bg-white/5 border-zinc-200  dark:border-white/10 text-zinc-500 dark:text-white/60 hover:bg-white dark:bg-white/10 '
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-wider text-zinc-500 dark:text-white/50">Post Content</Label>
                        <Textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="What do you want to share?"
                          className="min-h-[120px] bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white resize-y"
                          required
                        />
                      </div>

                      {/* Image Upload */}
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-wider text-zinc-500 dark:text-white/50">Media (Optional)</Label>
                        <ImageUpload value={file} onChange={setFile} />
                      </div>

                      {/* Date/Time */}
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-wider text-zinc-500 dark:text-white/50">Schedule For</Label>
                        <div className="relative">
                          <Input
                            type="datetime-local"
                            value={scheduledFor}
                            onChange={(e) => setScheduledFor(e.target.value)}
                            className="bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white pl-10"
                            required
                          />
                          <CalendarIcon className="w-4 h-4 text-zinc-500 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Form Footer */}
                  <div className="px-6 py-4 border-t border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={onClose} className="text-zinc-900 dark:text-white hover:bg-white dark:hover:bg-white/10 border-zinc-200">
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      form="create-post-form"
                      className="bg-blue-500 hover:bg-blue-600 text-zinc-900 dark:text-white gap-2 border-0"
                    >
                      <Send className="w-4 h-4" />
                      Schedule Post
                    </Button>
                  </div>
                </div>

                {/* Right Side: Live Preview */}
                <div className="hidden md:flex w-1/2 bg-[#0d1117] flex-col relative overflow-y-auto custom-scrollbar">
                  <div className="sticky top-0 p-4 border-b border-zinc-200 dark:border-white/10 bg-[#0d1117]/80 backdrop-blur z-10">
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-white/70">Live Preview</h3>
                  </div>
                  <div className="p-8 flex items-start justify-center flex-1 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[20px_20px]">
                    <PostPreview platform={platform} content={content} previewUrl={previewUrl} />
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
