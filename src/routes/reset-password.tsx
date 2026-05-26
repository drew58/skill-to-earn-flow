import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GlowButton } from "@/components/angie/GlowButton";
import { Logo } from "@/components/angie/Logo";
import { GlowOrbs } from "@/components/angie/GlowOrbs";

export const Route = createFileRoute("/reset-password")({ component: ResetPassword });

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase parses the hash automatically; verify a session exists
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated.");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <GlowOrbs />
      <form onSubmit={onSubmit} className="glass-strong relative z-10 w-full max-w-md rounded-2xl p-8">
        <div className="mb-6 flex flex-col items-center">
          <Logo />
          <h1 className="mt-4 text-2xl font-semibold">Set a new password</h1>
        </div>
        {!ready && (
          <div className="mb-3 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/70">
            Open the link from your email on this device to continue.
          </div>
        )}
        <label className="block">
          <div className="mb-1 text-xs text-white/60">New password</div>
          <input
            type="password"
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="glass w-full rounded-xl px-3 py-2.5 text-sm outline-none"
          />
        </label>
        <GlowButton type="submit" disabled={busy || !ready} className="mt-4 w-full py-3">
          {busy ? "Saving…" : "Update password"}
        </GlowButton>
      </form>
    </div>
  );
}
