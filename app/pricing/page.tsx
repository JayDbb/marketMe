import { PricingTeaser } from "@/components/marketing/pricing-teaser";
import { FaqSection } from "@/components/marketing/faq-section";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Pricing",
  description:
    "Simple, transparent pricing for teams of every size. Unlimited scheduling and AI generation on every plan.",
  path: "/pricing",
});

export const dynamic = "force-static";

export default function PricingPage() {
  return (
    <MarketingPageShell mainClassName="pt-40 pb-24">
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
    </MarketingPageShell>
  );
}
