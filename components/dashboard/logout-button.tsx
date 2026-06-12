'use client'

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/login/actions"
import { Loader2 } from "lucide-react"

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="ghost"
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
      className="w-full justify-start text-white/35 hover:text-white hover:bg-white/5 rounded-xl h-10 font-medium text-sm transition-all"
    >
      {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-white/50" /> : null}
      {isPending ? 'Logging out...' : 'Log out'}
    </Button>
  )
}
