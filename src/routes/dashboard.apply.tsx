import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { z } from "zod";
import {
  Sparkles, Upload, FileText, Loader2, Copy, Check, ExternalLink, Wand2, Linkedin, Search, ChevronRight,
} from "lucide-react";
import { GlassCard } from "@/components/angie/GlassCard";
import { Paywall } from "@/components/angie/Paywall";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/hooks/use-subscription";
import { OPPORTUNITIES, findOpportunity, type Opportunity } from "@/lib/opportunities";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const searchSchema = z.object({ opp: z.string().optional() });

export const Route = createFileRoute("/dashboard/apply")({
  component: ApplyPage,
  validateSearch: searchSchema,
});

type Kind = "cover-letter" | "proposal" | "gig" | "linkedin-message" | "email-pitch";

const KIND_LABELS: { value: Kind; label: string; hint: string }[] = [
  { value: "proposal", label: "Upwork proposal", hint: "Tight, results-led" },
  { value: "cover-letter", label: "Cover letter", hint: "Job applications" },
  { value: "gig", label: "Fiverr gig", hint: "Title + packages + desc" },
  { value: "linkedin-message", label: "LinkedIn DM", hint: "Short outreach" },
  { value: "email-pitch", label: "Cold email", hint: "Subject + pitch" },
];

