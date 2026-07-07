import { Hero } from "@/components/marketing/hero";
import { HomeBelowFold } from "@/components/marketing/home-below-fold";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";

export const dynamic = "force-static";

export default function Home() {
  return (
    <MarketingPageShell>
      <Hero />
      <HomeBelowFold />
    </MarketingPageShell>
  );
}
