import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function sanitizeRedirect(next: string | null): string {
  const fallback = '/dashboard'
  if (!next) return fallback
  // Only allow relative paths that start with a single slash (not //)
  if (!next.startsWith('/') || next.startsWith('//')) return fallback
  return next
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = sanitizeRedirect(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // If no code or exchange failed, redirect to login with error
  return NextResponse.redirect(
    new URL('/login?message=Could not authenticate with provider&type=error', request.url)
  )
}
