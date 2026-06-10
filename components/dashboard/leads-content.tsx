'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, SlidersHorizontal, ArrowUpRight, Mail, Phone, MoreHorizontal, User } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
}

const mockLeads = [
  { id: 1, name: 'Elena Rostova', company: 'Lumina Tech', role: 'VP of Marketing', status: 'High Intent', score: 94, avatar: 'ER' },
  { id: 2, name: 'Julian Hayes', company: 'Nova Group', role: 'Director of Growth', status: 'Nurturing', score: 78, avatar: 'JH' },
  { id: 3, name: 'Marcello Vitti', company: 'Vitti & Co', role: 'CEO', status: 'New Lead', score: 45, avatar: 'MV' },
  { id: 4, name: 'Anya Chen', company: 'Apex Dynamics', role: 'Head of Sales', status: 'High Intent', score: 91, avatar: 'AC' },
]

export function LeadsContent() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-6 py-12 relative z-10"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Leads Pipeline.</h1>
          <p className="text-zinc-400 mt-3 text-lg">Manage and nurture your high-value targets.</p>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input 
              placeholder="Search leads..." 
              className="pl-12 h-12 bg-zinc-900/60 backdrop-blur-xl border-zinc-800/80 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-white placeholder:text-zinc-500 rounded-xl transition-all shadow-inner"
            />
          </div>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="h-12 px-4 rounded-xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 text-zinc-300 hover:text-white hover:border-zinc-700/80 transition-all flex items-center justify-center shadow-inner"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Intelligent List Layout */}
      <div className="space-y-4">
        {mockLeads.map((lead) => (
          <motion.div variants={itemVariants} key={lead.id}>
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 text-zinc-50 hover:bg-zinc-900/80 transition-colors shadow-lg hover:shadow-xl rounded-2xl overflow-hidden group cursor-pointer">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center border border-zinc-700/50 font-medium text-emerald-400 tracking-wider">
                      {lead.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">{lead.name}</h3>
                      <p className="text-sm text-zinc-400 mt-0.5">{lead.role} at <span className="text-zinc-300 font-medium">{lead.company}</span></p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex flex-col items-start sm:items-end">
                      <span className={`text-xs px-2 py-1 rounded-md font-medium border ${
                        lead.status === 'High Intent' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        lead.status === 'Nurturing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        {lead.status}
                      </span>
                      <span className="text-sm text-zinc-500 mt-1 font-mono">Score: {lead.score}</span>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.button whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 border border-transparent hover:border-zinc-600 transition-all">
                        <Mail className="w-4 h-4" />
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 border border-transparent hover:border-zinc-600 transition-all">
                        <MoreHorizontal className="w-4 h-4" />
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
