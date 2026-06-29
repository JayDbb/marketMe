import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { dash } from "@better-auth/infra"
import { Pool } from "pg"

// Guard: DATABASE_URL must be set at runtime. During build, this module
// may be evaluated with placeholder values — better-auth will log errors
// but won't crash the build since we added it to serverExternalPackages.
const DATABASE_URL = process.env.DATABASE_URL || ""
console.log("[Better Auth Init] DATABASE_URL defined:", !!DATABASE_URL, "length:", DATABASE_URL.length);

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

export const auth = betterAuth({
  database: pool,
  experimental: {
    joins: true,
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-vercel-forwarded-for", "x-forwarded-for"],
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  accountLinking: {
    enabled: true,
    trustedProviders: ["google"],
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  session: {
    // 30 days session expiry
    expiresIn: 60 * 60 * 24 * 30,
    // Refresh session if it's within 1 day of expiring
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || "build-time-placeholder-secret-not-used",
  // Trust the host header from Next.js
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
    "http://localhost:3005",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "http://127.0.0.1:3003",
  ],
  // nextCookies() MUST be last in the plugins array
  plugins: [
    dash({
      apiKey: process.env.BETTER_AUTH_API_KEY,
      activityTracking: {
        enabled: false,
      },
    }),
    nextCookies(),
  ],
})
