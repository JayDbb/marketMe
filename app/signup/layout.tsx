import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = createPageMetadata({
  title: 'Sign up',
  description: 'Create your free Marketme account and start scheduling smarter today.',
  path: '/signup',
})

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
