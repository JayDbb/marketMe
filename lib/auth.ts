import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"

// Guard: DATABASE_URL must be set at runtime. During build, this module
// may be evaluated with placeholder values — better-auth will log errors
// but won't crash the build since we added it to serverExternalPackages.
const DATABASE_URL = process.env.DATABASE_URL || ""

export const auth = betterAuth({
  database: {
    type: "postgres",
    url: DATABASE_URL,
  },
  emailAndPassword: {
    enabled: true,
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
  ],
  // nextCookies() MUST be last in the plugins array
  plugins: [nextCookies()],
})
