import { signup } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Activity, Mail } from 'lucide-react'

export default async function SignupPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams;

  return (
    <div className="relative min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 font-sans overflow-hidden">
      {/* Ambient Backgrounds */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <Link href="/" className="absolute top-8 left-8 text-zinc-400 hover:text-white flex items-center gap-2 text-sm transition-colors z-10">
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      <div className="z-10 mb-8 flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <Activity className="w-7 h-7 text-zinc-950" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Marketme</h1>
      </div>
      
      <Card className="w-full max-w-md bg-zinc-900/60 backdrop-blur-2xl border-zinc-800/60 text-zinc-50 shadow-2xl z-10 rounded-2xl overflow-hidden">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Create an account</CardTitle>
          <CardDescription className="text-zinc-400 text-center">
            Join us to start managing your marketing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Google OAuth Button (Frontend Shell) */}
          <Button variant="outline" className="w-full h-12 bg-white hover:bg-zinc-100 text-zinc-950 font-semibold rounded-xl border-0 transition-all flex items-center justify-center gap-3">
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800/80" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900/60 px-2 text-zinc-500 font-medium tracking-wider">Or</span>
            </div>
          </div>

          <form id="signup-form" action={signup} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300 font-medium">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="h-12 bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300 font-medium">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="h-12 bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all rounded-xl"
              />
            </div>
            {searchParams?.message && (
              <p className="text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center">
                {searchParams.message}
              </p>
            )}
            <Button type="submit" className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all border-0 flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-transparent border-t border-zinc-800/50 py-6 flex justify-center">
          <div className="text-sm text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
