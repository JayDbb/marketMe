'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface InvoicesDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoicesDrawer({ open, onOpenChange }: InvoicesDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full border-border bg-background p-0 text-foreground sm:max-w-xl">
        <SheetHeader className="border-b border-border bg-card p-6">
          <SheetTitle className="font-semibold tracking-tight text-foreground">
            Invoices
          </SheetTitle>
        </SheetHeader>

        <div className="flex h-full flex-col bg-background">
          <div className="grid grid-cols-5 border-b border-border bg-card px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-1">Amount</div>
            <div className="col-span-1 text-right">Invoice</div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center p-6 pb-20">
            <p className="text-sm font-medium text-foreground">No invoices yet</p>
            <p className="mt-1 max-w-sm text-center text-xs text-muted-foreground">
              Checkout is not live, so nothing will appear here until payments are connected.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
