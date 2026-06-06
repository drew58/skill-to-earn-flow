import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Search, Sparkles, Bookmark, BookmarkCheck, ExternalLink, Filter, Lock,
  Briefcase, Code2, PenTool, Megaphone, GraduationCap, Camera, Headphones,
  TrendingUp, Zap, Globe2, Building2, ShoppingBag, Wand2, Radio, MapPin, Building,
} from "lucide-react";
import { GlassCard } from "@/components/angie/GlassCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { fetchLiveJobs, type LiveJob } from "@/lib/jobs.functions";

export const Route = createFileRoute("/dashboard/opportunities")({
  component: OpportunityExplorer,
});


type Level = "Beginner" | "Intermediate" | "Pro";
type Category = "Freelance" | "Remote Job" | "Marketplace" | "Creator" | "Microtask" | "Coaching";

type Opportunity = {
  id: string;
  title: string;
  platform: string;
  category: Category;
  level: Level;
  payout: string;
  tags: string[];
  url: string;
  description: string;
  trending?: boolean;
  recommended?: boolean;
  icon: typeof Briefcase;
  accent: string; // tailwind gradient stops
};

const OPPORTUNITIES: Opportunity[] = [
  { id: "upwork-writing", title: "Long-form content writers wanted", platform: "Upwork", category: "Freelance", level: "Beginner", payout: "$25–$80/hr", tags: ["Writing", "AI", "Blogs"], url: "https://www.upwork.com/", description: "Hundreds of new writing gigs posted daily. Perfect entry point with AI-assisted workflows.", trending: true, recommended: true, icon: PenTool, accent: "from-[#5B8CFF] to-[#8B5CF6]" },
  { id: "fiverr-design", title: "Brand kits & logo design packages", platform: "Fiverr", category: "Marketplace", level: "Beginner", payout: "$50–$500/pkg", tags: ["Design", "Branding"], url: "https://www.fiverr.com/", description: "Productize a brand kit and let buyers come to you. Low overhead, scalable.", icon: PenTool, accent: "from-[#22C55E] to-[#5B8CFF]" },
  { id: "toptal-dev", title: "Senior React engineers", platform: "Toptal", category: "Remote Job", level: "Pro", payout: "$80–$160/hr", tags: ["React", "TypeScript"], url: "https://www.toptal.com/", description: "Vetted remote roles with top-tier clients. Long-term engagements possible.", recommended: true, icon: Code2, accent: "from-[#8B5CF6] to-[#E879F9]" },
  { id: "remoteok-startup", title: "Trending startup remote roles", platform: "RemoteOK", category: "Remote Job", level: "Intermediate", payout: "$60k–$160k/yr", tags: ["Full-time", "Remote"], url: "https://remoteok.com/", description: "Curated remote jobs from fast-growing startups. New listings every hour.", trending: true, icon: Globe2, accent: "from-[#5B8CFF] to-[#22C55E]" },
  { id: "contra-design", title: "Independent design contracts", platform: "Contra", category: "Freelance", level: "Intermediate", payout: "$1k–$8k/project", tags: ["Design", "0% fee"], url: "https://contra.com/", description: "Commission-free freelance platform built for independents.", icon: PenTool, accent: "from-[#E879F9] to-[#5B8CFF]" },
  { id: "gumroad-product", title: "Sell digital templates & guides", platform: "Gumroad", category: "Creator", level: "Beginner", payout: "Passive", tags: ["Digital", "Templates"], url: "https://gumroad.com/", description: "Package your knowledge once, sell forever. Ideal first creator income.", recommended: true, icon: ShoppingBag, accent: "from-[#22C55E] to-[#8B5CF6]" },
  { id: "superpeer-coach", title: "Paid 1:1 coaching calls", platform: "Superpeer", category: "Coaching", level: "Intermediate", payout: "$100–$400/hr", tags: ["1:1", "Calls"], url: "https://superpeer.com/", description: "Monetize your expertise via short coaching sessions.", icon: Headphones, accent: "from-[#5B8CFF] to-[#E879F9]" },
  { id: "appen-microtask", title: "AI training microtasks", platform: "Appen", category: "Microtask", level: "Beginner", payout: "$8–$20/hr", tags: ["AI", "No interview"], url: "https://appen.com/", description: "Get paid to label data and evaluate AI outputs. Flexible hours.", icon: Zap, accent: "from-[#22C55E] to-[#5B8CFF]" },
  { id: "wellfound-startup", title: "Startup operator roles", platform: "Wellfound", category: "Remote Job", level: "Intermediate", payout: "Equity + salary", tags: ["Startup", "Operator"], url: "https://wellfound.com/", description: "Apply directly to founders at early-stage companies.", icon: Building2, accent: "from-[#8B5CF6] to-[#5B8CFF]" },
  { id: "skillshare-teach", title: "Teach a class, earn royalties", platform: "Skillshare", category: "Coaching", level: "Intermediate", payout: "Recurring", tags: ["Teaching", "Royalty"], url: "https://www.skillshare.com/teach", description: "Record once, earn from every minute watched.", trending: true, icon: GraduationCap, accent: "from-[#E879F9] to-[#22C55E]" },
  { id: "shutterstock-stock", title: "License photos & videos", platform: "Shutterstock", category: "Marketplace", level: "Beginner", payout: "Passive", tags: ["Photo", "Video"], url: "https://submit.shutterstock.com/", description: "Upload media you already have. Earn each download.", icon: Camera, accent: "from-[#5B8CFF] to-[#22C55E]" },
  { id: "passionfroot-sponsor", title: "Creator sponsorships marketplace", platform: "Passionfroot", category: "Creator", level: "Intermediate", payout: "$200–$5k/deal", tags: ["Sponsorship"], url: "https://www.passionfroot.me/", description: "List your audience, get inbound brand deals.", icon: Megaphone, accent: "from-[#8B5CF6] to-[#E879F9]" },
];

