import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = createPageMetadata({
  title: 'Log in',
  description: 'Sign in to your Marketme account.',
  path: '/login',
  noIndex: true,
})

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
