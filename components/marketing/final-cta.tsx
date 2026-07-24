import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-white/8 bg-transparent py-32 md:py-40">
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.12)_0%,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl space-y-8 px-6 text-center">
        <h2 className="font-serif text-4xl font-medium tracking-tight text-white md:text-6xl">
          Start scheduling{' '}
          <span className="font-serif italic font-medium text-sky-400">smarter today.</span>
        </h2>

        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-medium tracking-wide text-white/35 md:text-sm">
          <span>Free to start</span>
          <span aria-hidden="true">·</span>
          <span>No credit card required</span>
          <span aria-hidden="true">·</span>
          <span>Human review before publish</span>
        </p>

        <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'group h-14 gap-2 rounded-full border-0 bg-white px-8 text-base font-medium text-black hover:bg-white/90'
            )}
          >
            Get started for free
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-white/50 transition-colors hover:text-sky-300"
          >
            Compare plans →
          </Link>
        </div>
      </div>
    </section>
  )
}
