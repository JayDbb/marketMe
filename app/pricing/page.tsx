import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { PricingTeaser } from "@/components/marketing/pricing-teaser";
import { FaqSection } from "@/components/marketing/faq-section";
import { FinalCta } from "@/components/marketing/final-cta";

export default function PricingPage() {
  return (
    <div className="relative min-h-dvh bg-[#0d1117] text-zinc-50 overflow-x-hidden font-sans selection:bg-blue-500/30 selection:text-white">
      <Navbar />

      {/* Dense Grid Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none" />
      
      {/* Ambient Gradient Blobs to fill dark spaces */}
      <div className="fixed top-0 right-0 -mt-20 -mr-20 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -mb-20 -ml-20 w-[600px] h-[600px] bg-zinc-600/10 blur-[150px] rounded-full pointer-events-none" />

      <main className="relative z-10 flex flex-col items-center w-full pt-40 pb-24">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-6 text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif font-light tracking-tighter text-white mb-6">
            Simple, transparent <span className="italic font-medium text-blue-400">pricing</span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto">
            Choose the perfect plan for your team. Every plan includes unlimited scheduling and AI generation.
          </p>
        </div>

        <PricingTeaser />
        
        <div className="w-full max-w-5xl mx-auto h-px bg-linear-to-r from-transparent via-zinc-800 to-transparent my-12" />
        
        <FaqSection />
        
        <div className="w-full max-w-5xl mx-auto h-px bg-linear-to-r from-transparent via-zinc-800 to-transparent my-12" />
        
        <FinalCta />
      </main>
      
      <Footer />
    </div>
  );
}
