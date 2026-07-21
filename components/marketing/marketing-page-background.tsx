import { cn } from '@/lib/utils'

interface MarketingPageBackgroundProps {
  children: React.ReactNode
  className?: string
}

/** Client-safe marketing page canvas (no server-only imports). */
export function MarketingPageBackground({ children, className }: MarketingPageBackgroundProps) {
  return (
    <div
      className={cn(
        'relative min-h-dvh bg-[#0d1117] text-zinc-50 overflow-x-hidden font-sans selection:bg-blue-500/30 selection:text-white',
        className
      )}
    >
      <div
        className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="fixed top-0 right-0 -mt-20 -mr-20 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="fixed bottom-0 left-0 -mb-20 -ml-20 w-[600px] h-[600px] bg-zinc-600/10 blur-[150px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      {children}
    </div>
  )
}

interface MarketingPageMainProps {
  children: React.ReactNode
  className?: string
}

export function MarketingPageMain({ children, className }: MarketingPageMainProps) {
  return (
    <main
      id="main-content"
      className={cn('relative z-10 flex flex-col items-center w-full', className)}
    >
      {children}
    </main>
  )
}
