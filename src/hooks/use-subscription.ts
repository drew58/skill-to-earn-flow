import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type Tier = "free" | "pro" | "accelerator";

export type Subscription = {
  tier: Tier;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export type Usage = {
  plansThisMonth: number;
  coachMessagesToday: number;
  missionsToday: number;
  applicationsToday: number;
};

const TIER_LIMITS: Record<Tier, { plansPerMonth: number; coachPerDay: number; missionsPerDay: number; applicationsPerDay: number; instantApply: boolean; savedOpps: boolean }> = {
  free: { plansPerMonth: 1, coachPerDay: 5, missionsPerDay: 3, applicationsPerDay: 2, instantApply: false, savedOpps: false },
  pro: { plansPerMonth: Infinity, coachPerDay: Infinity, missionsPerDay: Infinity, applicationsPerDay: Infinity, instantApply: true, savedOpps: true },
  accelerator: { plansPerMonth: Infinity, coachPerDay: Infinity, missionsPerDay: Infinity, applicationsPerDay: Infinity, instantApply: true, savedOpps: true },
};

export function useSubscription() {
  const { user } = useAuth();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage>({ plansThisMonth: 0, coachMessagesToday: 0, missionsToday: 0, applicationsToday: 0 });
  const [loading, setLoading] = useState(true);

  const tier: Tier = sub?.tier ?? "free";
  const limits = TIER_LIMITS[tier];
  const isPro = tier === "pro" || tier === "accelerator";
  const isAccelerator = tier === "accelerator";

  const fetchData = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const [{ data: subData }, { data: usageData }] = await Promise.all([
      supabase.from("subscriptions").select("tier,status,current_period_end,cancel_at_period_end").eq("user_id", user.id).maybeSingle(),
      supabase.from("usage_counters").select("plans_this_month,coach_messages_today,missions_today,applications_today").eq("user_id", user.id).maybeSingle(),
    ]);
    if (subData) {
      setSub({
        tier: (subData.tier as Tier) || "free",
        status: subData.status || "active",
        currentPeriodEnd: subData.current_period_end,
        cancelAtPeriodEnd: subData.cancel_at_period_end ?? false,
      });
    } else {
      setSub({ tier: "free", status: "active", currentPeriodEnd: null, cancelAtPeriodEnd: false });
    }
    if (usageData) {
      setUsage({
        plansThisMonth: usageData.plans_this_month ?? 0,
        coachMessagesToday: usageData.coach_messages_today ?? 0,
        missionsToday: usageData.missions_today ?? 0,
        applicationsToday: usageData.applications_today ?? 0,
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const canUse = useCallback((feature: keyof typeof limits): boolean => {
    const val = limits[feature];
    return typeof val === "boolean" ? val : true;
  }, [limits]);

  const remaining = useCallback((feature: "plansPerMonth" | "coachPerDay" | "missionsPerDay" | "applicationsPerDay"): number => {
    const limit = limits[feature];
    if (!isFinite(limit)) return Infinity;
    const used = feature === "plansPerMonth" ? usage.plansThisMonth
      : feature === "coachPerDay" ? usage.coachMessagesToday
      : feature === "missionsPerDay" ? usage.missionsToday
      : usage.applicationsToday;
    return Math.max(0, limit - used);
  }, [limits, usage, isPro]);

  const increment = useCallback(async (feature: "plans" | "coach" | "missions" | "applications") => {
    if (!user || isPro) return true;
    await supabase.rpc("increment_usage_counter" as any, { _feature: feature });
    await fetchData();
    return true;
  }, [user, isPro, fetchData]);

  return { tier, sub, usage, limits, isPro, isAccelerator, loading, canUse, remaining, increment, refresh: fetchData };
}