function ApplyPage() {
  const { user, session } = useAuth();
  const { isPro, canUse, remaining, increment } = useSubscription();
  const search = useSearch({ from: "/dashboard/apply" });
  const preselected = search.opp ? findOpportunity(search.opp) ?? null : null;

  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(preselected);
  const [oppQuery, setOppQuery] = useState("");
  const [kind, setKind] = useState<Kind>(preselected?.applicationKinds[0] ?? "proposal");
  const [resumeText, setResumeText] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [output, setOutput] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pastApps, setPastApps] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: profile } = await supabase.from("profiles")
        .select("resume_text,linkedin_url")
        .eq("id", user.id).maybeSingle();
      if (profile?.resume_text) setResumeText(profile.resume_text);
      if (profile?.linkedin_url) setLinkedinUrl(profile.linkedin_url);
      const { data } = await supabase.from("applications")
        .select("id,kind,platform,content,created_at,input")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);
      setPastApps(data ?? []);
    })();
  }, [user]);

  const filteredOpps = useMemo(() => {
    const q = oppQuery.toLowerCase().trim();
    return OPPORTUNITIES.filter((o) =>
      !q || (o.title + " " + o.platform + " " + o.tags.join(" ")).toLowerCase().includes(q)
    ).slice(0, 8);
  }, [oppQuery]);

  const onResumeUpload = async (file: File) => {
    if (!user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${user.id}/resume.${ext}`;
      const { error: upErr } = await supabase.storage.from("resumes").upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      // Try simple text extraction for .txt and .md; otherwise just store path & ask user to paste
      let extracted = "";
      if (file.type.startsWith("text/") || /\.(txt|md|markdown)$/i.test(file.name)) {
        extracted = await file.text();
        setResumeText(extracted);
      }
      await supabase.from("profiles").update({
        resume_path: path,
        resume_text: extracted || resumeText || null,
      }).eq("id", user.id);
      toast.success("Resume uploaded", {
        description: extracted ? "Text extracted from file" : "Paste the text below so Angie can read it",
      });
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const generate = async () => {
    if (!selectedOpp) return toast.error("Pick an opportunity first");
    if (!session) return;
    if (!isPro && remaining("applicationsPerDay") <= 0) {
      toast.error("Daily limit reached", { description: "Free tier: 4 applications/day. Upgrade to Pro for unlimited." });
      return;
    }
    setGenerating(true);
    setOutput("");
    try {
      // Save latest resume text + linkedin to profile so it's reusable
      if (user) {
        await supabase.from("profiles").update({
          resume_text: resumeText || null,
          linkedin_url: linkedinUrl || null,
        }).eq("id", user.id);
      }

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-application`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          opportunity_id: selectedOpp.id,
          platform: selectedOpp.platform,
          kind,
          opportunity_title: selectedOpp.title,
          opportunity_description: selectedOpp.description,
          resume_text: resumeText,
          linkedin_url: linkedinUrl,
          extra_notes: extraNotes,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error ?? "Generation failed");
      setOutput(data.content);
      if (!isPro) await increment("applications");
      // refresh past
      const { data: apps } = await supabase.from("applications")
        .select("id,kind,platform,content,created_at,input")
        .eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5);
      setPastApps(apps ?? []);
    } catch (e: any) {
      toast.error(e.message ?? "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const availableKinds = selectedOpp?.applicationKinds ?? KIND_LABELS.map((k) => k.value);

  if (!canUse("instantApply")) {
    return <Paywall feature="Instant Apply Assistant" />;
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl glass-strong p-6 md:p-10"
      >
        <div className="pointer-events-none absolute -top-32 -right-20 h-80 w-80 rounded-full bg-[#5B8CFF]/30 blur-[110px] animate-pulse-glow" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white/60">
            <Wand2 className="h-3 w-3 text-[#A78BFA]" /> Instant Apply Assistant
          </div>
          <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-[1.05] tracking-tight md:text-5xl">
            One click to a <span className="text-gradient">tailored application</span>.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/60 md:text-base">
            Upload your CV, pick an opportunity, and Angie writes proposals, cover letters, gigs, and DMs optimized for that exact platform.
          </p>
        </div>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        {/* Left: inputs */}
        <div className="space-y-5">
          {/* Step 1: Resume */}
          <GlassCard className="p-5">
            <StepHeader n={1} title="Your background" />
            <div className="mt-4 space-y-3">
              <label className="group relative flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3.5 transition-all hover:border-[#5B8CFF]/50 hover:bg-[#5B8CFF]/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#5B8CFF]/25 to-[#8B5CF6]/25">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium">Upload resume / CV</div>
                    <div className="text-[11px] text-white/45">PDF, DOCX, TXT · max 5MB</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-white/30 transition-transform group-hover:translate-x-0.5" />
                <input
                  type="file" className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.md,application/pdf,text/plain"
                  onChange={(e) => e.target.files?.[0] && onResumeUpload(e.target.files[0])}
                />
              </label>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/45">
                  Paste resume text (recommended)
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your CV text or write a 5-line background…"
                  rows={5}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-white placeholder:text-white/40 outline-none transition-all focus:border-[#5B8CFF]/60 focus:ring-2 focus:ring-[#5B8CFF]/30"
                />
              </div>

              <div className="relative">
                <Linkedin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/your-handle"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#5B8CFF]/60 focus:ring-2 focus:ring-[#5B8CFF]/30"
                />
              </div>
            </div>
          </GlassCard>

          {/* Step 2: Opportunity */}
          <GlassCard className="p-5">
            <StepHeader n={2} title="Pick an opportunity" />
            {selectedOpp ? (
              <div className="mt-4 flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-white/40">{selectedOpp.platform}</div>
                  <div className="mt-0.5 text-sm font-semibold">{selectedOpp.title}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-white/55">{selectedOpp.description}</div>
                </div>
                <button onClick={() => setSelectedOpp(null)} className="text-xs text-white/50 hover:text-white">Change</button>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    value={oppQuery} onChange={(e) => setOppQuery(e.target.value)}
                    placeholder="Search platform or skill…"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-3 text-sm outline-none focus:border-[#5B8CFF]/60 focus:ring-2 focus:ring-[#5B8CFF]/30"
                  />
                </div>
                <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                  {filteredOpps.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => { setSelectedOpp(o); setKind(o.applicationKinds[0]); }}
                      className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-2.5 text-left transition-all hover:border-[#5B8CFF]/40 hover:bg-white/[0.05]"
                    >
                      <div className={cn("grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ring-1 ring-inset ring-white/15", o.accent)}>
                        <o.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] uppercase tracking-wider text-white/40">{o.platform} · {o.level}</div>
                        <div className="truncate text-xs font-medium">{o.title}</div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-white/30 group-hover:text-white/70" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>

          {/* Step 3: Kind + notes */}
          <GlassCard className="p-5">
            <StepHeader n={3} title="What should Angie write?" />
            <div className="mt-4 flex flex-wrap gap-2">
              {KIND_LABELS.filter((k) => availableKinds.includes(k.value)).map((k) => (
                <button
                  key={k.value}
                  onClick={() => setKind(k.value)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all",
                    kind === k.value
                      ? "border-transparent bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white shadow-[0_0_24px_-6px_rgba(139,92,246,0.7)]"
                      : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:text-white",
                  )}
                >
                  <div>{k.label}</div>
                  <div className={cn("text-[10px] font-normal mt-0.5", kind === k.value ? "text-white/80" : "text-white/40")}>{k.hint}</div>
                </button>
              ))}
            </div>
            <textarea
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              rows={3}
              placeholder="Optional: extra context (job link, client name, vibe, must-mention…)"
              className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#5B8CFF]/60 focus:ring-2 focus:ring-[#5B8CFF]/30"
            />

            <button
              onClick={generate}
              disabled={generating || !selectedOpp}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgba(139,92,246,0.8)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? "Angie is writing…" : "Generate application"}
            </button>
          </GlassCard>
        </div>

        {/* Right: output + past */}
        <div className="space-y-5">
          <GlassCard className="relative flex min-h-[420px] flex-col overflow-hidden p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#5B8CFF]">
                  <FileText className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold">Generated application</h3>
              </div>
              {output && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={copy}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/80 hover:text-white"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-[#86EFAC]" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  {selectedOpp && (
                    <a
                      href={selectedOpp.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] px-3 py-1.5 text-xs font-medium"
                    >
                      Open {selectedOpp.platform} <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!output && !generating && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 flex-col items-center justify-center text-center">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#5B8CFF]/20 to-[#8B5CF6]/20 ring-1 ring-inset ring-white/10">
                    <Wand2 className="h-5 w-5 text-[#A78BFA]" />
                  </div>
                  <div className="mt-3 text-sm font-medium">Your tailored application appears here</div>
                  <div className="mt-1 max-w-xs text-xs text-white/45">Pick an opportunity and hit Generate. Angie writes it in the right tone for that platform.</div>
                </motion.div>
              )}
              {generating && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 flex-col items-center justify-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-[#A78BFA]" />
                  <div className="text-xs text-white/55">Tailoring to {selectedOpp?.platform}…</div>
                </motion.div>
              )}
              {output && !generating && (
                <motion.div key="out" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="prose prose-invert prose-sm max-w-none overflow-y-auto pr-1">
                  <ReactMarkdown>{output}</ReactMarkdown>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          {pastApps.length > 0 && (
            <GlassCard className="p-5">
              <h3 className="text-sm font-semibold">Recent generations</h3>
              <ul className="mt-3 divide-y divide-white/5">
                {pastApps.map((a) => (
                  <li key={a.id}>
                    <button
                      onClick={() => setOutput(a.content)}
                      className="flex w-full items-center justify-between gap-3 py-2.5 text-left text-xs transition-colors hover:text-[#A78BFA]"
                    >
                      <span className="truncate">
                        <span className="text-white/45">{a.platform ?? "—"}</span>
                        <span className="mx-1.5 text-white/30">·</span>
                        <span className="text-white/80">{a.kind}</span>
                        {a.input?.opportunity_title && <span className="ml-2 text-white/45">— {a.input.opportunity_title}</span>}
                      </span>
                      <span className="shrink-0 text-[10px] text-white/35">{new Date(a.created_at).toLocaleDateString()}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

function StepHeader({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-[#5B8CFF] to-[#8B5CF6] text-[10px] font-bold">{n}</span>
      <h2 className="text-sm font-semibold">{title}</h2>
    </div>
  );
}
