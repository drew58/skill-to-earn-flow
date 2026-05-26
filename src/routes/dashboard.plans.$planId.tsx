import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/angie/GlassCard";
import { GlowButton } from "@/components/angie/GlowButton";
import { ArrowLeft, Copy, Trophy, Calendar, Users, DollarSign, MessageSquare, Zap } from "lucide-react";

export const Route = createFileRoute("/dashboard/plans/$planId")({ component: PlanView });

type Plan = {
  title?: string;
  top_opportunities?: { name: string; why: string; effort?: string }[];
  best_recommendation?: { name: string; rationale: string };
  action_plan_7_days?: { day: number | string; focus?: string; tasks: string[] }[];
  client_acquisition?: string[];
  pricing_strategy?: string;
  outreach_scripts?: { channel: string; script: string }[];
  first_24h_actions?: string[];
};

function PlanView() {
  const { planId } = Route.useParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [title, setTitle] = useState("Income plan");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("plans").select("title,content").eq("id", planId).maybeSingle();
      if (!error && data) {
        setPlan(data.content as Plan);
        setTitle(data.title);
      }
      setLoading(false);
    })();
  }, [planId]);

  if (loading) return <div className="text-sm text-white/50">Loading…</div>;
  if (!plan) return <div className="text-sm text-white/50">Plan not found.</div>;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const fade = (i = 0) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.06, duration: 0.5 },
  });

  return (
    <div className="space-y-5">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white">
        <ArrowLeft className="h-3 w-3" /> Dashboard
      </Link>
      <motion.h1 {...fade(0)} className="text-2xl font-bold md:text-3xl">{title}</motion.h1>

      {plan.best_recommendation && (
        <motion.div {...fade(1)}>
          <GlassCard className="glow-purple">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#8B5CF6]">
              <Trophy className="h-3 w-3" /> Best recommendation
            </div>
            <h2 className="mt-2 text-xl font-semibold">{plan.best_recommendation.name}</h2>
            <p className="mt-2 text-sm text-white/70">{plan.best_recommendation.rationale}</p>
          </GlassCard>
        </motion.div>
      )}

      {plan.top_opportunities && (
        <motion.div {...fade(2)}>
          <SectionTitle>Top 3 opportunities</SectionTitle>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {plan.top_opportunities.map((o, i) => (
              <GlassCard key={i}>
                <div className="text-xs text-white/40">#{i + 1}</div>
                <div className="mt-1 font-semibold">{o.name}</div>
                <div className="mt-1 text-sm text-white/70">{o.why}</div>
                {o.effort && <div className="mt-3 text-xs text-[#5B8CFF]">Effort: {o.effort}</div>}
              </GlassCard>
            ))}
          </div>
        </motion.div>
      )}

      {plan.action_plan_7_days && (
        <motion.div {...fade(3)}>
          <SectionTitle><Calendar className="h-4 w-4 inline mr-1.5" /> 7-day action plan</SectionTitle>
          <div className="mt-3 space-y-3">
            {plan.action_plan_7_days.map((d, i) => (
              <GlassCard key={i}>
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#5B8CFF] to-[#8B5CF6] text-sm font-bold">
                    {d.day}
                  </div>
                  <div className="font-medium">{d.focus ?? `Day ${d.day}`}</div>
                </div>
                <ul className="mt-3 space-y-1.5 pl-12 text-sm text-white/80">
                  {d.tasks.map((t, j) => <li key={j} className="list-disc">{t}</li>)}
                </ul>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {plan.client_acquisition && (
          <motion.div {...fade(4)}>
            <GlassCard>
              <SectionTitle><Users className="h-4 w-4 inline mr-1.5" /> Client acquisition</SectionTitle>
              <ul className="mt-3 space-y-1.5 text-sm text-white/80">
                {plan.client_acquisition.map((c, i) => <li key={i} className="list-disc list-inside">{c}</li>)}
              </ul>
            </GlassCard>
          </motion.div>
        )}
        {plan.pricing_strategy && (
          <motion.div {...fade(5)}>
            <GlassCard>
              <SectionTitle><DollarSign className="h-4 w-4 inline mr-1.5" /> Pricing strategy</SectionTitle>
              <p className="mt-3 whitespace-pre-line text-sm text-white/80">{plan.pricing_strategy}</p>
            </GlassCard>
          </motion.div>
        )}
      </div>

      {plan.outreach_scripts && (
        <motion.div {...fade(6)}>
          <SectionTitle><MessageSquare className="h-4 w-4 inline mr-1.5" /> Outreach scripts</SectionTitle>
          <div className="mt-3 space-y-3">
            {plan.outreach_scripts.map((s, i) => (
              <GlassCard key={i}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-medium uppercase tracking-wider text-[#5B8CFF]">{s.channel}</div>
                  <button onClick={() => copy(s.script)} className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white">
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-white/85">{s.script}</pre>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      )}

      {plan.first_24h_actions && (
        <motion.div {...fade(7)}>
          <GlassCard className="glow-blue">
            <SectionTitle><Zap className="h-4 w-4 inline mr-1.5" /> First 24 hours</SectionTitle>
            <ul className="mt-3 space-y-2 text-sm text-white/90">
              {plan.first_24h_actions.map((a, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#5B8CFF] to-[#8B5CF6] text-xs font-bold">
                    {i + 1}
                  </span>
                  {a}
                </li>
              ))}
            </ul>
          </GlassCard>
        </motion.div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link to="/dashboard"><GlowButton variant="secondary">Back to dashboard</GlowButton></Link>
        <Link to="/dashboard/plans/new"><GlowButton>Generate another</GlowButton></Link>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60">{children}</h2>;
}
