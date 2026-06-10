import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 w-full min-h-[100dvh] bg-[#f9fafb] dark:bg-[#09090b] bg-grid-pattern font-sans antialiased">
      {/* Navigation Header */}
      <nav className="max-w-7xl mx-auto w-full px-6 py-8 flex items-center justify-between border-b border-zinc-200/40 dark:border-zinc-800/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-extrabold text-xs shadow-sm">
            M
          </div>
          <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            marketMe
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            href="/linear"
            className="text-xs font-semibold text-zinc-650 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            Dashboard
          </Link>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active development" />
        </div>
      </nav>

      {/* Hero Showcase Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Asymmetric Typography */}
        <div className="lg:col-span-7 flex flex-col gap-6 items-start">
          <span className="text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-2.5 py-1 bg-zinc-100 dark:bg-zinc-850/80 rounded-md border border-zinc-200/10">
            Suite Release 1.0
          </span>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter leading-none text-zinc-900 dark:text-zinc-50">
            Unified workspace integration.
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[54ch]">
            marketMe integrates with engineering suites to organize, analyze, and dispatch project workflows directly from your central operational dashboard.
          </p>
          
          <div className="flex gap-3 mt-4">
            <Link
              href="/linear"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-150 active:scale-[0.97]"
            >
              Open Dashboard
            </Link>
            <a
              href="https://linear.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 text-xs font-semibold text-zinc-700 dark:text-zinc-350 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-[0.97]"
            >
              Linear Settings
            </a>
          </div>
        </div>

        {/* Right Column: Premium Showcase Bento Cards */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Linear Suite Link Card */}
          <Link
            href="/linear"
            className="group relative block p-8 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-[2.5rem] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.03)] hover:shadow-[0_24px_48px_-15px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_24px_48px_-15px_rgba(0,0,0,0.4)] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 ease-out"
          >
            {/* Spotlight shimmer decoration line */}
            <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-zinc-250 to-transparent dark:via-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 font-mono font-bold text-sm shadow-md transition-transform group-hover:scale-105 duration-300">
                  L
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-650 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-250/10 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ready to test
                </span>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-black dark:group-hover:text-white transition-colors">
                  Linear Integration Suite
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Kanban status tracking, dynamic priority filtering, productivity analytics, activity logging, and live personal token synchronization.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800/40 text-xs font-semibold text-zinc-750 dark:text-zinc-300">
                <span>Configure workspace</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transform group-hover:translate-x-1 transition-transform duration-200"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Secondary stats card for visual structure */}
          <div className="p-6 bg-white dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-805 rounded-[2.5rem] flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                Active Modules
              </span>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-250">
                Linear Workspace
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
                v1.0.0
              </span>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

