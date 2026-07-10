import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Avatar, Chip, EmptyState, ScoreRing, SectionTitle } from "../components/ui";
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

  return (
    <Layout>
      <SectionTitle
        kicker="Introductions"
        title="Your matches"
        sub="Every recommendation includes a full compatibility report. Nothing proceeds unless both of you approve."
      />

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
          {filtered.map((m) => {
            const c = candidates.find((x) => x.id === m.candidateId)!;
            return (
              <button
                key={m.id}
                onClick={() => navigate(`/app/matches/${m.id}`)}
                className="card card-hover p-5 text-left"
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
            );
          })}
        </div>
      )}
    </Layout>
  );
}
