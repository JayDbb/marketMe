import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { Clock } from "lucide-react";

export default function ChangelogPage() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden font-sans bg-[#0a0a14]">
      <Navbar />

      {/* Deep space background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(56,90,200,0.25),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <main className="relative z-10 flex flex-col items-center min-h-[80vh] px-6 pt-40 pb-24 w-full max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif font-light text-white tracking-tighter mb-6">
            Platform <span className="text-blue-400 italic">Updates</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed font-light">
            New features, visual improvements, and architectural scaling.
          </p>
        </div>

        <div className="w-full space-y-8">
          {/* Latest Update */}
          <div className="w-full bg-white/4 border border-white/8 backdrop-blur-xl p-8 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest mb-4">
              <Clock className="w-3.5 h-3.5" />
              <span>June 2026</span>
            </div>
            <h2 className="text-2xl font-serif text-white mb-3 tracking-tight">Global Dark Mode Redesign</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-6 font-light">
              MarketMe 3.0 has completely transitioned to a deep-navy dark aesthetic. We replaced the legacy emerald palette with a striking electric blue, introduced atmospheric radial gradients, and rebuilt the dashboard to use authentic, hardware-accelerated glassmorphism.
            </p>
            <ul className="space-y-2 text-sm text-white/40">
              <li className="flex gap-2"><span className="text-blue-500">•</span> New login and signup flows with 3D orbs.</li>
              <li className="flex gap-2"><span className="text-blue-500">•</span> Complete content calendar Kanban redesign.</li>
              <li className="flex gap-2"><span className="text-blue-500">•</span> Added responsive sidebars and faceted navigation.</li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
