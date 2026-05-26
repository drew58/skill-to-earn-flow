import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Sparkles, Target, MessageSquare, UserCircle2, Settings, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/plans/new", label: "Income Plans", icon: Sparkles },
  { to: "/dashboard/missions", label: "Missions", icon: Target },
  { to: "/dashboard/outreach", label: "Outreach", icon: MessageSquare },
  { to: "/dashboard/profile", label: "Profile Builder", icon: UserCircle2 },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-grid pointer-events-none fixed inset-0 -z-10" />
      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/5 px-4 py-6 md:flex md:flex-col">
          <div className="px-2">
            <Logo />
          </div>
          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const active = path === item.to || (item.to !== "/dashboard" && path.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                    active
                      ? "bg-gradient-to-r from-[#5B8CFF]/20 to-[#8B5CF6]/20 text-white shadow-[inset_0_0_0_1px_rgba(139,92,246,0.3)]"
                      : "text-white/60 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="glass mt-auto rounded-xl p-3 text-xs">
            <div className="truncate text-white/80">{user?.email}</div>
            <button
              onClick={signOut}
              className="mt-2 inline-flex items-center gap-1.5 text-white/50 hover:text-white"
            >
              <LogOut className="h-3 w-3" /> Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">
          <div className="mb-6 flex items-center justify-between md:hidden">
            <Logo />
            <button onClick={signOut} className="text-xs text-white/50">Sign out</button>
          </div>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="glass-strong fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-2xl p-2 md:hidden">
        {NAV.slice(0, 5).map((item) => {
          const active = path === item.to || (item.to !== "/dashboard" && path.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px]",
                active ? "text-[#5B8CFF]" : "text-white/60",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
