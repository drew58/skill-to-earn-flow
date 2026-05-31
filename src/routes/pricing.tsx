import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown, ArrowLeft } from "lucide-react";
import { GlassCard } from "@/components/angie/GlassCard";
import { GlowButton } from "@/components/angie/GlowButton";
import { Logo } from "@/components/angie/Logo";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/pricing")({ component: PricingPage });

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

const TIERS = [
  {
    name: "Free",
    price: "$0",
    per: "/mo",
    desc: "Try Angie and ship your first income plan.",
    icon: Sparkles,
    features: [
      "1 income plan / month",
      "5 coach messages / day",
      "Browse all opportunities",
      "3 missions / day",
      "Basic outreach scripts",
    ],
    cta: "Start Free",
    featured: false,
    tier: "free" as const,
  },
  {
    name: "Pro",
    price: "$19",
    per: "/mo",
    desc: "Serious about building freelance income.",
    icon: Zap,
    features: [
      "Unlimited income plans",
      "Unlimited AI coach chat",
      "Instant Apply Assistant",
      "Save opportunities",
      "All outreach templates",
      "Profile builder",
      "Export plans as PDF",
    ],
    cta: "Go Pro",
    featured: true,
    tier: "pro" as const,
  },
  {
    name: "Accelerator",
    price: "$39",
    per: "/mo",
    desc: "Maximize speed with priority AI.",
    icon: Crown,
    features: [
      "Everything in Pro",
      "Priority AI model (GPT-5 class)",
      "Resume tailoring assistant",
      "Early access to new features",
      "Priority support",
    ],
    cta: "Go Accelerator",
    featured: false,
    tier: "accelerator" as const,
  },
];

function PricingPage() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Logo />
          <Link to="/">
            <GlowButton variant="ghost" className="text-sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </GlowButton>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="bg-grid absolute inset-0" />
          <div className="animate-pulse-glow absolute -top-20 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[#8B5CF6]/25 blur-[120px]" />
        </div>
        <motion.div {...fadeUp} className="mx-auto max-w-3xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/70 backdrop-blur">
            <Sparkles className="h-3 w-3 text-[#5B8CFF]" />
            Simple, honest pricing
          </div>
          <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Start free. <span className="text-gradient">Upgrade when ready.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/60 md:text-lg">
            Angie pays for herself. Most Pro users land their first paid client within the first billing cycle.
          </p>
        </motion.div>
      </section>

      {/* Tiers */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-4 md:grid-cols-3">
            {TIERS.map((t) => (
              <motion.div key={t.name} {...fadeUp}>
                <GlassCard
                  className={`relative h-full flex flex-col ${t.featured ? "glow-purple border-[#8B5CF6]/40" : ""}`}
                >
                  {t.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                      Most popular
                    </div>
                  )}
                  <div className="mb-6">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#5B8CFF]/30 to-[#8B5CF6]/30 ring-1 ring-inset ring-white/10">
                      <t.icon className="h-5 w-5 text-[#A78BFA]" />
                    </div>
                    <div className="mt-3 text-sm font-medium text-white/60">{t.name}</div>
                    <div className="mt-1 flex items-end gap-1">
                      <span className="text-4xl font-bold">{t.price}</span>
                      {t.per && <span className="pb-1 text-sm text-white/50">{t.per}</span>}
                    </div>
                    <p className="mt-2 text-sm text-white/55">{t.desc}</p>
                  </div>

                  <ul className="mb-6 flex-1 space-y-2.5 text-sm">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-white/80">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {user ? (
                    <CheckoutButton tier={t.tier} label={t.cta} featured={t.featured} />
                  ) : (
                    <Link to="/auth">
                      <GlowButton variant={t.featured ? "primary" : "secondary"} className="w-full">
                        {t.cta}
                      </GlowButton>
                    </Link>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-y border-white/5 bg-white/[0.02] py-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 text-xs text-white/50">
          <span className="inline-flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-[#22C55E]" /> Cancel anytime
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-[#22C55E]" /> No hidden fees
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-[#22C55E]" /> Secure Paddle checkout
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-[#22C55E]" /> 7-day money-back guarantee
          </span>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4">
          <motion.h2 {...fadeUp} className="text-center text-2xl font-bold md:text-3xl">
            Billing questions
          </motion.h2>
          <div className="mt-10 space-y-3">
            {[
              { q: "Can I cancel anytime?", a: "Yes. No contracts, no cancellation fees. Cancel from your dashboard in two clicks." },
              { q: "What payment methods do you accept?", a: "All major credit/debit cards, PayPal, Apple Pay, Google Pay, and local methods via Paddle." },
              { q: "Is there a money-back guarantee?", a: "Yes — 7-day full refund, no questions asked." },
              { q: "What happens to my data if I downgrade?", a: "Your plans and history stay. Free tier limits apply going forward." },
              { q: "Is Paddle secure?", a: "Paddle is a Merchant of Record that handles billing, tax, and compliance globally. Your payment info never touches our servers." },
            ].map((f) => (
              <GlassCard key={f.q} className="p-5">
                <div className="font-medium">{f.q}</div>
                <div className="mt-1.5 text-sm text-white/60">{f.a}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/40">
        <div className="mx-auto max-w-6xl px-4">
          Payments processed securely by Paddle. Angie is a software product — not financial advice.
        </div>
      </footer>
    </div>
  );
}

function CheckoutButton({ tier, label, featured }: { tier: "free" | "pro" | "accelerator"; label: string; featured: boolean }) {
  const handleClick = () => {
    if (tier === "free") {
      window.location.href = "/dashboard";
      return;
    }
    // Placeholder: will wire to Paddle.js checkout once Paddle is connected
    alert(`Checkout for ${tier} will be available once Paddle is connected. Use your preview URL to complete Paddle setup.`);
  };

  return (
    <GlowButton
      variant={featured ? "primary" : "secondary"}
      className="w-full"
      onClick={handleClick}
    >
      {label}
    </GlowButton>
  );
}
