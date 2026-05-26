export function GlowOrbs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="animate-pulse-glow absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-[#5B8CFF]/40 blur-[120px]" />
      <div className="animate-pulse-glow absolute top-40 right-0 h-[380px] w-[380px] rounded-full bg-[#8B5CF6]/40 blur-[120px]" style={{ animationDelay: "1.4s" }} />
      <div className="animate-float absolute top-[60%] left-[10%] h-24 w-24 rounded-2xl border border-white/10 bg-white/5 backdrop-blur" />
      <div className="animate-float absolute top-[30%] right-[12%] h-16 w-16 rounded-xl border border-white/10 bg-white/5 backdrop-blur" style={{ animationDelay: "2s" }} />
    </div>
  );
}
