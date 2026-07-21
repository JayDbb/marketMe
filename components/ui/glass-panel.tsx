import * as React from "react";
import { cn } from "@/lib/utils";

type GlassPanelProps = React.HTMLAttributes<HTMLDivElement>

export function GlassPanel({ className, children, ...props }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] bg-white/50 backdrop-blur-xl border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_20px_40px_-15px_rgba(0,0,0,0.05)]",
        className
      )}
      {...props}
    >
      {/* Optional extra noise layer could go here if needed */}
      {children}
    </div>
  );
}
