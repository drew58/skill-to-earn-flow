import type { Opportunity, PaymentMethod } from "./opportunities";

export type UserContext = {
  country?: string | null;
  experience_level?: string | null; // "Beginner" | "Intermediate" | "Advanced"
  skills?: string[] | null;
  weekly_hours?: number | null;
  payment_methods?: string[] | null;
  goals?: string | null;
};

const LEVEL_RANK: Record<string, number> = { Beginner: 1, Intermediate: 2, Pro: 3, Advanced: 3 };

// Countries where PayPal/Stripe are restricted or hard to use.
const PAYPAL_HARD = ["NG", "PK", "BD", "VE", "IR", "CU"];
const STRIPE_HARD = ["NG", "PK", "BD", "EG", "VE", "IR", "CU", "KE", "GH"];

type Score = {
  score: number; // 0..100
  reasons: string[];
  warnings: string[];
};

export function scoreOpportunity(opp: Opportunity, user: UserContext): Score {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let score = 50;

  // Level fit
  const userLvl = LEVEL_RANK[user.experience_level ?? "Beginner"] ?? 1;
  const oppLvl = LEVEL_RANK[opp.level] ?? 1;
  const gap = oppLvl - userLvl;
  if (gap === 0) { score += 18; reasons.push("Matches your experience level"); }
  else if (gap === 1) { score += 6; reasons.push("Slight stretch — doable"); }
  else if (gap >= 2) { score -= 22; warnings.push(`${opp.platform} is highly competitive for beginners`); }
  else if (gap < 0) { score += 4; }

  // Competition penalty for beginners
  if (userLvl === 1 && opp.competition >= 4) {
    score -= 15;
    warnings.push("Saturated market — start somewhere easier first");
  }
  if (userLvl === 1 && opp.competition <= 2) {
    score += 8;
    reasons.push("Beginner-friendly, low competition");
  }

  // Payment accessibility
  const country = (user.country ?? "").toUpperCase().slice(0, 2);
  const userMethods = (user.payment_methods ?? []).map((m) => m as PaymentMethod);
  if (userMethods.length) {
    const overlap = opp.paymentMethods.filter((m) => userMethods.includes(m));
    if (overlap.length) { score += 10; reasons.push(`Pays via ${overlap.join(" / ")}`); }
    else { score -= 18; warnings.push("Payout methods don't match what you have set up"); }
  } else {
    // Geographic heuristic when user hasn't set payment methods
    if (country && PAYPAL_HARD.includes(country) && opp.paymentMethods.length === 1 && opp.paymentMethods[0] === "PayPal") {
      score -= 14; warnings.push("PayPal is restricted in your country");
    }
    if (country && STRIPE_HARD.includes(country) && opp.paymentMethods.includes("Stripe") && !opp.paymentMethods.some((m) => m !== "Stripe")) {
      score -= 12; warnings.push("Stripe isn't available in your country");
    }
    if (country && ["NG", "KE", "GH", "PH", "IN", "PK", "BD"].includes(country) && opp.paymentMethods.some((m) => m === "Payoneer" || m === "Wise")) {
      score += 8; reasons.push("Easy payout via Payoneer/Wise");
    }
  }

  // Region restriction
  if (Array.isArray(opp.regions) && country && !opp.regions.includes(country)) {
    score -= 25; warnings.push("Not available in your region");
  }
  if (opp.excludedRegions && country && opp.excludedRegions.includes(country)) {
    score -= 30; warnings.push("Restricted in your country");
  }

  // Time commitment
  const hours = user.weekly_hours ?? 10;
  if (hours < opp.minHoursPerWeek) {
    score -= 10;
    warnings.push(`Needs ~${opp.minHoursPerWeek}h/wk — you have ${hours}h`);
  } else {
    score += 4;
  }

  // Speed to income preference for beginners
  if (userLvl === 1 && (opp.timeToFirstDollar === "hours" || opp.timeToFirstDollar === "days")) {
    score += 8; reasons.push("Fast first payout");
  }

  // Skill match (loose)
  const skills = (user.skills ?? []).map((s) => s.toLowerCase());
  if (skills.length) {
    const hay = (opp.title + " " + opp.tags.join(" ") + " " + opp.description).toLowerCase();
    const hits = skills.filter((s) => s && hay.includes(s));
    if (hits.length) { score += Math.min(12, hits.length * 6); reasons.push(`Matches your skill: ${hits[0]}`); }
  }

  score = Math.max(0, Math.min(100, score));
  return { score, reasons: reasons.slice(0, 3), warnings: warnings.slice(0, 2) };
}

export function rankOpportunities(opps: Opportunity[], user: UserContext) {
  return opps
    .map((o) => ({ opp: o, ...scoreOpportunity(o, user) }))
    .sort((a, b) => b.score - a.score);
}
