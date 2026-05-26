import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  strong?: boolean;
}

export function GlassCard({ className, hover, strong, ...rest }: GlassCardProps) {
  return (
    <div
      className={cn(
        strong ? "glass-strong" : "glass",
        "rounded-2xl p-6",
        hover && "glass-hover",
        className,
      )}
      {...rest}
    />
  );
}
