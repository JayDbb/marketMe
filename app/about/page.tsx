import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "About",
  description:
    "Marketme is building the intelligent orchestration layer for modern marketing teams.",
  path: "/about",
});

export const dynamic = "force-static";

export default function AboutPage() {
  return (
    <MarketingPageShell mainClassName="justify-center min-h-[80vh] px-6 pt-32 pb-24 w-full max-w-5xl mx-auto">
      <div className="w-full bg-white/4 border border-white/8 backdrop-blur-xl p-12 md:p-24 rounded-3xl text-center shadow-[0_0_80px_rgba(59,130,246,0.05)]">
        <h1 className="text-4xl md:text-6xl font-serif font-light text-white tracking-tighter mb-6">
          About <span className="text-blue-400 italic">Marketme</span>
        </h1>
        <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed font-light">
          We are building the intelligent orchestration layer for modern SaaS teams.
          By merging data-driven automation with premium aesthetic engineering, we help revenue teams scale without losing their soul.
        </p>
      </div>
    </MarketingPageShell>
  );
}
