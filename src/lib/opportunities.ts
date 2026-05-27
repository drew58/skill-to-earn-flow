import {
  Briefcase, Code2, PenTool, Megaphone, GraduationCap, Camera, Headphones,
  Zap, Globe2, Building2, ShoppingBag,
} from "lucide-react";

export type Level = "Beginner" | "Intermediate" | "Pro";
export type Category = "Freelance" | "Remote Job" | "Marketplace" | "Creator" | "Microtask" | "Coaching";
export type PaymentMethod = "PayPal" | "Wise" | "Stripe" | "Payoneer" | "Bank" | "Crypto";

export type Opportunity = {
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
  icon: typeof Briefcase;
  accent: string;
  // matching metadata
  regions: "global" | string[]; // ISO-3166 or 'global'
  excludedRegions?: string[];
  paymentMethods: PaymentMethod[];
  competition: 1 | 2 | 3 | 4 | 5; // 5 = brutal
  timeToFirstDollar: "hours" | "days" | "weeks" | "months";
  minHoursPerWeek: number;
  needsResume?: boolean;
  applicationKinds: ("cover-letter" | "proposal" | "gig" | "linkedin-message" | "email-pitch")[];
};

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "upwork-writing",
    title: "Long-form content writers wanted",
    platform: "Upwork", category: "Freelance", level: "Beginner",
    payout: "$25–$80/hr", tags: ["Writing", "AI", "Blogs"],
    url: "https://www.upwork.com/", description: "Hundreds of new writing gigs posted daily. Perfect entry point with AI-assisted workflows.",
    trending: true, icon: PenTool, accent: "from-[#5B8CFF] to-[#8B5CF6]",
    regions: "global", paymentMethods: ["PayPal", "Wise", "Payoneer", "Bank"],
    competition: 4, timeToFirstDollar: "days", minHoursPerWeek: 5,
    applicationKinds: ["proposal", "cover-letter"],
  },
  {
    id: "fiverr-design",
    title: "Brand kits & logo design packages",
    platform: "Fiverr", category: "Marketplace", level: "Beginner",
    payout: "$50–$500/pkg", tags: ["Design", "Branding"],
    url: "https://www.fiverr.com/", description: "Productize a brand kit and let buyers come to you. Low overhead, scalable.",
    icon: PenTool, accent: "from-[#22C55E] to-[#5B8CFF]",
    regions: "global", paymentMethods: ["PayPal", "Payoneer", "Bank"],
    competition: 4, timeToFirstDollar: "weeks", minHoursPerWeek: 4,
    applicationKinds: ["gig"],
  },
  {
    id: "toptal-dev",
    title: "Senior React engineers",
    platform: "Toptal", category: "Remote Job", level: "Pro",
    payout: "$80–$160/hr", tags: ["React", "TypeScript"],
    url: "https://www.toptal.com/", description: "Vetted remote roles with top-tier clients. Rigorous screening — long-term engagements possible.",
    icon: Code2, accent: "from-[#8B5CF6] to-[#E879F9]",
    regions: "global", paymentMethods: ["PayPal", "Payoneer", "Bank"],
    competition: 5, timeToFirstDollar: "weeks", minHoursPerWeek: 20,
    needsResume: true, applicationKinds: ["cover-letter", "email-pitch"],
  },
  {
    id: "remoteok-startup",
    title: "Trending startup remote roles",
    platform: "RemoteOK", category: "Remote Job", level: "Intermediate",
    payout: "$60k–$160k/yr", tags: ["Full-time", "Remote"],
    url: "https://remoteok.com/", description: "Curated remote jobs from fast-growing startups. New listings every hour.",
    trending: true, icon: Globe2, accent: "from-[#5B8CFF] to-[#22C55E]",
    regions: "global", paymentMethods: ["Bank", "Wise"],
    competition: 3, timeToFirstDollar: "weeks", minHoursPerWeek: 30,
    needsResume: true, applicationKinds: ["cover-letter", "email-pitch"],
  },
  {
    id: "contra-design",
    title: "Independent design contracts",
    platform: "Contra", category: "Freelance", level: "Intermediate",
    payout: "$1k–$8k/project", tags: ["Design", "0% fee"],
    url: "https://contra.com/", description: "Commission-free freelance platform built for independents.",
    icon: PenTool, accent: "from-[#E879F9] to-[#5B8CFF]",
    regions: "global", paymentMethods: ["Stripe", "PayPal"],
    competition: 3, timeToFirstDollar: "days", minHoursPerWeek: 10,
    applicationKinds: ["proposal", "cover-letter"],
  },
  {
    id: "gumroad-product",
    title: "Sell digital templates & guides",
    platform: "Gumroad", category: "Creator", level: "Beginner",
    payout: "Passive", tags: ["Digital", "Templates"],
    url: "https://gumroad.com/", description: "Package your knowledge once, sell forever. Ideal first creator income.",
    icon: ShoppingBag, accent: "from-[#22C55E] to-[#8B5CF6]",
    regions: "global", paymentMethods: ["PayPal", "Stripe"],
    competition: 2, timeToFirstDollar: "weeks", minHoursPerWeek: 3,
    applicationKinds: ["gig"],
  },
  {
    id: "superpeer-coach",
    title: "Paid 1:1 coaching calls",
    platform: "Superpeer", category: "Coaching", level: "Intermediate",
    payout: "$100–$400/hr", tags: ["1:1", "Calls"],
    url: "https://superpeer.com/", description: "Monetize your expertise via short coaching sessions.",
    icon: Headphones, accent: "from-[#5B8CFF] to-[#E879F9]",
    regions: "global", paymentMethods: ["Stripe", "PayPal"],
    competition: 2, timeToFirstDollar: "weeks", minHoursPerWeek: 2,
    applicationKinds: ["gig"],
  },
  {
    id: "appen-microtask",
    title: "AI training microtasks",
    platform: "Appen", category: "Microtask", level: "Beginner",
    payout: "$8–$20/hr", tags: ["AI", "No interview"],
    url: "https://appen.com/", description: "Get paid to label data and evaluate AI outputs. Flexible hours.",
    icon: Zap, accent: "from-[#22C55E] to-[#5B8CFF]",
    regions: "global", paymentMethods: ["PayPal", "Payoneer"],
    competition: 1, timeToFirstDollar: "days", minHoursPerWeek: 5,
    applicationKinds: ["email-pitch"],
  },
  {
    id: "wellfound-startup",
    title: "Startup operator roles",
    platform: "Wellfound", category: "Remote Job", level: "Intermediate",
    payout: "Equity + salary", tags: ["Startup", "Operator"],
    url: "https://wellfound.com/", description: "Apply directly to founders at early-stage companies.",
    icon: Building2, accent: "from-[#8B5CF6] to-[#5B8CFF]",
    regions: "global", paymentMethods: ["Bank", "Wise"],
    competition: 3, timeToFirstDollar: "weeks", minHoursPerWeek: 30,
    needsResume: true, applicationKinds: ["cover-letter", "linkedin-message", "email-pitch"],
  },
  {
    id: "skillshare-teach",
    title: "Teach a class, earn royalties",
    platform: "Skillshare", category: "Coaching", level: "Intermediate",
    payout: "Recurring", tags: ["Teaching", "Royalty"],
    url: "https://www.skillshare.com/teach", description: "Record once, earn from every minute watched.",
    trending: true, icon: GraduationCap, accent: "from-[#E879F9] to-[#22C55E]",
    regions: "global", paymentMethods: ["PayPal"],
    competition: 2, timeToFirstDollar: "months", minHoursPerWeek: 5,
    applicationKinds: ["gig"],
  },
  {
    id: "shutterstock-stock",
    title: "License photos & videos",
    platform: "Shutterstock", category: "Marketplace", level: "Beginner",
    payout: "Passive", tags: ["Photo", "Video"],
    url: "https://submit.shutterstock.com/", description: "Upload media you already have. Earn each download.",
    icon: Camera, accent: "from-[#5B8CFF] to-[#22C55E]",
    regions: "global", paymentMethods: ["PayPal", "Payoneer"],
    competition: 3, timeToFirstDollar: "months", minHoursPerWeek: 2,
    applicationKinds: ["gig"],
  },
  {
    id: "passionfroot-sponsor",
    title: "Creator sponsorships marketplace",
    platform: "Passionfroot", category: "Creator", level: "Intermediate",
    payout: "$200–$5k/deal", tags: ["Sponsorship"],
    url: "https://www.passionfroot.me/", description: "List your audience, get inbound brand deals.",
    icon: Megaphone, accent: "from-[#8B5CF6] to-[#E879F9]",
    regions: "global", paymentMethods: ["Stripe", "PayPal"],
    competition: 2, timeToFirstDollar: "weeks", minHoursPerWeek: 3,
    applicationKinds: ["email-pitch"],
  },
];

export function findOpportunity(id: string) {
  return OPPORTUNITIES.find((o) => o.id === id);
}
