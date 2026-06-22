import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Moved from experimental per Next.js 16 deprecation notice
  cacheComponents: true,
  // Prevent pg/better-auth from being bundled — they use Node.js native APIs
  serverExternalPackages: ["pg", "better-auth"],
};

export default nextConfig;
