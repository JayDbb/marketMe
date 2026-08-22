<<<<<<< HEAD
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
=======
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { HeroCalendarVisual } from "./hero-calendar-visual";
>>>>>>> origin/development

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
<<<<<<< HEAD
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
=======
      className="relative w-full min-h-dvh overflow-hidden px-6 pt-28 pb-16 md:pt-32 md:pb-20"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
        <div className="z-10 max-w-xl space-y-8 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400/80 motion-safe:animate-hero-in motion-safe:animation-delay-100">
            Marketme
          </p>

          <h1
            id="hero-heading"
            className="font-serif text-[clamp(2.75rem,6vw,4.75rem)] font-medium leading-[1.05] tracking-tight text-white motion-safe:animate-hero-in motion-safe:animation-delay-150"
          >
            Draft, review,{" "}
            <span className="font-serif italic font-medium text-sky-400">
              schedule.
            </span>
          </h1>

          <p className="max-w-[36ch] text-base leading-relaxed text-white/50 md:text-lg motion-safe:animate-hero-in motion-safe:animation-delay-250">
            AI helps you write. You approve every post. Then Marketme schedules
            across the accounts you connect — built for small teams who ship
            weekly content.
          </p>

          <div className="flex flex-col items-start gap-4 pt-2 sm:flex-row sm:items-center motion-safe:animate-hero-in motion-safe:animation-delay-350">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 font-medium text-black transition-[transform,background-color] duration-150 ease-out hover:bg-white/90 hover:scale-[1.02] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
            >
              Start free
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-white/55 transition-colors duration-200 hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80"
            >
              See how it works
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
>>>>>>> origin/development

        <div className="z-10 w-full min-w-0 motion-safe:animate-hero-in motion-safe:animation-delay-250">
          <HeroCalendarVisual />
        </div>
      </div>
    </section>
  );
}
