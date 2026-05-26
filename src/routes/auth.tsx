import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/angie/Logo";
import { GlowButton } from "@/components/angie/GlowButton";
import { GlowOrbs } from "@/components/angie/GlowOrbs";
import { ArrowLeft, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/auth")({ component: AuthPage });

type Mode = "login" | "signup" | "reset";

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        toast.success("Reset link sent. Check your email.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/dashboard",
      });
      if (result.error) throw result.error;
      if (!result.redirected) navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <GlowOrbs />
      <Link
        to="/"
        className="absolute left-4 top-4 inline-flex items-center gap-1 text-xs text-white/60 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" /> Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-strong relative z-10 w-full max-w-md rounded-2xl p-8"
      >
        <div className="mb-6 flex flex-col items-center">
          <Logo />
          <h1 className="mt-6 text-2xl font-semibold">
            {mode === "login" && "Welcome back"}
            {mode === "signup" && "Create your account"}
            {mode === "reset" && "Reset your password"}
          </h1>
          <p className="mt-1 text-sm text-white/60">
            {mode === "login" && "Pick up where Angie left off."}
            {mode === "signup" && "Build your first income plan today."}
            {mode === "reset" && "We'll send a magic reset link."}
          </p>
        </div>

        {mode !== "reset" && (
          <>
            <button
              onClick={handleGoogle}
              disabled={busy}
              className="glass mb-4 flex w-full items-center justify-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-white/10 disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#fff" d="M21.35 11.1H12v3.2h5.35c-.5 2.4-2.6 3.7-5.35 3.7-3.2 0-5.8-2.6-5.8-5.8s2.6-5.8 5.8-5.8c1.5 0 2.8.5 3.8 1.4l2.4-2.4C16.5 3.7 14.4 2.9 12 2.9 6.9 2.9 2.8 7 2.8 12.1S6.9 21.3 12 21.3c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.2-.15-1.8z"/></svg>
              Continue with Google
            </button>
            <div className="my-4 flex items-center gap-3 text-xs text-white/40">
              <div className="h-px flex-1 bg-white/10" /> or email <div className="h-px flex-1 bg-white/10" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <div className="mb-1 text-xs text-white/60">Email</div>
            <div className="glass flex items-center gap-2 rounded-xl px-3 py-2.5">
              <Mail className="h-4 w-4 text-white/50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/30"
                placeholder="you@example.com"
              />
            </div>
          </label>
          {mode !== "reset" && (
            <label className="block">
              <div className="mb-1 text-xs text-white/60">Password</div>
              <div className="glass flex items-center gap-2 rounded-xl px-3 py-2.5">
                <Lock className="h-4 w-4 text-white/50" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-white/30"
                  placeholder="••••••••"
                />
              </div>
            </label>
          )}

          <GlowButton type="submit" disabled={busy} className="mt-2 w-full py-3">
            {busy ? "Working…" : mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
          </GlowButton>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-xs text-white/60">
          {mode === "login" && (
            <>
              <button onClick={() => setMode("signup")} className="hover:text-white">
                No account? <span className="text-[#5B8CFF]">Sign up</span>
              </button>
              <button onClick={() => setMode("reset")} className="hover:text-white">
                Forgot your password?
              </button>
            </>
          )}
          {mode === "signup" && (
            <button onClick={() => setMode("login")} className="hover:text-white">
              Already have an account? <span className="text-[#5B8CFF]">Sign in</span>
            </button>
          )}
          {mode === "reset" && (
            <button onClick={() => setMode("login")} className="hover:text-white">
              Back to sign in
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
