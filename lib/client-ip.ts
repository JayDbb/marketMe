import { headers } from 'next/headers'

/** Client IP for rate limiting (Vercel / reverse-proxy aware). */
export async function getClientIp(): Promise<string> {
  const h = await headers()
  return (
    h.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    'unknown'
  )
}
