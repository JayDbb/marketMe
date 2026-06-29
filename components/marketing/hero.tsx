"use client"

import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HeroCalendarVisual } from "./hero-calendar-visual";

export function Hero() {
  return (
    <section className="relative w-full flex flex-col items-center justify-center px-6 pt-32 pb-16 overflow-hidden">
      {/* Version badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mb-8 flex items-center gap-2"
      >
        <Link href="#" className="text-xs font-mono tracking-widest text-blue-400 hover:text-blue-300 transition-colors uppercase flex items-center">
          VERSION 3.0 IS LIVE <span className="mx-2">-</span> Read more <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </motion.div>

      {/* Massive headline */}
      <div className="text-center max-w-4xl mx-auto space-y-8 z-10">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(3rem,8vw,5.5rem)] font-serif font-medium tracking-tight text-white leading-[1.05]"
        >
          Marketing, <br className="md:hidden" />
          <span className="font-serif italic font-medium text-blue-400">automated.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg text-white/50 max-w-lg mx-auto leading-relaxed"
        >
          Deploy omnichannel campaigns, route leads intelligently, and predict revenue without writing a single line of code.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-white text-black font-medium rounded-full px-8 h-12 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-0 flex items-center gap-2"
            >
              Get for free
            </Button>
          </Link>
        </motion.div>
      </div>

      <HeroCalendarVisual />
    </section>
  );
}
