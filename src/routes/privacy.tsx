import { createFileRoute, Link } from "@tanstack/react-router";
import { GlassCard } from "@/components/angie/GlassCard";
import { Logo } from "@/components/angie/Logo";
import { GlowButton } from "@/components/angie/GlowButton";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Angie" },
      { name: "description", content: "Privacy Policy for Angie, the AI income execution platform." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
        <h1 className="text-3xl font-bold md:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-white/50">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <GlassCard className="mt-8">
          <div className="space-y-6 text-sm text-white/80">
            <section>
              <h2 className="text-lg font-semibold text-white">1. Information We Collect</h2>
              <p className="mt-2">We collect information you provide directly, such as your email address, skills, goals, and preferences when you create an account or use Angie. We also collect usage data to improve the Service.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">2. How We Use Your Information</h2>
              <p className="mt-2">We use your data to:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Provide and personalize the Service</li>
                <li>Generate income plans, outreach scripts, and missions</li>
                <li>Process payments and manage subscriptions</li>
                <li>Communicate important updates</li>
                <li>Improve our AI models and platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">3. AI Processing</h2>
              <p className="mt-2">Your inputs are processed by AI models (e.g., GPT-class models via Lovable AI Gateway) to generate responses. We do not use your personal data to train third-party AI models without your consent.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">4. Data Sharing</h2>
              <p className="mt-2">We do not sell your personal data. We share data only with:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li><strong>Paddle</strong> — for payment processing and subscription management</li>
                <li><strong>AI providers</strong> — to generate content (your data is processed, not retained for training)</li>
                <li><strong>Service providers</strong> — who help us operate the platform under strict confidentiality</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">5. Data Security</h2>
              <p className="mt-2">We use industry-standard encryption, secure authentication, and access controls to protect your data. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">6. Your Rights</h2>
              <p className="mt-2">Depending on your location, you may have the right to access, correct, delete, or export your personal data. Contact us to exercise these rights. You may also delete your account at any time from your settings.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">7. Cookies & Tracking</h2>
              <p className="mt-2">We use essential cookies for authentication and session management. We do not use third-party advertising cookies.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">8. Children's Privacy</h2>
              <p className="mt-2">Angie is not intended for children under 18. We do not knowingly collect data from minors.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">9. Changes to This Policy</h2>
              <p className="mt-2">We may update this Privacy Policy. We will notify you of significant changes via email or through the Service.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">10. Contact</h2>
              <p className="mt-2">For privacy-related questions, contact us at support@angie.ai.</p>
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
