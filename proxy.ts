import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  // Normalize double slashes in URL pathname to avoid 404 on API requests
  // e.g., https://...//api/auth/dash/validate -> https://.../api/auth/dash/validate
  const url = request.nextUrl.clone()
  
  if (url.pathname.startsWith('//')) {
    const normalizedPath = url.pathname.replace(/^\/+/, '/')
    console.log(`[Proxy] Normalizing double slash path: ${url.pathname} -> ${normalizedPath}`)
    const targetUrl = new URL(normalizedPath + url.search, request.url)
    return NextResponse.rewrite(targetUrl)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
