import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import CountUp from "../components/CountUp";
import Reveal from "../components/Reveal";
import { Avatar, Chip, EmptyState, LiveDot, ScoreRing, SectionTitle } from "../components/ui";
import { useStore } from "../lib/store";
import { INTENT_META } from "../lib/types";
import type { MatchStatus } from "../lib/types";

const FILTERS: { key: MatchStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "mutual", label: "Mutual" },
  { key: "approved", label: "Awaiting them" },
  { key: "declined", label: "Passed" },
];

export default function Matches() {
  const navigate = useNavigate();
  const { profile, matches, candidates } = useStore();
  const [filter, setFilter] = useState<MatchStatus | "all">("all");

  const filtered = matches.filter((m) => filter === "all" || m.status === filter);
  const avg = matches.length ? Math.round(matches.reduce((s, m) => s + m.score, 0) / matches.length) : 0;
  const newCount = matches.filter((m) => m.status === "new").length;
  const mutualCount = matches.filter((m) => m.status === "mutual").length;

  return (
    <Layout>
      <SectionTitle
        kicker="Introductions"
        title="Your matches"
        sub="Every recommendation includes a full compatibility report. Nothing proceeds unless both of you approve."
      />

      {/* Summary band (LIGHT) */}
      {matches.length > 0 && (
        <div className="section-light card-light mb-8 p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Your matches at a glance</span>
            <LiveDot />
          </div>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              { label: "Total introductions", value: matches.length },
              { label: "New reports", value: newCount },
              { label: "Mutual connections", value: mutualCount },
              { label: "Avg. compatibility", value: avg, suffix: "%" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <div>
                  <div className="font-display text-4xl font-bold gold-text-warm">
                    <CountUp end={s.value} suffix={s.suffix ?? ""} />
                  </div>
                  <div className="mt-1 text-sm text-stone-600">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="★"
          title={matches.length === 0 ? "No matches yet" : "Nothing in this filter"}
          sub={
            matches.length === 0
              ? profile
                ? `Start a matching round from the console and ${profile.agentName} will bring back reports.`
                : "Create your agent first — then it can start finding your people."
              : "Try another filter."
          }
          action={
            matches.length === 0 ? (
              <button onClick={() => navigate(profile ? "/app" : "/onboarding")} className="btn-gold">
                {profile ? "Go to console" : "Create your agent"}
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((m, idx) => {
            const c = candidates.find((x) => x.id === m.candidateId)!;
            return (
              <Reveal key={m.id} delay={(idx % 4) * 70}>
              <button
                onClick={() => navigate(`/app/matches/${m.id}`)}
                className="card card-hover h-full w-full p-5 text-left transition-transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={c.name} />
                    <div>
                      <div className="font-medium text-zinc-100">
                        {c.name}, {c.age}
                        {c.verified && <span className="ml-1.5 text-xs text-gold-400" title="Verified">✓</span>}
                      </div>
                      <div className="text-xs text-zinc-500">{c.city} · {INTENT_META[m.intent].label}</div>
                    </div>
                  </div>
                  <ScoreRing score={m.score} size={52} />
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-zinc-400">{c.headline}</p>
                {m.shared.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.shared.slice(0, 4).map((s) => (
                      <span key={s} className="rounded-full bg-gold-500/10 px-2 py-0.5 text-[11px] text-gold-300">{s}</span>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span
                    className={
                      m.status === "mutual" ? "font-semibold text-emerald-400"
                      : m.status === "new" ? "font-semibold text-gold-400"
                      : m.status === "approved" ? "text-sky-400"
                      : "text-zinc-600"
                    }
                  >
                    {m.status === "mutual" ? "● Mutual — chat open" : m.status === "new" ? "● New report" : m.status === "approved" ? "Awaiting their approval" : "Passed"}
                  </span>
                  <span className="text-zinc-600">View report →</span>
                </div>
              </button>
              </Reveal>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
