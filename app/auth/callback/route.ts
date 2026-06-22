/**
 * This route is no longer used.
 *
 * Better Auth handles the OAuth callback automatically via:
 *   /api/auth/callback/google  (managed by app/api/auth/[...all]/route.ts)
 *
 * This file is kept as a redirect shim in case any existing bookmarks or
 * emails still point to /auth/callback.
 */
import { NextResponse } from 'next/server'

export async function GET() {
  // Redirect to the home page — Better Auth handles OAuth internally
  return NextResponse.redirect(new URL('/', process.env.BETTER_AUTH_URL || 'http://localhost:3000'))
}
