import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { HeroCalendarVisual } from "./hero-calendar-visual";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative w-full min-h-dvh overflow-x-clip px-5 pb-14 pt-[calc(6.5rem+env(safe-area-inset-top))] sm:px-6 sm:pb-16 md:pt-32 md:pb-20"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
        <div className="z-10 max-w-xl space-y-6 text-left sm:space-y-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400/80 motion-safe:animate-hero-in motion-safe:animation-delay-100">
            Marketme
          </p>

          <h1
            id="hero-heading"
            className="font-serif text-[clamp(2.25rem,8vw,4.75rem)] font-medium leading-[1.05] tracking-tight text-white motion-safe:animate-hero-in motion-safe:animation-delay-150"
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

        <div className="z-10 w-full min-w-0 motion-safe:animate-hero-in motion-safe:animation-delay-250">
          <HeroCalendarVisual />
        </div>
      </div>
    </section>
  );
}
