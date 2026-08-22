import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import {
  buildConnectionsOAuthReturnUrl,
  isInstagramOAuthReturn,
} from '@/lib/social/oauth'

/** Paths the MarketMe AI Meta callback has been seen redirecting to (wrongly). */
const OAUTH_MISDIRECT_PREFIXES = [
  '/dashboard/settings',
  '/settings',
  '/dashboard/profile',
  '/profile',
  '/onboarding',
]

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()

  if (url.pathname.startsWith('//')) {
    const normalizedPath = url.pathname.replace(/^\/+/, '/')
    const targetUrl = new URL(normalizedPath + url.search, request.url)
    return NextResponse.rewrite(targetUrl)
  }

  // MarketMe AI currently returns to /dashboard/settings?instagram=…
  // Bounce those returns to Connections so OAuth completes in the right place.
  const isMisdirectedPath = OAUTH_MISDIRECT_PREFIXES.some(
    (prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`)
  )
  if (isMisdirectedPath && isInstagramOAuthReturn(url.searchParams)) {
    const target = buildConnectionsOAuthReturnUrl(url.origin, url.searchParams)
    return NextResponse.redirect(new URL(target, request.url))
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding',
    '/settings',
    '/settings/:path*',
    '/profile',
    '/profile/:path*',
    '/api/auth/:path*',
  ],
}
