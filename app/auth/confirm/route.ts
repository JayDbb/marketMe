/**
 * This route is no longer used.
 *
 * Better Auth handles email verification and magic link confirmation
 * automatically via:
 *   /api/auth/verify-email  (managed by app/api/auth/[...all]/route.ts)
 *
 * This file is kept as a redirect shim in case any existing emails
 * still contain links pointing to /auth/confirm.
 */
import { NextResponse } from 'next/server'

export async function GET() {
  // Redirect to login — Better Auth manages verification internally
  return NextResponse.redirect(new URL('/login', process.env.BETTER_AUTH_URL || 'http://localhost:3000'))
}
