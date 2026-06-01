import { createFileRoute, Link } from "@tanstack/react-router";
import { GlassCard } from "@/components/angie/GlassCard";
import { Logo } from "@/components/angie/Logo";
import { GlowButton } from "@/components/angie/GlowButton";
import { ArrowLeft, Check, Clock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund Policy — Angie" },
      { name: "description", content: "Refund Policy for Angie subscriptions. 7-day money-back guarantee." },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <div className="relative min-h-screen">
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

      <main className="mx-auto max-w-3xl px-4 py-12 md:py-20">
        <h1 className="text-3xl font-bold md:text-4xl">Refund Policy</h1>
        <p className="mt-2 text-sm text-white/50">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <GlassCard className="text-center">
            <Clock className="mx-auto h-8 w-8 text-[#5B8CFF]" />
            <div className="mt-3 font-semibold">7-Day Window</div>
            <div className="mt-1 text-sm text-white/60">Request a refund within 7 days of your first purchase.</div>
          </GlassCard>
          <GlassCard className="text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-[#22C55E]" />
            <div className="mt-3 font-semibold">No Questions Asked</div>
            <div className="mt-1 text-sm text-white/60">We do not require a reason. Your satisfaction is what matters.</div>
          </GlassCard>
          <GlassCard className="text-center">
            <Check className="mx-auto h-8 w-8 text-[#8B5CF6]" />
            <div className="mt-3 font-semibold">Full Refund</div>
            <div className="mt-1 text-sm text-white/60">100% of your payment returned. No hidden fees or restocking charges.</div>
          </GlassCard>
        </div>

        <GlassCard className="mt-8">
          <div className="space-y-6 text-sm text-white/80">
            <section>
              <h2 className="text-lg font-semibold text-white">Eligibility</h2>
              <p className="mt-2">Our 7-day money-back guarantee applies to first-time subscribers of the Pro and Accelerator plans. To be eligible, you must request the refund within 7 calendar days of your initial subscription payment.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">How to Request a Refund</h2>
              <p className="mt-2">Email us at <strong>support@angie.ai</strong> with the subject "Refund Request" and include the email address associated with your Angie account. We will process your refund within 5 business days. Refunds are issued to your original payment method via Paddle.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">After the Refund</h2>
              <p className="mt-2">Once refunded, your subscription will be canceled and you will be downgraded to the Free plan. You will retain access to any data you created, subject to Free plan limits.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">Exceptions</h2>
              <p className="mt-2">The money-back guarantee applies only to first-time purchases. Subsequent renewals and plan changes are not eligible for refunds, but you may cancel anytime to stop future billing.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">Contact</h2>
              <p className="mt-2">For refund requests or billing questions, contact support@angie.ai.</p>
            </section>
          </div>
        </GlassCard>
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/40">
        <div className="mx-auto max-w-6xl px-4">
          © {new Date().getFullYear()} Angie. Built for doers.
        </div>
      </footer>
    </div>
  );
}
