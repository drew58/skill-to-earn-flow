import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GlassCard } from "@/components/angie/GlassCard";
import { GlowButton } from "@/components/angie/GlowButton";
import { AiLoader } from "@/components/angie/AiLoader";
import { Paywall } from "@/components/angie/Paywall";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/hooks/use-subscription";
import { X, Plus, Sparkles, Lock } from "lucide-react";

export const Route = createFileRoute("/dashboard/plans/new")({ component: NewPlan });

const COUNTRIES = ["United States","United Kingdom","Canada","Germany","France","Spain","Portugal","Netherlands","Sweden","Norway","Nigeria","South Africa","India","Pakistan","Bangladesh","Philippines","Indonesia","Vietnam","Brazil","Mexico","Argentina","Australia","UAE","Egypt","Kenya","Other"];
const TIMES = ["1-2 hrs/day","3-4 hrs/day","5-6 hrs/day","Full time"];
const LEVELS = ["Beginner","Intermediate","Advanced"];
const GOALS = ["First $100","$500/month side income","$1-3K/month freelancing","$5K+/month full-time","Build a long-term business"];

function NewPlan() {
  const { user } = useAuth();
  const { isPro, remaining, increment } = useSubscription();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [country, setCountry] = useState("United States");
  const [time, setTime] = useState(TIMES[1]);
  const [level, setLevel] = useState(LEVELS[0]);
  const [goal, setGoal] = useState(GOALS[1]);
  const [busy, setBusy] = useState(false);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s) && skills.length < 12) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (skills.length === 0) return toast.error("Add at least one skill.");

    // Free tier limit check
    if (!isPro) {
      const plansRemaining = remaining("plansPerMonth");
      if (plansRemaining <= 0) {
        toast.error("Plan limit reached", { description: "Free tier: 1 plan / month. Upgrade to Pro for unlimited plans." });
        return;
      }
    }

    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-plan", {
        body: { skills, country, time, level, goal },
      });
      if (error) throw error;
      if (!data?.plan) throw new Error("AI didn't return a plan");

      // Track usage for free tier
      if (!isPro) {
        await increment("plans");
      }

      // Save plan
      const { data: saved, error: insErr } = await supabase
        .from("plans")
        .insert({
          user_id: user!.id,
          title: data.plan.title ?? `Income plan — ${new Date().toLocaleDateString()}`,
          input: { skills, country, time, level, goal },
          content: data.plan,
        })
        .select("id")
        .single();
      if (insErr) throw insErr;

      // Seed today's missions from first day's tasks
      const day1 = data.plan.action_plan_7_days?.[0]?.tasks ?? data.plan.first_24h_actions ?? [];
      if (Array.isArray(day1) && day1.length) {
        await supabase.from("missions").insert(
          day1.slice(0, 6).map((t: string) => ({
            user_id: user!.id,
            plan_id: saved.id,
            title: typeof t === "string" ? t : String(t),
          })),
        );
      }

      navigate({ to: "/dashboard/plans/$planId", params: { planId: saved.id } });
    } catch (err: any) {
      const msg = err?.message || "Failed to generate plan";
      if (msg.includes("Rate") || msg.includes("429")) toast.error("Rate limit hit — try again in a moment.");
      else if (msg.includes("Payment") || msg.includes("402")) toast.error("AI credits exhausted. Add credits in workspace settings.");
      else toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  if (busy) {
    return (
      <GlassCard className="mx-auto max-w-2xl">
        <AiLoader />
      </GlassCard>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8B5CF6]">
          <Sparkles className="h-3 w-3" /> Income plan generator
        </div>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl">Tell Angie about you</h1>
        <p className="mt-1 text-sm text-white/60">
          Two minutes. One realistic plan. Zero hype.
        </p>
      </motion.div>

      <form onSubmit={generate} className="space-y-4">
        <GlassCard>
          <Label>Your skills</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#5B8CFF]/20 to-[#8B5CF6]/20 px-3 py-1 text-xs">
                {s}
                <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))} className="text-white/50 hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              placeholder="e.g. UI design, copywriting, Python…"
              className="glass flex-1 rounded-xl px-3 py-2 text-sm outline-none placeholder:text-white/30"
            />
            <GlowButton type="button" variant="secondary" onClick={addSkill}>
              <Plus className="h-4 w-4" /> Add
            </GlowButton>
          </div>
        </GlassCard>

        <div className="grid gap-4 md:grid-cols-2">
          <GlassCard>
            <Label>Country</Label>
            <Select value={country} onChange={setCountry} options={COUNTRIES} />
          </GlassCard>
          <GlassCard>
            <Label>Time available</Label>
            <Pills value={time} setValue={setTime} options={TIMES} />
          </GlassCard>
          <GlassCard>
            <Label>Experience level</Label>
            <Pills value={level} setValue={setLevel} options={LEVELS} />
          </GlassCard>
          <GlassCard>
            <Label>Goal</Label>
            <Select value={goal} onChange={setGoal} options={GOALS} />
          </GlassCard>
        </div>

        <GlowButton type="submit" className="w-full py-3 text-base">
          <Sparkles className="h-4 w-4" /> Generate my income plan
        </GlowButton>
      </form>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-medium uppercase tracking-wider text-white/50">{children}</div>;
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="glass mt-2 w-full rounded-xl px-3 py-2 text-sm outline-none"
    >
      {options.map((o) => <option key={o} value={o} className="bg-[#121826]">{o}</option>)}
    </select>
  );
}

function Pills({ value, setValue, options }: { value: string; setValue: (v: string) => void; options: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => setValue(o)}
          className={`rounded-xl px-3 py-1.5 text-xs transition ${
            value === o
              ? "bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white shadow-[0_8px_24px_-8px_rgba(91,140,255,0.6)]"
              : "glass text-white/70 hover:text-white"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
