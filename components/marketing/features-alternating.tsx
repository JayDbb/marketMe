'use client';

import { motion } from 'framer-motion';
import { Calendar, Sparkles, Send, BarChart2 } from 'lucide-react';

const features = [
  {
    icon: <Calendar className="w-4 h-4 text-[#3fb950]" />,
    headline: "Plan your entire week visually",
    description: "Drag, drop, and schedule posts across all platforms in one dark, beautiful calendar.",
    Visual: CalendarVisual
  },
  {
    icon: <Sparkles className="w-4 h-4 text-[#3fb950]" />,
    headline: "AI writes your captions",
    description: "Generate platform-optimized content in seconds — just describe your post.",
    Visual: AIVisual
  },
  {
    icon: <Send className="w-4 h-4 text-[#3fb950]" />,
    headline: "Auto-publish everywhere",
    description: "Twitter, LinkedIn, Instagram — post once, publish everywhere on your schedule.",
    Visual: PublishVisual
  },
  {
    icon: <BarChart2 className="w-4 h-4 text-[#3fb950]" />,
    headline: "See what's actually working",
    description: "Track engagement, reach, and growth across every channel in one dashboard.",
    Visual: AnalyticsVisual
  }
];

function CalendarVisual() {
  return (
    <div className="w-full h-full bg-[#1c2128] rounded-xl border border-[#30363d] overflow-hidden flex flex-col p-4">
      <div className="grid grid-cols-3 gap-2 flex-1">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-4 bg-[#30363d] rounded w-1/2" />
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#0d1117] border border-[#30363d] p-3 rounded-lg space-y-2"
            >
              <div className="flex gap-2">
                <div className="w-4 h-4 rounded-full bg-white/10" />
                <div className="h-4 w-12 rounded-full bg-[#3fb950]/20 border border-[#3fb950]/30" />
              </div>
              <div className="h-2 bg-white/10 rounded w-full" />
              <div className="h-2 bg-white/10 rounded w-2/3" />
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIVisual() {
  return (
    <div className="w-full h-full bg-[#1c2128] rounded-xl border border-[#30363d] overflow-hidden flex flex-col p-4 gap-4">
      <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded-lg">
        <p className="text-xs text-white/40 mb-2">Prompt</p>
        <div className="flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-[#3fb950]" />
          <p className="text-sm text-white/80">Write a thread about the new redesign...</p>
        </div>
      </div>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        whileInView={{ height: 'auto', opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="flex-1 bg-[#0d1117] border border-[#3fb950]/30 p-3 rounded-lg space-y-2 relative"
      >
        <div className="absolute inset-0 bg-[#3fb950]/5 animate-pulse rounded-lg" />
        <div className="h-2 bg-white/20 rounded w-full" />
        <div className="h-2 bg-white/20 rounded w-full" />
        <div className="h-2 bg-white/20 rounded w-4/5" />
      </motion.div>
    </div>
  );
}

function PublishVisual() {
  return (
    <div className="w-full h-full bg-[#1c2128] rounded-xl border border-[#30363d] flex items-center justify-center relative overflow-hidden">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        className="bg-[#0d1117] border border-[#3fb950]/40 p-4 rounded-xl shadow-[0_0_30px_rgba(63,185,80,0.15)] flex flex-col items-center gap-4 z-10"
      >
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-[#0d1117] flex items-center justify-center text-white text-[10px]">TW</div>
          <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-[#0d1117] flex items-center justify-center text-white text-[10px]">IN</div>
          <div className="w-8 h-8 rounded-full bg-pink-600 border-2 border-[#0d1117] flex items-center justify-center text-white text-[10px]">IG</div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#3fb950] bg-[#3fb950]/10 px-3 py-1 rounded-full">
          <Send className="w-3 h-3" /> Scheduled for 10:00 AM
        </div>
      </motion.div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(63,185,80,0.1)_0%,transparent_60%)]" />
    </div>
  );
}

function AnalyticsVisual() {
  return (
    <div className="w-full h-full bg-[#1c2128] rounded-xl border border-[#30363d] p-4 flex flex-col gap-4">
      <div className="flex justify-between items-end h-32 px-4 pb-2 border-b border-[#30363d]">
        {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
          <motion.div 
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5, type: 'spring' }}
            className={`w-6 rounded-t-sm ${i === 6 ? 'bg-[#3fb950]' : 'bg-[#30363d]'}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded-lg">
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Engagement</p>
          <p className="text-lg text-white font-mono">14,209</p>
        </div>
        <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded-lg">
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Growth</p>
          <p className="text-lg text-[#3fb950] font-mono">+24.5%</p>
        </div>
      </div>
    </div>
  );
}

export function FeaturesAlternating() {
  return (
    <section id="features" className="py-24 bg-[#0d1117] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 space-y-32">
        {features.map((feature, idx) => {
          const isEven = idx % 2 === 0;
          const Visual = feature.Visual;

          return (
            <div key={idx} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-24`}>
              {/* Text content */}
              <motion.div 
                initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex-1 space-y-4"
              >
                <div className="w-10 h-10 rounded-full bg-[#3fb950]/10 border border-[#3fb950]/20 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-3xl md:text-4xl font-serif font-medium text-white tracking-tight leading-tight">
                  {feature.headline}
                </h3>
                <p className="text-base text-white/50 leading-relaxed max-w-md">
                  {feature.description}
                </p>
              </motion.div>

              {/* Visual content */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex-1 w-full aspect-square md:aspect-4/3 max-w-[500px]"
              >
                <Visual />
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
