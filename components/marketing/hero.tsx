"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const HeroCalendarVisual = dynamic(
  () =>
    import("./hero-calendar-visual").then((mod) => ({
      default: mod.HeroCalendarVisual,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="relative w-full max-w-[800px] mx-auto mt-16 aspect-video rounded-2xl bg-white/5 motion-safe:animate-pulse"
        aria-hidden="true"
      />
    ),
  }
);

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative w-full flex flex-col items-center justify-center px-6 pt-32 pb-16 overflow-hidden"
    >
      <div className="text-center max-w-4xl mx-auto space-y-8 z-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400/80 motion-safe:animate-hero-in motion-safe:animation-delay-100">
          Marketme
        </p>

        <h1
          id="hero-heading"
          className="text-[clamp(2.75rem,7vw,5rem)] font-serif font-medium tracking-tight text-white leading-[1.05] motion-safe:animate-hero-in motion-safe:animation-delay-150"
        >
          Draft, review,{" "}
          <span className="font-serif italic font-medium text-sky-400">schedule.</span>
        </h1>

        <p className="text-base md:text-lg text-white/50 max-w-lg mx-auto leading-relaxed motion-safe:animate-hero-in motion-safe:animation-delay-250">
          AI helps you write. You approve every post. Then Marketme schedules across the
          accounts you connect — built for small teams who ship weekly content.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 motion-safe:animate-hero-in motion-safe:animation-delay-350">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center bg-white text-black font-medium rounded-full px-8 h-12 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
          >
            Start free
          </Link>
          <Link
            href="/features"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/55 transition-colors hover:text-sky-300"
          >
            See how it works
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <HeroCalendarVisual />
    </section>
  );
}
