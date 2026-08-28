import { redirect } from 'next/navigation'
import { getPostAuthRedirectPath } from '@/lib/post-auth-redirect'

export async function GET() {
  redirect(await getPostAuthRedirectPath())
}
