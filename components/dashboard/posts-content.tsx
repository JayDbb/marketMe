'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Filter, Image as ImageIcon, MessageSquare, Heart, Clock } from 'lucide-react'
import { CreatePostModal } from '@/components/dashboard/calendar/create-post-modal'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
}

const mockPosts = [
  {
    id: 1,
    platform: 'Instagram',
    content: 'Just launched our new product line! Stay tuned. ✨',
    status: 'Queued',
    date: 'Sep 18, 2024 at 10:00 AM',
    metrics: { likes: 0, comments: 0 }
  },
  {
    id: 2,
    platform: 'Twitter',
    content: 'We are changing the game with AI-driven marketing.',
    status: 'Published',
    date: 'Sep 15, 2024 at 2:30 PM',
    metrics: { likes: 142, comments: 12 }
  },
  {
    id: 3,
    platform: 'LinkedIn',
    content: 'How small businesses are scaling faster in 2026. Read our latest insights on the blog.',
    status: 'Draft',
    date: '-',
    metrics: { likes: 0, comments: 0 }
  },
  {
    id: 4,
    platform: 'Twitter',
    content: 'Unexpected downtime due to server maintenance. We will be back up shortly.',
    status: 'Failed',
    date: 'Sep 19, 2024 at 09:15 AM',
    metrics: { likes: 0, comments: 0 }
  }
]

export function PostsContent() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('All')

  const tabs = ['All', 'Scheduled', 'Published', 'Drafts']

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-6 py-10 relative z-10 flex flex-col min-h-screen"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-white">Posts.</h1>
          <p className="text-white/40 mt-2 text-base">Manage and review all your scheduled and published content.</p>
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-5 bg-white text-zinc-950 hover:bg-white/90 font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Post
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 w-full sm:w-auto overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-white/10 text-white shadow-sm border border-white/5' 
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              placeholder="Search posts..."
              className="pl-10 h-10 bg-white/5 border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/50 text-white placeholder:text-white/25 rounded-xl transition-all shadow-none"
            />
          </div>
          <Button variant="outline" className="h-10 w-10 p-0 bg-white/5 border-white/10 text-white hover:bg-white/10 shrink-0 rounded-xl">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Posts List */}
      <motion.div variants={itemVariants} className="flex-1 rounded-2xl border border-white/10 bg-white/2 overflow-hidden">
        <div className="grid grid-cols-12 text-xs font-bold text-white/40 uppercase tracking-wider px-6 py-4 border-b border-white/5 bg-white/5">
          <div className="col-span-6 md:col-span-5">Content</div>
          <div className="hidden md:block col-span-2">Platform</div>
          <div className="col-span-3 md:col-span-2">Status</div>
          <div className="col-span-3">Date</div>
        </div>

        <div className="divide-y divide-white/5">
          {mockPosts.map((post) => (
            <div key={post.id} className="grid grid-cols-12 items-center px-6 py-5 hover:bg-white/5 transition-colors group cursor-pointer">
              <div className="col-span-6 md:col-span-5 pr-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <ImageIcon className="w-4 h-4 text-white/40" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>
                    {post.status === 'Published' && (
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-xs text-white/40"><Heart className="w-3 h-3" /> {post.metrics.likes}</span>
                        <span className="flex items-center gap-1 text-xs text-white/40"><MessageSquare className="w-3 h-3" /> {post.metrics.comments}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="hidden md:block col-span-2">
                <span className="text-sm text-white/70">{post.platform}</span>
              </div>

              <div className="col-span-3 md:col-span-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                  post.status === 'Published' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  post.status === 'Queued' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                  post.status === 'Failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  post.status === 'Scheduled' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  'bg-white/5 text-white/60 border-white/10'
                }`}>
                  {post.status}
                </span>
              </div>

              <div className="col-span-3">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="truncate">{post.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <CreatePostModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => setIsModalOpen(false)}
      />
    </motion.div>
  )
}
