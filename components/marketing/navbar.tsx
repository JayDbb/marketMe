import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-950"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>
        </div>
        <span className="font-bold text-xl tracking-tight text-white">Marketme</span>
      </Link>
      
      <div className="flex items-center gap-2 sm:gap-4">
        {user ? (
          <Link href="/dashboard">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold rounded-full px-6 shadow-[0_0_15px_rgba(16,185,129,0.3)] border-0">
              Dashboard
            </Button>
          </Link>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-full px-4 sm:px-6">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold rounded-full px-4 sm:px-6 shadow-[0_0_15px_rgba(16,185,129,0.3)] border-0">
                Sign up
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
