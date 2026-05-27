import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Save, UserCircle2, Linkedin } from "lucide-react";
import { GlassCard } from "@/components/angie/GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({ component: ProfilePage });

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const PAYMENT_METHODS = ["PayPal", "Wise", "Payoneer", "Stripe", "Bank", "Crypto"];

type Profile = {
  display_name: string;
  country: string;
  experience_level: string;
  skills: string[];
  goals: string;
  weekly_hours: number | null;
  payment_methods: string[];
  linkedin_url: string;
  resume_text: string;
};

const EMPTY: Profile = {
  display_name: "", country: "", experience_level: "Beginner", skills: [],
  goals: "", weekly_hours: null, payment_methods: [], linkedin_url: "", resume_text: "",
};

function ProfilePage() {
  const { user } = useAuth();
  const [p, setP] = useState<Profile>(EMPTY);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles")
        .select("display_name,country,experience_level,skills,goals,weekly_hours,payment_methods,linkedin_url,resume_text")
        .eq("id", user.id).maybeSingle();
      if (data) {
        setP({
          display_name: data.display_name ?? "",
          country: data.country ?? "",
          experience_level: data.experience_level ?? "Beginner",
          skills: data.skills ?? [],
          goals: data.goals ?? "",
          weekly_hours: data.weekly_hours,
          payment_methods: data.payment_methods ?? [],
          linkedin_url: data.linkedin_url ?? "",
          resume_text: data.resume_text ?? "",
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || p.skills.includes(s)) return;
    setP({ ...p, skills: [...p.skills, s] });
    setSkillInput("");
  };

  const togglePayment = (m: string) => {
    setP({
      ...p,
      payment_methods: p.payment_methods.includes(m)
        ? p.payment_methods.filter((x) => x !== m)
        : [...p.payment_methods, m],
    });
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: p.display_name || null,
      country: p.country.toUpperCase().slice(0, 2) || null,
      experience_level: p.experience_level,
      skills: p.skills,
      goals: p.goals || null,
      weekly_hours: p.weekly_hours,
      payment_methods: p.payment_methods,
      linkedin_url: p.linkedin_url || null,
      resume_text: p.resume_text || null,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved", { description: "Angie will use this to tailor recommendations." });
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-white/50"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#5B8CFF] to-[#8B5CF6] shadow-[0_0_28px_-6px_rgba(139,92,246,0.7)]">
            <UserCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Profile Builder</h1>
            <p className="text-sm text-white/55">Better profile = smarter recommendations and tailored applications.</p>
          </div>
        </div>
      </motion.div>

      <GlassCard className="p-6">
        <h2 className="text-sm font-semibold">About you</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Display name">
            <input value={p.display_name} onChange={(e) => setP({ ...p, display_name: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Country (2-letter code)">
            <input value={p.country} placeholder="US, NG, IN, PH…" maxLength={2}
              onChange={(e) => setP({ ...p, country: e.target.value.toUpperCase() })}
              className={inputCls} />
          </Field>
          <Field label="Experience level">
            <select value={p.experience_level} onChange={(e) => setP({ ...p, experience_level: e.target.value })} className={inputCls}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Weekly hours available">
            <input type="number" min={0} max={80} value={p.weekly_hours ?? ""}
              onChange={(e) => setP({ ...p, weekly_hours: e.target.value === "" ? null : Number(e.target.value) })}
              className={inputCls} placeholder="e.g. 10" />
          </Field>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-sm font-semibold">Skills</h2>
        <p className="mt-1 text-xs text-white/50">Comma-separated keywords help Angie match you to opportunities.</p>
        <div className="mt-3 flex gap-2">
          <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
            placeholder="e.g. React" className={cn(inputCls, "flex-1")} />
          <button onClick={addSkill} className="rounded-xl bg-white/[0.06] px-4 text-sm hover:bg-white/[0.1]">Add</button>
        </div>
        {p.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.skills.map((s) => (
              <span key={s} className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs">
                {s}
                <button onClick={() => setP({ ...p, skills: p.skills.filter((x) => x !== s) })} className="text-white/40 hover:text-white">×</button>
              </span>
            ))}
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-sm font-semibold">Payment methods you can receive</h2>
        <p className="mt-1 text-xs text-white/50">Angie skips platforms that can't actually pay you out.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((m) => {
            const active = p.payment_methods.includes(m);
            return (
              <button key={m} onClick={() => togglePayment(m)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                  active
                    ? "border-transparent bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white"
                    : "border-white/10 bg-white/[0.03] text-white/65 hover:text-white",
                )}
              >
                {m}
              </button>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-sm font-semibold">Goals & background</h2>
        <div className="mt-4 space-y-4">
          <Field label="Long-term income goal">
            <textarea value={p.goals} onChange={(e) => setP({ ...p, goals: e.target.value })} rows={3} className={inputCls}
              placeholder="e.g. Replace my 9-5 within 12 months with $4k/mo freelance income." />
          </Field>
          <Field label="LinkedIn URL">
            <div className="relative">
              <Linkedin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input value={p.linkedin_url} onChange={(e) => setP({ ...p, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/your-handle" className={cn(inputCls, "pl-10")} />
            </div>
          </Field>
          <Field label="Resume / CV summary (paste text)">
            <textarea value={p.resume_text} onChange={(e) => setP({ ...p, resume_text: e.target.value })} rows={6} className={inputCls}
              placeholder="Paste your resume or 5-10 lines of background. Used by the Instant Apply Assistant." />
          </Field>
        </div>
      </GlassCard>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button
          onClick={save} disabled={saving}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgba(139,92,246,0.8)] transition-all hover:-translate-y-0.5 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition-all focus:border-[#5B8CFF]/60 focus:ring-2 focus:ring-[#5B8CFF]/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-white/45">{label}</div>
      {children}
    </label>
  );
}
