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
      <div className="mb-8 flex items-center gap-2 motion-safe:animate-hero-in motion-safe:animation-delay-100">
        <Link
          href="/changelog"
          className="text-xs font-mono tracking-widest text-blue-400 hover:text-blue-300 transition-colors uppercase flex items-center"
        >
          VERSION 3.0 IS LIVE <span className="mx-2">-</span> Read more{" "}
          <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
        </Link>
      </div>

      <div className="text-center max-w-4xl mx-auto space-y-8 z-10">
        <h1
          id="hero-heading"
          className="text-[clamp(3rem,8vw,5.5rem)] font-serif font-medium tracking-tight text-white leading-[1.05] motion-safe:animate-hero-in motion-safe:animation-delay-150"
        >
          Marketing, <br className="md:hidden" />
          <span className="font-serif italic font-medium text-blue-400">automated.</span>
        </h1>

        <p className="text-base md:text-lg text-white/50 max-w-lg mx-auto leading-relaxed motion-safe:animate-hero-in motion-safe:animation-delay-250">
          Deploy omnichannel campaigns, route leads intelligently, and predict revenue without writing a single line of code.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 motion-safe:animate-hero-in motion-safe:animation-delay-350">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center bg-white text-black font-medium rounded-full px-8 h-12 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
          >
            Get for free
          </Link>
        </div>
      </div>

      <HeroCalendarVisual />
    </section>
  );
}
