'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { FastForward } from "lucide-react"

interface InvoicesDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoicesDrawer({ open, onOpenChange }: InvoicesDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl bg-background border-border text-foreground p-0">
        <SheetHeader className="p-6 border-b border-border bg-card">
          <SheetTitle className="text-foreground font-bold tracking-tight">Invoices</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full bg-background">
          {/* Table Header */}
          <div className="grid grid-cols-5 text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-4 border-b border-border bg-card">
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-1">Amount</div>
            <div className="col-span-1 text-right">Invoice</div>
          </div>

          {/* Empty State */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
            <FastForward className="w-8 h-8 text-zinc-500 dark:text-white/20 mb-3" />
            <p className="text-sm text-zinc-500 dark:text-white/40 font-medium">Nothing here yet.</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
