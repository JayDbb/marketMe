'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, CheckCircle2 } from 'lucide-react'

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

const mockConnections = [
  { id: 1, brand: 'Apple', time: '2 weeks ago', initial: 'A' },
  { id: 2, brand: "McDonald's", time: '1 month ago', initial: 'M' },
  { id: 3, brand: 'Nike', time: '2 months ago', initial: 'N' },
  { id: 4, brand: 'Apple', time: '2 weeks ago', initial: 'A' },
  { id: 5, brand: "McDonald's", time: '1 month ago', initial: 'M' },
  { id: 6, brand: 'Nike', time: '2 months ago', initial: 'N' },
  { id: 7, brand: 'Apple', time: '2 weeks ago', initial: 'A' },
  { id: 8, brand: "McDonald's", time: '1 month ago', initial: 'M' },
  { id: 9, brand: 'Nike', time: '2 months ago', initial: 'N' },
]

export function ConnectionsContent() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-6 py-10 relative z-10"
    >
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Connection Grid */}
        <motion.div variants={itemVariants} className="flex-1 w-full bg-white dark:bg-white/4 border-zinc-200 backdrop-blur-xl border dark:border-white/8 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none" />
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-white/50 tracking-wider uppercase">Profiles</h2>
            <div className="flex items-center gap-2">
              <Button className="h-8 bg-blue-500 hover:bg-blue-400 text-zinc-900 dark:text-white font-bold rounded-lg text-xs shadow-[0_0_15px_rgba(59,130,246,0.2)] border-0">
                Connect profile
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
            {mockConnections.map((conn, i) => (
              <Card key={i} className="bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-colors shadow-none rounded-xl group cursor-pointer">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white text-[#0c0c18] font-bold flex items-center justify-center text-lg shadow-inner relative">
                      {conn.initial}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0c0c18]" />
                    </div>
                    <button className="text-zinc-500 dark:text-white/30 hover:text-zinc-900 dark:hover:text-white transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-white text-sm truncate">{conn.brand}</h4>
                    <p className="text-[10px] text-zinc-500 dark:text-white/40 mt-0.5">{conn.time}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Right Side: CTA Panel */}
        <motion.div variants={itemVariants} className="w-full lg:w-[400px] shrink-0 pt-10 lg:pt-20 px-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Connect your social profiles</h2>
          <p className="text-sm text-zinc-500 dark:text-white/40 mb-6 leading-relaxed">
            Connecting socials just got easier, thanks to our connections made just for you.
          </p>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3 text-sm text-zinc-500 dark:text-white/70">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <span>Choose from different post variations, including general</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-zinc-500 dark:text-white/70">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <span>Determine posting schedule according to you</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-zinc-500 dark:text-white/70">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <span>Use pre-designed templates to get started quickly</span>
            </li>
          </ul>

          <Button className="h-11 px-8 bg-white text-zinc-950 hover:bg-zinc-100 dark:hover:bg-white/90 font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">
            Connect
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
