import { Sparkles } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#5B8CFF] to-[#8B5CF6] shadow-[0_0_24px_-4px_rgba(139,92,246,0.7)]">
        <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
      </div>
      <span className="text-lg font-semibold tracking-tight">Angie</span>
    </div>
  );
}
