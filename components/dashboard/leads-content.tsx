'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, SlidersHorizontal, Mail, MoreHorizontal } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 20 } }
}

const mockLeads = [
  { id: 1, name: 'Elena Rostova', company: 'Lumina Tech', role: 'VP of Marketing', status: 'High Intent', score: 94, avatar: 'ER' },
  { id: 2, name: 'Julian Hayes', company: 'Nova Group', role: 'Director of Growth', status: 'Nurturing', score: 78, avatar: 'JH' },
  { id: 3, name: 'Marcello Vitti', company: 'Vitti & Co', role: 'CEO', status: 'New Lead', score: 45, avatar: 'MV' },
  { id: 4, name: 'Anya Chen', company: 'Apex Dynamics', role: 'Head of Sales', status: 'High Intent', score: 91, avatar: 'AC' },
]

const statusStyles: Record<string, string> = {
  'High Intent': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Nurturing': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'New Lead': 'bg-white/6 text-white/40 border-white/10',
}

export function LeadsContent() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto px-6 py-10 relative z-10"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-white">Leads Pipeline.</h1>
          <p className="text-white/40 mt-2 text-base">Manage and nurture your high-value targets.</p>
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              placeholder="Search leads..."
              className="pl-10 h-11 bg-white/5 border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/50 text-white placeholder:text-white/25 rounded-xl transition-all"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/15 transition-all flex items-center justify-center"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Lead cards */}
      <div className="space-y-3">
        {mockLeads.map((lead) => (
          <motion.div variants={itemVariants} key={lead.id}>
            <Card className="bg-white/4 backdrop-blur-xl border-white/8 text-white hover:bg-white/6 transition-colors shadow-lg rounded-2xl overflow-hidden group cursor-pointer">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-full bg-blue-500/12 flex items-center justify-center border border-blue-500/20 font-semibold text-blue-400 text-sm tracking-wider shrink-0">
                      {lead.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-blue-300 transition-colors">{lead.name}</h3>
                      <p className="text-xs text-white/40 mt-0.5">
                        {lead.role} at <span className="text-white/60 font-medium">{lead.company}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex flex-col items-start sm:items-end gap-1">
                      <span className={`text-[11px] px-2.5 py-1 rounded-lg font-medium border ${statusStyles[lead.status] ?? statusStyles['New Lead']}`}>
                        {lead.status}
                      </span>
                      <span className="text-[11px] text-white/30 font-mono">Score: {lead.score}</span>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
