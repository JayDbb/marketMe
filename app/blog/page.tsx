import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export default function BlogPage() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden font-sans bg-[#0a0a14]">
      <Navbar />

      {/* Deep space background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(56,90,200,0.25),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[32px_32px]" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 pt-32 pb-24 w-full max-w-5xl mx-auto">
        <div className="w-full bg-white/4 border border-white/8 backdrop-blur-xl p-12 md:p-24 rounded-3xl text-center shadow-[0_0_80px_rgba(59,130,246,0.05)]">
          <h1 className="text-4xl md:text-6xl font-serif font-light text-white tracking-tighter mb-6">
            The <span className="text-blue-400 italic">Marketme</span> Blog
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed font-light mb-12">
            Insights on marketing automation, generative AI, and building intelligent SaaS products.
          </p>
          <div className="p-8 border border-dashed border-white/10 rounded-2xl bg-white/5 text-white/30 text-sm">
            Coming Soon: Articles on edge-deployment for global campaigns and scaling vector databases for lead scoring.
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
