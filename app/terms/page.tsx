import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Terms of Service",
  description: "Terms and conditions for using Marketme services.",
  path: "/terms",
});

export const dynamic = "force-static";

export default function TermsPage() {
  return (
    <MarketingPageShell mainClassName="justify-center min-h-[80vh] px-6 pt-32 pb-24 w-full max-w-4xl mx-auto">
      <div className="w-full bg-white/4 border border-white/8 backdrop-blur-xl p-10 md:p-16 rounded-3xl shadow-[0_0_80px_rgba(59,130,246,0.05)] text-left">
        <h1 className="text-4xl md:text-5xl font-serif font-light text-white tracking-tighter mb-8 border-b border-white/10 pb-6">
          Terms of Service
        </h1>
        <div className="space-y-6 text-white/60 font-light leading-relaxed text-sm">
          <p>
            By using our Services, you are agreeing to these terms. Please read them carefully.
          </p>
          <h3 className="text-lg text-white font-serif mt-8 mb-3">1. Using our Services</h3>
          <p>
            You must follow any policies made available to you within the Services. Do not misuse our Services. For example, do not interfere with our Services or try to access them using a method other than the interface and the instructions that we provide.
          </p>
          <h3 className="text-lg text-white font-serif mt-8 mb-3">2. Your Content</h3>
          <p>
            Some of our Services allow you to upload, submit, store, send or receive content. You retain ownership of any intellectual property rights that you hold in that content. In short, what belongs to you stays yours.
          </p>
          <h3 className="text-lg text-white font-serif mt-8 mb-3">3. Liability</h3>
          <p>
            When permitted by law, Marketme will not be responsible for lost profits, revenues, or data, financial losses or indirect, special, consequential, exemplary, or punitive damages.
          </p>
          <p className="mt-12 text-white/30 text-xs italic">
            Last updated: June 2026. This is a placeholder for demonstration purposes.
          </p>
        </div>
      </div>
    </MarketingPageShell>
  );
}
