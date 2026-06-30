import { BentoFeatures } from "@/components/marketing/bento-features";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Features",
  description:
    "AI content generation, smart scheduling, approval workflows, and cross-platform analytics — everything you need to scale social marketing.",
  path: "/features",
});

export const dynamic = "force-static";

export default function FeaturesPage() {
  return (
    <MarketingPageShell mainClassName="pt-40 pb-24">
      <div className="max-w-4xl mx-auto px-6 text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-serif font-light tracking-tighter text-white mb-6">
          Everything you need to <span className="italic font-medium text-blue-400">scale</span>
        </h1>
        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto">
          Marketme combines powerful AI generation with enterprise-grade scheduling and analytics to put your social media growth on autopilot.
        </p>
      </div>

      <BentoFeatures />

      <div className="w-full max-w-5xl mx-auto h-px bg-linear-to-r from-transparent via-zinc-800 to-transparent my-12" />

      <HowItWorks />

      <div className="w-full max-w-5xl mx-auto h-px bg-linear-to-r from-transparent via-zinc-800 to-transparent my-12" />

      <FinalCta />
    </MarketingPageShell>
  );
}
