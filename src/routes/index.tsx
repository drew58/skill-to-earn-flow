import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, Play, Sparkles, Target, MessageSquare, Rocket, ShieldCheck, Zap,
  Check, Star,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/angie/Logo";
import { GlowButton } from "@/components/angie/GlowButton";
import { GlassCard } from "@/components/angie/GlassCard";
import { GlowOrbs } from "@/components/angie/GlowOrbs";

const FAQS = [
  { q: "Is Angie just another AI chatbot?", a: "No. Angie is structured around execution — every plan ends with a 24-hour action and daily missions. It's a coach, not a chat window." },
  { q: "Will it work for my country?", a: "Yes. Plans are tailored to your country, time zone, and the platforms actually available to you." },
  { q: "Do I need experience?", a: "No. You pick your level (beginner, intermediate, advanced) and Angie scales the plan accordingly." },
  { q: "Can I cancel anytime?", a: "Yes. No contracts. Cancel from settings in two clicks." },
];

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Angie — Turn Your Skills Into Income With AI" },
      { name: "description", content: "Angie builds realistic income plans, daily missions, outreach scripts, and execution strategies based on your skills and goals." },
      { property: "og:title", content: "Angie — Turn Your Skills Into Income With AI" },
      { property: "og:description", content: "Stop guessing. Start earning. AI-generated income plans, daily missions, and outreach scripts." },
      { property: "og:url", content: "https://skill-to-earn-flow.lovable.app/" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/65e91299-1dcb-4bbf-8c95-984c13b968e9/id-preview-c8ce2705--b0331167-5a9d-4b90-940a-93c3de4767a8.lovable.app-1780316957477.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/65e91299-1dcb-4bbf-8c95-984c13b968e9/id-preview-c8ce2705--b0331167-5a9d-4b90-940a-93c3de4767a8.lovable.app-1780316957477.png" },
    ],
    links: [{ rel: "canonical", href: "https://skill-to-earn-flow.lovable.app/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }),
    }],
  }),
});

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Header />
      <Hero />
      <TrustBar />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#faq" className="hover:text-white">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth">
            <GlowButton variant="ghost" className="hidden sm:inline-flex">Sign in</GlowButton>
          </Link>
          <Link to="/auth">
            <GlowButton>Start Free</GlowButton>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative">
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10" />
      <GlowOrbs />
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-24 md:pt-28 md:pb-36">
        <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/70 backdrop-blur">
            <Sparkles className="h-3 w-3 text-[#5B8CFF]" />
            AI income execution platform · Built for doers
          </div>
          <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Turn Your Skills Into <span className="text-gradient">Income With AI</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-white/70 md:text-lg">
            Angie builds realistic income plans, daily missions, outreach scripts, and execution
            strategies based on your skills and goals.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/auth">
              <GlowButton className="px-7 py-3 text-base">
                Start Free <ArrowRight className="h-4 w-4" />
              </GlowButton>
            </Link>
            <GlowButton variant="secondary" className="px-7 py-3 text-base">
              <Play className="h-4 w-4" /> Watch Demo
            </GlowButton>
          </div>
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-white/50">
            <span className="inline-flex items-center gap-1"><Check className="h-3 w-3 text-[#22C55E]" /> Free to start</span>
            <span className="inline-flex items-center gap-1"><Check className="h-3 w-3 text-[#22C55E]" /> No credit card</span>
            <span className="inline-flex items-center gap-1"><Check className="h-3 w-3 text-[#22C55E]" /> Cancel anytime</span>
          </div>
        </motion.div>

        {/* App preview mock */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-[#5B8CFF]/30 to-[#8B5CF6]/30 blur-3xl" />
          <div className="glass-strong overflow-hidden rounded-3xl p-2 shadow-2xl">
            <div className="rounded-2xl bg-[#0B1020]/80 p-6">
              <div className="flex items-center gap-2 pb-4">
                <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <div className="ml-3 text-xs text-white/40">angie.app/dashboard</div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                  <GlassCard className="p-5">
                    <div className="text-xs text-white/50">Today's mission</div>
                    <div className="mt-1 text-lg font-semibold">Send 5 personalized cold DMs to design leads</div>
                    <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: "62%" }} transition={{ delay: 0.8, duration: 1.4 }}
                        className="h-full rounded-full bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6]"
                      />
                    </div>
                  </GlassCard>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Streak", value: "12d", color: "from-[#5B8CFF] to-[#22C55E]" },
                      { label: "Tasks done", value: "47", color: "from-[#8B5CF6] to-[#5B8CFF]" },
                    ].map((s) => (
                      <GlassCard key={s.label} className="p-4">
                        <div className="text-xs text-white/50">{s.label}</div>
                        <div className={`mt-1 bg-gradient-to-r ${s.color} bg-clip-text text-2xl font-bold text-transparent`}>
                          {s.value}
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Sparkles className="h-3 w-3 text-[#8B5CF6]" /> Angie AI
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-white/70">
                    <div className="rounded-lg bg-white/5 p-2">Top match: Freelance UI design on Contra — fits your stack & timezone.</div>
                    <div className="rounded-lg bg-gradient-to-r from-[#5B8CFF]/20 to-[#8B5CF6]/20 p-2 text-white">Open 3 outreach scripts →</div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = ["Used by freelancers in 40+ countries", "1,200+ income plans generated", "Built on GPT-class models"];
  return (
    <section className="border-y border-white/5 bg-white/[0.02] py-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 text-xs text-white/50">
        {items.map((t) => (
          <span key={t} className="inline-flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-[#22C55E]" /> {t}
          </span>
        ))}
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: Sparkles, title: "AI Income Plans", desc: "A realistic plan tailored to your skills, country, and time available." },
  { icon: Target, title: "Daily Missions", desc: "Bite-sized actions that compound. Build streaks, not anxiety." },
  { icon: MessageSquare, title: "Outreach Scripts", desc: "Cold DMs, emails, follow-ups generated in your voice." },
  { icon: Rocket, title: "Profile Builder", desc: "Fiverr, Upwork, LinkedIn bios that convert browsers into clients." },
  { icon: Zap, title: "24-hour Action Plan", desc: "Stop planning. Start the first move within the next hour." },
  { icon: ShieldCheck, title: "No hype, just execution", desc: "Practical opportunities, real platforms, no get-rich-quick fluff." },
];

function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-medium uppercase tracking-widest text-[#8B5CF6]">Features</div>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">Everything you need to ship income</h2>
          <p className="mt-4 text-white/60">Built around execution, not motivation. Angie tells you exactly what to do next.</p>
        </motion.div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
            >
              <GlassCard className="h-full">
                <div className="mb-4 inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#5B8CFF]/30 to-[#8B5CF6]/30 text-white">
                  <f.icon className="h-5 w-5" />
                </div>
                <div className="text-lg font-semibold">{f.title}</div>
                <div className="mt-1 text-sm text-white/60">{f.desc}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Tell Angie about you", desc: "Skills, country, time available, experience level, and goals." },
    { n: "02", title: "Get a realistic plan", desc: "Top 3 opportunities, a 7-day plan, pricing, and outreach scripts." },
    { n: "03", title: "Execute daily missions", desc: "Tiny daily wins, streak tracking, and your first 24-hour move." },
  ];
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <motion.h2 {...fadeUp} className="text-center text-3xl font-bold md:text-4xl">
          How it <span className="text-gradient">works</span>
        </motion.h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div key={s.n} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.6 }}>
              <GlassCard>
                <div className="text-gradient text-3xl font-bold">{s.n}</div>
                <div className="mt-2 text-lg font-semibold">{s.title}</div>
                <div className="mt-1 text-sm text-white/60">{s.desc}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const t = [
    { q: "Booked my first $400 client in 6 days. The 24-hour action plan was the unlock.", a: "Maya R.", r: "UI designer · Lisbon" },
    { q: "Angie cut the planning paralysis. The scripts feel like me, not ChatGPT.", a: "Daniel O.", r: "Copywriter · Lagos" },
    { q: "The streak system is dangerously addictive — in the best way.", a: "Sara K.", r: "Frontend dev · Berlin" },
  ];
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <motion.h2 {...fadeUp} className="text-center text-3xl font-bold md:text-4xl">
          People are shipping income
        </motion.h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {t.map((x, i) => (
            <motion.div key={x.a} {...fadeUp} transition={{ delay: i * 0.08, duration: 0.6 }}>
              <GlassCard className="h-full">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-[#5B8CFF] text-[#5B8CFF]" />
                  ))}
                </div>
                <p className="mt-4 text-pretty text-sm text-white/80">"{x.q}"</p>
                <div className="mt-6 text-sm font-medium">{x.a}</div>
                <div className="text-xs text-white/50">{x.r}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    { name: "Free", price: "$0", desc: "Try Angie and ship your first plan.", features: ["1 income plan / month", "5 coach messages / day", "Browse opportunities", "3 missions / day"], cta: "Start Free", featured: false },
    { name: "Pro", price: "$19", per: "/mo", desc: "Serious about building freelance income.", features: ["Unlimited plans", "Unlimited AI coach", "Instant Apply Assistant", "Save opportunities", "All outreach templates", "Export PDF"], cta: "Go Pro", featured: true },
    { name: "Accelerator", price: "$39", per: "/mo", desc: "Maximize speed with priority AI.", features: ["Everything in Pro", "Priority AI model", "Resume tailoring", "Early access", "Priority support"], cta: "Go Accelerator", featured: false },
  ];
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Simple, honest pricing</h2>
          <p className="mt-3 text-white/60">Start free. Upgrade when Angie has paid for itself.</p>
        </motion.div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <GlassCard
              key={t.name}
              className={`relative ${t.featured ? "glow-purple border-[#8B5CF6]/40" : ""}`}
            >
              {t.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                  Most popular
                </div>
              )}
              <div className="text-sm text-white/60">{t.name}</div>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-4xl font-bold">{t.price}</span>
                {t.per && <span className="pb-1 text-sm text-white/50">{t.per}</span>}
              </div>
              <p className="mt-2 text-sm text-white/60">{t.desc}</p>
              <ul className="my-6 space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-white/80">
                    <Check className="h-4 w-4 text-[#22C55E]" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/pricing">
                <GlowButton variant={t.featured ? "primary" : "secondary"} className="w-full">
                  {t.cta}
                </GlowButton>
              </Link>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  { q: "Is Angie just another AI chatbot?", a: "No. Angie is structured around execution — every plan ends with a 24-hour action and daily missions. It's a coach, not a chat window." },
  { q: "Will it work for my country?", a: "Yes. Plans are tailored to your country, time zone, and the platforms actually available to you." },
  { q: "Do I need experience?", a: "No. You pick your level (beginner, intermediate, advanced) and Angie scales the plan accordingly." },
  { q: "Can I cancel anytime?", a: "Yes. No contracts. Cancel from settings in two clicks." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-20">
      <div className="mx-auto max-w-3xl px-4">
        <motion.h2 {...fadeUp} className="text-center text-3xl font-bold md:text-4xl">
          Frequently asked questions
        </motion.h2>
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => (
            <GlassCard key={f.q} className="p-0">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-medium">{f.q}</span>
                <span className="text-white/40">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-5 pb-4 text-sm text-white/70"
                >
                  {f.a}
                </motion.div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-4xl px-4">
        <div className="glass-strong glow-purple relative overflow-hidden rounded-3xl px-6 py-16 text-center">
          <div className="absolute -top-20 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[#8B5CF6]/40 blur-3xl" />
          <h2 className="text-balance text-3xl font-bold md:text-5xl">
            Stop guessing. <span className="text-gradient">Start earning.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Build your first income plan in under 2 minutes. Free, forever.
          </p>
          <div className="mt-8">
            <Link to="/auth">
              <GlowButton className="px-8 py-3 text-base">
                Start Free <ArrowRight className="h-4 w-4" />
              </GlowButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <Logo />
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/40">
          <Link to="/terms" className="hover:text-white/70">Terms</Link>
          <Link to="/privacy" className="hover:text-white/70">Privacy</Link>
          <Link to="/refund" className="hover:text-white/70">Refund</Link>
          <span>© {new Date().getFullYear()} Angie</span>
        </div>
      </div>
    </footer>
  );
}
