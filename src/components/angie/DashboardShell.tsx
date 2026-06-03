import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Sparkles, Target, MessageSquare, UserCircle2, Settings, LogOut, Compass, Bot, Wand2, Zap, Crown } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/coach", label: "Coach", icon: Bot },
  { to: "/dashboard/plans", label: "Income Plans", icon: Sparkles },
  { to: "/dashboard/opportunities", label: "Opportunities", icon: Compass },
  { to: "/dashboard/apply", label: "Instant Apply", icon: Wand2 },
  { to: "/dashboard/missions", label: "Missions", icon: Target },
  { to: "/dashboard/outreach", label: "Outreach", icon: MessageSquare },
  { to: "/dashboard/profile", label: "Profile", icon: UserCircle2 },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();
  const { tier, isPro } = useSubscription();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="bg-grid absolute inset-0" />
        <div className="animate-pulse-glow absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-[#5B8CFF]/25 blur-[120px]" />
        <div className="animate-pulse-glow absolute -bottom-40 right-1/4 h-[460px] w-[460px] rounded-full bg-[#8B5CF6]/25 blur-[140px]" style={{ animationDelay: "1.4s" }} />
      </div>

      <div className="mx-auto flex max-w-[1480px]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 px-4 py-6 md:flex md:flex-col">
          <div className="px-2">
            <Logo />
          </div>
          <nav className="mt-10 flex flex-1 flex-col gap-0.5">
            {NAV.map((item) => {
              const active = item.to === "/dashboard" ? path === "/dashboard" : path.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                    active
                      ? "text-white"
                      : "text-white/55 hover:bg-white/[0.04] hover:text-white",
                  )}
                >
                  {active && (
                    <span className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-[#5B8CFF]/20 via-[#8B5CF6]/15 to-transparent ring-1 ring-inset ring-white/10" />
                  )}
                  <item.icon className={cn("h-4 w-4 transition-colors", active && "text-[#A78BFA]")} />
                  <span className="font-medium">{item.label}</span>
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#8B5CF6] shadow-[0_0_12px_2px_rgba(139,92,246,0.7)]" />}
                </Link>
              );
            })}
          </nav>

          {/* Upgrade CTA */}
          {!isPro && (
            <Link to="/pricing" className="mx-2 mb-3 block">
              <div className="glass rounded-xl p-3 text-xs transition-all hover:border-[#8B5CF6]/40 hover:shadow-[0_0_30px_-10px_rgba(139,92,246,0.3)]">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-[#A78BFA]" />
                  <span className="font-medium text-white/85">Upgrade to Pro</span>
                </div>
                <p className="mt-1 text-[10px] text-white/50">Unlimited plans, AI coach & Instant Apply</p>
              </div>
            </Link>
          )}

          <div className="glass mt-auto rounded-2xl p-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#5B8CFF] to-[#8B5CF6] text-[11px] font-bold uppercase">
                {(user?.email?.[0] ?? "A")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-white/85">{user?.email}</div>
                <div className="mt-0.5 flex items-center gap-1">
                  {isPro ? (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-[#5B8CFF]/20 to-[#8B5CF6]/20 px-1.5 py-0.5 text-[10px] text-[#A78BFA]">
                      <Crown className="h-2.5 w-2.5" /> {tier}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-white/50">
                      Free
                    </span>
                  )}
                  <button
                    onClick={signOut}
                    className="ml-1 inline-flex items-center gap-1 text-white/45 transition-colors hover:text-white"
                  >
                    <LogOut className="h-3 w-3" /> Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 px-4 pb-28 pt-5 md:px-10 md:pb-12 md:pt-8">
          <div className="mb-6 flex items-center justify-between md:hidden">
            <Logo />
            <button onClick={signOut} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/60 transition-colors hover:text-white">
              Sign out
            </button>
          </div>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="glass-strong fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-2xl p-1.5 md:hidden">
        {[NAV[0], NAV[1], NAV[3], NAV[4], NAV[5]].map((item) => {
          const active = item.to === "/dashboard" ? path === "/dashboard" : path.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] transition-colors",
                active ? "text-white" : "text-white/55",
              )}
            >
              {active && <span className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#5B8CFF]/25 to-[#8B5CF6]/10" />}
              <item.icon className={cn("relative h-5 w-5", active && "text-[#A78BFA]")} />
              <span className="relative truncate">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
