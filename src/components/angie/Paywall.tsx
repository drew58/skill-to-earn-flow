import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Lock, Zap, Crown } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { GlowButton } from "./GlowButton";

export function Paywall({ feature, tier = "pro" }: { feature: string; tier?: "pro" | "accelerator" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[50vh] items-center justify-center px-4"
    >
      <GlassCard className="max-w-md text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#5B8CFF]/30 to-[#8B5CF6]/30 ring-1 ring-inset ring-white/10">
          <Lock className="h-5 w-5 text-[#A78BFA]" />
        </div>
        <h2 className="mt-4 text-xl font-bold">{feature}</h2>
        <p className="mt-2 text-sm text-white/55">
          This feature is available on the {tier === "accelerator" ? "Accelerator" : "Pro"} plan.
          Upgrade to unlock it and more.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link to="/pricing">
            <GlowButton className="w-full">
              <Zap className="h-4 w-4" />
              Upgrade to {tier === "accelerator" ? "Accelerator" : "Pro"}
            </GlowButton>
          </Link>
          <Link to="/pricing">
            <GlowButton variant="ghost" className="w-full">
              View all plans
            </GlowButton>
          </Link>
        </div>
        {tier === "pro" && (
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-3 py-1 text-[11px] text-[#E8C07A]">
            <Crown className="h-3 w-3" />
            Want priority AI? Check out Accelerator
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
