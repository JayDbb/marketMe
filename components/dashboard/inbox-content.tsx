'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, MessageCircle, AtSign, MessageSquareText, Mail, CheckCircle2 } from 'lucide-react'

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

const columns = [
  {
    id: 'dms',
    title: 'DMs',
    icon: MessageCircle,
    emptyMessage: 'No dms found',
    emptySub: 'No threads of dms were found according to your filters.',
    messages: []
  },
  {
    id: 'mentions',
    title: '@ Mentions',
    icon: AtSign,
    emptyMessage: 'No mentions found',
    emptySub: 'Nobody has mentioned your brand recently.',
    messages: []
  },
  {
    id: 'comments',
    title: 'Comments',
    icon: MessageSquareText,
    emptyMessage: 'No comments found',
    emptySub: 'No new comments on your posts.',
    messages: []
  }
]

export function InboxContent() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-6 py-10 relative z-10 h-full flex flex-col"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-white">Inbox.</h1>
          <p className="text-white/40 mt-2 text-base">Manage all your social interactions in one place.</p>
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              placeholder="Search conversations..."
              className="pl-10 h-11 bg-white/5 border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/50 text-white placeholder:text-white/25 rounded-xl transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* 3-Column Kanban Board */}
      <motion.div variants={itemVariants} className="flex-1 min-h-[500px] flex gap-5 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex-1 min-w-[320px] flex flex-col rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-2">
                <column.icon className="w-4 h-4 text-white/50" />
                <h3 className="font-semibold text-[14px] text-white tracking-tight">
                  {column.title}
                </h3>
              </div>
              <span className="w-6 h-6 rounded-full bg-white/10 text-white/50 flex items-center justify-center text-[11px] font-bold">
                {column.messages.length}
              </span>
            </div>

            {/* Column Content */}
            <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
              {column.messages.length > 0 ? (
                // Map over messages here (when we have them)
                null
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-60">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <column.icon className="w-5 h-5 text-white/30" />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">{column.emptyMessage}</h4>
                  <p className="text-xs text-white/40 max-w-[200px] leading-relaxed">
                    {column.emptySub}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}
