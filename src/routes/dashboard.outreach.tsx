import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { GlassCard } from "@/components/angie/GlassCard";
import { GlowButton } from "@/components/angie/GlowButton";
import {
  MessageSquare, Copy, Check, Linkedin, Mail, Wand2, Loader2,
  ArrowRight, Sparkles, Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/outreach")({ component: OutreachPage });

type Script = {
  id: string;
  planId: string;
  planTitle: string;
  channel: string;
  script: string;
};

const TONES = [
  { id: "shorter", label: "Shorter", hint: "Tighten and trim" },
  { id: "casual", label: "More casual", hint: "Friendly, conversational" },
  { id: "formal", label: "More formal", hint: "Polished, professional" },
  { id: "linkedin", label: "LinkedIn-optimized", hint: "Connection-request length" },
  { id: "cold-dm", label: "Cold DM", hint: "IG/Twitter direct" },
  { id: "cold-email", label: "Cold email", hint: "Subject + 3 short paras" },
] as const;
type ToneId = (typeof TONES)[number]["id"];

function channelIcon(channel: string) {
  const c = channel.toLowerCase();
  if (c.includes("linkedin")) return Linkedin;
  if (c.includes("email")) return Mail;
  if (c.includes("dm") || c.includes("instagram") || c.includes("twitter")) return Send;
  return MessageSquare;
}

function OutreachPage() {
  const { user, session } = useAuth();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("id,title,content,created_at")
        .order("created_at", { ascending: false });
      if (error) {
        toast.error("Could not load outreach scripts");
        setLoading(false);
        return;
      }
      const flat: Script[] = [];
      for (const p of data ?? []) {
        const content = (p.content ?? {}) as { outreach_scripts?: { channel: string; script: string }[] };
        (content.outreach_scripts ?? []).forEach((s, idx) => {
          if (s?.script) {
            flat.push({
              id: `${p.id}-${idx}`,
              planId: p.id,
              planTitle: p.title ?? "Income plan",
              channel: s.channel ?? "Outreach",
              script: s.script,
            });
          }
        });
      }
      setScripts(flat);
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return <div className="text-sm text-white/50">Loading outreach scripts…</div>;
  }

  if (scripts.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <GlassCard className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#5B8CFF]/30 to-[#8B5CF6]/30">
            <MessageSquare className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">No outreach scripts yet</h1>
          <p className="mt-2 text-sm text-white/60">
            Generate an income plan and Angie will create cold DMs, LinkedIn messages and email pitches you can fine-tune here.
          </p>
          <Link to="/dashboard/plans/new" className="mt-6 inline-block">
            <GlowButton>
              Generate a plan <ArrowRight className="h-3.5 w-3.5" />
            </GlowButton>
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8B5CF6]">
          <MessageSquare className="h-3 w-3" /> Outreach
        </div>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl">Your outreach scripts</h1>
        <p className="mt-1 text-sm text-white/60">
          {scripts.length} scripts across {new Set(scripts.map((s) => s.planId)).size} plan
          {new Set(scripts.map((s) => s.planId)).size === 1 ? "" : "s"}. Fine-tune any of them for LinkedIn, cold DMs, email and more.
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        {scripts.map((s) => (
          <ScriptCard key={s.id} s={s} accessToken={session?.access_token} />
        ))}
      </div>
    </div>
  );
}

function ScriptCard({ s, accessToken }: { s: Script; accessToken?: string }) {
  const Icon = channelIcon(s.channel);
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState<ToneId>("shorter");
  const [refined, setRefined] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const display = refined ?? s.script;

  const copy = async () => {
    await navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const fineTune = async () => {
    if (!accessToken) {
      toast.error("Please sign in again");
      return;
    }
    setBusy(true);
    try {
      const preset = TONES.find((t) => t.id === tone)!;
      const kind =
        tone === "linkedin"
          ? "linkedin-message"
          : tone === "cold-email"
          ? "email-pitch"
          : tone === "cold-dm"
          ? "linkedin-message"
          : "proposal";

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-application`;
      const r = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          opportunity_id: `outreach-${s.id}`,
          platform: s.channel,
          kind,
          opportunity_title: `Refine outreach script (${preset.label})`,
          opportunity_description: `Rewrite the script below in this tone: ${preset.label} — ${preset.hint}. Keep the same intent and call-to-action. Channel: ${s.channel}.`,
          resume_text: "",
          linkedin_url: "",
          extra_notes: `Original script to rewrite:\n\n${s.script}\n\nReturn ONLY the rewritten message — no preamble, no explanation.`,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error ?? "Fine-tune failed");
      setRefined(String(data.content ?? "").trim());
      toast.success(`Rewritten — ${preset.label}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not fine-tune");
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassCard className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#5B8CFF]/30 to-[#8B5CF6]/30 ring-1 ring-inset ring-white/10">
            <Icon className="h-4 w-4 text-[#A78BFA]" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-medium uppercase tracking-wider text-white/45">{s.channel}</div>
            <div className="truncate text-sm font-semibold">{s.planTitle}</div>
          </div>
        </div>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-white/75 hover:text-white"
        >
          {copied ? <Check className="h-3 w-3 text-[#86EFAC]" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/5 bg-black/20 p-3 text-xs leading-relaxed text-white/85">
        {display}
      </pre>

      {refined && (
        <button
          onClick={() => setRefined(null)}
          className="mt-2 self-start text-[11px] text-white/45 hover:text-white"
        >
          ← Show original
        </button>
      )}

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-[#A78BFA]">
          <Wand2 className="h-3 w-3" /> Fine-tune
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {TONES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTone(t.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] transition-all",
                tone === t.id
                  ? "border-transparent bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white"
                  : "border-white/10 bg-white/[0.03] text-white/65 hover:text-white",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={fineTune}
          disabled={busy}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] py-2 text-xs font-semibold text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,0.6)] disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {busy ? "Angie is rewriting…" : "Rewrite with Angie"}
        </button>
      </div>
    </GlassCard>
  );
}
