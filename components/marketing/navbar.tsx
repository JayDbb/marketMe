import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { ClientNavbar } from './client-navbar'

async function NavbarUserAction() {
  let session = null
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {}
  const user = session?.user ?? null
  return <ClientNavbar user={user} />
}

export function Navbar() {
  return (
    <NavbarUserAction />
  )
}
