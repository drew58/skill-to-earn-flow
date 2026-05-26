import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function GlassCard({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-6 transition-all duration-300 hover:border-white/20",
        className,
      )}
      {...rest}
    />
  );
}
