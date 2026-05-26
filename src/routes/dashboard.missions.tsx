import { createFileRoute, Link } from "@tanstack/react-router";
import { GlassCard } from "@/components/angie/GlassCard";
import { GlowButton } from "@/components/angie/GlowButton";
import { Sparkles } from "lucide-react";

function ComingSoon({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="mx-auto max-w-2xl">
      <GlassCard className="text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#5B8CFF]/30 to-[#8B5CF6]/30">
          <Sparkles className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-white/60">{blurb}</p>
        <Link to="/dashboard/plans/new" className="mt-6 inline-block">
          <GlowButton>Generate an income plan</GlowButton>
        </Link>
      </GlassCard>
    </div>
  );
}

export const Route = createFileRoute("/dashboard/missions")({
  component: () => <ComingSoon title="Daily Missions" blurb="Generate an income plan and Angie will fill this with bite-sized daily missions, streaks, and completion animations." />,
});
