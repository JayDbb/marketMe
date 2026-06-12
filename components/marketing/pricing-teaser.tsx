import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import Link from "next/link";

export function PricingTeaser() {
  return (
    <section className="relative w-full max-w-5xl mx-auto px-6 py-12 pb-24 z-10">
      <div className="relative rounded-2xl border border-blue-500/20 bg-blue-500/8 overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-linear-to-l from-blue-500/10 to-transparent pointer-events-none" />
        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl md:text-4xl font-serif italic font-light tracking-normal text-white mb-2">
                Scale without limits.
              </h3>
              <p className="text-white/50 text-sm font-medium">
                Pro users get 30 concurrent automations. Start your free trial today.
              </p>
            </div>
          </div>
          <Link href="/signup" className="shrink-0">
            <Button
              size="lg"
              className="bg-white text-zinc-950 hover:bg-white/90 rounded-full px-8 shadow-xl border-0 w-full active:scale-[0.97] transition-all duration-150"
            >
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
