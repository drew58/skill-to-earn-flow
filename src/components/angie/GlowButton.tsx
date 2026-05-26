import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "secondary";

export interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ variant = "primary", className, children, ...rest }, ref) => {
    const base =
      "relative inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8CFF]/60 disabled:opacity-50 disabled:pointer-events-none";
    const styles: Record<Variant, string> = {
      primary:
        "text-white bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] shadow-[0_8px_30px_-8px_rgba(91,140,255,0.6)] hover:shadow-[0_12px_40px_-8px_rgba(139,92,246,0.8)] hover:-translate-y-0.5",
      secondary:
        "text-white glass hover:bg-white/10",
      ghost:
        "text-white/80 hover:text-white hover:bg-white/5",
    };
    return (
      <button ref={ref} className={cn(base, styles[variant], className)} {...rest}>
        {children}
      </button>
    );
  },
);
GlowButton.displayName = "GlowButton";
