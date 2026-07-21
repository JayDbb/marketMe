'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GitPullRequest } from "lucide-react"

interface CreateWorkflowModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateWorkflowModal({ open, onOpenChange }: CreateWorkflowModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border text-card-foreground p-6">
        <DialogHeader className="flex flex-col items-start mb-6 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-2">
            <GitPullRequest className="w-5 h-5 text-blue-400" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">Create Workflow</DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-white/50 text-sm">
            Set up a new automated workflow for your content pipeline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-zinc-500 dark:text-white/50 font-medium text-xs">Workflow Name</Label>
            <Input
              placeholder="e.g., Weekly Twitter Thread"
              className="h-11 bg-white dark:bg-white/5 border-transparent dark:border-white/10 focus-visible:ring-0 focus-visible:border-blue-400/50 text-zinc-900 dark:text-white rounded-xl shadow-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-500 dark:text-white/50 font-medium text-xs">Trigger</Label>
            <div className="h-11 bg-white dark:bg-white/5 border-transparent border dark:border-white/10 rounded-xl flex items-center px-4 cursor-not-allowed opacity-50">
              <span className="text-sm text-zinc-500 dark:text-white/50">Select trigger event...</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-500 dark:text-white/50 font-medium text-xs">Action</Label>
            <div className="h-11 bg-white dark:bg-white/5 border-transparent border dark:border-white/10 rounded-xl flex items-center px-4 cursor-not-allowed opacity-50">
              <span className="text-sm text-zinc-500 dark:text-white/50">Select action...</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="h-11 bg-transparent border-border text-foreground hover:bg-muted font-medium rounded-xl"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => onOpenChange(false)}
            className="h-11 px-6 bg-blue-500 hover:bg-blue-400 text-zinc-900 dark:text-white font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)] border-0 transition-all flex items-center justify-center gap-2"
          >
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
