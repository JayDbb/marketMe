import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent pg/better-auth from being bundled — they use Node.js native APIs
  serverExternalPackages: ["pg", "better-auth"],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