const CATEGORIES: { key: Category | "All"; icon: typeof Briefcase; label: string }[] = [
  { key: "All", icon: Sparkles, label: "All" },
  { key: "Freelance", icon: Briefcase, label: "Freelance" },
  { key: "Remote Job", icon: Globe2, label: "Remote Jobs" },
  { key: "Marketplace", icon: ShoppingBag, label: "Marketplaces" },
  { key: "Creator", icon: Megaphone, label: "Creator" },
  { key: "Microtask", icon: Zap, label: "Microtasks" },
  { key: "Coaching", icon: GraduationCap, label: "Coaching" },
];

function OpportunityExplorer() {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<Category | "All">("All");
  const [activeLevel, setActiveLevel] = useState<Level | "All">("All");
  const [savedOnly, setSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [planOpps, setPlanOpps] = useState<{ name: string; why: string; effort?: string }[]>([]);
  const [bestPick, setBestPick] = useState<{ name: string; rationale: string } | null>(null);
  const [planTitle, setPlanTitle] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("saved_opportunities")
      .select("opportunity_id")
      .then(({ data }) => {
        if (data) setSavedIds(new Set(data.map((d) => d.opportunity_id as string)));
      });
    supabase
      .from("plans")
      .select("title,content,created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const c = (data.content ?? {}) as { top_opportunities?: { name: string; why: string; effort?: string }[]; best_recommendation?: { name: string; rationale: string } };
        setPlanOpps(c.top_opportunities ?? []);
        setBestPick(c.best_recommendation ?? null);
        setPlanTitle(data.title ?? "");
      });
  }, [user]);

  const filtered = useMemo(() => {
    return OPPORTUNITIES.filter((o) => {
      if (activeCat !== "All" && o.category !== activeCat) return false;
      if (activeLevel !== "All" && o.level !== activeLevel) return false;
      if (savedOnly && !savedIds.has(o.id)) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const haystack = [o.title, o.platform, o.description, ...o.tags].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [activeCat, activeLevel, savedOnly, savedIds, query]);

  const recommended = OPPORTUNITIES.filter((o) => o.recommended).slice(0, 3);
  const trending = OPPORTUNITIES.filter((o) => o.trending);

  const toggleSave = async (o: Opportunity) => {
    if (!user) return;

    // Free tier cannot save opportunities
    if (!isPro) {
      toast.error("Upgrade to Pro", { description: "Saving opportunities is a Pro feature." });
      return;
    }

    const isSaved = savedIds.has(o.id);
    const next = new Set(savedIds);
    if (isSaved) {
      next.delete(o.id);
      setSavedIds(next);
      await supabase.from("saved_opportunities").delete().eq("user_id", user.id).eq("opportunity_id", o.id);
      toast("Removed from saved");
    } else {
      next.add(o.id);
      setSavedIds(next);
      await supabase.from("saved_opportunities").insert({
        user_id: user.id,
        opportunity_id: o.id,
        title: o.title,
        platform: o.platform,
        category: o.category,
        payout: o.payout,
        url: o.url,
      });
      toast.success("Saved", { description: o.title });
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
        className="relative overflow-hidden rounded-3xl glass-strong p-6 md:p-10"
      >
        <div className="pointer-events-none absolute -top-32 -right-20 h-80 w-80 rounded-full bg-[#8B5CF6]/30 blur-[110px] animate-pulse-glow" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#5B8CFF]/25 blur-[110px] animate-pulse-glow" style={{ animationDelay: "1.2s" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white/60">
            <Sparkles className="h-3 w-3 text-[#A78BFA]" /> Opportunity Explorer
          </div>
          <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-[1.05] tracking-tight md:text-5xl">
            Real platforms. <span className="text-gradient">Real income.</span> Apply in one click.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/60 md:text-base">
            Hand-picked freelance gigs, remote jobs, and creator platforms — filtered to match your skills and goals.
          </p>

          {/* Search */}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search platforms, skills, payout…"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/40 outline-none transition-all focus:border-[#5B8CFF]/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#5B8CFF]/30"
              />
            </div>
            <button
              onClick={() => setSavedOnly((s) => !s)}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3.5 text-sm font-medium transition-all",
                savedOnly
                  ? "border-[#8B5CF6]/50 bg-[#8B5CF6]/15 text-white shadow-[0_0_30px_-10px_rgba(139,92,246,0.6)]"
                  : "border-white/10 bg-white/[0.04] text-white/70 hover:text-white",
              )}
            >
              {isPro ? <Bookmark className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              Saved{savedIds.size > 0 && <span className="text-white/50">· {savedIds.size}</span>}
              {!isPro && <span className="ml-1 rounded-full bg-[#8B5CF6]/20 px-1.5 py-0.5 text-[10px] text-[#A78BFA]">Pro</span>}
            </button>
          </div>
        </div>
      </motion.div>

      {/* From your latest plan */}
      {(planOpps.length > 0 || bestPick) && (
        <section>
          <SectionHeader
            icon={Sparkles}
            eyebrow="From your latest plan"
            title={planTitle || "Pulled from your latest plan"}
            subtitle="Personalized opportunities Angie identified for you."
          />
          {bestPick && (
            <GlassCard className="mb-4 glow-purple">
              <div className="text-[11px] font-medium uppercase tracking-wider text-[#A78BFA]">Best pick</div>
              <h3 className="mt-1 text-lg font-semibold">{bestPick.name}</h3>
              <p className="mt-1 text-sm text-white/70">{bestPick.rationale}</p>
            </GlassCard>
          )}
          {planOpps.length > 0 && (
            <div className="grid gap-3 md:grid-cols-3">
              {planOpps.slice(0, 3).map((o, i) => (
                <GlassCard key={i} hover>
                  <div className="text-xs text-white/40">#{i + 1}</div>
                  <div className="mt-1 font-semibold">{o.name}</div>
                  <div className="mt-1 text-sm text-white/70">{o.why}</div>
                  {o.effort && <div className="mt-3 text-xs text-[#5B8CFF]">Effort: {o.effort}</div>}
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(o.name + " freelance jobs")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs text-[#A78BFA] hover:underline"
                  >
                    Search live listings <ExternalLink className="h-3 w-3" />
                  </a>
                </GlassCard>
              ))}
            </div>
          )}
        </section>
      )}

      {/* AI Recommendations */}
      <section>
        <SectionHeader
          icon={Wand2}
          eyebrow="Angie AI"
          title="Recommended for you"
          subtitle="Based on your profile, plans, and current trends."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {recommended.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <OpportunityCard o={o} saved={savedIds.has(o.id)} onSave={toggleSave} highlighted />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section>
        <SectionHeader
          icon={TrendingUp}
          eyebrow="Live"
          title="Trending right now"
          subtitle="Hot platforms with surging demand this week."
        />
        <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-3 scrollbar-hide">
          {trending.map((o) => (
            <div key={o.id} className="w-[300px] shrink-0 md:w-[340px]">
              <OpportunityCard o={o} saved={savedIds.has(o.id)} onSave={toggleSave} />
            </div>
          ))}
        </div>
      </section>

      {/* Filters + Grid */}
      <section>
        <SectionHeader
          icon={Filter}
          eyebrow="Browse"
          title="All opportunities"
          subtitle={`${filtered.length} matching results`}
        />

        {/* Category chips */}
        <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-2 scrollbar-hide">
          {CATEGORIES.map((c) => {
            const active = activeCat === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setActiveCat(c.key)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-all",
                  active
                    ? "border-transparent bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white shadow-[0_0_24px_-6px_rgba(139,92,246,0.7)]"
                    : "border-white/10 bg-white/[0.03] text-white/65 hover:border-white/20 hover:text-white",
                )}
              >
                <c.icon className="h-3.5 w-3.5" /> {c.label}
              </button>
            );
          })}
        </div>

        {/* Level chips */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(["All", "Beginner", "Intermediate", "Pro"] as const).map((lv) => {
            const active = activeLevel === lv;
            return (
              <button
                key={lv}
                onClick={() => setActiveLevel(lv)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-all",
                  active
                    ? "border-[#5B8CFF]/50 bg-[#5B8CFF]/15 text-white"
                    : "border-white/10 bg-transparent text-white/50 hover:text-white",
                )}
              >
                {lv}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GlassCard className="py-16 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#5B8CFF]/20 to-[#8B5CF6]/20 ring-1 ring-inset ring-white/10">
                  <Search className="h-5 w-5 text-[#A78BFA]" />
                </div>
                <div className="mt-3 text-sm font-medium">No opportunities match those filters</div>
                <div className="mt-1 text-xs text-white/50">Try clearing filters or searching a different skill.</div>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {filtered.map((o, i) => (
                <motion.div
                  key={o.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.35 }}
                >
                  <OpportunityCard o={o} saved={savedIds.has(o.id)} onSave={toggleSave} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

function SectionHeader({
  icon: Icon, eyebrow, title, subtitle,
}: { icon: typeof Briefcase; eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
          <Icon className="h-3.5 w-3.5 text-[#A78BFA]" /> {eyebrow}
        </div>
        <h2 className="mt-1.5 text-xl font-semibold tracking-tight md:text-2xl">{title}</h2>
        <p className="mt-0.5 text-xs text-white/50 md:text-sm">{subtitle}</p>
      </div>
    </div>
  );
}

function OpportunityCard({
  o, saved, onSave, highlighted,
}: { o: Opportunity; saved: boolean; onSave: (o: Opportunity) => void; highlighted?: boolean }) {
  return (
    <GlassCard
      hover
      className={cn(
        "group relative flex h-full flex-col overflow-hidden p-5",
        highlighted && "ring-gradient",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br opacity-25 blur-3xl transition-opacity duration-500 group-hover:opacity-60",
          o.accent,
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn("grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br shadow-lg ring-1 ring-inset ring-white/15", o.accent)}>
            <o.icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-white/45">{o.platform}</div>
            <div className="mt-0.5 inline-flex items-center gap-1.5">
              <span className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                o.level === "Beginner" && "bg-[#22C55E]/15 text-[#86EFAC]",
                o.level === "Intermediate" && "bg-[#5B8CFF]/15 text-[#93B4FF]",
                o.level === "Pro" && "bg-[#8B5CF6]/15 text-[#C4B5FD]",
              )}>{o.level}</span>
              {o.trending && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E879F9]/15 px-2 py-0.5 text-[10px] font-medium text-[#F0ABFC]">
                  <TrendingUp className="h-2.5 w-2.5" /> Trending
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => onSave(o)}
          aria-label={saved ? "Remove from saved" : "Save opportunity"}
          className={cn(
            "relative grid h-9 w-9 place-items-center rounded-xl border transition-all",
            saved
              ? "border-[#8B5CF6]/40 bg-[#8B5CF6]/15 text-[#C4B5FD]"
              : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white",
          )}
        >
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>

      <h3 className="relative mt-4 text-base font-semibold leading-snug tracking-tight">{o.title}</h3>
      <p className="relative mt-1.5 line-clamp-2 text-sm text-white/55">{o.description}</p>

      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {o.tags.map((t) => (
          <span key={t} className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/60">
            {t}
          </span>
        ))}
      </div>

      <div className="relative mt-5 flex items-end justify-between gap-3 pt-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/40">Payout</div>
          <div className="mt-0.5 bg-gradient-to-r from-white to-white/70 bg-clip-text text-sm font-semibold text-transparent">
            {o.payout}
          </div>
        </div>
        <a
          href={o.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] px-4 py-2 text-xs font-medium text-white shadow-[0_8px_30px_-8px_rgba(91,140,255,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-8px_rgba(139,92,246,0.8)]"
        >
          Quick apply <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </GlassCard>
  );
}
