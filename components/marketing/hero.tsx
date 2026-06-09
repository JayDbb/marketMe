import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ChartBar, ArrowRight, MousePointer2 } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 pt-32 pb-16 flex flex-col items-center">
      
      {/* Dense decorative elements to fill space */}
      <div className="hidden lg:block absolute top-40 left-10 xl:left-20 animate-bounce" style={{ animationDuration: '3s' }}>
         <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur border border-zinc-800 text-zinc-300 text-xs px-3 py-1.5 rounded-full shadow-lg">
            <MousePointer2 className="w-3 h-3 text-emerald-400" />
            <span>Auto-optimized</span>
         </div>
      </div>
      <div className="hidden lg:block absolute top-60 right-10 xl:right-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
         <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur border border-zinc-800 text-zinc-300 text-xs px-3 py-1.5 rounded-full shadow-lg">
            <Users className="w-3 h-3 text-emerald-400" />
            <span>+400 Leads routed</span>
         </div>
      </div>

      <div className="text-center max-w-3xl flex flex-col items-center space-y-6 z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <Badge variant="outline" className="bg-zinc-900/50 text-zinc-300 border-zinc-800 px-4 py-1.5 rounded-full">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
          Marketme 3.0 is live
        </Badge>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
          Marketing, <span className="text-zinc-500">automated.</span>
        </h1>
        
        <p className="text-lg text-zinc-400 max-w-xl mx-auto">
          Deploy omnichannel campaigns, route leads intelligently, and predict revenue without writing a single line of code.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link href="/signup">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold rounded-full px-8 h-12 shadow-[0_0_30px_rgba(16,185,129,0.3)] border-0 w-full sm:w-auto">
              Start your engine
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="bg-zinc-900/50 hover:bg-zinc-800 text-white border-zinc-700 rounded-full px-8 h-12">
            View Demo
          </Button>
        </div>
      </div>

      {/* Clean, visible Dashboard Mockup using Shadcn styling */}
      <div className="w-full max-w-5xl mt-20 p-2 md:p-4 bg-zinc-900/40 rounded-3xl md:rounded-[2rem] border border-zinc-800/50 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
        <div className="w-full bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-inner">
          <div className="h-12 border-b border-zinc-800 flex items-center px-6 gap-2">
             <div className="w-3 h-3 rounded-full bg-zinc-700" />
             <div className="w-3 h-3 rounded-full bg-zinc-700" />
             <div className="w-3 h-3 rounded-full bg-zinc-700" />
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-zinc-900/20">
             <div className="md:col-span-2 bg-zinc-900 rounded-xl border border-zinc-800 p-6 h-64 flex items-end gap-2">
                {[40, 70, 45, 90, 65, 80, 100, 60, 85].map((h, i) => (
                  <div key={i} className="flex-1 bg-emerald-500/10 rounded-t border-t border-emerald-500/30 relative group h-full flex items-end">
                    <div style={{ height: `${h}%` }} className="w-full bg-linear-to-t from-emerald-500/20 to-emerald-400/80 rounded-t relative hover:brightness-125 transition-all">
                       <div className="absolute top-0 w-full h-0.5 bg-emerald-300" />
                    </div>
                  </div>
                ))}
             </div>
             <div className="flex flex-col gap-6">
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 flex-1 flex flex-col justify-center">
                   <p className="text-zinc-400 text-sm mb-2 flex items-center gap-2"><Users className="w-4 h-4" /> Active Leads</p>
                   <p className="text-4xl font-bold text-white">4,291</p>
                </div>
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 flex-1 flex flex-col justify-center">
                   <p className="text-zinc-400 text-sm mb-2 flex items-center gap-2"><ChartBar className="w-4 h-4" /> Conversion</p>
                   <p className="text-4xl font-bold text-white flex items-baseline gap-2">8.4% <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+1.2%</span></p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
