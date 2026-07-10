import { NavLink, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useStore } from "../lib/store";
import { AgentOrb, Logo } from "./ui";

const NAV = [
  { to: "/app", label: "Agent Console", icon: "◈", end: true },
  { to: "/app/matches", label: "Matches", icon: "★" },
  { to: "/app/interview", label: "Virtual Interview", icon: "✎" },
  { to: "/app/privacy", label: "Privacy Vault", icon: "🛡" },
  { to: "/app/learning", label: "Learning Loop", icon: "↻" },
  { to: "/app/premium", label: "Premium", icon: "♛" },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { profile, matches, agentRunning, insights } = useStore();
  const navigate = useNavigate();
  const newMatches = matches.filter((m) => m.status === "new").length;
  const pendingInsights = insights.filter((i) => i.status === "pending").length;

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-ink-700/70 bg-ink-900/90 backdrop-blur lg:flex">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 px-6 py-6 text-left">
          <Logo size="text-2xl" />
        </button>
        <div className="hairline" />

        {profile && (
          <div className="flex items-center gap-3 px-6 py-5">
            <AgentOrb active={agentRunning} />
            <div>
              <div className="text-sm font-medium text-zinc-200">{profile.agentName}</div>
              <div className="text-xs text-zinc-500">
                {agentRunning ? <span className="text-gold-400">Searching the network…</span> : "Your agent · standing by"}
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all ${
                  isActive
                    ? "bg-gold-500/10 text-gold-300 shadow-gold-glow"
                    : "text-zinc-400 hover:bg-ink-800 hover:text-zinc-200"
                }`
              }
            >
              <span className="flex items-center gap-3">
                <span className="w-5 text-center text-gold-500/80">{item.icon}</span>
                {item.label}
              </span>
              {item.to === "/app/matches" && newMatches > 0 && (
                <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold text-ink-950">{newMatches}</span>
              )}
              {item.to === "/app/learning" && pendingInsights > 0 && (
                <span className="rounded-full border border-gold-500/60 px-2 py-0.5 text-[10px] font-bold text-gold-400">
                  {pendingInsights}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-5">
          <div className="hairline mb-4" />
          {profile ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-zinc-300">{profile.name || "Member"}</div>
                <div className="text-[11px] uppercase tracking-wider text-zinc-500">
                  {profile.premium ? <span className="text-gold-400">♛ Premium</span> : "Free plan"}
                </div>
              </div>
            </div>
          ) : (
            <button onClick={() => navigate("/onboarding")} className="btn-gold w-full text-sm">
              Create profile
            </button>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-20 flex items-center justify-between border-b border-ink-700/70 bg-ink-900/95 px-4 py-3 backdrop-blur lg:hidden">
        <button onClick={() => navigate("/")}>
          <Logo size="text-xl" />
        </button>
        <nav className="flex gap-1 overflow-x-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-lg px-2.5 py-1.5 text-lg ${isActive ? "bg-gold-500/15 text-gold-300" : "text-zinc-500"}`
              }
              title={item.label}
            >
              {item.icon}
            </NavLink>
          ))}
        </nav>
      </div>

      <main className="min-h-screen flex-1 px-4 pb-16 pt-20 sm:px-8 lg:ml-64 lg:pt-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
