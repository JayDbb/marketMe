"use client"

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const trustedBy = [
  "Acme Corp",
  "Quantum",
  "Echo Valley",
  "Celestial",
  "PULSE",
  "APEX",
];

export function Hero() {
  return (
    <section className="relative w-full min-h-dvh flex flex-col items-center justify-center px-6 pt-28 pb-16 overflow-hidden">

      {/* Version badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="mb-8 flex items-center gap-2"
      >
        <span className="text-xs text-blue-300/70 tracking-widest uppercase font-mono">
          Version 3.0 is live
        </span>
        <span className="text-xs text-white/40">·</span>
        <Link href="/changelog" className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200 underline underline-offset-2 decoration-blue-500/40">
          Read more
        </Link>
        <ArrowRight className="w-3 h-3 text-blue-400" />
      </motion.div>

      {/* Massive headline */}
      <div className="text-center max-w-4xl mx-auto space-y-4 z-10">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(3.5rem,10vw,7rem)] font-serif font-light tracking-tighter text-white leading-[0.95]"
        >
          Marketing,{" "}
          <br />
          <span className="italic text-blue-400">automated.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg text-white/50 max-w-sm mx-auto leading-relaxed"
        >
          Deploy omnichannel campaigns, route leads intelligently, and predict revenue without writing a single line of code.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="pt-4"
        >
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-white text-zinc-950 font-semibold rounded-full px-8 h-12 hover:bg-white/90 active:scale-[0.97] transition-all duration-150 shadow-[0_0_40px_rgba(99,130,255,0.3)] border-0"
            >
              Get for free
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Glowing orb sphere — the centrepiece from the reference */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative mt-16 w-full max-w-2xl mx-auto"
        aria-hidden="true"
      >
        {/* Glowing sphere body with continuous float */}
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="relative mx-auto w-[min(90vw,520px)] aspect-square rounded-full overflow-hidden"
        >
          {/* Main orb gradient */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_30%_30%,rgba(130,150,255,0.6)_0%,rgba(60,80,200,0.7)_35%,rgba(20,30,120,0.9)_65%,rgba(8,10,40,1)_100%)]" />
          {/* Highlight sheen with slight pulsing */}
          <motion.div 
            animate={{ opacity: [0.6, 1, 0.6], scale: [0.95, 1.05, 0.95] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute top-[8%] left-[20%] w-[35%] h-[20%] rounded-full bg-white/20 blur-md rotate-[-20deg]" 
          />
          {/* Inner depth ring */}
          <div className="absolute inset-[15%] rounded-full border border-blue-400/10" />
          {/* Bottom glow */}
          <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[60%] h-[30%] bg-blue-500/15 rounded-full blur-2xl" />
        </motion.div>

        {/* Ground glow beneath sphere pulsating to match */}
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[80%] h-16 bg-blue-600/30 rounded-full blur-3xl" 
        />

        {/* Floating dashboard UI overlay — different float speed for parallax depth */}
        <motion.div 
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
          className="absolute top-[6%] right-[-5%] md:right-[-12%] w-[55%] max-w-[280px] bg-zinc-900/80 backdrop-blur-md border border-white/8 rounded-xl p-3 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Live pipeline</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          </div>
          {[
            { label: "Product", val: "14 apr 11", pct: 72 },
            { label: "Analytics", val: "12 apr 09", pct: 55 },
            { label: "Finances", val: "09 apr 16", pct: 38 },
          ].map((row) => (
            <div key={row.label} className="mb-2 last:mb-0">
              <div className="flex justify-between text-[9px] text-white/50 mb-0.5">
                <span>{row.label}</span>
                <span>{row.val}</span>
              </div>
              <div className="h-0.5 w-full bg-white/5 rounded-full">
                <div
                  className="h-full bg-blue-500/70 rounded-full"
                  style={{ width: `${row.pct}%` }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Trusted by strip */}
      <motion.div
        id="customers"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="mt-16 flex flex-col items-center gap-4 z-10"
      >
        <p className="text-[11px] uppercase tracking-widest text-white/25 font-mono">
          Trusted by the next-gen productive teams
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {trustedBy.map((brand) => (
            <span
              key={brand}
              className="text-xs text-white/25 font-semibold tracking-wide hover:text-white/40 transition-colors duration-200"
            >
              {brand}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
