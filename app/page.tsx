import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { LogoBar } from "@/components/marketing/logo-bar";
import { ProblemStatement } from "@/components/marketing/problem-statement";
import { SocialProof } from "@/components/marketing/social-proof";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { FaqSection } from "@/components/marketing/faq-section";
import { FinalCta } from "@/components/marketing/final-cta";
import { Footer } from "@/components/marketing/footer";

export default function Home() {
  return (
    <div className="relative min-h-dvh bg-[#0d1117] text-zinc-50 overflow-x-hidden font-sans selection:bg-blue-500/30 selection:text-white">
      <Navbar />

      {/* Dense Grid Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none" />
      
      {/* Ambient Gradient Blobs to fill dark spaces */}
      <div className="fixed top-0 right-0 -mt-20 -mr-20 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -mb-20 -ml-20 w-[600px] h-[600px] bg-zinc-600/10 blur-[150px] rounded-full pointer-events-none" />

      <main id="main" className="relative z-10 flex flex-col items-center w-full">
        <Hero />
        <LogoBar />
        <div className="w-full max-w-5xl mx-auto h-px bg-linear-to-r from-transparent via-zinc-800 to-transparent my-12" />
        
        <ProblemStatement />
        <SocialProof />
        <HowItWorks />
        <FaqSection />
        <FinalCta />
      </main>
      
      <Footer />
    </div>
  );
}

