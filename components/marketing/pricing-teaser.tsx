import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import Link from "next/link";

export function PricingTeaser() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 py-12 pb-24 z-10">
      <Card className="bg-emerald-500 border-0 text-zinc-950 overflow-hidden relative shadow-[0_0_50px_rgba(16,185,129,0.3)]">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-linear-to-l from-white/20 to-transparent skew-x-12 translate-x-1/4 pointer-events-none" />
        <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-zinc-950 rounded-full flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-emerald-500" />
             </div>
             <div>
               <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Scale without limits.</h3>
               <p className="text-emerald-950 font-medium">Pro users get 30 concurrent automations. Start your free trial today.</p>
             </div>
          </div>
          <Link href="/signup" className="shrink-0">
            <Button size="lg" className="bg-zinc-950 text-white hover:bg-zinc-800 rounded-full px-8 shadow-xl border-0 w-full">
              Upgrade to Pro
            </Button>
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
