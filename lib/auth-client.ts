import { createAuthClient } from "better-auth/react"
// @ts-ignore
import { dashClient } from "@better-auth/infra/client"

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  plugins: [
    dashClient() as any
  ],
})

export const { signIn, signUp, signOut, useSession } = authClient
