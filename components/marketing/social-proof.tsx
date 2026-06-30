'use client';

import { motion } from 'framer-motion';

const impactMetrics = [
  {
    metric: "Saved 15 hours a week",
    description: "By automating the entire content pipeline across 3 platforms, eliminating manual posting.",
    role: "Director of Marketing at SaaS Startup"
  },
  {
    metric: "3x Faster Approval",
    description: "The pending approval workflow completely eliminated messy Slack back-and-forths.",
    role: "Independent Creator"
  },
  {
    metric: "98% On-time Rate",
    description: "Never missed a scheduled campaign launch since migrating to the unified calendar.",
    role: "Lead Content Strategist"
  }
];

const stats = [
  { number: "4,200+", label: "Active creators" },
  { number: "98%", label: "On-time publish rate" },
  { number: "3x", label: "Faster content workflow" }
];

export function SocialProof() {
  return (
    <section className="py-32 bg-transparent border-t border-white/8">
      <div className="max-w-6xl mx-auto px-6 space-y-24">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-serif font-medium text-white tracking-tight"
          >
            Real impact, <span className="font-serif italic font-medium text-blue-400">measurable results.</span>
          </motion.h2>
        </div>

        {/* Impact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {impactMetrics.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              className="bg-white/4 backdrop-blur-sm border border-white/8 rounded-2xl p-8 flex flex-col justify-between hover:border-white/12 transition-all duration-300"
            >
              <div className="space-y-4">
                <h3 className="text-xl font-serif font-medium text-white">{item.metric}</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  &ldquo;{item.description}&rdquo;
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-white/8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                  <span className="text-[10px] text-blue-400 font-mono uppercase">{item.role.charAt(0)}</span>
                </div>
                <span className="text-[11px] text-white/40 uppercase tracking-widest font-medium">
                  {item.role}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Stats Row */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-white/8"
        >
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center space-y-2">
              <p className="text-5xl font-serif font-light text-white tracking-tighter tabular">
                {stat.number}
              </p>
              <p className="text-sm text-blue-400 font-medium tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
