'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, GitPullRequest, Plus } from 'lucide-react'
import { CreateWorkflowModal } from './create-workflow-modal'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
}

export function WorkflowsContent() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-6 py-10 relative z-10 flex flex-col min-h-screen"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900 dark:text-white">Workflows.</h1>
          <p className="text-zinc-500 dark:text-white/40 mt-2 text-base">Automate your content creation and distribution.</p>
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-5 bg-white text-zinc-950 hover:bg-zinc-100 dark:hover:bg-white/90 font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all gap-2"
          >
            Create
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-white/30" />
          <Input
            placeholder="Search..."
            className="pl-10 h-11 bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/50 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:text-white/25 rounded-xl transition-all shadow-none"
          />
        </div>
        
        <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-white/40">
          <span>0 - 0 of 0</span>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 border-zinc-200 flex items-center justify-center opacity-50 cursor-not-allowed">
              &lt;
            </button>
            <button className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 border-zinc-200 flex items-center justify-center opacity-50 cursor-not-allowed">
              &gt;
            </button>
          </div>
        </div>
      </motion.div>

      {/* Empty State */}
      <motion.div variants={itemVariants} className="flex-1 flex flex-col items-center justify-center border border-zinc-200 dark:border-white/10 rounded-2xl bg-white dark:bg-white/2 mt-4 min-h-[400px]">
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border-zinc-200 border dark:border-white/10 flex items-center justify-center mb-6 shadow-inner">
          <GitPullRequest className="w-6 h-6 text-zinc-500 dark:text-white/50" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Create your first workflow</h3>
        <p className="text-sm text-zinc-500 dark:text-white/40 mb-6 text-center max-w-[300px]">
          Automatically create and publish posts with automated conditional workflows.
        </p>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-6 bg-white dark:bg-white/10 border-zinc-200 hover:bg-white dark:bg-white/20 text-zinc-900 dark:text-white font-medium rounded-xl border dark:border-white/10 transition-all gap-2 shadow-none"
        >
          <Plus className="w-4 h-4" />
          Create workflow
        </Button>
      </motion.div>

      <CreateWorkflowModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </motion.div>
  )
}
