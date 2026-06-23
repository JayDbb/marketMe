'use client';

import { motion } from 'framer-motion';
import { Send, Clock, CheckCircle2, FileEdit } from 'lucide-react';

const mockPosts = [
  { day: 'Mon', status: 'published', delay: 0 },
  { day: 'Mon', status: 'approved', delay: 0.1 },
  { day: 'Tue', status: 'scheduled', delay: 0.2 },
  { day: 'Tue', status: 'draft', delay: 0.3 },
  { day: 'Wed', status: 'approved', delay: 0.4 },
  { day: 'Wed', status: 'scheduled', delay: 0.5 },
  { day: 'Wed', status: 'draft', delay: 0.6 },
  { day: 'Thu', status: 'published', delay: 0.7 },
  { day: 'Thu', status: 'draft', delay: 0.8 },
  { day: 'Fri', status: 'scheduled', delay: 0.9 },
  { day: 'Fri', status: 'approved', delay: 1.0 },
];

function StatusBadge({ status }: { status: string }) {
  if (status === 'published') return <div className="flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30"><Send className="w-2.5 h-2.5" /> Published</div>;
  if (status === 'scheduled') return <div className="flex items-center gap-1 text-[9px] text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30"><Clock className="w-2.5 h-2.5" /> Scheduled</div>;
  if (status === 'approved') return <div className="flex items-center gap-1 text-[9px] text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30"><CheckCircle2 className="w-2.5 h-2.5" /> Approved</div>;
  return <div className="flex items-center gap-1 text-[9px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full border border-white/10"><FileEdit className="w-2.5 h-2.5" /> Draft</div>;
}

export function HeroCalendarVisual() {
  return (
    <div className="relative w-full max-w-[800px] mx-auto mt-16 aspect-video perspective-[1000px]">
      <motion.div 
        initial={{ rotateX: 20, rotateY: -10, opacity: 0, y: 40 }}
        animate={{ rotateX: 10, rotateY: -5, opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="w-full h-full bg-[#1c2128] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Mock Header */}
        <div className="h-12 border-b border-[#30363d] flex items-center justify-between px-4 bg-[#0d1117]/50 relative">
          <div className="flex gap-1.5 z-10">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-xs font-medium text-white/40 tracking-wide flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              </span>
              Marketme — Content Calendar
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-5 divide-x divide-[#30363d]">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
            <div key={day} className="flex flex-col">
              <div className="h-8 border-b border-[#30363d] flex items-center justify-center text-[10px] font-medium text-white/40 uppercase tracking-widest bg-[#0d1117]/30">
                {day}
              </div>
              <div className="flex-1 p-2 flex flex-col gap-2 relative bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[100%_40px] overflow-hidden">
                {/* Find post for this day */}
                {mockPosts.filter(p => p.day === day).map((post, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.6 + post.delay, duration: 0.5 }}
                    className="relative bg-[#0d1117] border border-[#30363d] rounded-lg p-2.5 shadow-xl shrink-0"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="w-4 h-4 rounded bg-white/10 shrink-0" />
                      <StatusBadge status={post.status} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 w-full bg-white/10 rounded-full" />
                      <div className="h-1.5 w-2/3 bg-white/10 rounded-full" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Decorative glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-blue-500/10 blur-[100px] pointer-events-none -z-10" />
    </div>
  );
}
