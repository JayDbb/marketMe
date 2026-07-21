import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()

  if (url.pathname.startsWith('//')) {
    const normalizedPath = url.pathname.replace(/^\/+/, '/')
    const targetUrl = new URL(normalizedPath + url.search, request.url)
    return NextResponse.rewrite(targetUrl)
  }

  return await updateSession(request)
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding', '/api/auth/:path*'],
}
