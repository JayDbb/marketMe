import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Activity } from 'lucide-react'

export default async function LoginPage(props: { searchParams: Promise<{ message?: string }> }) {
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
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Welcome back</CardTitle>
          <CardDescription className="text-zinc-400 text-center">
            Enter your email and password to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="login-form" action={login} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300 font-medium">Email</Label>
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
              <div className="flex items-center justify-between">
                 <Label htmlFor="password" className="text-zinc-300 font-medium">Password</Label>
                 <Link href="#" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Forgot password?</Link>
              </div>
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
            <Button type="submit" className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all mt-2 border-0">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-transparent border-t border-zinc-800/50 py-6 flex justify-center">
          <div className="text-sm text-zinc-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
