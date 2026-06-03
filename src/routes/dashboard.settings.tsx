import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { GlassCard } from "@/components/angie/GlassCard";
import { GlowButton } from "@/components/angie/GlowButton";
import { Moon, Sun, Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({ component: Settings });

function Settings() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
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

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Account */}
      <GlassCard>
        <div className="text-xs uppercase tracking-wider text-white/50">Account</div>
        <div className="mt-2 text-sm">{user?.email}</div>
      </GlassCard>

      {/* Display name */}
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

      {/* Theme */}
      <GlassCard>
        <div className="text-xs uppercase tracking-wider text-white/50">Theme</div>
        <p className="mt-1 text-xs text-white/50">
          Switch between dark and light. The dashboard is optimized for dark mode.
        </p>
        <div className="mt-3 inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition ${
              theme === "dark"
                ? "bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white shadow-[0_8px_24px_-8px_rgba(91,140,255,0.6)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Moon className="h-3.5 w-3.5" /> Dark
          </button>
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition ${
              theme === "light"
                ? "bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white shadow-[0_8px_24px_-8px_rgba(91,140,255,0.6)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Sun className="h-3.5 w-3.5" /> Light
          </button>
        </div>
      </GlassCard>

      {/* Subscription */}
      <GlassCard>
        <div className="text-xs uppercase tracking-wider text-white/50">Subscription</div>
        <div className="mt-2 text-sm text-white/70">
          Manage your plan from the pricing page.
        </div>
      </GlassCard>

      <GlowButton variant="secondary" onClick={signOut}>
        Sign out
      </GlowButton>
    </div>
  );
}
