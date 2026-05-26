import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { GlassCard } from "@/components/angie/GlassCard";
import { GlowButton } from "@/components/angie/GlowButton";

export const Route = createFileRoute("/dashboard/settings")({ component: Settings });

function Settings() {
  const { user, signOut } = useAuth();
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <GlassCard>
        <div className="text-xs uppercase tracking-wider text-white/50">Account</div>
        <div className="mt-2 text-sm">{user?.email}</div>
      </GlassCard>
      <GlassCard>
        <div className="text-xs uppercase tracking-wider text-white/50">Theme</div>
        <div className="mt-2 text-sm text-white/70">Dark mode (default). Light mode coming soon.</div>
      </GlassCard>
      <GlassCard>
        <div className="text-xs uppercase tracking-wider text-white/50">Subscription</div>
        <div className="mt-2 text-sm text-white/70">Free plan. Upgrade options coming with billing integration.</div>
      </GlassCard>
      <GlowButton variant="secondary" onClick={signOut}>Sign out</GlowButton>
    </div>
  );
}
