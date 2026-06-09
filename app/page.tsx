import { Hero } from "@/components/marketing/hero";
import { BentoFeatures } from "@/components/marketing/bento-features";
import { PricingTeaser } from "@/components/marketing/pricing-teaser";
import { Navbar } from "@/components/marketing/navbar";

export default function Home() {
  return (
    <div className="relative min-h-dvh bg-zinc-950 text-zinc-50 overflow-hidden font-sans">
      <Navbar />
      {/* Dense Grid Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />
      
      {/* Ambient Gradient Blobs to fill dark spaces */}
      <div className="fixed top-0 right-0 -mt-20 -mr-20 w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -mb-20 -ml-20 w-[600px] h-[600px] bg-zinc-600/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center w-full">
        <Hero />
        <div className="w-full h-px bg-linear-to-r from-transparent via-zinc-800 to-transparent my-12" />
        <BentoFeatures />
        <PricingTeaser />
      </div>
    </div>
  );
}
