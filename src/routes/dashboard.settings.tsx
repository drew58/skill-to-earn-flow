import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { GlassCard } from "@/components/angie/GlassCard";
import { GlowButton } from "@/components/angie/GlowButton";
import { useSubscription } from "@/hooks/use-subscription";
import { Moon, Sun, Loader2, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/settings")({ component: Settings });

function Settings() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { tier } = useSubscription();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();
      setDisplayName(
        data?.display_name ||
          (user.user_metadata?.display_name as string | undefined) ||
          user.email?.split("@")[0] ||
          "",
      );
      setLoading(false);
    })();
  }, [user]);

  const saveName = async () => {
    if (!user) return;
    const trimmed = displayName.trim();
    if (!trimmed) {
      toast.error("Display name can't be empty");
      return;
    }
    setSaving(true);
    try {
      const { error: pErr } = await supabase
        .from("profiles")
        .upsert(
          { id: user.id, display_name: trimmed, updated_at: new Date().toISOString() },
          { onConflict: "id" },
        );
      if (pErr) throw pErr;
      await supabase.auth.updateUser({ data: { display_name: trimmed } });
      toast.success("Display name updated");
    } catch (err: any) {
      toast.error(err?.message || "Could not save display name");
    } finally {
      setSaving(false);
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <motion.h1 {...fadeIn} className="text-2xl font-bold">Settings</motion.h1>

      {/* Account Section */}
      <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
        <h2 className="mb-3 text-sm font-semibold text-white/70">Account</h2>
        <GlassCard>
          <div className="text-xs uppercase tracking-wider text-white/50">Email</div>
          <div className="mt-2 text-sm">{user?.email}</div>
        </GlassCard>
      </motion.div>

      {/* Display Name */}
      <motion.div {...fadeIn} transition={{ delay: 0.15 }}>
        <h2 className="mb-3 text-sm font-semibold text-white/70">Profile</h2>
        <GlassCard>
          <div className="text-xs uppercase tracking-wider text-white/50">Display name</div>
          <p className="mt-1 text-xs text-white/50">How Angie greets you in the dashboard.</p>
          <div className="mt-3 flex gap-2">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={loading ? "Loading…" : "Your name"}
              disabled={loading || saving}
              maxLength={60}
              className="glass flex-1 rounded-xl px-3 py-2 text-sm outline-none placeholder:text-white/30"
            />
            <GlowButton onClick={saveName} disabled={loading || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </GlowButton>
          </div>
        </GlassCard>
      </motion.div>

      {/* Theme Section */}
      <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
        <h2 className="mb-3 text-sm font-semibold text-white/70">Appearance</h2>
        <GlassCard>
          <div className="text-xs uppercase tracking-wider text-white/50">Theme</div>
          <p className="mt-1 text-xs text-white/50">Choose between dark and light mode. Dark is optimized for performance.</p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "group flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 transition-all",
                theme === "dark"
                  ? "border-[#5B8CFF] bg-[#5B8CFF]/10 text-white"
                  : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white",
              )}
            >
              <Moon className="h-4 w-4" />
              <span className="text-sm font-medium">Dark</span>
            </button>
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "group flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 transition-all",
                theme === "light"
                  ? "border-[#5B8CFF] bg-[#5B8CFF]/10 text-white"
                  : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white",
              )}
            >
              <Sun className="h-4 w-4" />
              <span className="text-sm font-medium">Light</span>
            </button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Subscription Section */}
      <motion.div {...fadeIn} transition={{ delay: 0.25 }}>
        <h2 className="mb-3 text-sm font-semibold text-white/70">Subscription</h2>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-white/50">Current Plan</div>
              <div className="mt-2 flex items-center gap-2">
                <div>
                  <div className="text-sm font-semibold capitalize">{tier === "free" ? "Free" : tier === "pro" ? "Pro" : "Accelerator"} Plan</div>
                  <p className="mt-1 text-xs text-white/50">
                    {tier === "free" && "Upgrade to unlock premium features and unlimited access"}
                    {tier === "pro" && "Advanced AI and premium features enabled"}
                    {tier === "accelerator" && "Priority AI (GPT-5 class) with all features"}
                  </p>
                </div>
              </div>
            </div>
            {tier !== "accelerator" && (
              tier === "pro" ? (
                <Crown className="h-5 w-5 text-[#C9A84C]" />
              ) : (
                <Zap className="h-5 w-5 text-[#5B8CFF]" />
              )
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Security Section */}
      <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
        <h2 className="mb-3 text-sm font-semibold text-white/70">Security</h2>
        <GlassCard>
          <div className="text-xs uppercase tracking-wider text-white/50">Session</div>
          <p className="mt-1 text-xs text-white/50">Sign out from this device and all sessions.</p>
          <div className="mt-4">
            <GlowButton variant="secondary" onClick={signOut} className="w-full">
              Sign out
            </GlowButton>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
