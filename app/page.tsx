import { Hero } from "@/components/marketing/hero";
import { BentoFeatures } from "@/components/marketing/bento-features";
import { FaqSection } from "@/components/marketing/faq-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export default function Home() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden font-sans bg-[#0a0a14]">
      <Navbar />

      {/* Deep space background — matching the dark purple/blue globe reference */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {/* Base radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(56,90,200,0.25),transparent)]" />
        {/* Globe-like orb in center-bottom of hero */}
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(60,80,180,0.35)_0%,rgba(30,40,120,0.2)_40%,transparent_70%)] blur-[2px]" />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
        {/* Edge vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_100%,rgba(10,10,20,0.9),transparent_60%)]" />
      </div>

      <div id="main" className="relative z-10 flex flex-col items-center w-full">
        <Hero />
        <BentoFeatures />
        <FaqSection />
        <CtaSection />
      </div>
      <Footer />
    </div>
  );
}
