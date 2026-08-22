import { betterAuth } from "better-auth"
import { magicLink } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { dash } from "@better-auth/infra"
import { Pool } from "pg"
import { getResendClient } from "@/lib/resend"

function hostFromUrl(value: string | undefined): string | null {
  if (!value) return null
  try {
    return new URL(value).host
  } catch {
    return null
  }
}

/**
 * Dynamic base URL for Vercel previews + local ports.
 * Without this, BETTER_AUTH_URL=http://localhost:3000 on Vercel makes Google
 * OAuth use redirect_uri=http://localhost:3000/... and the flow never returns.
 */
function buildBaseURLConfig() {
  const allowedHosts = new Set<string>([
    "localhost:*",
    "127.0.0.1:*",
    "*.vercel.app",
  ])

  for (const value of [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ]) {
    const host = hostFromUrl(value)
    if (host) allowedHosts.add(host)
  }

  for (const host of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]) {
    if (host) allowedHosts.add(host)
  }

  // Prefer a non-localhost public URL as fallback so mis-matched hosts
  // don't silently send OAuth callbacks to the developer's machine.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const authUrl = process.env.BETTER_AUTH_URL
  const vercelUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : undefined
  const fallback =
    (siteUrl && !siteUrl.includes("localhost") ? siteUrl : undefined) ||
    (authUrl && !authUrl.includes("localhost") ? authUrl : undefined) ||
    vercelUrl ||
    siteUrl ||
    authUrl ||
    "http://localhost:3000"

  return {
    allowedHosts: [...allowedHosts],
    fallback,
    protocol: "auto" as const,
  }
}

function buildTrustedOrigins(): string[] {
  const origins = new Set<string>([
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
  ])

  for (const host of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]) {
    if (host) origins.add(`https://${host}`)
  }

  return [...origins]
}

// Guard: DATABASE_URL must be set at runtime. During build, this module
// may be evaluated with placeholder values — better-auth will log errors
// but won't crash the build since we added it to serverExternalPackages.
const DATABASE_URL = process.env.DATABASE_URL || ""
console.log("[Better Auth Init] DATABASE_URL defined:", !!DATABASE_URL, "length:", DATABASE_URL.length);

const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : undefined

export const auth = betterAuth({
  ...(pool ? { database: pool } : {}),
  baseURL: buildBaseURLConfig(),
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
  trustedOrigins: buildTrustedOrigins(),
  // nextCookies() MUST be last in the plugins array
  plugins: [
    dash({
      apiKey: process.env.BETTER_AUTH_API_KEY,
      activityTracking: {
        enabled: false,
      },
    }),
    magicLink({
      expiresIn: 60 * 10,
      sendMagicLink: async ({ email, url }) => {
        const resend = getResendClient()
        if (!resend) {
          throw new Error("RESEND_API_KEY is not configured")
        }

        const from =
          process.env.RESEND_FROM_EMAIL?.trim() ||
          "Marketme <onboarding@resend.dev>"

        const { error } = await resend.emails.send({
          from,
          to: email,
          subject: "Your Marketme sign-in link",
          html: `
            <p>Click the link below to sign in to Marketme. This link expires in 10 minutes.</p>
            <p><a href="${url}">Sign in to Marketme</a></p>
            <p>If you did not request this email, you can ignore it.</p>
          `,
        })

        if (error) {
          console.error("[magic-link] Resend error:", error.message)
          throw new Error("Failed to send magic link email")
        }
      },
    }),
    nextCookies(),
  ],
})
