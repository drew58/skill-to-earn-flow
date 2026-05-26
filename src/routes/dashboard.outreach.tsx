import { createFileRoute, Link } from "@tanstack/react-router";
import { GlassCard } from "@/components/angie/GlassCard";
import { GlowButton } from "@/components/angie/GlowButton";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/dashboard/outreach")({
  component: () => (
    <div className="mx-auto max-w-2xl">
      <GlassCard className="text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#5B8CFF]/30 to-[#8B5CF6]/30">
          <MessageSquare className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Outreach Generator</h1>
        <p className="mt-2 text-sm text-white/60">
          Cold DMs, client emails, follow-ups, LinkedIn and Instagram outreach — coming next. For now, every plan ships with ready-to-copy outreach scripts.
        </p>
        <Link to="/dashboard/plans/new" className="mt-6 inline-block">
          <GlowButton>Generate plan with scripts</GlowButton>
        </Link>
      </GlassCard>
    </div>
  ),
});
