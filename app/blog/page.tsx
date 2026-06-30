import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Blog",
  description:
    "Insights on marketing automation, generative AI, and building intelligent SaaS products.",
  path: "/blog",
});

export const dynamic = "force-static";

export default function BlogPage() {
  return (
    <MarketingPageShell mainClassName="justify-center min-h-[80vh] px-6 pt-32 pb-24 w-full max-w-5xl mx-auto">
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
    </MarketingPageShell>
  );
}
