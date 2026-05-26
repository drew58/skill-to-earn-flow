import { createFileRoute } from "@tanstack/react-router";
import { GlassCard } from "@/components/angie/GlassCard";
import { UserCircle2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/profile")({
  component: () => (
    <div className="mx-auto max-w-2xl">
      <GlassCard className="text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#5B8CFF]/30 to-[#8B5CF6]/30">
          <UserCircle2 className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Profile Builder</h1>
        <p className="mt-2 text-sm text-white/60">
          AI-generated Fiverr bios, Upwork bios, LinkedIn headlines, and portfolio descriptions — rolling out next.
        </p>
      </GlassCard>
    </div>
  ),
});
