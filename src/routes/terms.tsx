import { createFileRoute, Link } from "@tanstack/react-router";
import { GlassCard } from "@/components/angie/GlassCard";
import { Logo } from "@/components/angie/Logo";
import { GlowButton } from "@/components/angie/GlowButton";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Angie" },
      { name: "description", content: "Terms of Service for Angie, the AI income execution platform." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
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
        <h1 className="text-3xl font-bold md:text-4xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-white/50">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <GlassCard className="mt-8">
          <div className="space-y-6 text-sm text-white/80">
            <section>
              <h2 className="text-lg font-semibold text-white">1. Acceptance of Terms</h2>
              <p className="mt-2">By accessing or using Angie ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">2. Description of Service</h2>
              <p className="mt-2">Angie is an AI-powered software platform that generates income plans, outreach scripts, and daily missions to help users build freelance and remote income. Angie is a software tool — not financial, legal, or career advice.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">3. Accounts & Eligibility</h2>
              <p className="mt-2">You must be at least 18 years old to use the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">4. Subscriptions & Billing</h2>
              <p className="mt-2">Some features require a paid subscription. Payments are processed by Paystack, our Merchant of Record. By subscribing, you agree to Paystack's terms. Subscriptions auto-renew unless cancelled. You may cancel anytime from your account settings.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">5. Refund Policy</h2>
              <p className="mt-2">We offer a 7-day money-back guarantee for first-time subscribers. If you are not satisfied, contact us within 7 days of your initial purchase for a full refund. Refunds are processed through Paystack.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">6. Acceptable Use</h2>
              <p className="mt-2">You agree not to misuse the Service, including but not limited to: reverse engineering, scraping, using bots, sharing accounts, or generating content that violates applicable laws. We reserve the right to suspend accounts for abuse.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">7. Intellectual Property</h2>
              <p className="mt-2">All content, branding, and software provided by Angie are the property of Angie and its licensors. You retain ownership of any content you input, and grant us a license to process it for the purpose of providing the Service.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">8. Disclaimer of Warranties</h2>
              <p className="mt-2">The Service is provided "as is" without warranties of any kind. Angie does not guarantee specific income results. Your results depend on your effort, skills, market conditions, and other factors outside our control.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">9. Limitation of Liability</h2>
              <p className="mt-2">To the maximum extent permitted by law, Angie shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">10. Changes to Terms</h2>
              <p className="mt-2">We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the revised Terms.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">11. Contact</h2>
              <p className="mt-2">For questions about these Terms, contact us at support@angie.ai.</p>
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
