'use client';

import { motion } from 'framer-motion';

export function ProblemStatement() {
  return (
    <section className="py-32 px-6 bg-transparent border-t border-white/8">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto text-center space-y-6"
      >
        <h2 className="text-3xl md:text-5xl font-serif font-medium text-white tracking-tight leading-tight">
          Managing content shouldn't feel like <span className="font-serif italic font-medium text-blue-400">a second job.</span>
        </h2>
        <p className="text-lg md:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto">
          Jumping between tabs, missing post times, losing track of campaigns — there's a better way.
        </p>
      </motion.div>
    </section>
  );
}
