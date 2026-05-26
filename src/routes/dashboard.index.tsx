import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { GlassCard } from "@/components/angie/GlassCard";
import { GlowButton } from "@/components/angie/GlowButton";
import { ArrowRight, Flame, CheckCircle2, Sparkles, Target, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({ component: DashboardHome });

type Mission = { id: string; title: string; completed: boolean };
type Plan = { id: string; title: string; created_at: string };
type Streak = { current_streak: number; tasks_completed: number };

function DashboardHome() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [streak, setStreak] = useState<Streak>({ current_streak: 0, tasks_completed: 0 });

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [m, p, s] = await Promise.all([
        supabase.from("missions").select("id,title,completed").eq("due_date", today).order("created_at"),
        supabase.from("plans").select("id,title,created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("streaks").select("current_streak,tasks_completed").maybeSingle(),
      ]);
      setMissions((m.data ?? []) as Mission[]);
      setPlans((p.data ?? []) as Plan[]);
      if (s.data) setStreak(s.data as Streak);
    })();
  }, []);

  const toggleMission = async (id: string, completed: boolean) => {
    setMissions((prev) => prev.map((m) => (m.id === id ? { ...m, completed } : m)));
    await supabase
      .from("missions")
      .update({ completed, completed_at: completed ? new Date().toISOString() : null })
      .eq("id", id);
    if (completed) {
      const next = { current_streak: streak.current_streak + (streak.current_streak === 0 ? 1 : 0), tasks_completed: streak.tasks_completed + 1 };
      setStreak(next);
      await supabase.from("streaks").upsert({
        user_id: user!.id,
        current_streak: Math.max(1, streak.current_streak),
        tasks_completed: streak.tasks_completed + 1,
        last_active_date: new Date().toISOString().slice(0, 10),
        updated_at: new Date().toISOString(),
      });
    }
  };

  const name = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "there";
  const done = missions.filter((m) => m.completed).length;

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}>
        <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">Today · {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</div>
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          Hey {name}, <span className="text-gradient">let's ship</span>.
        </h1>
        <p className="mt-2 max-w-xl text-sm text-white/55 md:text-base">Small moves, every day. That's how income compounds.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon={Flame} label="Streak" value={`${streak.current_streak}d`} grad="from-[#5B8CFF] to-[#22C55E]" delay={0} />
        <Stat icon={CheckCircle2} label="Tasks completed" value={String(streak.tasks_completed)} grad="from-[#8B5CF6] to-[#5B8CFF]" delay={0.05} />
        <Stat icon={TrendingUp} label="Active plans" value={String(plans.length)} grad="from-[#8B5CF6] to-[#E879F9]" delay={0.1} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Missions */}
        <GlassCard hover className="lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[#5B8CFF]/25 to-[#8B5CF6]/15 ring-1 ring-inset ring-white/10">
                <Target className="h-4 w-4 text-[#7FA8FF]" />
              </div>
              <h2 className="text-base font-semibold tracking-tight">Today's missions</h2>
            </div>
            <div className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/60">{done}/{missions.length} done</div>
          </div>
          {missions.length === 0 ? (
            <EmptyState
              title="No missions for today"
              desc="Generate an income plan to receive daily missions."
              cta={<Link to="/dashboard/plans/new"><GlowButton>Generate plan <ArrowRight className="h-3.5 w-3.5" /></GlowButton></Link>}
            />
          ) : (
            <ul className="space-y-1">
              {missions.map((m) => (
                <li key={m.id}>
                  <label className="group flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/[0.04]">
                    <input
                      type="checkbox"
                      checked={m.completed}
                      onChange={(e) => toggleMission(m.id, e.target.checked)}
                      className="mt-1 h-4 w-4 accent-[#5B8CFF]"
                    />
                    <span className={`text-sm ${m.completed ? "text-white/40 line-through" : "text-white/90"}`}>
                      {m.title}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        {/* AI panel */}
        <GlassCard hover className="relative overflow-hidden ring-gradient">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#8B5CF6]/30 blur-3xl" />
          <div className="relative flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#5B8CFF] shadow-[0_0_24px_-4px_rgba(139,92,246,0.7)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold tracking-tight">Angie AI</h2>
          </div>
          <p className="relative mt-3 text-sm leading-relaxed text-white/65">
            Ready to build a tailored income plan in under 2 minutes.
          </p>
          <Link to="/dashboard/plans/new" className="relative mt-5 block">
            <GlowButton className="w-full">New income plan <ArrowRight className="h-3.5 w-3.5" /></GlowButton>
          </Link>
        </GlassCard>
      </div>

      {/* Recent plans */}
      <GlassCard hover>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">Recent plans</h2>
          <Link to="/dashboard/plans/new" className="text-xs text-white/50 transition-colors hover:text-white">+ New</Link>
        </div>
        {plans.length === 0 ? (
          <div className="text-sm text-white/50">No plans yet. Generate your first one.</div>
        ) : (
          <ul className="divide-y divide-white/5">
            {plans.map((p) => (
              <li key={p.id}>
                <Link
                  to="/dashboard/plans/$planId"
                  params={{ planId: p.id }}
                  className="group flex items-center justify-between gap-3 py-3 text-sm transition-colors hover:text-[#A78BFA]"
                >
                  <span className="truncate">{p.title}</span>
                  <span className="shrink-0 text-xs text-white/40">{new Date(p.created_at).toLocaleDateString()}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}

function Stat({ icon: Icon, label, value, grad, delay }: { icon: typeof Flame; label: string; value: string; grad: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <GlassCard hover className="relative overflow-hidden p-5">
        <div className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${grad} opacity-20 blur-2xl`} />
        <div className="relative flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-white/50">
          <Icon className="h-3.5 w-3.5" /> {label}
        </div>
        <div className={`relative mt-2 bg-gradient-to-r ${grad} bg-clip-text text-4xl font-bold tracking-tight text-transparent`}>{value}</div>
      </GlassCard>
    </motion.div>
  );
}

function EmptyState({ title, desc, cta }: { title: string; desc: string; cta?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#5B8CFF]/25 to-[#8B5CF6]/25 ring-1 ring-inset ring-white/10">
        <Sparkles className="h-5 w-5 text-[#A78BFA]" />
      </div>
      <div className="text-sm font-medium">{title}</div>
      <div className="max-w-xs text-xs text-white/50">{desc}</div>
      {cta}
    </div>
  );
}
