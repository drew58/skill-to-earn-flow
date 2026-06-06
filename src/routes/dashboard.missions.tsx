import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { GlassCard } from "@/components/angie/GlassCard";
import { GlowButton } from "@/components/angie/GlowButton";
import { ArrowRight, Target, Sparkles, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/missions")({ component: MissionsPage });

type Mission = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string;
  created_at: string;
};

function MissionsPage() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase
      .from("missions")
      .select("id,title,description,completed,due_date,created_at")
      .order("due_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Could not load missions");
    } else {
      setMissions((data ?? []) as Mission[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    load();
    const channel = supabase
      .channel(`missions:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "missions", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setMissions((prev) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as Mission;
              if (prev.some((m) => m.id === row.id)) return prev;
              return [row, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as Mission;
              return prev.map((m) => (m.id === row.id ? { ...m, ...row } : m));
            }
            if (payload.eventType === "DELETE") {
              const row = payload.old as Mission;
              return prev.filter((m) => m.id !== row.id);
            }
            return prev;
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const toggle = async (id: string, completed: boolean) => {
    setMissions((prev) => prev.map((m) => (m.id === id ? { ...m, completed } : m)));
    const { error } = await supabase
      .from("missions")
      .update({ completed, completed_at: completed ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) toast.error("Could not update mission");
  };

  const today = new Date().toISOString().slice(0, 10);
  const todayMissions = missions.filter((m) => m.due_date === today);
  const upcoming = missions.filter((m) => m.due_date > today);
  const past = missions.filter((m) => m.due_date < today);
  const doneCount = missions.filter((m) => m.completed).length;

  if (loading) {
    return <div className="text-sm text-white/50">Loading missions…</div>;
  }

  if (missions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <GlassCard className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#5B8CFF]/30 to-[#8B5CF6]/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">No missions yet</h1>
          <p className="mt-2 text-sm text-white/60">
            Generate an income plan and Angie will seed your daily missions automatically.
          </p>
          <Link to="/dashboard/plans/new" className="mt-6 inline-block">
            <GlowButton>
              Generate an income plan <ArrowRight className="h-3.5 w-3.5" />
            </GlowButton>
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8B5CF6]">
          <Target className="h-3 w-3" /> Missions
        </div>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl">Your missions</h1>
        <p className="mt-1 text-sm text-white/60">
          {doneCount} of {missions.length} completed across all plans.
        </p>
      </motion.div>

      {todayMissions.length > 0 && (
        <Section title="Today" missions={todayMissions} onToggle={toggle} />
      )}
      {upcoming.length > 0 && (
        <Section title="Upcoming" missions={upcoming} onToggle={toggle} />
      )}
      {past.length > 0 && (
        <Section title="Past" missions={past} onToggle={toggle} dimmed />
      )}
    </div>
  );
}

function Section({
  title,
  missions,
  onToggle,
  dimmed,
}: {
  title: string;
  missions: Mission[];
  onToggle: (id: string, completed: boolean) => void;
  dimmed?: boolean;
}) {
  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/60">
          {missions.filter((m) => m.completed).length}/{missions.length}
        </span>
      </div>
      <ul className="space-y-1">
        {missions.map((m) => (
          <li key={m.id}>
            <label
              className={`group flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/[0.04] ${
                dimmed ? "opacity-70" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={m.completed}
                onChange={(e) => onToggle(m.id, e.target.checked)}
                className="mt-1 h-4 w-4 accent-[#5B8CFF]"
              />
              <div className="flex-1">
                <div
                  className={`text-sm ${m.completed ? "text-white/40 line-through" : "text-white/90"}`}
                >
                  {m.title}
                </div>
                {m.description && (
                  <div className="mt-0.5 text-xs text-white/50">{m.description}</div>
                )}
                <div className="mt-1 text-[10px] uppercase tracking-wider text-white/35">
                  {new Date(m.due_date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                  {m.completed && (
                    <span className="ml-2 inline-flex items-center gap-1 text-[#22C55E]">
                      <CheckCircle2 className="h-3 w-3" /> Done
                    </span>
                  )}
                </div>
              </div>
            </label>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
