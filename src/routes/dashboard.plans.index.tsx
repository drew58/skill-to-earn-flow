import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { GlassCard } from "@/components/angie/GlassCard";
import { GlowButton } from "@/components/angie/GlowButton";
import { Sparkles, Plus, ArrowRight, FileText } from "lucide-react";

export const Route = createFileRoute("/dashboard/plans/")({ component: PlansIndex });

type PlanRow = { id: string; title: string; created_at: string };

function PlansIndex() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("plans")
        .select("id,title,created_at")
        .order("created_at", { ascending: false });
      setPlans((data ?? []) as PlanRow[]);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8B5CF6]">
            <Sparkles className="h-3 w-3" /> Income plans
          </div>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">Your income plans</h1>
          <p className="mt-1 text-sm text-white/60">
            Browse plans you've generated or create a fresh one.
          </p>
        </div>
        <Link to="/dashboard/plans/new">
          <GlowButton>
            <Plus className="h-4 w-4" /> New plan
          </GlowButton>
        </Link>
      </motion.div>

      {loading ? (
        <div className="text-sm text-white/50">Loading…</div>
      ) : plans.length === 0 ? (
        <GlassCard className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#5B8CFF]/30 to-[#8B5CF6]/30">
            <FileText className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">No plans yet</h2>
          <p className="mt-2 text-sm text-white/60">
            Generate your first AI income plan in about two minutes.
          </p>
          <Link to="/dashboard/plans/new" className="mt-5 inline-block">
            <GlowButton>
              Generate income plan <ArrowRight className="h-3.5 w-3.5" />
            </GlowButton>
          </Link>
        </GlassCard>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {plans.map((p) => (
            <Link
              key={p.id}
              to="/dashboard/plans/$planId"
              params={{ planId: p.id }}
              className="block"
            >
              <GlassCard hover className="h-full">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#5B8CFF]/25 to-[#8B5CF6]/25 ring-1 ring-inset ring-white/10">
                    <FileText className="h-4 w-4 text-[#A78BFA]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{p.title}</div>
                    <div className="mt-1 text-xs text-white/50">
                      {new Date(p.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/40" />
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
