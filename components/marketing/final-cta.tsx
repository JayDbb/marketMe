'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function FinalCta() {
  return (
    <section className="relative py-40 bg-transparent overflow-hidden border-t border-white/8">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-serif font-medium text-white tracking-tight"
        >
          Start scheduling <span className="font-serif italic font-medium text-blue-400">smarter today.</span>
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center justify-center gap-3 text-xs md:text-sm text-white/30 tracking-wide font-medium"
        >
          <span>Free forever</span>
          <span>&middot;</span>
          <span>No credit card</span>
          <span>&middot;</span>
          <span>Set up in 2 minutes</span>
          <span>&middot;</span>
          <span>SOC2 certified</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="pt-2"
        >
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-white text-black font-medium rounded-full px-8 h-14 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.1)] border-0 flex items-center gap-2 group mx-auto text-base"
            >
              Get started for free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
