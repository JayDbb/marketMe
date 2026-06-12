'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Clock, CalendarIcon } from 'lucide-react';
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

export function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState<Platform>('twitter');
  // Default scheduled for tomorrow at 10 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  
  const [scheduledFor, setScheduledFor] = useState(tomorrow.toISOString().slice(0, 16));
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Create a local object URL for immediate display
    const assetUrl = file ? URL.createObjectURL(file) : undefined;

    onSubmit({
      caption: content,
      business_id: 1, // Mock business ID
      account_id: platform === 'twitter' ? 101 : 102, // Mock account ID
      social_account: { platform },
      scheduled_date: new Date(scheduledFor).toISOString(),
      media_url: assetUrl,
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
              className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h2 className="text-lg font-medium text-white">Create New Post</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-6 flex-1 space-y-6 custom-scrollbar">
                <form id="create-post-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Platform Selection */}
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider text-white/50">Platform</Label>
                    <div className="flex gap-2">
                      {(['twitter', 'linkedin', 'instagram'] as Platform[]).map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPlatform(p)}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize border transition-colors ${
                            platform === p 
                              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider text-white/50">Post Content</Label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="What do you want to share?"
                      className="min-h-[120px] bg-white/5 border-white/10 text-white resize-y"
                      required
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider text-white/50">Media (Optional)</Label>
                    <ImageUpload value={file} onChange={setFile} />
                  </div>

                  {/* Date/Time */}
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider text-white/50">Schedule For</Label>
                    <div className="relative">
                      <Input
                        type="datetime-local"
                        value={scheduledFor}
                        onChange={(e) => setScheduledFor(e.target.value)}
                        className="bg-white/5 border-white/10 text-white pl-10"
                        required
                      />
                      <CalendarIcon className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={onClose} className="text-white hover:bg-white/10">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  form="create-post-form"
                  className="bg-blue-500 hover:bg-blue-600 text-white gap-2 border-0"
                >
                  <Send className="w-4 h-4" />
                  Schedule Post
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
